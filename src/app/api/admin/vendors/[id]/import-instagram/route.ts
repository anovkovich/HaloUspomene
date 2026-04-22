import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { put, del } from "@vercel/blob";
import { getVendorById, patchVendor } from "@/lib/vendors";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

// Instagram anonymously serves a login wall, but Googlebot gets the full
// profile HTML including og:image. The og:image URL is a signed CDN URL that
// expires in ~24h, so we download the bytes and persist them to Vercel Blob.
const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin_token");
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, secret);
    return true;
  } catch {
    return false;
  }
}

function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .split("?")[0];
}

function extractOgImage(html: string): string | null {
  // og:image can appear with either attribute order; handle both.
  const patterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      // HTML entities → characters
      return m[1].replace(/&amp;/g, "&");
    }
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const vendor = await getVendorById(id);
  if (!vendor)
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  if (!vendor.instagram)
    return NextResponse.json(
      { error: "Vendor nema Instagram handle. Unesi ga prvo." },
      { status: 400 },
    );

  const handle = normalizeHandle(vendor.instagram);
  if (!handle)
    return NextResponse.json(
      { error: "Instagram handle nije validan." },
      { status: 400 },
    );

  const profileUrl = `https://www.instagram.com/${handle}/`;

  let html: string;
  try {
    const res = await fetch(profileUrl, {
      headers: { "User-Agent": GOOGLEBOT_UA, Accept: "text/html" },
      // Don't follow redirects to instagram.com/accounts/login/
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok)
      return NextResponse.json(
        { error: `Instagram je vratio status ${res.status}` },
        { status: 502 },
      );
    html = await res.text();
  } catch (err) {
    console.error("IG fetch failed:", err);
    return NextResponse.json(
      { error: "Greška pri pristupu Instagram profilu." },
      { status: 502 },
    );
  }

  const ogImage = extractOgImage(html);
  if (!ogImage)
    return NextResponse.json(
      {
        error:
          "Profil nije pronađen ili je privatan (nema og:image). Probaj ručni upload.",
      },
      { status: 404 },
    );

  // Download the actual image bytes before the signed URL expires.
  let buffer: ArrayBuffer;
  let contentType = "image/jpeg";
  try {
    const imgRes = await fetch(ogImage, { cache: "no-store" });
    if (!imgRes.ok)
      return NextResponse.json(
        {
          error: `Preuzimanje slike nije uspelo (status ${imgRes.status}).`,
        },
        { status: 502 },
      );
    contentType = imgRes.headers.get("content-type") || contentType;
    buffer = await imgRes.arrayBuffer();
  } catch (err) {
    console.error("IG image download failed:", err);
    return NextResponse.json(
      { error: "Greška pri preuzimanju slike." },
      { status: 502 },
    );
  }

  if (buffer.byteLength === 0)
    return NextResponse.json(
      { error: "Preuzeta slika je prazna." },
      { status: 502 },
    );

  // Replace the previous logo in Blob to avoid orphans.
  if (vendor.logoUrl) {
    try {
      await del(vendor.logoUrl);
    } catch {
      // Non-fatal.
    }
  }

  const ext = contentType.includes("png") ? "png" : "jpg";
  const pathname = `vendors/${id}/logo-ig-${Date.now()}.${ext}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
  });

  await patchVendor(id, { logoUrl: blob.url });

  return NextResponse.json({ url: blob.url, source: "instagram", handle });
}
