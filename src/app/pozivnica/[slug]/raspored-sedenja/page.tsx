import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Wallet, Users, LayoutDashboard, Mic } from "lucide-react";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/rsvp";
import { getThemeCSSVariables } from "../constants";
import RasporedClient from "./RasporedClient";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Raspored sedenja`;
  const description = `Raspored sedenja za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs(); return slugs.map((slug) => ({ slug }));
}

export default async function RasporedSedenja({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: import("@/lib/rsvp").RSVPEntry[] = [];

  try {
    responses = await getRSVPResponses(slug);
  } catch {
    // silently fail
  }

  const attending = responses.filter((r) => r.attending === "Da");
  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  const pageContent = (
    <div style={cssVars as React.CSSProperties} className="[@media(display-mode:standalone)_and_(max-width:767px)]:pb-16">
      <RasporedClient
        attending={attending}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        paidForRaspored={weddingData.paid_for_raspored ?? false}
      />

      {/* PWA-only bottom nav */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#232323]/10 hidden [@media(display-mode:standalone)_and_(max-width:767px)]:flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-around items-center h-14 w-full">
          <Link href="/moje-vencanje" className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-medium">Checklista</span>
          </Link>
          <Link href="/moje-vencanje?tab=budget" className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <Wallet size={20} />
            <span className="text-[10px] font-medium">Budžet</span>
          </Link>
          <Link href="/moje-vencanje?tab=guests" className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <Users size={20} />
            <span className="text-[10px] font-medium">Gosti</span>
          </Link>
          <Link href="/moje-vencanje?tab=audio" className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <Mic size={20} />
            <span className="text-[10px] font-medium">Audio</span>
          </Link>
          <span className="flex flex-col items-center gap-0.5 py-1 text-[#AE343F]">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Raspored</span>
          </span>
        </div>
      </nav>
    </div>
  );

  return pageContent;
}
