import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses } from "@/lib/google-sheets";
import { getThemeCSSVariables } from "../constants";
import PotvrdeClient from "./PotvrdeClient";
import PotvrdeGate from "./PotvrdeGate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllWeddingSlugs().map((slug) => ({ slug }));
}

export default async function PotvrdeePage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: import("@/lib/google-sheets").RSVPEntry[] = [];
  let fetchError = false;

  if (weddingData.responses_spreadsheet_id) {
    try {
      responses = await getRSVPResponses(weddingData.responses_spreadsheet_id);
    } catch {
      fetchError = true;
    }
  }

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  const attending = responses.filter((r) => r.attending === "Da");
  const notAttending = responses.filter((r) => r.attending === "Ne");
  const totalGuests = attending.reduce(
    (sum, r) => sum + (parseInt(r.plusOnes) || 1),
    0,
  );

  const pageContent = (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-text)" }}
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

          {/* Error / not configured states */}
          {!weddingData.responses_spreadsheet_id && (
            <div
              className="text-center py-16 px-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p className="font-raleway text-base mb-2" style={{ color: "var(--theme-text-muted)" }}>
                Spreadsheet nije konfigurisan
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
                Dodajte{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "var(--theme-border-light)" }}
                >
                  responses_spreadsheet_id
                </code>{" "}
                u podatke za ovu pozivnicu.
              </p>
            </div>
          )}

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
                Proverite da li je spreadsheet podeljen sa servisnim nalogom i da je ID ispravan.
              </p>
            </div>
          )}

          {!fetchError && weddingData.responses_spreadsheet_id && responses.length === 0 && (
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
              formUrl={weddingData.rsvp_form_url}
              entry_IDs={weddingData.entry_IDs}
              spreadsheetId={weddingData.responses_spreadsheet_id!}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (!weddingData.potvrde_password) return pageContent;

  return (
    <PotvrdeGate
      password={weddingData.potvrde_password}
      slug={slug}
      coupleNames={weddingData.couple_names.full_display}
      cssVars={cssVars}
    >
      {pageContent}
    </PotvrdeGate>
  );
}
