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
  getRodjendanRasporedPrice,
  getStandaloneSeatingPrice,
  isStandaloneSeatingPromoActive,
  getDogadjajPaketPrice,
  getDogadjajPaketPriceEur,
} from "@/data/pricing";
import { getWeddingData, patchCouple } from "@/lib/couples";
import { getBirthdayData, patchBirthday } from "@/lib/birthday";
import {
  getStandaloneSeating,
  setStandaloneActive,
  patchStandaloneFeatures,
} from "@/lib/standalone-seating";
import { getPhoneRentalById, patchPhoneRental } from "@/lib/phone-rentals";
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
  displayName: string; // "Ana & Dejan" / event name — prikaz u panelu (IPS svrha je konstanta)
  eventDate?: string;
  premium: boolean; // pozivnica only; false elsewhere
  unlockedTiers: string[]; // tiers whose flags are already fully set
  /** Z1 (pozivnica only): a draft couple that already carries a functional
   *  add-on flag (raspored/audio/galerija) must not check out as "osnovni" —
   *  osnovni's unlock wouldn't cover those, so paying 5.000 would publish a
   *  full config. When true, osnovni is hidden and refused. */
  blockOsnovni?: boolean;
  /** Birthday kinds: the record has no `contact_phone`, so the gallery's
   *  purge-warning SMS could never be delivered. The add-on is hidden and
   *  refused rather than sold with silent data loss attached. */
  blockGallery?: boolean;
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

// ── rodjendan + punoletstvo (both live in `birthday_events`) ─────────────────
//
// One factory, two kinds. The products differ only in which `type` they accept,
// the base tier's label, and its price — everything past that (the raspored
// add-on, the unlock flags) is identical, and duplicating it once already gave
// us two byte-identical portals to un-duplicate.
//
// The `raspored` add-on is offered by BOTH kinds even though only punoletstvo
// shows an upsell teaser in its portal. The tier is the sales rail; the teaser
// is marketing. Decoupling them means a dečiji-rođendan parent who asks for
// seating can just be sent /placanje/rodjendan/{slug}/ instead of being
// invoiced by hand — at no extra cost, since it is the same LS product.

const BIRTHDAY_ADDON_LABEL: Record<string, string> = {
  raspored: "Raspored sedenja",
  galerija: "QR galerija fotografija",
  slike: "Galerija fotografija na pozivnici",
};

/** Add-on ids in the order they should be offered. */
const BIRTHDAY_ADDONS = ["galerija", "raspored", "slike"] as const;
type BirthdayAddon = (typeof BIRTHDAY_ADDONS)[number];

function birthdayAddonMoney(id: BirthdayAddon): { rsd: number; eur: number } {
  if (id === "slike") {
    // Flat extra shared with the wedding builder (`addons[id=images]`), so the
    // same LS product backs both. Cheapest tier we sell — it only pays for
    // itself because the buyer uploads the photos from their own portal.
    const a = pricing.addons.find((x) => x.id === "images");
    return { rsd: a?.price ?? 600, eur: 6 };
  }
  if (id === "galerija") {
    // Priced identically to the standalone couple gallery ON PURPOSE — that is
    // what lets all three kinds share one LS product (LS_VARIANT_GALERIJA).
    // The webhook's money invariant compares the frozen amount against the LS
    // charge, so if these two prices ever diverge, this tier needs its own LS
    // product before the price changes, not after.
    return {
      rsd: pricing.pozivnica.galerija.price,
      eur: pricing.pozivnica.galerija.priceEur,
    };
  }
  return {
    rsd: getRodjendanRasporedPrice(),
    eur: eur(pricing.rodjendan.raspored.priceEur, 25),
  };
}

const BIRTHDAY_ADDON_VARIANT_ENV: Record<BirthdayAddon, string> = {
  galerija: "LS_VARIANT_GALERIJA",
  raspored: "LS_VARIANT_RODJENDAN_RASPORED",
  slike: "LS_VARIANT_SLIKE",
};

/** Entity flag each add-on flips. unlock/revoke are exact mirrors. */
const BIRTHDAY_ADDON_FLAG: Record<
  BirthdayAddon,
  "paid_for_gallery" | "paid_for_raspored" | "paid_for_images"
> = {
  galerija: "paid_for_gallery",
  raspored: "paid_for_raspored",
  slike: "paid_for_images",
};

function isBirthdayAddon(id: string): id is BirthdayAddon {
  return (BIRTHDAY_ADDONS as readonly string[]).includes(id);
}

function makeBirthdayAdapter(opts: {
  /** Which docs this kind owns — the other kind must reject them. */
  isEighteenth: boolean;
  baseLabel: string;
  baseMoney: () => { rsd: number; eur: number };
  /** LS product for the base invitation. Both products share one. */
  baseVariantEnv: string;
}): KindAdapter {
  const { isEighteenth, baseLabel, baseMoney, baseVariantEnv } = opts;

  const tierMoney = (tierId: string) =>
    isBirthdayAddon(tierId) ? birthdayAddonMoney(tierId) : baseMoney();
  const tierLabel = (tierId: string) =>
    isBirthdayAddon(tierId) ? BIRTHDAY_ADDON_LABEL[tierId] : baseLabel;

  return {
    async loadEntity(slug) {
      const b = await getBirthdayData(slug);
      if (!b) return null;
      if ((b.type === "eighteenth") !== isEighteenth) return null;

      const name = isEighteenth
        ? [b.honoree_name, b.honoree_surname].filter(Boolean).join(" ").trim() ||
          b.child_name ||
          "Punoletstvo"
        : b.child_name || "Rođendan";

      const unlockedTiers: string[] = [];
      if (!b.draft) unlockedTiers.push("default");
      if (b.paid_for_raspored) unlockedTiers.push("raspored");
      if (b.paid_for_gallery) unlockedTiers.push("galerija");
      if (b.paid_for_images) unlockedTiers.push("slike");
      // No phone ⇒ the gallery's purge-warning SMS can never be sent, so the
      // gallery is not offered at all. Better an unsellable add-on than a
      // client whose photos vanish without notice.
      const canSellGallery = !!b.contact_phone;

      return {
        slug,
        displayName: name,
        eventDate: b.event_date,
        premium: false,
        unlockedTiers,
        blockGallery: !canSellGallery,
      };
    },

    tiers(e) {
      // Until the invitation itself is paid, that is the only thing on offer —
      // selling an add-on onto a draft would leave the client with a feature
      // hanging off an unpublished invitation.
      if (!e.unlockedTiers.includes("default")) {
        const m = baseMoney();
        return [
          {
            id: "default",
            labelSr: baseLabel,
            rsd: m.rsd,
            eur: m.eur,
            lsVariantEnv: baseVariantEnv,
          },
        ];
      }

      return BIRTHDAY_ADDONS.filter(
        (id) => !e.unlockedTiers.includes(id),
      )
        .filter((id) => !(id === "galerija" && e.blockGallery))
        .map((id) => {
          const m = birthdayAddonMoney(id);
          return {
            id,
            labelSr: BIRTHDAY_ADDON_LABEL[id],
            rsd: m.rsd,
            eur: m.eur,
            lsVariantEnv: BIRTHDAY_ADDON_VARIANT_ENV[id],
          };
        });
    },

    computeOrder(e, tierId) {
      if (tierId !== "default" && !isBirthdayAddon(tierId))
        throw new PaymentError("INVALID_TIER");
      if (e.unlockedTiers.includes(tierId))
        throw new PaymentError("ALREADY_UNLOCKED");
      if (isBirthdayAddon(tierId)) {
        // An add-on on an unpublished invitation is not a thing we sell.
        if (!e.unlockedTiers.includes("default"))
          throw new PaymentError("INVALID_TIER");
        if (tierId === "galerija" && e.blockGallery)
          throw new PaymentError("INVALID_TIER");
      }
      const m = tierMoney(tierId);
      return oneLine(tierLabel(tierId), m.rsd, m.eur);
    },

    async unlock(slug, order) {
      if (isBirthdayAddon(order.tier)) {
        await patchBirthday(slug, { [BIRTHDAY_ADDON_FLAG[order.tier]]: true });
        return;
      }
      await patchBirthday(slug, { draft: false });
    },

    async revoke(slug, order) {
      if (isBirthdayAddon(order.tier)) {
        await patchBirthday(slug, { [BIRTHDAY_ADDON_FLAG[order.tier]]: false });
        return;
      }
      await patchBirthday(slug, { draft: true });
    },
  };
}

const rodjendan = makeBirthdayAdapter({
  isEighteenth: false,
  baseLabel: "Rođendanska pozivnica",
  baseMoney: () => ({
    rsd: getRodjendanPozivnicaPrice(false),
    eur: pricing.rodjendan.pozivnica.priceEur,
  }),
  baseVariantEnv: "LS_VARIANT_PROSLAVA",
});

const punoletstvo = makeBirthdayAdapter({
  isEighteenth: true,
  baseLabel: "Pozivnica za punoletstvo",
  baseMoney: () => ({
    rsd: getRodjendanPozivnicaPrice(true),
    eur: pricing.rodjendan.punoletstvo.priceEur,
  }),
  baseVariantEnv: "LS_VARIANT_PROSLAVA",
});

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

// ── dogadjaj (Korporativni paket on a standalone seating) ────────────────────
// One tier, sold as a bundle: seating tool + event invitation + QR gallery.
// A company pays once with a company card instead of three separate purchases.
// The invitation-only add-on (6.000) is sold manually over IPS/bank transfer to
// clients who already own the seating — it is deliberately not a card tier, so
// this kind maps to exactly one LS variant and cannot mis-price.

const dogadjaj: KindAdapter = {
  async loadEntity(slug) {
    const s = await getStandaloneSeating(slug);
    if (!s) return null;
    return {
      slug,
      displayName: s.eventName || "Događaj",
      eventDate: s.eventDate,
      premium: false,
      // Fully unlocked only when every part of the package is on.
      unlockedTiers:
        s.active && s.paid_for_invitation && s.paid_for_gallery
          ? ["default"]
          : [],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    // The gallery's upload/purge windows are computed from the event date, so
    // selling the package before one is set would hand over a dead add-on.
    if (!e.eventDate) return [];
    return [
      {
        id: "default",
        labelSr: "Korporativni paket",
        rsd: getDogadjajPaketPrice(),
        eur: getDogadjajPaketPriceEur(),
        lsVariantEnv: "LS_VARIANT_DOGADJAJ",
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    return oneLine(
      "Korporativni paket (raspored + pozivnica + galerija)",
      getDogadjajPaketPrice(),
      getDogadjajPaketPriceEur(),
    );
  },
  async unlock(slug) {
    await setStandaloneActive(slug, true);
    await patchStandaloneFeatures(slug, {
      paid_for_invitation: true,
      paid_for_gallery: true,
    });
  },
  async revoke(slug) {
    await setStandaloneActive(slug, false);
    await patchStandaloneFeatures(slug, {
      paid_for_invitation: false,
      paid_for_gallery: false,
    });
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

// ── telefon (retro Audio Guest Book phone rental) ────────────────────────────
// The only kind whose entity is a PHYSICAL booking: the row is created by the
// self-serve form at /telefon-uspomena/online-placanje (which already checked
// the date against PHONE_UNITS) and payment confirms the reservation.
//
// Deliberately sells at the STANDARD price (pricing.packages.essential.price),
// not getAudioPrice(): the LS variant is a fixed 6.900 product. Activating the
// audio discount in pricing.json therefore does NOT reach this rail — to run a
// promo here, add a flat LS discount code and wire it through `lsDiscountCode`,
// the way `raspored` does. Otherwise the charged total would disagree with the
// frozen amount and the webhook would quarantine every order.

const telefon: KindAdapter = {
  async loadEntity(slug) {
    const r = await getPhoneRentalById(slug);
    if (!r) return null;
    return {
      slug,
      displayName: r.contact_name || "Retro telefon",
      eventDate: r.rental_date,
      premium: false,
      unlockedTiers: r.paid ? ["default"] : [],
    };
  },
  tiers(e) {
    if (e.unlockedTiers.includes("default")) return [];
    return [
      {
        id: "default",
        labelSr: "Retro telefon — Audio Guest Book",
        rsd: pricing.packages.essential.price,
        eur: pricing.packages.essential.priceEur,
        lsVariantEnv: "LS_VARIANT_TELEFON",
      },
    ];
  },
  computeOrder(e, tierId) {
    if (tierId !== "default") throw new PaymentError("INVALID_TIER");
    if (e.unlockedTiers.includes("default"))
      throw new PaymentError("ALREADY_UNLOCKED");
    return oneLine(
      "Retro telefon — Audio Guest Book",
      pricing.packages.essential.price,
      pricing.packages.essential.priceEur,
    );
  },
  async unlock(slug) {
    await patchPhoneRental(slug, { paid: true });
  },
  async revoke(slug) {
    await patchPhoneRental(slug, { paid: false });
  },
};

export const KINDS: Record<PaymentKind, KindAdapter> = {
  pozivnica,
  rodjendan,
  punoletstvo,
  raspored,
  galerija,
  dogadjaj,
  telefon,
};

/** Type guard for a raw string coming off the URL. */
export function isPaymentKind(v: string): v is PaymentKind {
  return v in KINDS;
}
