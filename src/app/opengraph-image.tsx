import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt =
  "HALO Uspomene — pozivnice, raspored sedenja i audio uspomene za venčanja u Srbiji";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData, heroImageData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/og-hero.png")),
  ]);

  const heroSrc = `data:image/png;base64,${heroImageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, #FAF9F0, #F0EFD4)",
          position: "relative",
          padding: "44px 60px 30px",
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
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#AE343F",
              fontWeight: 700,
            }}
          >
            Platforma za venčanja
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginTop: 26,
          }}
        >
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 60,
              color: "#232323",
              lineHeight: 1,
            }}
          >
            Sve za venčanje
          </span>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 60,
              fontStyle: "italic",
              color: "#AE343F",
              lineHeight: 1,
            }}
          >
            na jednom mestu!
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontFamily: "Josefin Sans",
            fontSize: 20,
            color: "#3a3a3a",
            lineHeight: 1.45,
            maxWidth: 1020,
            marginTop: 16,
          }}
        >
          Web i Premium AI pozivnice sa potvrdama dolaska, raspored sedenja, QR
          galerija slika i audio knjiga uspomena — sve za vaše venčanje.
        </span>

        {/* Hero image: retro phone + invitation on mobile + seating on laptop */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <img
            alt=""
            src={heroSrc}
            width={860}
            height={350}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background:
              "linear-gradient(90deg, #AE343F 0%, #d4af37 50%, #AE343F 100%)",
            opacity: 0.85,
          }}
        />
      </div>
    ),
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
