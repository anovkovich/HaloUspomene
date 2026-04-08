import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 60;

/**
 * Removes background via fal.ai birefnet (REST API, no SDK).
 * Returns a transparent PNG stored in Vercel Blob.
 * The client renders it on white background via CSS.
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }

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

    // Store transparent PNG in Vercel Blob
    const imgRes = await fetch(transparentUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const blob = await put(
      `premium/whitened/${Date.now()}.png`,
      imgBuffer,
      { access: "public", contentType: "image/png" },
    );

    return NextResponse.json({ resultUrl: blob.url });
  } catch (err) {
    console.error("Whiten-bg error:", err);
    return NextResponse.json({ resultUrl: "" }, { status: 500 });
  }
}
