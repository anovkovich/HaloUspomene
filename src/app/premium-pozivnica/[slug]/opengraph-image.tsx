import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getWeddingData, getPremiumWeddingSlugs } from "@/lib/couples";
import type { ScriptFontType } from "@/app/pozivnica/[slug]/types";

export const alt = "Premium Pozivnica — HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getPremiumWeddingSlugs();
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
  if (!iso) return "";
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

function fallbackCard() {
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

export default async function PremiumOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getWeddingData(slug);

  // Guard: fallback card if slug isn't a premium couple
  if (!data?.premium) return fallbackCard();

  try {

  const scriptFontKey = (data.scriptFont ?? "great-vibes") as ScriptFontType;
  const scriptFontFile =
    SCRIPT_FONT_FILES[scriptFontKey] ?? "GreatVibes-Regular.ttf";

  // Fonts live under the classic route — reuse them here.
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [scriptFontData, serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, scriptFontFile)),
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  const fontsConfig = [
    { name: "Script", data: scriptFontData, style: "normal" as const, weight: 400 as const },
    { name: "Cormorant Garamond", data: serifFontData, style: "normal" as const, weight: 400 as const },
    { name: "Josefin Sans", data: sansFontData, style: "normal" as const, weight: 400 as const },
  ];

  const dateStr = formatDate(data.event_date, data.useCyrillic);
  // Defensive: some older premium couples may be missing full_display.
  const bride = data.couple_names?.bride ?? "";
  const groom = data.couple_names?.groom ?? "";
  const fullName =
    data.couple_names?.full_display ||
    (bride && groom ? `${bride} & ${groom}` : bride || groom || "Naše Venčanje");
  const isLineArt = data.premium_theme === "line_art";

  // ─────────────────── LINE ART (gold-on-ivory, matches live invitation) ──────
  if (isLineArt) {
    // Palette pulled from the Line Art invitation itself (hero names use
    // text-[#d4af37] on #fffdf5 ivory; deep brown accent #5a4a2e).
    const GOLD = "#d4af37";
    const GOLD_DEEP = "#b89520";
    const BROWN = "#5a4a2e";
    const PANEL_SHADOW =
      "0 10px 28px rgba(90,65,30,0.18), 0 3px 8px rgba(90,65,30,0.12)";
    const CUT_SHADOW_SM = "0 1px 2px rgba(90,65,30,0.35)";
    const CUT_SHADOW_MD = "0 2px 4px rgba(90,65,30,0.4)";

    // Corner bracket: L-shaped line detail, inset inside the triple frame.
    const CORNER_INSET = 98;
    const CORNER_SIZE = 36;
    const CORNER_OP = 0.85;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(ellipse 95% 85% at 50% 50%, #fffdf5 0%, #f3ead1 100%)",
            position: "relative",
          }}
        >
          {/* Elevated paper panel — a brighter "card" sitting on the warmer
              base, with a real drop shadow. Paper-cut effect. */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 60,
              left: 60,
              right: 60,
              bottom: 60,
              background: "#fffdf5",
              boxShadow: PANEL_SHADOW,
            }}
          />

          {/* Triple gold hairline frame drawn ON the paper panel */}
          <div style={{ display: "flex", position: "absolute", top: 68, left: 68, right: 68, bottom: 68, border: `1px solid ${GOLD}`, opacity: 0.9 }} />
          <div style={{ display: "flex", position: "absolute", top: 76, left: 76, right: 76, bottom: 76, border: `1px solid ${GOLD}`, opacity: 0.5 }} />
          <div style={{ display: "flex", position: "absolute", top: 82, left: 82, right: 82, bottom: 82, border: `1px solid ${GOLD}`, opacity: 0.2 }} />

          {/* Corner brackets — L-shape at each corner (2 lines per corner) */}
          {/* top-left */}
          <div style={{ display: "flex", position: "absolute", top: CORNER_INSET, left: CORNER_INSET, width: CORNER_SIZE, height: 1, background: GOLD_DEEP, opacity: CORNER_OP }} />
          <div style={{ display: "flex", position: "absolute", top: CORNER_INSET, left: CORNER_INSET, width: 1, height: CORNER_SIZE, background: GOLD_DEEP, opacity: CORNER_OP }} />
          {/* top-right */}
          <div style={{ display: "flex", position: "absolute", top: CORNER_INSET, right: CORNER_INSET, width: CORNER_SIZE, height: 1, background: GOLD_DEEP, opacity: CORNER_OP }} />
          <div style={{ display: "flex", position: "absolute", top: CORNER_INSET, right: CORNER_INSET, width: 1, height: CORNER_SIZE, background: GOLD_DEEP, opacity: CORNER_OP }} />
          {/* bottom-left */}
          <div style={{ display: "flex", position: "absolute", bottom: CORNER_INSET, left: CORNER_INSET, width: CORNER_SIZE, height: 1, background: GOLD_DEEP, opacity: CORNER_OP }} />
          <div style={{ display: "flex", position: "absolute", bottom: CORNER_INSET, left: CORNER_INSET, width: 1, height: CORNER_SIZE, background: GOLD_DEEP, opacity: CORNER_OP }} />
          {/* bottom-right */}
          <div style={{ display: "flex", position: "absolute", bottom: CORNER_INSET, right: CORNER_INSET, width: CORNER_SIZE, height: 1, background: GOLD_DEEP, opacity: CORNER_OP }} />
          <div style={{ display: "flex", position: "absolute", bottom: CORNER_INSET, right: CORNER_INSET, width: 1, height: CORNER_SIZE, background: GOLD_DEEP, opacity: CORNER_OP }} />

          {/* Top wordmark with diamond end-caps (gold) */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 110,
              alignItems: "center",
              gap: 14,
              fontFamily: "Josefin Sans",
              fontSize: 14,
              letterSpacing: "0.4em",
              color: BROWN,
            }}
          >
            <div style={{ display: "flex", width: 5, height: 5, background: GOLD_DEEP, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
            <div style={{ display: "flex", width: 60, height: 1, background: GOLD_DEEP, opacity: 0.8 }} />
            <span>PREMIUM POZIVNICA</span>
            <div style={{ display: "flex", width: 60, height: 1, background: GOLD_DEEP, opacity: 0.8 }} />
            <div style={{ display: "flex", width: 5, height: 5, background: GOLD_DEEP, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
          </div>

          {/* Triple-diamond ornament cluster above names — gold */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", width: 6,  height: 6,  background: GOLD, opacity: 0.7, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
            <div style={{ display: "flex", width: 14, height: 14, background: GOLD_DEEP, opacity: 0.95, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_MD }} />
            <div style={{ display: "flex", width: 6,  height: 6,  background: GOLD, opacity: 0.7, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
          </div>

          {/* Couple names — gold script, matches live hero */}
          <span
            style={{
              fontFamily: "Script",
              fontSize: 118,
              color: GOLD_DEEP,
              lineHeight: 1,
              textAlign: "center",
              maxWidth: 1000,
              padding: "0 80px",
              textShadow: "0 2px 6px rgba(90,65,30,0.25)",
            }}
          >
            {fullName}
          </span>

          {/* Ornate multi-segment gold divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 32 }}>
            <div style={{ display: "flex", width: 40,  height: 1, background: GOLD_DEEP, opacity: 0.45 }} />
            <div style={{ display: "flex", width: 5,   height: 5, background: GOLD_DEEP, opacity: 0.8, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
            <div style={{ display: "flex", width: 130, height: 1, background: GOLD_DEEP, opacity: 0.7 }} />
            <div style={{ display: "flex", width: 12,  height: 12, background: GOLD_DEEP, opacity: 0.95, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_MD }} />
            <div style={{ display: "flex", width: 130, height: 1, background: GOLD_DEEP, opacity: 0.7 }} />
            <div style={{ display: "flex", width: 5,   height: 5, background: GOLD_DEEP, opacity: 0.8, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
            <div style={{ display: "flex", width: 40,  height: 1, background: GOLD_DEEP, opacity: 0.45 }} />
          </div>

          {/* Date — warm brown italic serif */}
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: 62,
              color: BROWN,
              marginTop: 18,
              letterSpacing: "0.04em",
            }}
          >
            {dateStr}
          </span>

          {/* Under-date accent: line with gold diamond endpoints */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
            <div style={{ display: "flex", width: 5,   height: 5, background: GOLD_DEEP, opacity: 0.7, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
            <div style={{ display: "flex", width: 320, height: 1, background: GOLD_DEEP, opacity: 0.45 }} />
            <div style={{ display: "flex", width: 5,   height: 5, background: GOLD_DEEP, opacity: 0.7, transform: "rotate(45deg)", boxShadow: CUT_SHADOW_SM }} />
          </div>

          {/* Bottom wordmark — subtle maker's mark */}
          <span
            style={{
              position: "absolute",
              bottom: 108,
              fontFamily: "Josefin Sans",
              fontSize: 12,
              color: GOLD_DEEP,
              opacity: 0.55,
              letterSpacing: "0.4em",
            }}
          >
            HALOUSPOMENE
          </span>
        </div>
      ),
      { ...size, fonts: fontsConfig },
    );
  }

  // ─────────────────── WATERCOLOR (deep gold luxury) ───────────────────
  const GOLD = "#d4af37";
  const GOLD_LIGHT = "#f5d77e";
  // Lighter, warmer gradient: glowing caramel-bronze center → deep brown edges
  const DARK = "#1a0d05";
  const DARK2 = "#5a381c";

  // Scattered gold "sparkle" positions — drawn as CSS diamonds (rotated squares)
  // to avoid relying on Unicode star glyphs that Satori can't find in our fonts.
  type Sparkle = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    size: number;
    op: number;
  };
  const sparkles: Sparkle[] = [
    // corner flourishes (brighter, larger)
    { top: 58,  left: 58,  size: 16, op: 0.9  },
    { top: 58,  right: 58, size: 16, op: 0.9  },
    { bottom: 58, left: 58,  size: 16, op: 0.9  },
    { bottom: 58, right: 58, size: 16, op: 0.9  },
    // scattered across top area
    { top: 120, left: 190,  size: 9,  op: 0.6  },
    { top: 90,  left: 340,  size: 6,  op: 0.5  },
    { top: 150, right: 220, size: 8,  op: 0.6  },
    { top: 100, right: 360, size: 10, op: 0.7  },
    { top: 200, left: 90,   size: 7,  op: 0.55 },
    { top: 210, right: 100, size: 8,  op: 0.6  },
    // mid-sides
    { top: 300, left: 80,   size: 6,  op: 0.5  },
    { top: 300, right: 80,  size: 6,  op: 0.5  },
    { top: 360, left: 140,  size: 9,  op: 0.6  },
    { top: 360, right: 140, size: 9,  op: 0.6  },
    // bottom scatter
    { bottom: 150, left: 180,  size: 8, op: 0.55 },
    { bottom: 150, right: 180, size: 8, op: 0.55 },
    { bottom: 120, left: 340,  size: 6, op: 0.5  },
    { bottom: 120, right: 340, size: 6, op: 0.5  },
    { bottom: 200, left: 100,  size: 8, op: 0.6  },
    { bottom: 200, right: 100, size: 8, op: 0.6  },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(ellipse 95% 80% at 50% 50%, ${DARK2} 0%, ${DARK} 90%)`,
          position: "relative",
        }}
      >
        {/* Double gold frame */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 34,
            left: 34,
            right: 34,
            bottom: 34,
            border: `1px solid ${GOLD}`,
            opacity: 0.75,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 44,
            left: 44,
            right: 44,
            bottom: 44,
            border: `1px solid ${GOLD}`,
            opacity: 0.3,
          }}
        />

        {/* Scattered gold sparkles (CSS diamonds, no glyphs).
            Only set defined position props — Satori chokes on `undefined`
            values in style, whereas React silently skips them. */}
        {sparkles.map((s, i) => {
          const style: Record<string, string | number> = {
            display: "flex",
            position: "absolute",
            width: s.size,
            height: s.size,
            background: GOLD,
            opacity: s.op,
            transform: "rotate(45deg)",
          };
          if (s.top !== undefined) style.top = s.top;
          if (s.bottom !== undefined) style.bottom = s.bottom;
          if (s.left !== undefined) style.left = s.left;
          if (s.right !== undefined) style.right = s.right;
          return <div key={i} style={style} />;
        })}

        {/* Top wordmark */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 82,
            alignItems: "center",
            gap: 18,
            fontFamily: "Josefin Sans",
            fontSize: 14,
            letterSpacing: "0.45em",
            color: GOLD,
          }}
        >
          <div style={{ display: "flex", width: 56, height: 1, background: GOLD, opacity: 0.8 }} />
          <span>PREMIUM POZIVNICA</span>
          <div style={{ display: "flex", width: 56, height: 1, background: GOLD, opacity: 0.8 }} />
        </div>

        {/* Gold ornament above names — CSS diamond */}
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            background: GOLD,
            opacity: 0.95,
            transform: "rotate(45deg)",
            marginBottom: 18,
          }}
        />


        {/* Couple names — gold foil effect */}
        <span
          style={{
            fontFamily: "Script",
            fontSize: 120,
            color: GOLD_LIGHT,
            lineHeight: 1,
            textAlign: "center",
            maxWidth: 1000,
            padding: "0 80px",
            textShadow: `0 2px 6px rgba(0,0,0,0.75)`,
          }}
        >
          {fullName}
        </span>

        {/* Ornate gold divider (CSS diamond centerpiece) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginTop: 30,
          }}
        >
          <div style={{ display: "flex", width: 200, height: 1, background: GOLD, opacity: 0.7 }} />
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              background: GOLD,
              opacity: 0.95,
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ display: "flex", width: 200, height: 1, background: GOLD, opacity: 0.7 }} />
        </div>

        {/* Date */}
        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontStyle: "italic",
            fontSize: 60,
            color: GOLD_LIGHT,
            marginTop: 22,
            letterSpacing: "0.05em",
          }}
        >
          {dateStr}
        </span>

        {/* Bottom wordmark — subtle */}
        <span
          style={{
            position: "absolute",
            bottom: 86,
            fontFamily: "Josefin Sans",
            fontSize: 12,
            color: GOLD,
            opacity: 0.45,
            letterSpacing: "0.45em",
          }}
        >
          HALOUSPOMENE
        </span>
      </div>
    ),
    { ...size, fonts: fontsConfig },
  );
  } catch (err) {
    // Last-resort safety net: any Satori/font quirk falls back to the plain
    // card so the OG endpoint never 500s on social-media crawlers.
    console.error("[premium-og] render failed for slug", slug, err);
    return fallbackCard();
  }
}
