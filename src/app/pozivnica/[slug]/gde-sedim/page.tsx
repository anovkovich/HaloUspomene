import { Metadata } from "next";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { loadSeatingLayout } from "@/lib/seating";
import { getThemeCSSVariables } from "../constants";
import type { TableData } from "../raspored-sedenja/types";
import GdeSedimClient from "./GdeSedimClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);
  if (!weddingData) return {};
  const title = `${weddingData.couple_names.full_display} - Gde sedim?`;
  const description = `Pronađite svoje mesto sedenja za venčanje - ${weddingData.couple_names.bride} & ${weddingData.couple_names.groom}`;
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

export interface GuestTableEntry {
  tableId: string;
  tableLabel: string;
  assignedSeats: number; // how many seats this guest occupies at this table
  seatCount: number;     // total capacity of the table
  occupiedCount: number; // total occupied seats at this table
}

export interface GuestLookupEntry {
  guestName: string;
  tables: GuestTableEntry[];
}

export default async function GdeSedimPage({ params }: PageProps) {
  const { slug } = await params;
  const weddingData = await getWeddingData(slug);

  if (!weddingData) notFound();
  if (!weddingData.paid_for_raspored) notFound();

  const cssVars = getThemeCSSVariables(weddingData.theme, weddingData.scriptFont);

  // ── Load seating data from MongoDB ──────────────────────────────────────
  let tables: TableData[] = [];
  let parseError = false;

  try {
    const loaded = await loadSeatingLayout(slug);
    if (loaded) tables = loaded;
  } catch {
    parseError = true;
  }

  // ── Build guest lookup ───────────────────────────────────────────────────
  // Group by guestName → map of tableId → assigned seat count
  const guestTableMap = new Map<string, Map<string, { assignedSeats: number; tableLabel: string; seatCount: number; occupiedCount: number }>>();

  for (const table of tables) {
    if (table.type === "decoration") continue;
    const occupiedCount = table.assignments.filter(Boolean).length;

    for (const seat of table.assignments) {
      if (!seat) continue;
      if (!guestTableMap.has(seat.guestName)) {
        guestTableMap.set(seat.guestName, new Map());
      }
      const tableMap = guestTableMap.get(seat.guestName)!;
      const existing = tableMap.get(table.id);
      if (existing) {
        existing.assignedSeats += 1;
      } else {
        tableMap.set(table.id, {
          assignedSeats: 1,
          tableLabel: table.label,
          seatCount: table.seats,
          occupiedCount,
        });
      }
    }
  }

  const guestLookup: GuestLookupEntry[] = Array.from(guestTableMap.entries()).map(
    ([guestName, tableMap]) => ({
      guestName,
      tables: Array.from(tableMap.entries()).map(([tableId, info]) => ({
        tableId,
        tableLabel: info.tableLabel,
        assignedSeats: info.assignedSeats,
        seatCount: info.seatCount,
        occupiedCount: info.occupiedCount,
      })),
    }),
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
        style={{ color: "var(--theme-text)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">

          {/* Back link */}
          <div className="mb-8">
            <Link
              href={`/pozivnica/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-raleway transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ChevronLeft size={15} />
              Nazad na pozivnicu
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="font-script text-5xl sm:text-6xl mb-4"
              style={{ color: "var(--theme-primary)" }}
            >
              {weddingData.couple_names.full_display}
            </h1>
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
              <span style={{ color: "var(--theme-primary)", opacity: 0.5, fontSize: 12 }}>✦</span>
              <div className="h-px w-10" style={{ backgroundColor: "var(--theme-border)" }} />
            </div>
            <p
              className="font-raleway text-xs uppercase tracking-widest"
              style={{ color: "var(--theme-text-light)" }}
            >
              Gde sedim?
            </p>
          </div>

          {/* Edge case: parse error */}
          {parseError && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p className="font-raleway text-base mb-2" style={{ color: "var(--theme-text-muted)" }}>
                Greška pri učitavanju rasporeda
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
                Pokušajte ponovo za koji trenutak.
              </p>
            </div>
          )}

          {/* Main interactive content */}
          {!parseError && (
            <GdeSedimClient
              guestLookup={guestLookup}
              tables={tables}
            />
          )}

        </div>
      </div>
    </div>
  );
}
