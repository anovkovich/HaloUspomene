import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getStandaloneSeating,
  checkinTokenMatches,
} from "@/lib/standalone-seating";
import { loadSeatingLayout, type TableData } from "@/lib/seating";
import { buildGuestLookup } from "@/lib/seating/lookup";
import HostessCheckinClient from "./HostessCheckinClient";

/**
 * Hostess door check-in.
 *
 * A route of its own rather than a `?h=` mode on `/gde-sedim`, for two reasons
 * that have nothing to do with caching (measured: `/gde-sedim` renders per
 * request either way — its `revalidate` never produces a cache hit):
 *
 *  - `/gde-sedim` is the QR-pano destination a few hundred guests hit within
 *    minutes of the doors opening. Keeping staff-only logic off it keeps the
 *    highest-traffic page in the product unchanged.
 *  - The two screens want different things from a bad token. Here a revoked
 *    link is meaningful, so it redirects to the plain guest lookup — the
 *    hostess still finds seats, and the URL makes it obvious check-in is gone.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prijem gostiju",
  robots: { index: false, follow: false },
};

// Brand palette CSS variables — feeds the shared GdeSedimClient + HallMap.
const BRAND_VARS: React.CSSProperties = {
  "--theme-primary": "#AE343F",
  "--theme-primary-light": "rgba(174,52,63,0.25)",
  "--theme-primary-muted": "rgba(174,52,63,0.12)",
  "--theme-background": "#f5f4dc",
  "--theme-surface": "#faf9f6",
  "--theme-text": "#232323",
  "--theme-text-light": "rgba(35,35,35,0.6)",
  "--theme-text-muted": "rgba(35,35,35,0.75)",
  "--theme-border": "rgba(35,35,35,0.35)",
  "--theme-border-light": "rgba(35,35,35,0.2)",
} as React.CSSProperties;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PrijemGostijuPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const data = await getStandaloneSeating(slug);
  if (!data || !data.active) notFound();

  // A revoked or mistyped link must not be a dead end: the hostess is standing
  // at the door. Send her to the ordinary seat lookup instead.
  const sp = await searchParams;
  const suppliedToken = typeof sp.h === "string" ? sp.h : undefined;
  if (!checkinTokenMatches(data.checkin_token, suppliedToken)) {
    redirect(`/raspored-sedenja/${slug}/gde-sedim/`);
  }

  let tables: TableData[] = [];
  let parseError = false;
  try {
    tables = (await loadSeatingLayout(slug)) ?? [];
  } catch {
    parseError = true;
  }

  const guestLookup = buildGuestLookup(tables, data.guests);

  return (
    <div className="min-h-screen" style={BRAND_VARS}>
      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
        style={{ color: "var(--theme-text)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-10">
            <h1
              className="font-script text-5xl sm:text-6xl mb-4"
              style={{ color: "var(--theme-primary)" }}
            >
              {data.eventName}
            </h1>
            <p
              className="font-raleway text-xs uppercase tracking-widest"
              style={{ color: "var(--theme-text-light)" }}
            >
              Prijem gostiju
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
                className="font-raleway text-base mb-2"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Greška pri učitavanju rasporeda
              </p>
              <p className="text-sm" style={{ color: "var(--theme-text-light)" }}>
                Pokušajte ponovo za koji trenutak.
              </p>
            </div>
          )}

          {!parseError && tables.length === 0 && (
            <div
              className="text-center py-14 px-6 rounded-xl"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <p
                className="font-raleway text-base"
                style={{ color: "var(--theme-text-muted)" }}
              >
                Raspored još nije objavljen.
              </p>
            </div>
          )}

          {!parseError && tables.length > 0 && (
            <HostessCheckinClient
              slug={slug}
              token={suppliedToken!}
              guests={data.guests}
              guestLookup={guestLookup}
              tables={tables}
            />
          )}
        </div>
      </div>
    </div>
  );
}
