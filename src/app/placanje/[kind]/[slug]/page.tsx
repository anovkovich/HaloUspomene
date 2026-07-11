import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { KINDS, isPaymentKind, PaymentError } from "@/lib/payments/kinds";
import { getOrCreatePendingOrder } from "@/lib/orders";
import { productUrl } from "@/lib/payments/product-urls";
import CheckoutPanel from "@/components/payments/CheckoutPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plaćanje — HaloUspomene",
  robots: { index: false, follow: false },
};

function AlreadyUnlocked({
  kind,
  slug,
  displayName,
}: {
  kind: string;
  slug: string;
  displayName: string;
}) {
  const href = isPaymentKind(kind) ? productUrl(kind, slug) : "/";
  return (
    <div className="min-h-screen bg-[#F5F4DC] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-green-600" size={40} />
        <h1 className="text-xl font-serif text-[#232323] mb-1">Već aktivirano</h1>
        <p className="text-sm text-gray-500 mb-6">
          {displayName} je već otključano — nema potrebe za plaćanjem.
        </p>
        <Link
          href={href}
          className="inline-block bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl px-6 py-3 font-semibold transition-colors"
        >
          Otvori
        </Link>
      </div>
    </div>
  );
}

export default async function PlacanjePage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; slug: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { kind, slug } = await params;
  const { tier: requestedTier } = await searchParams;

  if (!isPaymentKind(kind)) notFound();

  const adapter = KINDS[kind];
  const entity = await adapter.loadEntity(slug);
  if (!entity) notFound();

  const available = adapter.tiers(entity);
  // No purchasable tier left ⇒ fully unlocked.
  if (available.length === 0) {
    return (
      <AlreadyUnlocked
        kind={kind}
        slug={slug}
        displayName={entity.displayName}
      />
    );
  }

  const tierId =
    requestedTier && available.some((t) => t.id === requestedTier)
      ? requestedTier
      : available[0].id;

  let money;
  try {
    money = adapter.computeOrder(entity, tierId);
  } catch (e) {
    if (e instanceof PaymentError && e.code === "ALREADY_UNLOCKED") {
      return (
        <AlreadyUnlocked
          kind={kind}
          slug={slug}
          displayName={entity.displayName}
        />
      );
    }
    if (e instanceof PaymentError) notFound(); // INVALID_TIER
    throw e;
  }

  const selectedTier = available.find((t) => t.id === tierId)!;

  const order = await getOrCreatePendingOrder({
    kind,
    slug,
    tier: tierId,
    amountRsd: money.totalRsd,
    amountEur: money.totalEur,
    lines: money.lines,
  });

  return (
    <CheckoutPanel
      kind={kind}
      slug={slug}
      orderId={order.orderId}
      ipsRef={order.ipsRef}
      displayName={entity.displayName}
      tierLabel={selectedTier.labelSr}
      amountRsd={order.amountRsd}
      amountEur={order.amountEur}
      lines={order.lines}
      tierId={tierId}
      cardEnabled={process.env.PAYMENTS_CARD_ENABLED === "1"}
    />
  );
}
