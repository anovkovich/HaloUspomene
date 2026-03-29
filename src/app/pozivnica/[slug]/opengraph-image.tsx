import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getWeddingData, getAllWeddingSlugs } from "@/data/pozivnice";
import { THEME_CONFIGS } from "./constants";
import type { ScriptFontType } from "./types";

export const alt = "Pozivnica - HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllWeddingSlugs();
  return slugs.map((slug) => ({ slug }));
}

const MONTHS_LATIN = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

const MONTHS_CYRILLIC = [
  "јануар", "фебруар", "март", "април", "мај", "јун",
  "јул", "август", "септембар", "октобар", "новембар", "децембар",
];

function formatDate(iso: string, useCyrillic = false): string {
  const d = new Date(iso);
  const months = useCyrillic ? MONTHS_CYRILLIC : MONTHS_LATIN;
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}

const SCRIPT_FONT_FILES: Record<ScriptFontType, string> = {
  "great-vibes": "GreatVibes-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  "parisienne": "Parisienne-Regular.ttf",
  "allura": "Allura-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  "caveat": "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  if (!data) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#F5F4DC", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 40, color: "#232323" }}>HaloUspomene</span>
      </div>,
      { ...size },
    );
  }

  const theme = THEME_CONFIGS[data.theme] ?? THEME_CONFIGS.classic_rose;
  const primary = theme.colors.primary;
  const dateStr = formatDate(data.event_date, data.useCyrillic);
  const scriptFontKey = data.scriptFont ?? "great-vibes";
  const scriptFontFile = SCRIPT_FONT_FILES[scriptFontKey] ?? "GreatVibes-Regular.ttf";

  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [scriptFontData, serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, scriptFontFile)),
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse 80% 70% at 50% 45%, #FAF9F0, #F5F4DC)`,
        position: "relative",
      }}
    >
      {/* Top wordmark */}
      <span
        style={{
          position: "absolute",
          top: 36,
          fontFamily: "Josefin Sans",
          fontSize: 16,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#a8a29e",
        }}
      >
        halouspomene.rs
      </span>

      {/* Decorative line above names */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 10,
        }}
      >
        <div style={{ width: 80, height: 1, background: primary, opacity: 0.3 }} />
        <div style={{ width: 80, height: 1, background: primary, opacity: 0.3 }} />
      </div>

      {/* Couple names */}
      <span
        style={{
          fontFamily: "Script",
          fontSize: 88,
          color: "#232323",
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth: 1000,
        }}
      >
        {data.couple_names.full_display}
      </span>

      {/* Decorative line below names with heart */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 10,
        }}
      >
        <div style={{ width: 80, height: 1, background: primary, opacity: 0.3 }} />
        <span style={{ fontSize: 22, color: primary, opacity: 0.6 }}>&#9829;</span>
        <div style={{ width: 80, height: 1, background: primary, opacity: 0.3 }} />
      </div>

      {/* Date */}
      <span
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: 32,
          color: "#78716c",
          marginTop: 20,
        }}
      >
        {dateStr}
      </span>

      {/* Tagline */}
      {data.tagline && (
        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: 22,
            fontStyle: "italic",
            color: "#a8a29e",
            marginTop: 12,
            maxWidth: 700,
            textAlign: "center",
          }}
        >
          {data.tagline}
        </span>
      )}

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          width: 200,
          height: 2,
          background: primary,
          opacity: 0.35,
          borderRadius: 2,
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        { name: "Script", data: scriptFontData, style: "normal", weight: 400 },
        { name: "Cormorant Garamond", data: serifFontData, style: "normal", weight: 400 },
        { name: "Josefin Sans", data: sansFontData, style: "normal", weight: 400 },
      ],
    },
  );
}
