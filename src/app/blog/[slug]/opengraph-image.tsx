import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getBlogPost } from "@/data/blog/posts";

export const alt = "HALO Uspomene Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_EMOJI: Record<string, string> = {
  Vodič: "📖",
  Poređenje: "⚖️",
  Saveti: "💡",
  Trendovi: "✨",
  Checklista: "✅",
};

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  const fontsDir = join(process.cwd(), "src/app/pozivnica/[slug]/fonts");
  const [serifFontData, sansFontData] = await Promise.all([
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "JosefinSans-Regular.ttf")),
  ]);

  const title = post ? truncate(post.title, 80) : "Blog";
  const category = post?.category ?? "";
  const emoji = CATEGORY_EMOJI[category] ?? "📝";
  const readTime = post?.readTime ? `${post.readTime} min čitanja` : "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "radial-gradient(ellipse 80% 70% at 50% 45%, #FAF9F0, #F5F4DC)",
        position: "relative",
        padding: "60px 80px",
      }}
    >
      {/* Top bar: logo + category */}
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
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Josefin Sans",
              fontSize: 16,
              color: "#78716c",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span>{emoji}</span>
            <span>{category}</span>
          </div>
        )}
      </div>

      {/* Center: title */}
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
            maxWidth: 960,
          }}
        >
          {/* Decorative line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
            <span style={{ fontSize: 18, color: "#AE343F", opacity: 0.5 }}>&#9829;</span>
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
          </div>

          {/* Title */}
          <span
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: title.length > 50 ? 42 : 52,
              color: "#232323",
              lineHeight: 1.25,
              textAlign: "center",
            }}
          >
            {title}
          </span>

          {/* Decorative line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
            <div style={{ width: 60, height: 1, background: "#AE343F", opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Bottom: read time + blog label */}
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
            color: "#a8a29e",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Blog
        </span>
        {readTime && (
          <span
            style={{
              fontFamily: "Josefin Sans",
              fontSize: 15,
              color: "#a8a29e",
            }}
          >
            {readTime}
          </span>
        )}
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
