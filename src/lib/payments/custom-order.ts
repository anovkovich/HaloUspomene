import { getWeddingData } from "@/lib/couples";
import { getOrCreatePendingOrder, type OrderDocument } from "@/lib/orders";
import {
  computeBuilderMoney,
  type BuilderSelection,
} from "@/lib/payments/builder-pricing";
import { PaymentError } from "@/lib/payments/kinds";

/**
 * Freezes a custom (partial-combo) pozivnica order. The amount is computed
 * SERVER-SIDE from the couple's `builder_extras` snapshot — the client only
 * ever supplies the slug, never a price. Custom orders never touch the card
 * rail (the pozivnica adapter doesn't list a "custom" tier), so they can carry
 * an arbitrary dinar amount safely: IPS is settled by manual admin approval.
 *
 * Throws PaymentError:
 *  - ALREADY_UNLOCKED when the couple is already published (not draft)
 *  - INVALID_TIER when there's no builder snapshot to price from
 */
export async function createCustomPozivnicaOrder(
  slug: string,
): Promise<OrderDocument> {
  const w = await getWeddingData(slug);
  if (!w) throw new PaymentError("INVALID_TIER");
  if (!w.draft) throw new PaymentError("ALREADY_UNLOCKED");

  const ex = w.builder_extras;
  if (!ex) throw new PaymentError("INVALID_TIER");

  const sel: BuilderSelection = {
    premium: !!ex.premium,
    raspored: !!ex.raspored,
    audio: !!ex.audio,
    galerija: !!ex.galerija,
    music: !!ex.music,
    usb: ex.usb ?? "",
    images: !!ex.images,
    customColor: !!ex.customColor,
  };
  const money = computeBuilderMoney(sel);

  return getOrCreatePendingOrder({
    kind: "pozivnica",
    slug,
    tier: "custom",
    amountRsd: money.totalRsd,
    amountEur: 0, // IPS is RSD-only; the panel doesn't render EUR
    lines: money.lines,
    customSelection: sel,
  });
}
