import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { upsertCouple, deleteCouple, patchCouple } from "@/lib/couples";
import { deleteRSVPResponses } from "@/lib/rsvp";
import { deleteSeatingLayout } from "@/lib/seating";
import { getAudioMessages, deleteAllAudioMessages } from "@/lib/audio";
import { del } from "@vercel/blob";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const data = await req.json();
  await upsertCouple(slug, data);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const updates = await req.json();
  await patchCouple(slug, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;

  // Delete audio blobs from Vercel Blob before clearing metadata
  try {
    const audioMessages = await getAudioMessages(slug);
    if (audioMessages.length > 0) {
      await Promise.allSettled(
        audioMessages.map((m) => del(m.blobUrl))
      );
    }
  } catch {
    // Continue with deletion even if blob cleanup fails
  }

  await Promise.all([
    deleteCouple(slug),
    deleteRSVPResponses(slug),
    deleteSeatingLayout(slug),
    deleteAllAudioMessages(slug),
  ]);
  return NextResponse.json({ ok: true });
}
