import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jwtVerify } from "jose";
import { upsertCouple, deleteCouple, patchCouple, getWeddingData } from "@/lib/couples";
import { deleteRSVPResponses } from "@/lib/rsvp";
import { deleteSeatingLayout } from "@/lib/seating";
import { deletePortalData } from "@/lib/portal";
import { getAudioMessages, deleteAllAudioMessages } from "@/lib/audio";
import { deleteAllGalleryPhotos } from "@/lib/gallery";
import { deleteByPrefix } from "@/lib/r2";
import { deleteShareLinksForProduct } from "@/lib/share-links";
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

// Drop ISR cache for both public invitation routes so admin edits show up
// immediately instead of waiting for the 10s revalidate window + a visitor
// to trigger background regeneration. We don't know which variant the couple
// has, so we hit both paths; revalidatePath is a no-op when the path isn't
// in the cache.
function revalidateCouplePaths(slug: string) {
  revalidatePath(`/pozivnica/${slug}`);
  revalidatePath(`/premium-pozivnica/${slug}`);
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
  revalidateCouplePaths(slug);
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
  revalidateCouplePaths(slug);
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

  // Delete image + music blobs from Vercel Blob
  try {
    const coupleData = await getWeddingData(slug);
    const blobUrls: string[] = [];
    if (coupleData?.images && coupleData.images.length > 0) {
      for (const img of coupleData.images) blobUrls.push(img.url);
    }
    if (coupleData?.music_url) blobUrls.push(coupleData.music_url);
    if (blobUrls.length > 0) {
      await Promise.allSettled(blobUrls.map((u) => del(u)));
    }
  } catch {
    // Continue with deletion even if blob cleanup fails
  }

  // Delete gallery photo objects from R2 (best-effort; never throws)
  await deleteByPrefix(`gallery/${slug}/`);

  await Promise.all([
    deleteCouple(slug),
    deleteRSVPResponses(slug),
    deleteSeatingLayout(slug),
    deletePortalData(slug),
    deleteAllAudioMessages(slug),
    deleteAllGalleryPhotos(slug),
    deleteShareLinksForProduct("couple", slug),
  ]);
  revalidateCouplePaths(slug);
  return NextResponse.json({ ok: true });
}
