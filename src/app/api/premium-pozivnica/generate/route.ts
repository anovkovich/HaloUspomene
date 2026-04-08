import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { generateCoupleIllustration } from "@/lib/fal-ai";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coupleDescription, bride, groom } = body;

    if (!coupleDescription || typeof coupleDescription !== "string" || !coupleDescription.trim()) {
      return NextResponse.json(
        { error: "Couple description is required" },
        { status: 400 },
      );
    }
    if (!bride || !groom) {
      return NextResponse.json(
        { error: "Couple names are required" },
        { status: 400 },
      );
    }

    const result = await generateCoupleIllustration(coupleDescription.trim());

    // Store result in Vercel Blob for persistence
    const response = await fetch(result.url, { redirect: "follow" });
    if (!response.ok) throw new Error("Failed to fetch generated image");
    const imageBuffer = await response.arrayBuffer();

    const contentType = response.headers.get("content-type") || "";
    const isImage = contentType.startsWith("image") || imageBuffer.byteLength > 10000;
    if (!isImage) throw new Error("Generated result is not a valid image");

    const rateLimitKey = `${bride.trim().toLowerCase()}_${groom.trim().toLowerCase()}`;
    const timestamp = Date.now();
    const blob = await put(
      `premium/results/${rateLimitKey}/${timestamp}.png`,
      Buffer.from(imageBuffer),
      { access: "public", contentType: contentType.startsWith("image") ? contentType : "image/png" },
    );

    return NextResponse.json({ resultUrl: blob.url });
  } catch (err: any) {
    console.error("AI generation error:", err);
    return NextResponse.json(
      { error: "Generisanje nije uspelo. Pokušajte ponovo." },
      { status: 500 },
    );
  }
}
