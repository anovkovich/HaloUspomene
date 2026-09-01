import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt =
  "Iznajmljivanje paviljona, barskih stolova i ventilatora za venčanje | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #FAF9F0 0%, #F5F4DC 50%, #EBE9D8 100%)",
          position: "relative",
          padding: "50px 70px",
        }}
      >
        {/* Decorative pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L22 18L40 20L22 22L20 40L18 22L0 20L18 18Z' fill='%23232323'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gold accent corners */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            width: 80,
            height: 80,
            borderTop: "3px solid #d4af37",
            borderLeft: "3px solid #d4af37",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 80,
            height: 80,
            borderTop: "3px solid #d4af37",
            borderRight: "3px solid #d4af37",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 80,
            height: 80,
            borderBottom: "3px solid #d4af37",
            borderLeft: "3px solid #d4af37",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 80,
            height: 80,
            borderBottom: "3px solid #d4af37",
            borderRight: "3px solid #d4af37",
            opacity: 0.5,
          }}
        />

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
              fontSize: 14,
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
              color: "#78716c",
            }}
          >
            Oprema za venčanja na otvorenom
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
            {/* Decorative line with diamond */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, #AE343F)",
                }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#d4af37">
                <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
              </svg>
              <div
                style={{
                  width: 50,
                  height: 1,
                  background: "linear-gradient(90deg, #AE343F, transparent)",
                }}
              />
            </div>

            {/* Equipment icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {/* Pavilion icon */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#AE343F"
                    strokeWidth="1.5"
                  >
                    <path d="M4 22V8L12 2L20 8V22" />
                    <path d="M2 22H22" />
                    <path d="M6 22V16H10V22" />
                    <path d="M14 22V16H18V22" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "Josefin Sans",
                    fontSize: 11,
                    color: "#78716c",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Paviljoni
                </span>
              </div>

              {/* Bar table icon */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#AE343F"
                    strokeWidth="1.5"
                  >
                    <path d="M8 22V12" />
                    <path d="M16 22V12" />
                    <ellipse cx="12" cy="9" rx="8" ry="3" />
                    <path d="M4 9V11C4 12.66 7.58 14 12 14C16.42 14 20 12.66 20 11V9" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "Josefin Sans",
                    fontSize: 11,
                    color: "#78716c",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Stolovi
                </span>
              </div>

              {/* Fan icon */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#AE343F"
                    strokeWidth="1.5"
                  >
                    <path d="M17.7 7.7A2.5 2.5 0 0 1 17 12H12V9.5a2.5 2.5 0 0 1 2.5-2.5c.62 0 1.19.22 1.63.6L17.7 7.7Z" />
                    <path d="M6.3 7.7A2.5 2.5 0 0 0 7 12H12V9.5a2.5 2.5 0 0 0-2.5-2.5c-.62 0-1.19.22-1.63.6L6.3 7.7Z" />
                    <path d="M17.7 16.3A2.5 2.5 0 0 0 17 12H12V14.5a2.5 2.5 0 0 0 2.5 2.5c.62 0 1.19-.22 1.63-.6L17.7 16.3Z" />
                    <path d="M6.3 16.3A2.5 2.5 0 0 1 7 12H12V14.5a2.5 2.5 0 0 1-2.5 2.5c-.62 0-1.19-.22-1.63-.6L6.3 16.3Z" />
                    <circle cx="12" cy="12" r="1.5" fill="#AE343F" />
                    <path d="M12 19V22" />
                    <path d="M8 22H16" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "Josefin Sans",
                    fontSize: 11,
                    color: "#78716c",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Ventilatori
                </span>
              </div>
            </div>

            {/* Main headline */}
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 56,
                color: "#232323",
                lineHeight: 1.15,
                textAlign: "center",
                maxWidth: 900,
              }}
            >
              Oprema za venčanje na otvorenom
            </span>

            {/* Subtitle */}
            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 20,
                color: "#78716c",
                textAlign: "center",
              }}
            >
              Paviljoni · Barski stolovi · Rashladni ventilatori
            </span>

            {/* CTA line */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 1,
                  background: "#d4af37",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 14,
                  color: "#AE343F",
                  textAlign: "center",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Doček svatova · Polazak od kuće · Ceremonija
              </span>
              <div
                style={{
                  width: 30,
                  height: 1,
                  background: "#d4af37",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 13,
              color: "#a8a29e",
            }}
          >
            Dostava i montaža širom Srbije
          </span>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, #d4af37, #AE343F, #d4af37)",
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
    }
  );
}
