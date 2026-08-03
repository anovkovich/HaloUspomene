import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Lažni matičar — simbolična ceremonija venčanja | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  // Satori ne dekodira WebP, pa OG koristi PNG kopiju hero fotografije, inline
  // kao data URI. Generisana iz /public/images/lazni-maticar/ceremonija.webp
  // (resize na 620px) — regenerisati ako se hero fotografija promeni.
  const [serifFontData, sansFontData, photoData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/lazni-maticar/og-ceremonija.png")),
  ]);
  const photoSrc = `data:image/png;base64,${photoData.toString("base64")}`;

  return new ImageResponse(
    (
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
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 16,
              color: "#78716c",
            }}
          >
            Simbolična ceremonija venčanja
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
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 60,
                  height: 1,
                  background: "#AE343F",
                  opacity: 0.3,
                }}
              />
              {/* Inline SVG: a text ✦ makes Satori fetch a symbol font at
                  build time, which fails on the build machine. */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#d4af37">
                <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
              </svg>
              <div
                style={{
                  width: 60,
                  height: 1,
                  background: "#AE343F",
                  opacity: 0.3,
                }}
              />
            </div>

            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 58,
                color: "#232323",
                lineHeight: 1.15,
                textAlign: "center",
                maxWidth: 920,
              }}
            >
              Lažni matičar — prave suze
            </span>

            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 20,
                color: "#78716c",
                textAlign: "center",
              }}
            >
              Ceremoniju vodi glumac, po vašoj priči
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt=""
              width={620}
              height={232}
              style={{ objectFit: "contain" }}
            />

            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 16,
                color: "#AE343F",
                textAlign: "center",
                letterSpacing: "0.1em",
              }}
            >
              Emotivno ili šaljivo · Bez papirologije · Cela Srbija
            </span>
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
