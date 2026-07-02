import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Moje Venčanje — Planer za Organizaciju | HALO Uspomene";
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
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse 80% 70% at 50% 45%, #FAF9F0, #F5F4DC)",
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

      {/* Decorative line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 14,
        }}
      >
        <div style={{ width: 80, height: 1, background: "#d4af37", opacity: 0.4 }} />
        <span style={{ fontSize: 22, color: "#d4af37", opacity: 0.6 }}>&#9829;</span>
        <div style={{ width: 80, height: 1, background: "#d4af37", opacity: 0.4 }} />
      </div>

      {/* Title */}
      <span
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: 72,
          color: "#232323",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Moje Venčanje
      </span>

      {/* Subtitle */}
      <span
        style={{
          fontFamily: "Josefin Sans",
          fontSize: 24,
          color: "#78716c",
          marginTop: 20,
          letterSpacing: "0.12em",
        }}
      >
        Planer za organizaciju venčanja
      </span>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 36,
        }}
      >
        {["Checklista", "Budžet", "Praćenje"].map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              padding: "10px 28px",
              borderRadius: 999,
              border: "1px solid rgba(212, 175, 55, 0.35)",
              fontFamily: "Josefin Sans",
              fontSize: 16,
              color: "#d4af37",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          width: 200,
          height: 2,
          background: "#AE343F",
          opacity: 0.35,
          borderRadius: 2,
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: serifFontData, style: "normal" as const, weight: 400 as const },
        { name: "Josefin Sans", data: sansFontData, style: "normal" as const, weight: 400 as const },
      ],
    },
  );
}
