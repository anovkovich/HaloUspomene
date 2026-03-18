import { Metadata } from "next";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
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
  const title = `${weddingData.couple_names.full_display} - Potvrde dolaska`;
  const description = `Pregled potvrda dolaska za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
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
      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
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
              Pregled potvrda dolaska
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

          {!fetchError && responses.length === 0 && (
            <div
              className="text-center py-16"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p className="font-raleway text-base" style={{ color: "var(--theme-text-muted)" }}>
                Još uvek nema potvrda
              </p>
            </div>
          )}

          {/* Interactive: stats + search + lists */}
          {!fetchError && responses.length > 0 && (
            <PotvrdeClient
              attending={attending}
              notAttending={notAttending}
              totalGuests={totalGuests}
              slug={slug}
            />
          )}
        </div>
      </div>
    </div>
  );

  return pageContent;
}
