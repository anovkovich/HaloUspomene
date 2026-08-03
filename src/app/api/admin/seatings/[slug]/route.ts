import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest as isAdmin } from "@/lib/admin-auth";
import {
  deleteStandaloneSeating,
  setStandaloneActive,
  setStandaloneEventDate,
  getStandaloneSeating,
  patchStandaloneReceipt,
  patchStandaloneFeatures,
  patchStandaloneEventKind,
  patchStandaloneInvitation,
  patchStandaloneCheckinToken,
  setStandaloneEventTime,
  generateCheckinToken,
  isEventKind,
  type EventInvitation,
} from "@/lib/standalone-seating";



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
    eventTime?: string;
    eventKind?: unknown;
    paid_for_audio?: boolean;
    paid_for_gallery?: boolean;
    paid_for_invitation?: boolean;
    invitation?: EventInvitation;
    checkin_token?: string | null;
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

  // Display switch only — the stored checklist/budget survive a flip, so the
  // admin can move a record back to "wedding" without any data loss.
  if (body.eventKind !== undefined) {
    if (!isEventKind(body.eventKind)) {
      return NextResponse.json(
        { error: "Nepoznata namena događaja." },
        { status: 400 },
      );
    }
    await patchStandaloneEventKind(slug, body.eventKind);
  }

  // Allow setting/changing the event date after creation (dateless seatings
  // otherwise can't enable audio/gallery). Block clearing it while an add-on
  // is on — that would silently close the feature.
  if (typeof body.eventDate === "string") {
    if (
      !body.eventDate.trim() &&
      (existing.paid_for_audio ||
        existing.paid_for_gallery ||
        existing.paid_for_invitation)
    ) {
      return NextResponse.json(
        { error: "Isključite dodatke pre uklanjanja datuma." },
        { status: 400 },
      );
    }
    await setStandaloneEventDate(slug, body.eventDate);
  }

  if (typeof body.eventTime === "string") {
    await setStandaloneEventTime(slug, body.eventTime);
  }

  // Invitation payload is saved wholesale by the admin form.
  if (body.invitation && typeof body.invitation === "object") {
    await patchStandaloneInvitation(slug, body.invitation);
  }

  // Hostess check-in link: any non-null value issues a FRESH token (revoking
  // whatever was handed out before), null revokes without issuing. The minted
  // token is returned at the end rather than here — an early return would
  // silently drop any paid_for_* or receipt change sent in the same body.
  let issuedCheckinToken: string | null = null;
  if (body.checkin_token !== undefined) {
    issuedCheckinToken =
      body.checkin_token === null ? null : generateCheckinToken();
    await patchStandaloneCheckinToken(slug, issuedCheckinToken);
  }

  // Paid add-ons require an event date — their time windows are computed from
  // it (audio = event day +1; gallery upload d0–d1, purge ~d6). Enabling
  // without a date would leave the feature permanently closed. The invitation
  // additionally needs a venue, since an invitation without one is useless.
  const featureChanges: {
    paid_for_audio?: boolean;
    paid_for_gallery?: boolean;
    paid_for_invitation?: boolean;
  } = {};
  if (typeof body.paid_for_audio === "boolean")
    featureChanges.paid_for_audio = body.paid_for_audio;
  if (typeof body.paid_for_gallery === "boolean")
    featureChanges.paid_for_gallery = body.paid_for_gallery;
  if (typeof body.paid_for_invitation === "boolean")
    featureChanges.paid_for_invitation = body.paid_for_invitation;
  if (Object.keys(featureChanges).length > 0) {
    const enabling =
      featureChanges.paid_for_audio === true ||
      featureChanges.paid_for_gallery === true ||
      featureChanges.paid_for_invitation === true;
    if (enabling && !existing.eventDate) {
      return NextResponse.json(
        { error: "Datum događaja je obavezan za dodatke." },
        { status: 400 },
      );
    }
    if (featureChanges.paid_for_invitation === true) {
      // Re-read: the invitation may have been saved earlier in this same PATCH.
      const fresh = body.invitation ?? existing.invitation;
      if (!fresh?.location?.name?.trim()) {
        return NextResponse.json(
          { error: "Unesite lokaciju pre uključivanja pozivnice." },
          { status: 400 },
        );
      }
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

  return NextResponse.json(
    issuedCheckinToken
      ? { ok: true, checkin_token: issuedCheckinToken }
      : { ok: true },
  );
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
