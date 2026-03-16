import { notFound } from "next/navigation";
import Link from "next/link";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { getRSVPResponses, RSVPEntry } from "@/lib/google-sheets";
import { getThemeCSSVariables } from "../constants";
import { Check, X, Users, ArrowLeft, Heart, MessageSquare } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllWeddingSlugs().map((slug) => ({ slug }));
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPersonLabel(count: number): string {
  if (count === 1) return "osoba";
  if (count < 5) return "osobe";
  return "osoba";
}

function ResponseCard({ entry }: { entry: RSVPEntry }) {
  const isAttending = entry.attending === "Da";
  const guestCount = parseInt(entry.plusOnes) || 1;

  return (
    <div
      className="relative p-5 sm:p-6 transition-all duration-300"
      style={{
        backgroundColor: "var(--theme-background)",
        borderRadius: "var(--theme-radius)",
        border: `1px solid var(--theme-border-light)`,
        boxShadow: "var(--theme-shadow)",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Attending indicator */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: isAttending
              ? "var(--theme-primary-muted)"
              : "rgba(0,0,0,0.05)",
            border: `2px solid ${isAttending ? "var(--theme-primary)" : "var(--theme-border)"}`,
          }}
        >
          {isAttending ? (
            <Check size={16} style={{ color: "var(--theme-primary)" }} strokeWidth={2.5} />
          ) : (
            <X size={16} style={{ color: "var(--theme-text-light)" }} strokeWidth={2.5} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p
              className="font-serif text-lg leading-tight"
              style={{ color: "var(--theme-text)" }}
            >
              {entry.name}
            </p>
            {isAttending && (
              <span
                className="flex items-center gap-1.5 text-xs font-elegant uppercase tracking-[0.15em] px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: "var(--theme-primary-muted)",
                  color: "var(--theme-primary)",
                }}
              >
                <Users size={11} />
                {guestCount} {getPersonLabel(guestCount)}
              </span>
            )}
            {!isAttending && (
              <span
                className="text-xs font-elegant uppercase tracking-[0.15em] px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "var(--theme-text-light)",
                }}
              >
                Neće doći
              </span>
            )}
          </div>

          {entry.details && entry.details !== "-" && (
            <p
              className="mt-2 text-sm leading-relaxed flex items-start gap-1.5"
              style={{ color: "var(--theme-text-muted)" }}
            >
              <MessageSquare size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--theme-text-light)" }} />
              {entry.details}
            </p>
          )}

          {entry.timestamp && (
            <p
              className="mt-2 text-xs font-elegant tracking-[0.1em]"
              style={{ color: "var(--theme-text-light)" }}
            >
              {formatTimestamp(entry.timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function PotvrdeePage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = getWeddingData(slug);

  if (!weddingData) notFound();

  let responses: RSVPEntry[] = [];
  let fetchError = false;

  if (weddingData.responses_spreadsheet_id) {
    try {
      responses = await getRSVPResponses(weddingData.responses_spreadsheet_id);
    } catch {
      fetchError = true;
    }
  }

  const cssVars = getThemeCSSVariables(
    weddingData.theme,
    weddingData.scriptFont,
  );

  const attending = responses.filter((r) => r.attending === "Da");
  const notAttending = responses.filter((r) => r.attending === "Ne");
  const totalGuests = attending.reduce(
    (sum, r) => sum + (parseInt(r.plusOnes) || 1),
    0,
  );

  return (
    <div
      className="min-h-screen"
      style={cssVars as React.CSSProperties}
    >
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-text)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between backdrop-blur-sm"
          style={{
            backgroundColor: "color-mix(in srgb, var(--theme-surface) 92%, transparent)",
            borderBottom: "1px solid var(--theme-border-light)",
          }}
        >
          <Link
            href={`/pozivnica/${slug}`}
            className="flex items-center gap-2 text-sm font-elegant uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            style={{ color: "var(--theme-text-light)" }}
          >
            <ArrowLeft size={14} />
            Pozivnica
          </Link>
          <p
            className="font-elegant text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--theme-text-light)" }}
          >
            Potvrde dolaska
          </p>
          <div className="w-20" />
        </div>

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
              className="font-elegant text-xs uppercase tracking-[0.35em]"
              style={{ color: "var(--theme-text-light)" }}
            >
              Pregled potvrda dolaska
            </p>
          </div>

          {/* Stats */}
          {!fetchError && responses.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
              {[
                { label: "Potvrđenih", value: attending.length, sub: "odgovora" },
                { label: "Ukupno gostiju", value: totalGuests, sub: "osoba" },
                { label: "Odbijanja", value: notAttending.length, sub: "odgovora" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-4 sm:p-6"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    borderRadius: "var(--theme-radius)",
                    border: "1px solid var(--theme-border-light)",
                  }}
                >
                  <p
                    className="font-serif text-3xl sm:text-4xl mb-1"
                    style={{ color: i === 0 || i === 1 ? "var(--theme-primary)" : "var(--theme-text-muted)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="font-elegant text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* States */}
          {!weddingData.responses_spreadsheet_id && (
            <div
              className="text-center py-16 px-6"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderRadius: "var(--theme-radius)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p className="font-serif text-lg mb-2" style={{ color: "var(--theme-text-muted)" }}>
                Spreadsheet nije konfigurisan
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
                Dodajte <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "var(--theme-border-light)" }}>responses_spreadsheet_id</code> u podatke za ovu pozivnicu.
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
              <p className="font-serif text-lg mb-2" style={{ color: "var(--theme-text-muted)" }}>
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
              <p className="font-serif text-lg" style={{ color: "var(--theme-text-muted)" }}>
                Još uvek nema potvrda
              </p>
            </div>
          )}

          {/* Attending list */}
          {attending.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Check size={14} style={{ color: "var(--theme-primary)" }} strokeWidth={2.5} />
                <h2
                  className="font-elegant text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--theme-primary)" }}
                >
                  Dolaze · {attending.length}
                </h2>
              </div>
              <div className="space-y-3">
                {attending.map((entry, i) => (
                  <ResponseCard key={i} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Not attending list */}
          {notAttending.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <X size={14} style={{ color: "var(--theme-text-light)" }} strokeWidth={2.5} />
                <h2
                  className="font-elegant text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Ne dolaze · {notAttending.length}
                </h2>
              </div>
              <div className="space-y-3">
                {notAttending.map((entry, i) => (
                  <ResponseCard key={i} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
