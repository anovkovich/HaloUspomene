import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getTier } from "@/data/pricing";

export const alt =
  "Cene i paketi za venčanje — pozivnica, raspored, galerija, audio | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Thousands with a dot separator (sr): 9900 → "9.900". Avoids relying on
 *  toLocaleString locale data being present in the build runtime. */
function din(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  const osnovno = getTier("osnovno")?.price ?? 5000;
  const kompletno = getTier("kompletno");
  const kompletnoPrice = kompletno?.price ?? 9900;
  const kompletnoFull = kompletno?.fullPrice ?? 14000;
  const premium = getTier("premium")?.price ?? 13900;
  const savings = kompletnoFull - kompletnoPrice;

  // Faint skeleton "bullet list" (dot + bar) to fill the empty lower half of a
  // card so it reads as a feature list rather than blank space.
  const bulletLines = (
    innerWidth: number,
    barColor: string,
    dotColor: string,
    widths: number[],
    marginTop: number,
  ) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 13,
        width: innerWidth,
        marginTop,
      }}
    >
      {widths.map((w, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div
            style={{
              display: "flex",
              width: 5,
              height: 5,
              borderRadius: 3,
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              height: 6,
              width: w,
              borderRadius: 3,
              background: barColor,
            }}
          />
        </div>
      ))}
    </div>
  );

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
            Cene i paketi
          </span>
        </div>

        {/* Main row */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 44,
            marginTop: 8,
          }}
        >
          {/* Mini tier "podium" */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 16,
              width: 480,
              height: 420,
            }}
          >
            {/* Osnovni */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 140,
                height: 280,
                background: "#ffffff",
                border: "1px solid rgba(35,35,35,0.12)",
                borderRadius: 20,
                padding: "26px 12px",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#78716c",
                }}
              >
                Osnovni
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 44,
                  color: "#232323",
                  lineHeight: 1,
                }}
              >
                {din(osnovno)}
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 12,
                  color: "#a8a29e",
                  letterSpacing: "0.1em",
                }}
              >
                din
              </span>
              {bulletLines(
                116,
                "rgba(35,35,35,0.10)",
                "rgba(174,52,63,0.35)",
                [96, 78, 88, 68],
                24,
              )}
            </div>

            {/* Kompletan — highlighted, tallest */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 168,
                height: 360,
                background: "#ffffff",
                border: "2px solid #AE343F",
                borderRadius: 22,
                boxShadow: "0 14px 34px rgba(174,52,63,0.20)",
                padding: "20px 14px 26px",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontFamily: "Josefin Sans",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  background: "#AE343F",
                  borderRadius: 999,
                  padding: "5px 12px",
                }}
              >
                Najpopularnije
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#AE343F",
                  marginTop: 6,
                }}
              >
                Kompletan
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 62,
                  color: "#232323",
                  lineHeight: 1,
                }}
              >
                {din(kompletnoPrice)}
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 15,
                  color: "#a8a29e",
                  textDecoration: "line-through",
                }}
              >
                {din(kompletnoFull)}
              </span>
              <span
                style={{
                  display: "flex",
                  fontFamily: "Josefin Sans",
                  fontSize: 13,
                  color: "#15803d",
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                ušteda {din(savings)}
              </span>
              {bulletLines(
                140,
                "rgba(35,35,35,0.10)",
                "rgba(174,52,63,0.5)",
                [116, 96, 108, 84],
                16,
              )}
            </div>

            {/* Premium — dark/gold */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 140,
                height: 280,
                background: "#232323",
                borderRadius: 20,
                padding: "26px 12px",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#d4af37",
                }}
              >
                Premium
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 44,
                  color: "#F5F4DC",
                  lineHeight: 1,
                }}
              >
                {din(premium)}
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 12,
                  color: "rgba(212,175,55,0.7)",
                  letterSpacing: "0.1em",
                }}
              >
                din
              </span>
              {bulletLines(
                116,
                "rgba(245,244,220,0.16)",
                "rgba(212,175,55,0.55)",
                [96, 78, 88, 68],
                24,
              )}
            </div>
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
                fontSize: 64,
                color: "#232323",
                lineHeight: 1.02,
              }}
            >
              Cene i paketi
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
              za vaše venčanje
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
              Pozivnica, raspored sedenja, QR galerija i audio knjiga utisaka —
              u paketu, uz besplatan dizajn štampanih.
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
                "Gotova pozivnica odmah",
                "Fiksne cene — bez skrivenih troškova",
                "Najveći popust uz Kompletan paket",
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
