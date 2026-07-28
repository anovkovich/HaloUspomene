import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  deleteStandaloneSeating,
  setStandaloneActive,
  setStandaloneEventDate,
  getStandaloneSeating,
  patchStandaloneReceipt,
  patchStandaloneFeatures,
} from "@/lib/standalone-seating";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    active?: boolean;
    eventDate?: string;
    paid_for_audio?: boolean;
    paid_for_gallery?: boolean;
    receipt_valid?: boolean;
    receipt_created?: string;
    custom_discount?: number;
  };

  const existing = await getStandaloneSeating(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof body.active === "boolean") {
    await setStandaloneActive(slug, body.active);
  }

  // Allow setting/changing the event date after creation (dateless seatings
  // otherwise can't enable audio/gallery). Block clearing it while an add-on
  // is on — that would silently close the feature.
  if (typeof body.eventDate === "string") {
    if (
      !body.eventDate.trim() &&
      (existing.paid_for_audio || existing.paid_for_gallery)
    ) {
      return NextResponse.json(
        { error: "Isključite audio/galeriju pre uklanjanja datuma." },
        { status: 400 },
      );
    }
    await setStandaloneEventDate(slug, body.eventDate);
  }

  // Paid add-ons require an event date — their time windows are computed from
  // it (audio = event day +1; gallery upload d0–d1, purge ~d6). Enabling
  // without a date would leave the feature permanently closed.
  const featureChanges: {
    paid_for_audio?: boolean;
    paid_for_gallery?: boolean;
  } = {};
  if (typeof body.paid_for_audio === "boolean")
    featureChanges.paid_for_audio = body.paid_for_audio;
  if (typeof body.paid_for_gallery === "boolean")
    featureChanges.paid_for_gallery = body.paid_for_gallery;
  if (Object.keys(featureChanges).length > 0) {
    const enabling =
      featureChanges.paid_for_audio === true ||
      featureChanges.paid_for_gallery === true;
    if (enabling && !existing.eventDate) {
      return NextResponse.json(
        { error: "Datum događaja je obavezan za audio/galeriju." },
        { status: 400 },
      );
    }
    await patchStandaloneFeatures(slug, featureChanges);
  }

  const receiptChanges: {
    receipt_valid?: boolean;
    receipt_created?: string;
    custom_discount?: number;
  } = {};
  if (typeof body.receipt_valid === "boolean")
    receiptChanges.receipt_valid = body.receipt_valid;
  if (typeof body.receipt_created === "string")
    receiptChanges.receipt_created = body.receipt_created;
  if (typeof body.custom_discount === "number")
    receiptChanges.custom_discount = body.custom_discount;
  if (Object.keys(receiptChanges).length > 0) {
    await patchStandaloneReceipt(slug, receiptChanges);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  await deleteStandaloneSeating(slug);
  return NextResponse.json({ ok: true });
}
