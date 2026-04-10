import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

/**
 * Deletes ALL draft premium generation blobs after form submission.
 * The final whitened image is already stored separately in the couple's DB record.
 */
export async function POST(request: NextRequest) {
  try {
    const { bride, groom } = await request.json();
    if (!bride || !groom) {
      return NextResponse.json({ error: "Names required" }, { status: 400 });
    }

    let deleted = 0;
    let freedBytes = 0;

    // Delete all draft results for this couple (whitened version stays — it's the final image)
    const prefix = `premium/results/${bride.trim().toLowerCase()}_${groom.trim().toLowerCase()}/`;
    const { blobs } = await list({ prefix });
    for (const blob of blobs) {
      await del(blob.url);
      deleted++;
      freedBytes += blob.size;
    }

    return NextResponse.json({
      deleted,
      freedKB: Math.round(freedBytes / 1024),
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
