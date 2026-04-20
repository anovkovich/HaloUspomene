import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import { THEME_CONFIGS } from "@/app/pozivnica/[slug]/constants";
import type { ScriptFontType, ThemeType } from "@/app/pozivnica/[slug]/types";

export const alt = "Pozivnica za punoletstvo - HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

// Nominative — standalone date label on the OG card ("26. april 2026.")
const MONTHS_LATIN = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS_LATIN[d.getMonth()]} ${d.getFullYear()}.`;
}

const SCRIPT_FONT_FILES: Record<ScriptFontType, string> = {
  "great-vibes": "GreatVibes-Regular.ttf",
  "dancing-script": "DancingScript-Regular.ttf",
  "alex-brush": "AlexBrush-Regular.ttf",
  parisienne: "Parisienne-Regular.ttf",
  allura: "Allura-Regular.ttf",
  "marck-script": "MarckScript-Regular.ttf",
  caveat: "Caveat-Regular.ttf",
  "bad-script": "BadScript-Regular.ttf",
};

function cornerOrnamentSVG(color: string, rotate: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" style="transform:rotate(${rotate}deg)">
    <g fill="none" stroke="${color}" stroke-linecap="round">
      <path d="M 4 4 L 30 4" stroke-width="1" />
      <path d="M 4 4 L 4 30" stroke-width="1" />
      <path d="M 4 4 L 20 20" stroke-width="0.5" opacity="0.6" />
      <path d="M 10 4 Q 22 4 22 16 Q 22 22 28 22" stroke-width="0.6" opacity="0.7" />
      <circle cx="4" cy="4" r="2.5" fill="${color}" opacity="0.9" />
      <circle cx="4" cy="4" r="5" opacity="0.25" />
    </g>
  </svg>`;
}

function cornerDataUrl(color: string, rotate: number) {
  return `data:image/svg+xml;base64,${Buffer.from(cornerOrnamentSVG(color, rotate)).toString("base64")}`;
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data || data.type !== "eighteenth") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#F5F4DC",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 40, color: "#232323" }}>HaloUspomene</span>
        </div>
      ),
      { ...size },
    );
  }

  const rawTheme = data.theme as string;
  const themeKey: ThemeType =
    rawTheme === "white_gold_navy" ? "white_gold_navy" : "white_gold_burgundy";
  const theme = THEME_CONFIGS[themeKey];
  const primary = theme.colors.primary;
  const gold = theme.colors.waxSeal;

  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;

  const dateStr = formatDate(data.event_date);
  const scriptFontKey: ScriptFontType =
    ((data as { scriptFont?: ScriptFontType }).scriptFont as ScriptFontType) ||
    "great-vibes";
  const scriptFontFile = SCRIPT_FONT_FILES[scriptFontKey] ?? "GreatVibes-Regular.ttf";

  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");

  const [scriptFontData, serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, scriptFontFile)),
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  const cornerTL = cornerDataUrl(gold, 0);
  const cornerTR = cornerDataUrl(gold, 90);
  const cornerBR = cornerDataUrl(gold, 180);
  const cornerBL = cornerDataUrl(gold, 270);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, #ffffff, #fffdf5)",
          position: "relative",
        }}
      >
        {/* Framed card */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1060,
            height: 500,
            background:
              "linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)",
            border: `1px solid ${gold}`,
            boxShadow: "0 30px 80px -30px rgba(0,0,0,0.25)",
          }}
        >
          {/* Inner gold hairline */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              bottom: 10,
              border: `1px solid ${gold}`,
              opacity: 0.45,
              display: "flex",
            }}
          />

          {/* Art-deco corners */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cornerTL} width="60" height="60" style={{ position: "absolute", top: 18, left: 18 }} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cornerTR} width="60" height="60" style={{ position: "absolute", top: 18, right: 18 }} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cornerBR} width="60" height="60" style={{ position: "absolute", bottom: 18, right: 18 }} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cornerBL} width="60" height="60" style={{ position: "absolute", bottom: 18, left: 18 }} alt="" />

          {/* Punoletstvo label */}
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 14,
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              color: "#a8a29e",
              marginBottom: 16,
            }}
          >
            Punoletstvo
          </span>

          {/* Honoree name */}
          <span
            style={{
              fontFamily: "Script",
              fontSize: 92,
              color: primary,
              lineHeight: 1.05,
              textAlign: "center",
              maxWidth: 960,
            }}
          >
            {displayName}
          </span>

          {/* Diamond divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 20,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 110, height: 1, background: gold, opacity: 0.8, display: "flex" }} />
            <div
              style={{
                display: "flex",
                width: 16,
                height: 16,
                transform: "rotate(45deg)",
                background: gold,
                opacity: 0.85,
              }}
            />
            <div style={{ width: 110, height: 1, background: gold, opacity: 0.8, display: "flex" }} />
          </div>

          {/* Date */}
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 30,
              color: "#78716c",
              marginTop: 4,
            }}
          >
            {dateStr}
          </span>

          {data.tagline && (
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 20,
                fontStyle: "italic",
                color: "#a8a29e",
                marginTop: 14,
                maxWidth: 720,
                textAlign: "center",
              }}
            >
              {data.tagline}
            </span>
          )}

          {/* Wordmark — anchored near the bottom of the framed card */}
          <span
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "Josefin Sans",
              fontSize: 13,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "#a8a29e",
              textIndent: "0.45em",
            }}
          >
            halouspomene.rs
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Script", data: scriptFontData, style: "normal", weight: 400 },
        { name: "Cormorant Garamond", data: serifFontData, style: "normal", weight: 400 },
        { name: "Cormorant Garamond", data: serifFontData, style: "normal", weight: 600 },
        { name: "Josefin Sans", data: sansFontData, style: "normal", weight: 400 },
      ],
    },
  );
}
