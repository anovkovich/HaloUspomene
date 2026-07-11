import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { getOrder } from "@/lib/orders";
import { getWeddingData } from "@/lib/couples";
import { isPaymentKind } from "@/lib/payments/kinds";
import { productUrl } from "@/lib/payments/product-urls";
import Refresher from "./Refresher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hvala — HaloUspomene",
  robots: { index: false, follow: false },
};

export default async function HvalaPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; slug: string }>;
  searchParams: Promise<{ order?: string; r?: string }>;
}) {
  const { kind, slug } = await params;
  const { order: orderId, r } = await searchParams;

  if (!isPaymentKind(kind)) notFound();

  const order = orderId ? await getOrder(String(orderId)) : null;
  const status = order?.status ?? "pending";
  const href = productUrl(kind, slug);
  const unlocked = status === "unlocked";
  // Keep polling only while the card payment is still settling.
  const settling = status === "pending" || status === "paid";
  const attempt = Number(r) || 0;

  // Premium themes (watercolor custom bg / line_art HQ illustration) need a
  // manual team step AFTER payment. The invitation is live immediately; the
  // final hand-crafted asset arrives shortly. Set the expectation here.
  let premiumInProduction = false;
  if (unlocked && order?.kind === "pozivnica" && order.tier === "premium") {
    const couple = await getWeddingData(slug);
    premiumInProduction = couple?.premium_status === "u_izradi";
  }

  return (
    <div className="min-h-screen bg-[#F5F4DC] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 text-center">
        {unlocked ? (
          <>
            <CheckCircle2 className="mx-auto mb-3 text-green-600" size={44} />
            <h1 className="text-xl font-serif text-[#232323] mb-1">
              Uplata potvrđena
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Sve je aktivirano. Možete nastaviti.
            </p>
            {premiumInProduction && (
              <div className="mb-6 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/[0.06] p-4 text-left">
                <p className="text-sm text-[#8B7355] leading-relaxed">
                  Vaša pozivnica je <strong>aktivna i možete je odmah slati</strong>.
                  Naš tim upravo radi na finalnoj, ručno doteranoj verziji —
                  zamenićemo je automatski, bez ikakve akcije s vaše strane.
                  Obavestićemo vas kad bude gotova.
                </p>
              </div>
            )}
            <Link
              href={href}
              className="inline-block bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl px-6 py-3 font-semibold transition-colors"
            >
              Otvori
            </Link>
          </>
        ) : (
          <>
            <Clock className="mx-auto mb-3 text-[#AE343F]" size={44} />
            <h1 className="text-xl font-serif text-[#232323] mb-1">
              Potvrđujemo uplatu
            </h1>
            <p className="text-sm text-gray-500">
              Čim proverimo uplatu, aktiviraćemo vam pristup — obično u roku od 1
              sata. Javićemo vam porukom.
            </p>
            {orderId && settling && (
              <Refresher order={String(orderId)} attempt={attempt} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
