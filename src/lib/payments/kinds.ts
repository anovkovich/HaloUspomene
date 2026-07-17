// The `kind` registry — the single place a product plugs into self-serve
// payments. Server-only by construction (imports the MongoDB lib facades).
//
// Each adapter knows how to: load + summarize its entity, list the purchasable
// tiers for THAT entity, freeze the money (server-computed, never client input),
// and flip / reverse the exact entity flags on unlock / revoke.

import {
  pricing,
  getTier,
  getRodjendanPozivnicaPrice,
  getStandaloneSeatingPrice,
  isStandaloneSeatingPromoActive,
} from "@/data/pricing";
import { getWeddingData, patchCouple } from "@/lib/couples";
import { getBirthdayData, patchBirthday } from "@/lib/birthday";
import {
  getStandaloneSeating,
  setStandaloneActive,
} from "@/lib/standalone-seating";
import type {
  PaymentKind,
  CheckoutLine,
  OrderDocument,
} from "@/lib/orders";
import { findUnlockedOrderForTuple } from "@/lib/orders";

/** Thrown by `computeOrder` — the checkout page renders a friendly state per code. */
export class PaymentError extends Error {
  constructor(
    public code: "ALREADY_UNLOCKED" | "INVALID_TIER" | "BLOCKED_OSNOVNI",
  ) {
    super(code);
    this.name = "PaymentError";
  }
}

export interface KindEntitySummary {
  slug: string;
  displayName: string; // "Ana & Dejan" / event name — panel + IPS S field
  eventDate?: string;
  premium: boolean; // pozivnica only; false elsewhere
  unlockedTiers: string[]; // tiers whose flags are already fully set
  /** Z1 (pozivnica only): a draft couple that already carries a functional
   *  add-on flag (raspored/audio/galerija) must not check out as "osnovni" —
   *  osnovni's unlock wouldn't cover those, so paying 5.000 would publish a
   *  full config. When true, osnovni is hidden and refused. */
  blockOsnovni?: boolean;
}

export interface KindTier {
  id: string;
  labelSr: string;
  rsd: number;
  eur: number;
  lsVariantEnv: string; // name of the env var holding this tier's LS variant id
  /** Flat LS discount code to apply when this tier's price is a promo price —
   *  keeps the LS product at its regular price while `rsd` (and the charged
   *  total) carry the discount. Omit when the tier sells at full price. */
  lsDiscountCode?: string;
}

export interface KindAdapter {
  /** Load + summarize. null ⇒ 404 the checkout page. */
  loadEntity(slug: string): Promise<KindEntitySummary | null>;
  /** Purchasable tiers for THIS entity, already filtered (fully-unlocked hidden). */
  tiers(e: KindEntitySummary): KindTier[];
  /** Frozen money. THROWS PaymentError. Reads pricing.ts — never client input. */
  computeOrder(
    e: KindEntitySummary,
    tierId: string,
  ): { lines: CheckoutLine[]; totalRsd: number; totalEur: number };
  /** Flip entity flags via lib facades. MUST be idempotent ($set to fixed values). */
  unlock(slug: string, order: OrderDocument): Promise<void>;
  /** Reverse exactly what unlock() set. Called on full refund / admin revoke. */
  revoke(slug: string, order: OrderDocument): Promise<void>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function eur(v: number | undefined, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

/**
 * Test-payment override. When PAYMENTS_TEST_PRICE_RSD is set, EVERY order is
 * repriced to that flat dinar amount, and the card rail routes to the single
 * PAYMENTS_TEST_VARIANT product (see actions.ts) — so the whole live
 * card → webhook → unlock → refund chain can be exercised with a real ~100 din
 * charge you refund afterwards. Off unless the env is present. Because the
 * amount is frozen into the order and the webhook compares against it, the
 * override only has to run wherever the ORDER is created (e.g. a local instance
 * pointed at the shared DB) — production's webhook validates it either way.
 * NEVER set this env on the customer-facing production deploy.
 */
export function testPaymentPriceRsd(): number | null {
  const v = process.env.PAYMENTS_TEST_PRICE_RSD;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Replaces `money` with the flat test price when the override is active. */
export function applyTestPrice(money: {
  lines: CheckoutLine[];
  totalRsd: number;
  totalEur: number;
}): { lines: CheckoutLine[]; totalRsd: number; totalEur: number } {
  const rsd = testPaymentPriceRsd();
  if (rsd == null) return money;
  console.warn(`[payments] TEST PRICE ACTIVE — order repriced to ${rsd} din`);
  return {
    lines: [{ l: "Test plaćanje", rsd, eur: 1 }],
    totalRsd: rsd,
    totalEur: 1,
  };
}

/** Builds a single-line frozen snapshot for a one-line tier. */
function oneLine(labelSr: string, rsd: number, eurAmt: number) {
  const lines: CheckoutLine[] = [{ l: labelSr, rsd, eur: eurAmt }];
  return { lines, totalRsd: rsd, totalEur: eurAmt };
}

// ── pozivnica (classic + premium wedding invitation) ─────────────────────────

const POZIVNICA_TIER_LABEL: Record<string, string> = {
  osnovni: "Osnovni paket",
  kompletan: "Kompletan paket",
  premium: "Premium paket",
};

function pozivnicaTierMoney(tierId: string): { rsd: number; eur: number } {
  switch (tierId) {
    case "osnovni": {
      const t = getTier("osnovno");
      return { rsd: t?.price ?? 5000, eur: eur(t?.priceEur, 45) };
    }
    case "kompletan": {
      const t = getTier("kompletno");
      return { rsd: t?.price ?? 9900, eur: eur(t?.priceEur, 85) };
    }
    case "premium": {
      const t = getTier("premium");
      return { rsd: t?.price ?? 13900, eur: eur(t?.priceEur, 120) };
    }
    default:
      throw new PaymentError("INVALID_TIER");
  }
}

const pozivnica: KindAdapter = {
  async loadEntity(slug) {
    const w = await getWeddingData(slug);
    if (!w) return null;
    const premium = !!w.premium;
    const published = !w.draft;
    const unlockedTiers: string[] = [];
    if (premium) {
      if (
        published &&
        w.premium_paid &&
        w.paid_for_raspored &&
        w.paid_for_audio &&
        w.paid_for_gallery
      )
        unlockedTiers.push("premium");
    } else {
      if (published) unlockedTiers.push("osnovni");
      if (
        published &&
        w.paid_for_raspored &&
        w.paid_for_audio &&
        w.paid_for_gallery
      )
        unlockedTiers.push("kompletan");
    }
    // Z1: block osnovni for a DRAFT couple that carries ANY paid extra —
    // functional (raspored/audio/galerija) OR a flat extra (music/images/custom
    // colour). Flat extras are free only inside the full package; alone they're
    // à-la-carte, so paying 5.000 as "osnovni" must not smuggle them in. USB is
    // off-system (pouzeće), so it doesn't count. Checked by flag (not
    // builder_extras) so it also protects drafts from before this feature.
    const blockOsnovni =
      !published &&
      !!(
        w.paid_for_raspored ||
        w.paid_for_audio ||
        w.paid_for_gallery ||
        w.paid_for_music ||
        w.paid_for_images ||
        w.custom_primary_color ||
        w.custom_background_color
      );
    return {
      slug,
      displayName:
        w.couple_names?.full_display ||
        `${w.couple_names?.bride ?? ""} & ${w.couple_names?.groom ?? ""}`.trim(),
      eventDate: w.event_date,
      premium,
      unlockedTiers,
      blockOsnovni,
    };
  },

  tiers(e) {
    const ids = e.premium ? ["premium"] : ["osnovni", "kompletan"];
    return ids
      .filter((id) => !e.unlockedTiers.includes(id))
      .filter((id) => !(id === "osnovni" && e.blockOsnovni)) // Z1
      .map((id) => {
        const m = pozivnicaTierMoney(id);
        return {
          id,
          labelSr: POZIVNICA_TIER_LABEL[id],
          rsd: m.rsd,
          eur: m.eur,
          lsVariantEnv:
            id === "osnovni"
              ? "LS_VARIANT_OSNOVNI"
              : id === "kompletan"
                ? "LS_VARIANT_KOMPLETAN"
                : "LS_VARIANT_PREMIUM",
        };
      });
  },

  computeOrder(e, tierId) {
    const valid = e.premium
      ? ["premium"]
      : ["osnovni", "kompletan"];
    if (!valid.includes(tierId)) throw new PaymentError("INVALID_TIER");
    if (tierId === "osnovni" && e.blockOsnovni)
      throw new PaymentError("BLOCKED_OSNOVNI"); // Z1
    if (e.unlockedTiers.includes(tierId))
      throw new PaymentError("ALREADY_UNLOCKED");
    const m = pozivnicaTierMoney(tierId);
    return oneLine(POZIVNICA_TIER_LABEL[tierId], m.rsd, m.eur);
  },

  async unlock(slug, order) {
    switch (order.tier) {
      case "osnovni":
        await patchCouple(slug, { draft: false });
        break;
      case "kompletan":
        await patchCouple(slug, {
          draft: false,
          paid_for_raspored: true,
          paid_for_audio: true,
          paid_for_gallery: true,
        });
        break;
      case "premium":
        await patchCouple(slug, {
          draft: false,
          premium_paid: true,
          paid_for_raspored: true,
          paid_for_audio: true,
          paid_for_gallery: true,
        });
        break;
      case "custom": {
        // Partial combo (IPS). Publish + set true ONLY the functional flags in
        // the frozen selection (additive; free bonuses/USB were set at create).
        // Defensive: a missing selection must never throw — the approve route
        // marks the order unlocked BEFORE calling this, so a throw would strand
        // it (retry is a no-op). Publish and let admin reconcile.
        const sel = order.customSelection;
        if (!sel) {
          console.error(
            "[unlock] custom order without customSelection:",
            order.orderId,
          );
          await patchCouple(slug, { draft: false });
          break;
        }
        await patchCouple(slug, {
          draft: false,
          ...(sel.raspored ? { paid_for_raspored: true } : {}),
          ...(sel.audio ? { paid_for_audio: true } : {}),
          ...(sel.galerija ? { paid_for_gallery: true } : {}),
          ...(sel.premium ? { premium_paid: true } : {}),
        });
        break;
      }
    }
  },

  async revoke(slug, order) {
    switch (order.tier) {
      case "osnovni":
        await patchCouple(slug, { draft: true });
        break;
      case "kompletan":
        await patchCouple(slug, {
          draft: true,
          paid_for_raspored: false,
          paid_for_audio: false,
          paid_for_gallery: false,
        });
        break;
      case "premium":
        await patchCouple(slug, {
          draft: true,
          premium_paid: false,
          paid_for_raspored: false,
          paid_for_audio: false,
          paid_for_gallery: false,
        });
        break;
      case "custom": {
        const sel = order.customSelection;
        if (!sel) {
          await patchCouple(slug, { draft: true });
          break;
        }
        // Belt: never turn off a gallery that was ALSO bought standalone.
        const galleryElsewhere =
          sel.galerija &&
          (await findUnlockedOrderForTuple("galerija", slug, "default"));
        await patchCouple(slug, {
          draft: true,
          ...(sel.raspored ? { paid_for_raspored: false } : {}),
          ...(sel.audio ? { paid_for_audio: false } : {}),
          ...(sel.galerija && !galleryElsewhere
            ? { paid_for_gallery: false }
            : {}),
          ...(sel.premium ? { premium_paid: false } : {}),
        });
        break;
      }
    }
  },
};

// ── rodjendan (children's birthday) ──────────────────────────────────────────

const rodjendan: KindAdapter = {
  async loadEntity(slug) {
    const b = await getBirthdayData(slug);
    if (!b) return null;
    // Reject punoletstvo-typed docs — those belong to the `punoletstvo` kind.
    if (b.type === "eighteenth") return null;
    return {
      slug,
      displayName: b.child_name || "Rođendan",
      eventDate: b.event_date,
      premium: false,
      unlockedTiers: b.draft ? [] : ["default"],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    const rsd = getRodjendanPozivnicaPrice(false);
    const eurAmt = pricing.rodjendan.pozivnica.priceEur;
    return [
      {
        id: "default",
        labelSr: "Rođendanska pozivnica",
        rsd,
        eur: eurAmt,
        lsVariantEnv: "LS_VARIANT_PROSLAVA",
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    const rsd = getRodjendanPozivnicaPrice(false);
    const eurAmt = pricing.rodjendan.pozivnica.priceEur;
    return oneLine("Rođendanska pozivnica", rsd, eurAmt);
  },
  async unlock(slug) {
    await patchBirthday(slug, { draft: false });
  },
  async revoke(slug) {
    await patchBirthday(slug, { draft: true });
  },
};

// ── punoletstvo (18th birthday) ──────────────────────────────────────────────

const punoletstvo: KindAdapter = {
  async loadEntity(slug) {
    const b = await getBirthdayData(slug);
    if (!b) return null;
    // Strict: only punoletstvo-typed docs.
    if (b.type !== "eighteenth") return null;
    const name =
      [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ").trim() ||
      b.child_name ||
      "Punoletstvo";
    return {
      slug,
      displayName: name,
      eventDate: b.event_date,
      premium: false,
      unlockedTiers: b.draft ? [] : ["default"],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    const rsd = getRodjendanPozivnicaPrice(true);
    const eurAmt = pricing.rodjendan.punoletstvo.priceEur;
    return [
      {
        id: "default",
        labelSr: "Pozivnica za punoletstvo",
        rsd,
        eur: eurAmt,
        lsVariantEnv: "LS_VARIANT_PROSLAVA",
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    const rsd = getRodjendanPozivnicaPrice(true);
    const eurAmt = pricing.rodjendan.punoletstvo.priceEur;
    return oneLine("Pozivnica za punoletstvo", rsd, eurAmt);
  },
  async unlock(slug) {
    await patchBirthday(slug, { draft: false });
  },
  async revoke(slug) {
    await patchBirthday(slug, { draft: true });
  },
};

// ── raspored (standalone seating tool for organizers) ────────────────────────
// EUR is fixed at 45 regardless of the RSD promo (locked product decision).

/** Mirrors the standalone-seating launch promo on the card rail. The LS product
 *  stays at the REGULAR 5.000 din; while `promoActive` is set in pricing.json,
 *  computeOrder returns the promo price and the checkout applies this flat code
 *  so LS charges exactly that. Ending the promo is then a pricing.json flag —
 *  no LS product edit — and the receipt shows the saving as its own line.
 *  MUST exist on LS as a flat 1.000 din code on the raspored variant, or the
 *  webhook money invariant quarantines the order. */
const LS_DISCOUNT_RASPORED = "RASPORED1000";

const raspored: KindAdapter = {
  async loadEntity(slug) {
    const s = await getStandaloneSeating(slug);
    if (!s) return null;
    return {
      slug,
      displayName: s.eventName || "Raspored sedenja",
      eventDate: s.eventDate,
      premium: false,
      unlockedTiers: s.active ? ["default"] : [],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    const rsd = getStandaloneSeatingPrice(); // promo price while promoActive
    const eurAmt = pricing.standalone_seating.priceEur;
    return [
      {
        id: "default",
        labelSr: "Raspored sedenja za organizatore",
        rsd,
        eur: eurAmt,
        lsVariantEnv: "LS_VARIANT_RASPORED",
        lsDiscountCode: isStandaloneSeatingPromoActive()
          ? LS_DISCOUNT_RASPORED
          : undefined,
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    const rsd = getStandaloneSeatingPrice();
    const eurAmt = pricing.standalone_seating.priceEur;
    return oneLine("Raspored sedenja za organizatore", rsd, eurAmt);
  },
  async unlock(slug) {
    await setStandaloneActive(slug, true);
  },
  async revoke(slug) {
    await setStandaloneActive(slug, false);
  },
};

// ── galerija (standalone QR photo gallery on a couple record) ─────────────────
// Independent of `draft` — a gallery-only record may never publish an invitation.

const galerija: KindAdapter = {
  async loadEntity(slug) {
    const w = await getWeddingData(slug);
    if (!w) return null;
    return {
      slug,
      displayName:
        w.couple_names?.full_display ||
        `${w.couple_names?.bride ?? ""} & ${w.couple_names?.groom ?? ""}`.trim() ||
        "Galerija",
      eventDate: w.event_date,
      premium: false,
      unlockedTiers: w.paid_for_gallery ? ["default"] : [],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    const rsd = pricing.pozivnica.galerija.price;
    const eurAmt = pricing.pozivnica.galerija.priceEur;
    return [
      {
        id: "default",
        labelSr: "QR galerija fotografija",
        rsd,
        eur: eurAmt,
        lsVariantEnv: "LS_VARIANT_GALERIJA",
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    const rsd = pricing.pozivnica.galerija.price;
    const eurAmt = pricing.pozivnica.galerija.priceEur;
    return oneLine("QR galerija fotografija", rsd, eurAmt);
  },
  async unlock(slug) {
    await patchCouple(slug, { paid_for_gallery: true });
  },
  async revoke(slug) {
    await patchCouple(slug, { paid_for_gallery: false });
  },
};

export const KINDS: Record<PaymentKind, KindAdapter> = {
  pozivnica,
  rodjendan,
  punoletstvo,
  raspored,
  galerija,
};

/** Type guard for a raw string coming off the URL. */
export function isPaymentKind(v: string): v is PaymentKind {
  return v in KINDS;
}
