import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Izrada pozivnica online za svaku priliku | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Faint skeleton "bullet list" (dot + bar) used inside cards so they read as a
 *  real invitation rather than blank space. Mirrors the /cene OG helper. */
function bulletLines(
  innerWidth: number,
  barColor: string,
  dotColor: string,
  widths: number[],
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        width: innerWidth,
        marginTop: 14,
      }}
    >
      {widths.map((w, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <div
            style={{
              display: "flex",
              width: 4,
              height: 4,
              borderRadius: 2,
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              height: 5,
              width: w,
              borderRadius: 3,
              background: barColor,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  // Shared card frame. The three occasion cards are absolutely positioned
  // within the fan container and rotated into an arc.
  const cardBase = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "absolute" as const,
    width: 150,
    height: 246,
    borderRadius: 18,
    padding: "22px 12px",
  };

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
            Pozivnice za sve prilike
          </span>
        </div>

        {/* Main row */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 30,
            marginTop: 4,
          }}
        >
          {/* Fan of three occasion cards */}
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 540,
              height: 430,
            }}
          >
            {/* Dečiji rođendan — left, playful */}
            <div
              style={{
                ...cardBase,
                left: 14,
                top: 96,
                transform: "rotate(-8deg)",
                background: "#ffffff",
                border: "1px solid rgba(35,35,35,0.10)",
                boxShadow: "0 14px 32px rgba(35,35,35,0.14)",
              }}
            >
              {/* confetti */}
              <div style={{ display: "flex", position: "absolute", top: 16, left: 18, width: 8, height: 8, borderRadius: 4, background: "rgba(174,52,63,0.45)" }} />
              <div style={{ display: "flex", position: "absolute", top: 24, right: 20, width: 7, height: 7, borderRadius: 4, background: "rgba(212,175,55,0.6)" }} />
              <div style={{ display: "flex", position: "absolute", top: 13, right: 44, width: 6, height: 6, borderRadius: 3, background: "rgba(74,123,166,0.55)" }} />
              <div style={{ display: "flex", position: "absolute", top: 44, left: 30, width: 6, height: 6, borderRadius: 3, background: "rgba(122,155,109,0.55)" }} />
              <div style={{ display: "flex", position: "absolute", bottom: 30, left: 22, width: 6, height: 6, borderRadius: 3, background: "rgba(212,175,55,0.5)" }} />
              <div style={{ display: "flex", position: "absolute", bottom: 38, right: 24, width: 8, height: 8, borderRadius: 4, background: "rgba(174,52,63,0.32)" }} />
              <span
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 58,
                  color: "#AE343F",
                  lineHeight: 1,
                }}
              >
                5
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#78716c",
                  marginTop: 8,
                }}
              >
                Dečiji rođendan
              </span>
              {bulletLines(
                108,
                "rgba(35,35,35,0.10)",
                "rgba(174,52,63,0.4)",
                [92, 74, 84],
              )}
            </div>

            {/* Venčanje — right, elegant / rich */}
            <div
              style={{
                ...cardBase,
                left: 372,
                top: 96,
                transform: "rotate(8deg)",
                background: "#FDFBF5",
                border: "1px solid rgba(212,175,55,0.5)",
                boxShadow: "0 14px 32px rgba(35,35,35,0.14)",
              }}
            >
              {/* inner gold frame */}
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  top: 10,
                  left: 10,
                  right: 10,
                  bottom: 10,
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 12,
                }}
              />
              {/* ornamental divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <div style={{ display: "flex", width: 20, height: 1, background: "rgba(212,175,55,0.7)" }} />
                <div style={{ display: "flex", width: 6, height: 6, background: "#d4af37", transform: "rotate(45deg)" }} />
                <div style={{ display: "flex", width: 20, height: 1, background: "rgba(212,175,55,0.7)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", marginTop: 8 }}>
                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 40, color: "#232323" }}>M </span>
                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 40, color: "#d4af37" }}>&amp;</span>
                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 40, color: "#232323" }}> J</span>
              </div>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#78716c",
                  marginTop: 8,
                }}
              >
                Venčanje
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "#a08a4a",
                  marginTop: 6,
                }}
              >
                12 · 08 · 2025
              </span>
              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  background: "#AE343F",
                  color: "#fff",
                  fontFamily: "Josefin Sans",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  padding: "5px 12px",
                  borderRadius: 999,
                }}
              >
                Potvrdi dolazak
              </div>
            </div>

            {/* Punoletstvo — center, gold cream anchor (drawn last → on top) */}
            <div
              style={{
                ...cardBase,
                width: 160,
                height: 262,
                left: 190,
                top: 40,
                transform: "rotate(0deg)",
                background: "#FDF6EC",
                border: "1px solid rgba(212,175,55,0.5)",
                boxShadow: "0 20px 42px rgba(35,35,35,0.20)",
              }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "rgba(212,175,55,0.75)",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: 72,
                  color: "#d4af37",
                  lineHeight: 1,
                  marginTop: 10,
                }}
              >
                18
              </span>
              <span
                style={{
                  fontFamily: "Josefin Sans",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#8a7a4a",
                  marginTop: 10,
                }}
              >
                Punoletstvo
              </span>
              <div
                style={{
                  display: "flex",
                  width: 78,
                  height: 2,
                  background: "rgba(212,175,55,0.55)",
                  marginTop: 20,
                }}
              />
            </div>
          </div>

          {/* Right text block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 62,
                color: "#232323",
                lineHeight: 1.02,
              }}
            >
              Izrada pozivnica
            </span>
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 33,
                fontStyle: "italic",
                color: "#AE343F",
                lineHeight: 1.1,
              }}
            >
              online — za svaku priliku
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
                fontSize: 18,
                color: "#3a3a3a",
                lineHeight: 1.5,
                maxWidth: 460,
              }}
            >
              Venčanje, dečiji rođendan ili punoletstvo — pozivnica sa
              potvrdama dolaska, odbrojavanjem i mapom.
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
                "Gotova odmah",
                "Deli se jednim linkom",
                "Potvrde dolaska uživo",
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

        {/* Bottom accent line — house signature */}
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
