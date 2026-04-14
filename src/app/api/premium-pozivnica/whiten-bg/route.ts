import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Removes background via fal.ai birefnet (REST API, no SDK), then
 * compresses the transparent PNG to WebP before storing in Vercel Blob.
 * Typical size drops from 1-3MB PNG → 150-300KB WebP with no visible
 * quality loss on the transparent edges.
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, bride, groom } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }
    const slug = bride && groom
      ? `${bride.trim().toLowerCase()}-${groom.trim().toLowerCase()}`
      : "unknown";

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json({ resultUrl: imageUrl });
    }

    // Submit to fal.ai queue
    const submitRes = await fetch("https://queue.fal.run/fal-ai/birefnet", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!submitRes.ok) {
      console.error("fal.ai submit error:", await submitRes.text());
      return NextResponse.json({ resultUrl: imageUrl });
    }

    const { request_id } = await submitRes.json();
    if (!request_id) {
      return NextResponse.json({ resultUrl: imageUrl });
    }

    // Poll for result
    let result: any = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/birefnet/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${falKey}` } },
      );
      const status = await statusRes.json();
      if (status.status === "COMPLETED") {
        // Fetch the result
        const resultRes = await fetch(
          `https://queue.fal.run/fal-ai/birefnet/requests/${request_id}`,
          { headers: { Authorization: `Key ${falKey}` } },
        );
        result = await resultRes.json();
        break;
      }
      if (status.status === "FAILED") {
        console.error("fal.ai birefnet failed:", status);
        return NextResponse.json({ resultUrl: imageUrl });
      }
    }

    if (!result) {
      return NextResponse.json({ resultUrl: imageUrl });
    }

    const transparentUrl = result.image?.url;
    if (!transparentUrl) {
      return NextResponse.json({ resultUrl: imageUrl });
    }

    // Fetch the transparent PNG from birefnet
    const imgRes = await fetch(transparentUrl);
    const pngBuffer = Buffer.from(await imgRes.arrayBuffer());

    // Compress + convert to WebP (preserves alpha channel).
    // - resize caps max width at 1400px (birefnet often returns 1024+)
    // - quality 88 is visually indistinguishable from 100 on illustrations
    // - effort 6 (max CPU) — we run this once and cache forever
    // - alphaQuality 95 keeps the cut-out edges crisp
    let storedBuffer: Buffer = pngBuffer;
    let contentType = "image/png";
    let extension = "png";
    try {
      const webpBuffer = await sharp(pngBuffer)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 88, effort: 6, alphaQuality: 95 })
        .toBuffer();
      storedBuffer = webpBuffer;
      contentType = "image/webp";
      extension = "webp";
    } catch (err) {
      // If sharp fails for any reason, fall back to storing the raw PNG
      // so the user flow still completes.
      console.error("sharp WebP conversion failed, storing PNG:", err);
    }

    const blob = await put(
      `premium/whitened/${slug}/${Date.now()}.${extension}`,
      storedBuffer,
      { access: "public", contentType },
    );

    return NextResponse.json({ resultUrl: blob.url });
  } catch (err) {
    console.error("Whiten-bg error:", err);
    return NextResponse.json({ resultUrl: "" }, { status: 500 });
  }
}
