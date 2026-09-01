import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

export const runtime = "nodejs"; // sharp + fs
export const alt =
  "Telefon Uspomena — Retro Telefon za Venčanja | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData, phoneWebp] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
    readFile(join(process.cwd(), "public/images/phone.webp")),
  ]);

  // Satori can't decode webp — convert the hero image to a PNG data URI. The
  // source has a transparent background, so keep the alpha (no flatten) and fit
  // by width; it floats on the OG background with no frame.
  const phoneW = 400;
  const phoneH = 267; // 1536×1024 source → 3:2
  const phonePng = await sharp(phoneWebp)
    .resize({ width: phoneW })
    .png()
    .toBuffer();
  const phoneSrc = `data:image/png;base64,${phonePng.toString("base64")}`;

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
          padding: "50px 70px",
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
            Audio Guest Book
          </span>
        </div>

        {/* Main row */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            marginTop: 8,
          }}
        >
          {/* Phone hero image — transparent PNG, no frame, floats on the bg */}
          <div
            style={{
              display: "flex",
              width: 460,
              height: 420,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Satori (next/og) renders raw <img>; next/image doesn't apply here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={phoneSrc} alt="" width={phoneW} height={phoneH} />
          </div>

          {/* Right text block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 66,
                color: "#232323",
                lineHeight: 1.02,
              }}
            >
              Telefon Uspomena
            </span>
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 34,
                fontStyle: "italic",
                color: "#AE343F",
                lineHeight: 1.1,
              }}
            >
              audio knjiga utisaka
            </span>
            <div
              style={{
                display: "flex",
                width: 80,
                height: 3,
                background: "#AE343F",
                marginTop: 4,
                marginBottom: 4,
                opacity: 0.7,
              }}
            />
            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 19,
                color: "#3a3a3a",
                lineHeight: 1.5,
                maxWidth: 470,
              }}
            >
              Retro telefon na kome gosti ostavljaju glasovne poruke — uspomena
              koju slušate godinama posle venčanja.
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
                marginTop: 6,
              }}
            >
              {[
                "Dostava u celoj Srbiji",
                "Lična dostava i montaža u Novom Sadu",
                "Sve poruke digitalno, spremne za preuzimanje",
              ].map((line) => (
                <div
                  key={line}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      display: "flex",
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: "#AE343F",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Josefin Sans",
                      fontSize: 15,
                      color: "#444",
                    }}
                  >
                    {line}
                  </span>
                </div>
              ))}
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
