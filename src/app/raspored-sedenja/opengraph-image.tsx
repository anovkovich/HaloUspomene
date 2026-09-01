import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt =
  "Raspored sedenja za svadbu ili događaj — online alat | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  // Visual: mini seating diagram (round tables + chairs) on the left,
  // typography on the right. Brand cream + burgundy accents.
  const tablePositions = [
    { cx: 90, cy: 90, r: 40, chairs: 8 },
    { cx: 220, cy: 90, r: 40, chairs: 8 },
    { cx: 350, cy: 90, r: 40, chairs: 8 },
    { cx: 90, cy: 220, r: 40, chairs: 8 },
    { cx: 220, cy: 220, r: 40, chairs: 8 },
    { cx: 350, cy: 220, r: 40, chairs: 8 },
    { cx: 90, cy: 350, r: 40, chairs: 8 },
    { cx: 220, cy: 350, r: 50, chairs: 0 }, // mladenacki sto (highlight)
    { cx: 350, cy: 350, r: 40, chairs: 8 },
  ];

  return new ImageResponse(
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
          Raspored sedenja online
        </span>
      </div>

      {/* Main row */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          marginTop: 16,
        }}
      >
        {/* Mini seating diagram */}
        <div
          style={{
            display: "flex",
            width: 440,
            height: 440,
            position: "relative",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 24,
            border: "1px solid rgba(174,52,63,0.15)",
            padding: 8,
          }}
        >
          <svg
            width="440"
            height="440"
            viewBox="0 0 440 440"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hall outline */}
            <rect
              x="20"
              y="20"
              width="400"
              height="400"
              rx="12"
              fill="none"
              stroke="#AE343F"
              strokeWidth="2"
              strokeDasharray="4 6"
              opacity="0.35"
            />
            {/* Tables */}
            {tablePositions.map((t, i) => {
              const isMladenacki = i === 7;
              return (
                <g key={i}>
                  {/* Chairs around */}
                  {!isMladenacki &&
                    Array.from({ length: t.chairs }).map((_, ci) => {
                      const angle = (ci / t.chairs) * Math.PI * 2;
                      const cx = t.cx + Math.cos(angle) * (t.r + 12);
                      const cy = t.cy + Math.sin(angle) * (t.r + 12);
                      return (
                        <circle
                          key={ci}
                          cx={cx}
                          cy={cy}
                          r="5"
                          fill="#232323"
                          opacity="0.35"
                        />
                      );
                    })}
                  {/* Table circle */}
                  <circle
                    cx={t.cx}
                    cy={t.cy}
                    r={t.r}
                    fill={isMladenacki ? "#AE343F" : "#ffffff"}
                    stroke={isMladenacki ? "#AE343F" : "#AE343F"}
                    strokeWidth="2"
                    opacity={isMladenacki ? 0.95 : 0.85}
                  />
                  {/* Inner dot accent (replaces text label — Satori doesn't support <text>) */}
                  <circle
                    cx={t.cx}
                    cy={t.cy}
                    r={isMladenacki ? 10 : 6}
                    fill={isMladenacki ? "#F5F4DC" : "#AE343F"}
                    opacity={isMladenacki ? 0.95 : 0.5}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right text block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            alignItems: "flex-start",
            gap: 18,
          }}
        >
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 62,
              color: "#232323",
              lineHeight: 1.05,
            }}
          >
            Raspored sedenja
          </span>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 36,
              fontStyle: "italic",
              color: "#AE343F",
              lineHeight: 1.1,
            }}
          >
            za svadbu ili događaj
          </span>
          <div
            style={{
              display: "flex",
              width: 80,
              height: 3,
              background: "#AE343F",
              marginTop: 6,
              marginBottom: 6,
              opacity: 0.7,
            }}
          />
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 19,
              color: "#3a3a3a",
              lineHeight: 1.5,
              maxWidth: 480,
            }}
          >
            Alat za raspored stolova, Excel uvoz gostiju i QR Pano dobrodošlice
            za ulaz u salu.
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
            }}
          >
            {[
              "Svadbe · Konferencije · Korporativni eventi",
              "Promene u realnom vremenu do dana događaja",
              "B1 pano spreman za štampu",
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
