import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import { loadSeatingLayout } from "@/lib/seating";
import { getBirthdayThemeCSSVariables } from "../constants";
import type { TableData } from "@/app/pozivnica/[slug]/raspored-sedenja/types";
import type {
  GuestLookupEntry,
  GuestTableEntry,
} from "@/app/pozivnica/[slug]/gde-sedim/page";
import GdeSedimClient from "@/app/pozivnica/[slug]/gde-sedim/GdeSedimClient";

export const dynamicParams = true;
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};
  const honoree =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;
  const title = `${honoree} — Gde sedim?`;
  const description = `Pronađite svoje mesto sedenja za proslavu — ${honoree}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BirthdayGdeSedimPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();
  if (!data.paid_for_raspored) notFound();

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

  // ── Load seating data from MongoDB ──────────────────────────────────────
  let tables: TableData[] = [];
  let parseError = false;

  try {
    const loaded = await loadSeatingLayout(slug);
    if (loaded) tables = loaded;
  } catch {
    parseError = true;
  }

  // ── Build guest lookup — same algorithm as the wedding page ─────────────
  const guestTableMap = new Map<
    string,
    Map<
      string,
      {
        assignedSeats: number;
        tableLabel: string;
        seatCount: number;
        occupiedCount: number;
      }
    >
  >();

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

  const guestLookup: GuestLookupEntry[] = Array.from(
    guestTableMap.entries(),
  ).map(([guestName, tableMap]) => ({
    guestName,
    tables: Array.from(tableMap.entries()).map<GuestTableEntry>(
      ([tableId, info]) => ({
        tableId,
        tableLabel: info.tableLabel,
        assignedSeats: info.assignedSeats,
        seatCount: info.seatCount,
        occupiedCount: info.occupiedCount,
      }),
    ),
  }));

  const honoree =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={cssVars as React.CSSProperties}>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "var(--theme-background)",
          color: "var(--theme-text)",
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href={`/deciji-rodjendan/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
              style={{ color: "var(--theme-text-light)" }}
            >
              <ChevronLeft size={15} />
              Nazad na pozivnicu
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-5xl sm:text-6xl mb-4 font-bold"
              style={{
                color: "var(--theme-primary)",
                fontFamily: "var(--theme-display-font)",
              }}
            >
              {honoree}
            </h1>
            <div className="flex items-center justify-center gap-4 my-4">
              <div
                className="h-px w-10"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
              <span
                style={{
                  color: "var(--theme-primary)",
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                ✦
              </span>
              <div
                className="h-px w-10"
                style={{ backgroundColor: "var(--theme-border)" }}
              />
            </div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--theme-text-light)" }}
            >
              Gde sedim?
            </p>
          </div>

          {parseError && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="text-base mb-2"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Greška pri učitavanju rasporeda
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--theme-text-light)" }}
              >
                Pokušajte ponovo za koji trenutak.
              </p>
            </div>
          )}

          {!parseError && (
            <GdeSedimClient guestLookup={guestLookup} tables={tables} />
          )}
        </div>
      </div>
    </div>
  );
}
