import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, KeyRound } from "lucide-react";
import { getOrder } from "@/lib/orders";
import { getWeddingData } from "@/lib/couples";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { getBirthdayData } from "@/lib/birthday";
import { createOrGetShareLink } from "@/lib/share-links";
import { isPaymentKind } from "@/lib/payments/kinds";
import { productUrl, shareProductKind } from "@/lib/payments/product-urls";
import Refresher from "./Refresher";
import CopyButton from "./CopyButton";

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

  // Fetch couple data once if needed (for PIN and/or premium status check)
  const needsCoupleData =
    unlocked &&
    order &&
    order.slug === slug &&
    (kind === "pozivnica" || kind === "galerija");
  const coupleData = needsCoupleData ? await getWeddingData(slug) : null;

  // Premium themes (watercolor custom bg / line_art HQ illustration) need a
  // manual team step AFTER payment. The invitation is live immediately; the
  // final hand-crafted asset arrives shortly. Set the expectation here.
  const premiumInProduction =
    unlocked &&
    order?.kind === "pozivnica" &&
    order.tier === "premium" &&
    coupleData?.premium_status === "u_izradi";

  // PIN za sve proizvode — buyer ga je dobio pri kreiranju ali često zaboravi.
  // Prikaz je gated na validan unlocked order (orderId je nepogodljiv capability token).
  const orderMatches =
    unlocked && !!order && order.slug === slug && order.kind === kind;

  let pin: string | null = null;
  if (orderMatches) {
    if (kind === "raspored" || kind === "dogadjaj") {
      // Both live on the same standalone seating record, so the same PIN opens
      // the organizer's tool and portal.
      pin = (await getStandaloneSeating(slug))?.password ?? null;
    } else if (kind === "pozivnica" || kind === "galerija") {
      pin = coupleData?.potvrde_password ?? null;
    } else if (kind === "punoletstvo" || kind === "rodjendan") {
      // Both products share `birthday_events`; the portal PIN is admin_password.
      pin = (await getBirthdayData(slug))?.admin_password ?? null;
    }
  }

  // Buyer's own access page — bundles the public link, the PIN, the portal and
  // a ready-made guest message. Minted here (idempotent, stable per
  // product+slug) rather than in the webhook: a throw there would return 500,
  // make LS retry, and risk stranding an order that already unlocked.
  let accessToken: string | null = null;
  const shareKind = orderMatches ? shareProductKind(kind) : null;
  if (shareKind) {
    try {
      accessToken = (await createOrGetShareLink(shareKind, slug)).token;
    } catch (err) {
      // Never let this break the confirmation page — the money is already in.
      console.error("[hvala] share link failed:", slug, err);
    }
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
              {kind === "telefon"
                ? "Vaš termin je rezervisan. Javljamo vam se porukom oko dostave telefona."
                : "Sve je aktivirano. Možete nastaviti."}
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
            {pin && (
              <div className="mb-6 rounded-2xl border border-[#AE343F]/20 bg-[#AE343F]/[0.04] p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1.5">
                  <KeyRound size={13} className="text-[#AE343F]" />
                  Vaš PIN za prijavu
                </p>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold tracking-[0.3em] text-[#232323]">
                    {pin}
                  </p>
                  <CopyButton text={pin} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Sačuvajte ga — trebaće vam za prijavu
                  {kind === "raspored" || kind === "dogadjaj"
                    ? " na raspored sedenja"
                    : ""}
                  .
                </p>
              </div>
            )}
            {accessToken ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/pristup/${accessToken}/`}
                  className="inline-block bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl px-6 py-3 font-semibold transition-colors"
                >
                  Otvorite svoj pristup
                </Link>
                <p className="text-[11px] text-gray-400 -mt-1">
                  Sačuvajte ovu stranicu — na njoj su link za goste, prijava na
                  portal i gotova poruka za slanje.
                </p>
                <Link
                  href={href}
                  className="text-sm text-[#AE343F] hover:underline"
                >
                  Otvori {kind === "telefon" ? "stranicu" : "pozivnicu"}
                </Link>
              </div>
            ) : (
              <Link
                href={href}
                className="inline-block bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-2xl px-6 py-3 font-semibold transition-colors"
              >
                Otvori
              </Link>
            )}
          </>
        ) : (
          <>
            <Clock className="mx-auto mb-3 text-[#AE343F]" size={44} />
            <h1 className="text-xl font-serif text-[#232323] mb-1">
              Potvrđujemo uplatu
            </h1>
            <p className="text-sm text-gray-500">
              {order?.rail === "card"
                ? "Aktiviramo vam pristup — obično za nekoliko sekundi. Stranica će se sama osvežiti."
                : "Čim proverimo uplatu, aktiviraćemo vam pristup — obično u roku od 1 sata. Javićemo vam porukom."}
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
