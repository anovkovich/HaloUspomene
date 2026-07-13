import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentKind, CheckoutLine } from "@/lib/orders";

// Guest-referral promo codes (Option A — see docs/PLAN-promo-codes.md).
//
// Codes are STATELESS, HMAC-signed and DERIVED from couple X's event date +
// slug — so rendering a code on an RSVP success screen writes nothing to the DB.
// Redemptions are tracked separately (promo-redemptions.ts) only to enforce an
// abuse cap. The discount is a FIXED amount (never a percent) so the flat LS
// discount code and our computeOrder math can't round-drift across the two rails.

export const PROMO_DISCOUNT_EUR = 10; // MUST equal the LS discount code's flat € value
export const PROMO_DISCOUNT_RSD = 1000; // IPS-only; independent of the EUR value
export const PROMO_LS_CODE = "SVADBA10"; // the one reusable LS discount code string
export const PROMO_VALIDITY_DAYS = 45; // window after couple X's event date
export const PROMO_CAP = 25; // max redemptions per code (leak cap)

/** Only wedding invitations are eligible (matches "napravi svoju pozivnicu"). */
const ELIGIBLE_KIND: PaymentKind = "pozivnica";

const SECRET =
  process.env.PROMO_SECRET || process.env.JWT_SECRET || "dev-secret";
const DAY_MS = 86_400_000;

function hmacHex(msg: string): string {
  return createHmac("sha256", SECRET).update(msg).digest("hex");
}

function todayDay(): number {
  return Math.floor(Date.now() / DAY_MS);
}

export interface PromoResult {
  valid: boolean;
  code: string;
  discountRsd: number;
  discountEur: number;
  validUntil?: string;
  reason?: "invalid" | "expired" | "ineligible_kind" | "bad_format";
}

/** Deterministic (no `Date.now()`) — depends only on the event date + slug, so
 *  it's stable/cacheable when rendered on the RSVP success screen. Returns null
 *  when the couple has no usable event date. */
export function issuePromo(
  eventDate: string | undefined | null,
  slug: string,
): { code: string; validUntil: string } | null {
  if (!eventDate) return null;
  const ms = new Date(eventDate).getTime();
  if (!Number.isFinite(ms)) return null;
  const expDay = Math.floor((ms + PROMO_VALIDITY_DAYS * DAY_MS) / DAY_MS);
  const coupleTag = hmacHex(slug).slice(0, 4).toUpperCase();
  const sig = hmacHex(`${expDay}.${coupleTag}`).slice(0, 6).toUpperCase();
  return {
    code: `HU-${expDay}-${coupleTag}-${sig}`,
    validUntil: new Date(expDay * DAY_MS).toISOString(),
  };
}

/** Pure crypto + expiry + kind check (NO DB). The per-code redemption cap is
 *  checked by the caller via promo-redemptions.countRedemptions(). */
export function verifyPromo(
  rawCode: string | undefined | null,
  kind: PaymentKind,
): PromoResult {
  const code = (rawCode || "").trim().toUpperCase();
  const fail = (reason: NonNullable<PromoResult["reason"]>): PromoResult => ({
    valid: false,
    code,
    discountRsd: 0,
    discountEur: 0,
    reason,
  });

  if (!code) return fail("invalid");
  const parts = code.split("-");
  if (parts.length !== 4 || parts[0] !== "HU") return fail("bad_format");
  const [, expDayStr, coupleTag, sig] = parts;
  const expDay = Number(expDayStr);
  if (!Number.isInteger(expDay) || expDay <= 0) return fail("bad_format");

  const expected = hmacHex(`${expDay}.${coupleTag}`).slice(0, 6).toUpperCase();
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("invalid");

  if (expDay < todayDay()) return fail("expired");
  if (kind !== ELIGIBLE_KIND) return fail("ineligible_kind");

  return {
    valid: true,
    code,
    discountRsd: PROMO_DISCOUNT_RSD,
    discountEur: PROMO_DISCOUNT_EUR,
    validUntil: new Date(expDay * DAY_MS).toISOString(),
  };
}

/** Appends a negative "Promo popust" line and floors both totals at 0. The
 *  single point where a discount is applied — after computeOrder, before freeze. */
export function applyPromo(
  money: { lines: CheckoutLine[]; totalRsd: number; totalEur: number },
  promo: { discountRsd: number; discountEur: number },
): { lines: CheckoutLine[]; totalRsd: number; totalEur: number } {
  return {
    lines: [
      ...money.lines,
      { l: "Promo popust", rsd: -promo.discountRsd, eur: -promo.discountEur },
    ],
    totalRsd: Math.max(0, money.totalRsd - promo.discountRsd),
    totalEur: Math.max(0, money.totalEur - promo.discountEur),
  };
}
