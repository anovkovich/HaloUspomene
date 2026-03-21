import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/rsvp";
import { getThemeCSSVariables } from "../constants";
import PotvrdeClient from "./PotvrdeClient";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Portal`;
  const description = `Portal za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
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

export default async function PotvrdeePage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: import("@/lib/rsvp").RSVPEntry[] = [];
  let fetchError = false;

  try {
    responses = await getRSVPResponses(slug);
  } catch {
    fetchError = true;
  }

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  const attending = responses.filter((r) => r.attending === "Da");
  const notAttending = responses.filter((r) => r.attending === "Ne");
  const totalGuests = attending.reduce(
    (sum, r) => sum + (parseInt(r.guestCount) || 1),
    0,
  );

  const pageContent = (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      {/* ── Simple Navbar ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F4DC]/90 backdrop-blur-lg border-b border-[#232323]/5">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/moje-vencanje"
            className="flex items-center gap-2 text-sm text-[#232323]/50 hover:text-[#232323] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Moje venčanje</span>
          </Link>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/images/full-logo.png"
              alt="HALO Uspomene"
              width={3519}
              height={1798}
              className="h-10 w-auto"
            />
          </Link>

          <span className="text-xs tracking-wider text-[#232323]/40 uppercase">
            {weddingData.couple_names.bride} & {weddingData.couple_names.groom}
          </span>
        </div>
      </nav>

      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-16"
        style={{ color: "var(--theme-text)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h1
              className="font-script text-5xl sm:text-7xl mb-3"
              style={{ color: "var(--theme-primary)" }}
            >
              {weddingData.couple_names.full_display}
            </h1>
            <div className="flex items-center justify-center gap-4 my-5">
              <div className="h-px w-12" style={{ backgroundColor: "var(--theme-border)" }} />
              <Heart size={14} fill="currentColor" style={{ color: "var(--theme-primary)", opacity: 0.5 }} />
              <div className="h-px w-12" style={{ backgroundColor: "var(--theme-border)" }} />
            </div>
            <p
              className="font-raleway text-xs uppercase tracking-widest"
              style={{ color: "var(--theme-text-light)" }}
            >
              Portal
            </p>
          </div>

          {fetchError && (
            <div
              className="text-center py-16 px-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p className="font-raleway text-base mb-2" style={{ color: "var(--theme-text-muted)" }}>
                Greška pri učitavanju podataka
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
                Pokušajte ponovo kasnije.
              </p>
            </div>
          )}

          {/* Interactive: toolbar + stats + search + lists */}
          {!fetchError && (
            <PotvrdeClient
              attending={attending}
              notAttending={notAttending}
              totalGuests={totalGuests}
              slug={slug}
              weddingData={weddingData}
            />
          )}
        </div>
      </div>
    </div>
  );

  return pageContent;
}
