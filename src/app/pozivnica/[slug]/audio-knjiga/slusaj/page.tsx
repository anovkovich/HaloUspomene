import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Wallet, Users, LayoutDashboard, Mic } from "lucide-react";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getAudioMessages } from "@/lib/audio";
import { getThemeCSSVariables, THEME_CONFIGS } from "../../constants";
import SlusajClient from "./SlusajClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Audio poruke`;
  const description = `Audio poruke gostiju za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function SlusajPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  const paidForAudio = weddingData.paid_for_audio ?? false;

  let messages: import("@/lib/audio").AudioMessage[] = [];
  let fetchError = false;

  if (paidForAudio) {
    try {
      messages = await getAudioMessages(slug);
    } catch {
      fetchError = true;
    }
  }

  const cssVars = getThemeCSSVariables(
    weddingData.theme,
    weddingData.scriptFont
  );

  return (
    <div className="min-h-screen [@media(display-mode:standalone)_and_(max-width:767px)]:pb-16" style={cssVars as React.CSSProperties}>
      {/* PWA-only header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F4DC]/90 backdrop-blur-lg border-b border-[#232323]/5 hidden [@media(display-mode:standalone)]:block">
        <div className="container mx-auto px-4 h-14 flex items-center justify-center">
          <Link href="/moje-vencanje">
            <Image src="/images/full-logo.png" alt="HALO Uspomene" width={3519} height={1798} className="h-10 w-auto" />
          </Link>
        </div>
      </nav>
      <div className="hidden [@media(display-mode:standalone)]:block h-14" />

      <SlusajClient
        messages={messages}
        fetchError={fetchError}
        slug={slug}
        coupleNames={weddingData.couple_names.full_display}
        useCyrillic={weddingData.useCyrillic ?? false}
        paidForAudio={paidForAudio}
        primaryColor={(THEME_CONFIGS[weddingData.theme] ?? THEME_CONFIGS.classic_rose).colors.primary}
        scriptFont={weddingData.scriptFont}
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
          <Link href={`/pozivnica/${slug}/portal`} className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <Users size={20} />
            <span className="text-[10px] font-medium">Gosti</span>
          </Link>
          <span className="flex flex-col items-center gap-0.5 py-1 text-[#AE343F]">
            <Mic size={20} />
            <span className="text-[10px] font-medium">Audio</span>
          </span>
          <Link href={`/pozivnica/${slug}/raspored-sedenja`} className="flex flex-col items-center gap-0.5 py-1 text-[#232323]/35">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Raspored</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
