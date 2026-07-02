import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "HALO Uspomene — Račun";
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
        background: "#f5f5f0",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Receipt card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "white",
          padding: "48px 64px",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "2px dashed #ddd",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 14,
            letterSpacing: "0.35em",
            color: "#aaa",
          }}
        >
          — — — — — — — — —
        </span>

        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 28,
            fontWeight: "bold",
            letterSpacing: "0.2em",
            color: "#333",
          }}
        >
          HaloUspomene.rs
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 50, height: 1, background: "#AE343F", opacity: 0.3 }} />
          <span style={{ fontSize: 16, color: "#AE343F", opacity: 0.5 }}>&#9829;</span>
          <div style={{ width: 50, height: 1, background: "#AE343F", opacity: 0.3 }} />
        </div>

        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: 40,
            color: "#232323",
            textAlign: "center",
          }}
        >
          Vaša porudžbina je spremna
        </span>

        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 16,
            color: "#999",
          }}
        >
          Skenirajte NBS IPS QR kod i platite u sekundi
        </span>

        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 14,
            letterSpacing: "0.35em",
            color: "#aaa",
          }}
        >
          — — — — — — — — —
        </span>
      </div>

      {/* Bottom accent */}
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
        { name: "Cormorant Garamond", data: serifFontData, style: "normal" as const, weight: 400 as const },
        { name: "Josefin Sans", data: sansFontData, style: "normal" as const, weight: 400 as const },
      ],
    },
  );
}
