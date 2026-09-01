import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Ostavite Recenziju — HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
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
        background:
          "radial-gradient(ellipse 80% 70% at 50% 45%, #FAF9F0, #F5F4DC)",
        position: "relative",
        padding: "60px 80px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 16,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#a8a29e",
          }}
        >
          halouspomene.rs
        </span>
      </div>

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Stars row — inline SVG, not a text ★: Satori would fetch a symbol
              font for the glyph at build time, and that fetch fails on the
              build machine and takes the whole prerender down. */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} width="36" height="36" viewBox="0 0 24 24" fill="#d4af37">
                <path d="M12 1.5 L15.09 8.26 L22.5 9.02 L17 14.14 L18.5 21.5 L12 17.77 L5.5 21.5 L7 14.14 L1.5 9.02 L8.91 8.26 Z" />
              </svg>
            ))}
          </div>

          {/* Title */}
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 56,
              color: "#232323",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            Ostavite Recenziju
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 20,
              color: "#78716c",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Podelite vaše iskustvo sa HALO Uspomene
          </span>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 60,
                height: 1,
                background: "#AE343F",
                opacity: 0.3,
              }}
            />
            <span style={{ fontSize: 18, color: "#AE343F", opacity: 0.5 }}>
              &#9829;
            </span>
            <div
              style={{
                width: 60,
                height: 1,
                background: "#AE343F",
                opacity: 0.3,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "#AE343F",
          opacity: 0.6,
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: serifFontData,
          style: "normal" as const,
          weight: 400 as const,
        },
        {
          name: "Josefin Sans",
          data: sansFontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    },
  );
}
