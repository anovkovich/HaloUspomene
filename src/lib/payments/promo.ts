import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentKind, CheckoutLine } from "@/lib/orders";

// Guest-referral promo codes (Option A — see docs/PLAN-promo-codes.md).
//
// Codes are STATELESS, HMAC-signed and DERIVED from couple X's event date +
// slug — so rendering a code on an RSVP success screen writes nothing to the DB.
// Redemptions are tracked separately (promo-redemptions.ts) only to enforce an
// abuse cap. The discount is a PERCENTAGE off the frozen subtotal and MUST match
// the LS discount code's percentage exactly — both rails derive it from the same
// base, so the paid total agrees with order.amountRsd (a disagreement is not a
// rounding nuisance: the webhook quarantines the order and nothing unlocks).

/** MUST equal the LS discount code's percentage. Keep every RSD price divisible
 *  by 10 so this lands on whole dinars: LS computes the same percentage at para
 *  precision, and a fractional dinar here would drift from its total. Today's
 *  prices (5.000 / 9.900 / 13.900) all divide exactly → 500 / 990 / 1.390. */
export const PROMO_PERCENT = 10;
export const PROMO_LS_CODE = "PROMO10HU"; // the one reusable LS discount code string
export const PROMO_VALIDITY_DAYS = 45; // window after couple X's event date
export const PROMO_CAP = 25; // max redemptions per code (leak cap)

/** Master switch. Off in production until the whole promo + card flow is ready
 *  to launch — when off, no code is issued and none validates, so the system is
 *  fully invisible + inert. Flip PROMO_ENABLED=1 (Vercel env) to activate. */
export function isPromoEnabled(): boolean {
  return process.env.PROMO_ENABLED === "1";
}

/** Invitation purchases are eligible — a guest at any celebration can redeem the
 *  code for their own invitation: wedding (classic + premium), children's
 *  birthday, or coming-of-age. The seating editor + gallery add-ons are not. */
const ELIGIBLE_KINDS: ReadonlySet<PaymentKind> = new Set([
  "pozivnica",
  "rodjendan",
  "punoletstvo",
]);

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
  /** Percentage off; 0 when invalid. The dinar amount depends on the tier, so
   *  it's computed (and frozen) by applyPromo against the actual subtotal. */
  percent: number;
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
  if (!isPromoEnabled()) return null;
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
    percent: 0,
    reason,
  });

  if (!isPromoEnabled()) return fail("invalid");
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
  if (!ELIGIBLE_KINDS.has(kind)) return fail("ineligible_kind");

  return {
    valid: true,
    code,
    percent: PROMO_PERCENT,
    validUntil: new Date(expDay * DAY_MS).toISOString(),
  };
}

/** Appends a negative "Promo popust" line and floors both totals at 0. The
 *  single point where a discount is applied — after computeOrder, before freeze.
 *  Also returns the resolved amounts: the caller freezes exactly what was taken
 *  off, so the order ledger records the real discount rather than a rate. */
export function applyPromo(
  money: { lines: CheckoutLine[]; totalRsd: number; totalEur: number },
  promo: { percent: number },
): {
  lines: CheckoutLine[];
  totalRsd: number;
  totalEur: number;
  discountRsd: number;
  discountEur: number;
} {
  const discountRsd = Math.round((money.totalRsd * promo.percent) / 100);
  const discountEur = Math.round((money.totalEur * promo.percent) / 100);
  return {
    lines: [
      ...money.lines,
      {
        l: `Promo popust (${promo.percent}%)`,
        rsd: -discountRsd,
        eur: -discountEur,
      },
    ],
    totalRsd: Math.max(0, money.totalRsd - discountRsd),
    totalEur: Math.max(0, money.totalEur - discountEur),
    discountRsd,
    discountEur,
  };
}
