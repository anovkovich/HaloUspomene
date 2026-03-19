import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "HALO Uspomene Blog";
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
        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 16,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#78716c",
          }}
        >
          Blog
        </span>
      </div>

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
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
            <span style={{ fontSize: 18, color: "#AE343F", opacity: 0.5 }}>&#9829;</span>
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
          </div>

          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 56,
              color: "#232323",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            Saveti za Vaše Venčanje
          </span>

          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 20,
              color: "#78716c",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Vodič, trendovi, checkliste i inspiracija za nezaboravan dan
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
          </div>
        </div>
      </div>

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
