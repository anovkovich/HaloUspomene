import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getStandaloneSeating } from "@/lib/standalone-seating";
import { stripOgSymbols } from "@/lib/og-text";
import { resolveEventTheme } from "./eventInvitationThemes";

export const alt = "Pozivnica za događaj - HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Nominative — standalone date label on the card ("15. oktobar 2026.")
const MONTHS_LATIN = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

function formatDate(iso?: string, time?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  const base = `${d}. ${MONTHS_LATIN[m - 1]} ${y}.`;
  return time ? `${base} · ${time}` : base;
}

/** Plain card used whenever the invitation isn't live or anything throws.
 *  Renders without fonts on purpose so it cannot fail for a font reason. */
function fallbackCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F4DC",
          color: "#232323",
          fontSize: 54,
        }}
      >
        HaloUspomene
      </div>
    ),
    { ...size },
  );
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const s = await getStandaloneSeating(slug);
    if (!s || !s.active || !s.paid_for_invitation) {
      return fallbackCard();
    }

    // `invitation` may not be filled in yet — a freshly paid event still
    // deserves a real OG card, so every field below is optional.
    const inv = s.invitation ?? {};
    const theme = resolveEventTheme(inv.theme);
    const c = theme.colors;

    const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
    const [serif, sans] = await Promise.all([
      readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
      readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
    ]);

    const title = stripOgSymbols(s.eventName);
    const dateStr = formatDate(s.eventDate, s.eventTime);
    const venue = stripOgSymbols(inv.location?.name ?? "");

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.background,
            color: c.text,
            padding: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div style={{ width: 64, height: 1, backgroundColor: c.accent }} />
            <div style={{ color: c.accent, fontSize: 20 }}>◆</div>
            <div style={{ width: 64, height: 1, backgroundColor: c.accent }} />
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontSize: 76,
              lineHeight: 1.1,
              textAlign: "center",
              maxWidth: 960,
            }}
          >
            {title}
          </div>

          {dateStr && (
            <div
              style={{
                display: "flex",
                fontFamily: "Josefin Sans",
                fontSize: 28,
                letterSpacing: 3,
                marginTop: 30,
                color: c.textMuted,
              }}
            >
              {dateStr.toUpperCase()}
            </div>
          )}

          {venue && (
            <div
              style={{
                display: "flex",
                fontFamily: "Josefin Sans",
                fontSize: 22,
                marginTop: 12,
                color: c.textMuted,
              }}
            >
              {venue}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontFamily: "Josefin Sans",
              fontSize: 18,
              letterSpacing: 4,
              marginTop: 46,
              color: c.accent,
            }}
          >
            POZIVNICA
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: "Cormorant Garamond", data: serif, style: "normal", weight: 400 },
          { name: "Josefin Sans", data: sans, style: "normal", weight: 400 },
        ],
      },
    );
  } catch (err) {
    // A font quirk or a transient Mongo blip during `next build` must not kill
    // the build or 500 a crawler — degrade to the plain card.
    console.error("[dogadjaj-og] render failed for slug", slug, err);
    return fallbackCard();
  }
}
