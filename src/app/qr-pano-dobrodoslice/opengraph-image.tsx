import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt =
  "QR Pano Dobrodošlice — Pametan raspored sedenja za svadbu | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Suptilna šema sale (stolovi + mladenački sto + podijum + dvokrilna vrata)
 *  kao linijski watermark u pozadini. */
function HallWatermark() {
  const cols = [60, 150, 420, 510];
  const rows = [56, 122, 188, 254];
  const tables: { cx: number; cy: number }[] = [];
  rows.forEach((cy) => cols.forEach((cx) => tables.push({ cx, cy })));
  return (
    <svg
      width="760"
      height="480"
      viewBox="0 0 570 360"
      xmlns="http://www.w3.org/2000/svg"
    >
      {tables.map((t, i) => (
        <circle
          key={i}
          cx={t.cx}
          cy={t.cy}
          r={20}
          fill="none"
          stroke="#232323"
          strokeWidth={2}
        />
      ))}
      <rect
        x={222}
        y={42}
        width={126}
        height={30}
        rx={7}
        fill="none"
        stroke="#232323"
        strokeWidth={2}
      />
      <rect
        x={222}
        y={100}
        width={126}
        height={120}
        rx={10}
        fill="none"
        stroke="#232323"
        strokeWidth={2}
        strokeDasharray="5 6"
      />
      <g stroke="#232323" strokeWidth={2} fill="none">
        <line x1="195" y1="312" x2="250" y2="312" />
        <line x1="320" y1="312" x2="375" y2="312" />
        <line x1="250" y1="312" x2="250" y2="277" />
        <path d="M250 277 A 35 35 0 0 1 285 312" />
        <line x1="320" y1="312" x2="320" y2="277" />
        <path d="M320 277 A 35 35 0 0 0 285 312" />
      </g>
    </svg>
  );
}

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData, scriptFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
    readFile(join(fontsDir, "GreatVibes-Regular.ttf")),
  ]);

  // QR code mock pattern (12x12 grid)
  const qrGrid = [
    "111111100110001111110",
    "100000100101001000001",
    "101110100110001011101",
    "101110101010001011101",
    "101110100011101011101",
    "100000100110001000001",
    "111111101010101111110",
    "000000001110100000000",
    "101010111000110110010",
    "010101001011001100101",
    "111010110101011010010",
    "100110000110100101100",
    "001111110010101110110",
    "010101010101010101010",
    "111001011100110010010",
    "000000001111001000110",
    "111111101010100101010",
    "100000100110111100110",
    "101110100110001011101",
    "101110100011101011101",
    "111111111111111111111",
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
      {/* Hall-scheme watermark (background) */}
      <div
        style={{
          position: "absolute",
          top: 178,
          right: 10,
          display: "flex",
          opacity: 0.06,
        }}
      >
        <HallWatermark />
      </div>

      {/* Gold inner frame */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          right: 22,
          bottom: 22,
          border: "2px solid rgba(212,175,55,0.30)",
          borderRadius: 10,
          display: "flex",
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
          QR Pano Dobrodošlice
        </span>
      </div>

      {/* Main row */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 50,
          marginTop: 16,
        }}
      >
        {/* Mock pano (left) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 320,
            height: 440,
            background: "#FFFFFF",
            borderRadius: 6,
            border: "1px solid #e7e3d4",
            boxShadow: "0 26px 55px rgba(0,0,0,0.15)",
            padding: "32px 24px",
            position: "relative",
          }}
        >
          {/* Elegantan dupli zlatni okvir (kao na pravom panou) */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
              border: "1px solid rgba(212,175,55,0.6)",
              borderRadius: 4,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              right: 18,
              bottom: 18,
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 3,
              display: "flex",
            }}
          />
          {/* Decorative top */}
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a8a29e",
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            Dobrodošli na venčanje
          </span>
          <span
            style={{
              fontFamily: "Great Vibes",
              fontSize: 47,
              color: "#AE343F",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Ana &amp; Marko
          </span>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 14,
              color: "#232323",
              opacity: 0.6,
              marginBottom: 14,
            }}
          >
            pronađi svoje mesto sedenja
          </span>
          {/* Ornamental divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 36,
                height: 1,
                background: "rgba(212,175,55,0.7)",
              }}
            />
            <div
              style={{
                display: "flex",
                width: 7,
                height: 7,
                marginLeft: 9,
                marginRight: 9,
                background: "#d4af37",
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                display: "flex",
                width: 36,
                height: 1,
                background: "rgba(212,175,55,0.7)",
              }}
            />
          </div>
          {/* QR mock — bez okvira, kao na pravom panou */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              padding: 2,
            }}
          >
            <svg
              width="168"
              height="168"
              viewBox="0 0 21 21"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="crispEdges"
            >
              <rect width="21" height="21" fill="#ffffff" />
              {qrGrid
                .slice(0, 21)
                .map((row, ry) =>
                  row
                    .split("")
                    .map((cell, rx) =>
                      cell === "1" ? (
                        <rect
                          key={`${rx}-${ry}`}
                          x={rx}
                          y={ry}
                          width="1"
                          height="1"
                          fill="#232323"
                        />
                      ) : null,
                    ),
                )}
            </svg>
          </div>
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 11,
              color: "#232323",
              opacity: 0.55,
              marginTop: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Skenirajte
          </span>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: 999,
              background: "rgba(174,52,63,0.08)",
              border: "1px solid rgba(174,52,63,0.25)",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 14,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#AE343F",
                fontWeight: 700,
              }}
            >
              Pametan raspored sedenja
            </span>
          </div>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 64,
              color: "#232323",
              lineHeight: 1.0,
            }}
          >
            QR Pano
          </span>
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: 38,
              fontStyle: "italic",
              color: "#AE343F",
              lineHeight: 1.0,
            }}
          >
            dobrodošlice
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
              maxWidth: 470,
            }}
          >
            Gosti skeniraju pano na ulazu, ukucaju ime — i telefon ih vodi do
            njihovog stola za 2 sekunde.
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 6,
            }}
          >
            {[
              "Lako rasporedite goste po stolovima",
              "Bez hostese, bez štampanih spiskova",
              "Promene moguće u realnom vremenu",
              "B1 format spreman za štampu",
            ].map((line) => (
              <div
                key={line}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: "#AE343F",
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
        {
          name: "Great Vibes",
          data: scriptFontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    },
  );
}
