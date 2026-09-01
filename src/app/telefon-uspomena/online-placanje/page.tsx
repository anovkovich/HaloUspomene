import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import { resolveBypassInfo } from "@/lib/bypass-token";
import TelefonPlacanjeForm from "./TelefonPlacanjeForm";

// Not a marketing page: the link is copied out of the admin panel and sent to a
// buyer who already agreed on the deal, so it stays out of the index and out of
// the sitemap. It is deliberately NOT blocked in robots.txt — a disallowed page
// can never be crawled, and an uncrawled page never sees this noindex.
export const metadata: Metadata = {
  title: { absolute: "Rezervacija i plaćanje — Retro telefon | HALO Uspomene" },
  description:
    "Rezervišite retro telefon (Audio Guest Book) za vaš datum i platite online.",
  robots: { index: false, follow: false },
};

// The page deliberately carries no price or feature list: the buyer gets this
// link only after we've already agreed on the deal, and the amount is shown on
// the checkout step that follows. (The rail charges the STANDARD price — see the
// `telefon` adapter in src/lib/payments/kinds.ts for why an active audio
// discount does not reach it.)

export default async function OnlinePlacanjePage({
  searchParams,
}: {
  searchParams: Promise<{ bypass?: string }>;
}) {
  const bypassInfo = await resolveBypassInfo((await searchParams).bypass);

  return (
    <>
      <Header />
      <main className="bg-[#232323] min-h-screen pt-28 pb-20 sm:pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/telefon-uspomena"
            className="inline-flex items-center gap-2 text-xs text-[#F5F4DC]/40 hover:text-[#F5F4DC]/70 transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Nazad na Telefon uspomena
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="w-11 h-11 rounded-full bg-[#AE343F]/15 flex items-center justify-center">
              <Phone size={20} className="text-[#AE343F]" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#F5F4DC]/40">
                Rezervacija i plaćanje
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F4DC]">
                Retro telefon uspomena
              </h1>
            </div>
          </div>

          <div className="mt-10">
            <TelefonPlacanjeForm bypassInfo={bypassInfo} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
