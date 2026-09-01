import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  CATEGORY_CONTENT,
  CATEGORY_SLUGS,
} from "@/data/vendori/categories";

export const alt = "Wedding vendori — kategorija | HALO Uspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((slug) => ({ kategorija: slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ kategorija: string }>;
}) {
  const { kategorija } = await params;
  const content = CATEGORY_CONTENT.find((c) => c.slug === kategorija);

  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  // Fallback when an unknown slug somehow gets here — render a generic
  // vendor card so social previews never embarrass us with broken images.
  const title = content?.h1 ?? "Wedding vendori Srbija";
  const subtitle = content
    ? "Provereni dobavljači po gradovima"
    : "Provereni dobavljači za Vaš dan iz snova";
  // Trim the long DB intro to one tight line for the card.
  const blurb = content
    ? `${content.intro.split(".").slice(0, 1).join(".")}.`
    : "Filtrirajte po gradu i kategoriji, pogledajte preporuke parova.";

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
            Wedding Vendori
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
              maxWidth: 980,
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 60,
                color: "#232323",
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {title}
            </span>

            <span
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: 28,
                fontStyle: "italic",
                color: "#AE343F",
                textAlign: "center",
              }}
            >
              {subtitle}
            </span>

            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 18,
                color: "#78716c",
                textAlign: "center",
                maxWidth: 880,
                lineHeight: 1.5,
              }}
            >
              {blurb}
            </span>

            <span
              style={{
                fontFamily: "Josefin Sans",
                fontSize: 16,
                color: "#AE343F",
                textAlign: "center",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Beograd &nbsp;·&nbsp; Novi Sad &nbsp;·&nbsp; Niš &nbsp;·&nbsp;
              Subotica &nbsp;·&nbsp; Čačak &nbsp;·&nbsp; Kragujevac
            </span>
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
