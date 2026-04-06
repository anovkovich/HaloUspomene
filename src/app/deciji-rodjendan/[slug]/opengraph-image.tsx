import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getBirthdayData, getAllBirthdaySlugs } from "@/data/rodjendani";
import { BIRTHDAY_THEME_CONFIGS } from "./constants";
import type { BirthdayFontType } from "./types";

export const alt = "Rođendanska pozivnica - HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

const MONTHS = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;
}

// Google Fonts name mapping for fetch
const GOOGLE_FONT_NAMES: Record<BirthdayFontType, string> = {
  fredoka: "Fredoka",
  "bubblegum-sans": "Bubblegum+Sans",
  "baloo-2": "Baloo+2",
  "patrick-hand": "Patrick+Hand",
  chewy: "Chewy",
};

async function fetchGoogleFont(fontKey: BirthdayFontType): Promise<ArrayBuffer | null> {
  const fontName = GOOGLE_FONT_NAMES[fontKey] || "Fredoka";
  // Try bold first, then regular (some fonts like Chewy only have 400)
  const urls = [
    `https://fonts.googleapis.com/css2?family=${fontName}:wght@700&display=swap`,
    `https://fonts.googleapis.com/css2?family=${fontName}:wght@400&display=swap`,
    `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`,
  ];

  for (const cssUrl of urls) {
    try {
      const cssRes = await fetch(cssUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)" },
      });
      if (!cssRes.ok) continue;
      const css = await cssRes.text();
      const match = css.match(/url\(([^)]+)\)/);
      if (!match) continue;
      const fontRes = await fetch(match[1]);
      if (!fontRes.ok) continue;
      return fontRes.arrayBuffer();
    } catch {
      continue;
    }
  }
  return null;
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#FFF8F0", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 40, color: "#232323" }}>HaloUspomene</span>
      </div>,
      { ...size },
    );
  }

  const theme = BIRTHDAY_THEME_CONFIGS[data.theme] ?? BIRTHDAY_THEME_CONFIGS.neutral_safari;
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;
  const confetti = theme.colors.confetti;
  const dateStr = formatDate(data.event_date);
  const displayFontKey = data.displayFont ?? "fredoka";

  // Load fonts in parallel
  const sharedFontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const birthdayFontsDir = join(process.cwd(), "src/app/deciji-rodjendan/[slug]/fonts");
  const [sansFontData, fetchedFont] = await Promise.all([
    readFile(join(sharedFontsDir, "JosefinSans-Regular.ttf")),
    fetchGoogleFont(displayFontKey),
  ]);
  // Fallback to local Fredoka if Google Fonts fetch fails
  const displayFontData = fetchedFont ?? await readFile(join(birthdayFontsDir, "Fredoka-SemiBold.ttf"));

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})`,
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

      {/* Confetti dots */}
      {confetti.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12 + (i % 3) * 6,
            height: 12 + (i % 3) * 6,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: 0.3,
            top: 60 + (i * 110) % 500,
            left: 40 + (i * 230) % 1100,
          }}
        />
      ))}

      {/* Age badge */}
      <div
        style={{
          display: "flex",
          width: 130,
          height: 130,
          borderRadius: "65px",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          boxShadow: `0 8px 30px ${primary}40`,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Display",
            fontSize: 80,
            fontWeight: 700,
            color: "white",
          }}
        >
          {data.age}
        </span>
      </div>

      {/* Birthday label */}
      <span
        style={{
          fontFamily: "Josefin Sans",
          fontSize: 18,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: theme.colors.textMuted,
          marginBottom: 8,
        }}
      >
        {data.age === 1 ? "PRVI ROĐENDAN" : `${data.age}. ROĐENDAN`}
      </span>

      {/* Child name */}
      <span
        style={{
          fontFamily: "Display",
          fontSize: 80,
          fontWeight: 700,
          color: theme.colors.text,
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {data.child_name}
      </span>

      {/* Decorative line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 16,
        }}
      >
        <div style={{ width: 80, height: 2, background: primary, opacity: 0.4, borderRadius: 2 }} />
        <div style={{ width: 80, height: 2, background: primary, opacity: 0.4, borderRadius: 2 }} />
      </div>

      {/* Date */}
      <span
        style={{
          fontFamily: "Josefin Sans",
          fontSize: 24,
          color: theme.colors.textMuted,
          marginTop: 16,
          letterSpacing: "0.05em",
        }}
      >
        {dateStr}
      </span>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          width: 200,
          height: 3,
          background: `linear-gradient(90deg, ${primary}, ${secondary})`,
          opacity: 0.4,
          borderRadius: 2,
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        { name: "Display", data: displayFontData, style: "normal", weight: 700 },
        { name: "Josefin Sans", data: sansFontData, style: "normal", weight: 400 },
      ],
    },
  );
}
