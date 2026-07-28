import { ObjectId } from "mongodb";
import { del } from "@vercel/blob";
import clientPromise from "./mongodb";
import { deleteSeatingLayout } from "./seating";
import { deleteShareLinksForProduct } from "./share-links";
import { getAudioMessages, deleteAllAudioMessages } from "./audio";
import { deleteAllGalleryPhotos } from "./gallery";
import { deleteByPrefix } from "./r2";

export interface StandaloneGuest {
  id: string;
  name: string;
  guestCount: number;
  /** Optional grouping label (e.g. "VIP", "Govornici", "Mladin"). Empty string treated as undefined. */
  category?: string;
}

export interface StandaloneSeating {
  slug: string;
  /** Owner identification — name + phone are primary; email is legacy/optional. */
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  eventName: string;
  eventDate?: string;
  password: string;
  guests: StandaloneGuest[];
  active: boolean;
  /** Paid add-ons (admin toggles). Both require `eventDate` to be set, since
   *  their time windows are computed from it (mirrors the couple products). */
  paid_for_audio?: boolean;
  paid_for_gallery?: boolean;
  /** Extra days the gallery stays accessible/undeleted past the default d5. */
  gallery_extra_days?: number;
  /** Gallery lifecycle bookkeeping — set by the purge cron, keep it idempotent. */
  gallery_sms_last_access_sent?: boolean;
  gallery_sms_purge_warning_sent?: boolean;
  gallery_purged_at?: string;
  /** Receipt fields — admin generates a /racun?d=... link to share with the
   *  client. `receipt_valid` gates the link; setting it false invalidates
   *  shared URLs (e.g. after payment is completed). */
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
  createdAt: string;
  updatedAt: string;
}

interface StandaloneSeatingDocument {
  _id?: ObjectId;
  slug: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  eventName: string;
  eventDate?: string;
  password: string;
  guests: StandaloneGuest[];
  active: boolean;
  paid_for_audio?: boolean;
  paid_for_gallery?: boolean;
  gallery_extra_days?: number;
  gallery_sms_last_access_sent?: boolean;
  gallery_sms_purge_warning_sent?: boolean;
  gallery_purged_at?: string;
  receipt_valid?: boolean;
  receipt_created?: string;
  custom_discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

async function col() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<StandaloneSeatingDocument>("standalone_seatings");
}

function toApi(doc: StandaloneSeatingDocument): StandaloneSeating {
  return {
    slug: doc.slug,
    ownerName: doc.ownerName,
    ownerPhone: doc.ownerPhone,
    ownerEmail: doc.ownerEmail,
    eventName: doc.eventName,
    eventDate: doc.eventDate,
    password: doc.password,
    guests: doc.guests ?? [],
    active: doc.active,
    paid_for_audio: doc.paid_for_audio,
    paid_for_gallery: doc.paid_for_gallery,
    gallery_extra_days: doc.gallery_extra_days,
    gallery_sms_last_access_sent: doc.gallery_sms_last_access_sent,
    gallery_sms_purge_warning_sent: doc.gallery_sms_purge_warning_sent,
    gallery_purged_at: doc.gallery_purged_at,
    receipt_valid: doc.receipt_valid,
    receipt_created: doc.receipt_created,
    custom_discount: doc.custom_discount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomSuffix(len = 4): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l for legibility
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generatePassword(): string {
  // 6-digit numeric PIN, leading zeros allowed (e.g. "048291")
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
}

/** Generates a unique slug from an event name + 4-char random suffix.
 *  Retries on collision until success (up to 5 attempts). */
async function generateUniqueStandaloneSlug(eventName: string): Promise<string> {
  const c = await col();
  const base = normalize(eventName) || "raspored";

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomSuffix(4)}`;
    const existing = await c.findOne({ slug: candidate }, { projection: { _id: 1 } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate unique slug after 5 attempts");
}

export interface CreateStandaloneSeatingInput {
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  eventName: string;
  eventDate?: string;
}

/** Creates a new standalone seating with auto-generated slug + 6-digit PIN.
 *  **Disabled by default** — admin must explicitly activate after payment is
 *  confirmed. Returns the full record so the admin tab can show the URL +
 *  password ready to share once enabled. */
export async function createStandaloneSeating(
  input: CreateStandaloneSeatingInput,
): Promise<StandaloneSeating> {
  const c = await col();
  const slug = await generateUniqueStandaloneSlug(input.eventName);
  const password = generatePassword();
  const now = new Date();

  const doc: StandaloneSeatingDocument = {
    slug,
    ownerName: input.ownerName?.trim() || undefined,
    ownerPhone: input.ownerPhone?.trim() || undefined,
    ownerEmail: input.ownerEmail?.trim().toLowerCase() || undefined,
    eventName: input.eventName.trim(),
    eventDate: input.eventDate?.trim() || undefined,
    password,
    guests: [],
    active: false,
    createdAt: now,
    updatedAt: now,
  };

  await c.insertOne(doc);
  return toApi(doc);
}

export async function getStandaloneSeating(
  slug: string,
): Promise<StandaloneSeating | null> {
  const c = await col();
  const doc = await c.findOne({ slug });
  return doc ? toApi(doc) : null;
}

export async function listStandaloneSeatings(): Promise<StandaloneSeating[]> {
  const c = await col();
  const docs = await c.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(toApi);
}

/** Verifies a 6-digit PIN against the stored value. Returns true only when
 *  the seating is active AND the PIN matches. Used by the login route. */
export async function verifyStandalonePassword(
  slug: string,
  password: string,
): Promise<boolean> {
  const c = await col();
  const doc = await c.findOne(
    { slug },
    { projection: { password: 1, active: 1 } },
  );
  if (!doc || !doc.active) return false;
  return doc.password === password;
}

export async function isStandaloneActive(slug: string): Promise<boolean> {
  const c = await col();
  const doc = await c.findOne({ slug }, { projection: { active: 1 } });
  return !!doc?.active;
}

/** Replaces the entire guest list. Used after Excel/CSV import. */
export async function setStandaloneGuests(
  slug: string,
  guests: StandaloneGuest[],
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { guests, updatedAt: new Date() } },
  );
}

export async function addStandaloneGuest(
  slug: string,
  guest: Omit<StandaloneGuest, "id">,
): Promise<StandaloneGuest> {
  const c = await col();
  const id = `g-${Date.now()}-${randomSuffix(5)}`;
  const newGuest: StandaloneGuest = { id, ...guest };
  await c.updateOne(
    { slug },
    {
      $push: { guests: newGuest },
      $set: { updatedAt: new Date() },
    },
  );
  return newGuest;
}

export async function updateStandaloneGuest(
  slug: string,
  guestId: string,
  changes: Partial<Omit<StandaloneGuest, "id">>,
): Promise<void> {
  const c = await col();
  const setOps: Record<string, unknown> = { updatedAt: new Date() };
  if (changes.name !== undefined) setOps["guests.$.name"] = changes.name;
  if (changes.guestCount !== undefined)
    setOps["guests.$.guestCount"] = changes.guestCount;
  if (changes.category !== undefined)
    setOps["guests.$.category"] = changes.category;

  await c.updateOne(
    { slug, "guests.id": guestId },
    { $set: setOps },
  );
}

export async function removeStandaloneGuest(
  slug: string,
  guestId: string,
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    {
      $pull: { guests: { id: guestId } },
      $set: { updatedAt: new Date() },
    },
  );
}

export async function setStandaloneActive(
  slug: string,
  active: boolean,
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { active, updatedAt: new Date() } },
  );
}

/** Sets (or clears) the event date on an existing seating. Needed so a
 *  seating created without a date can later enable audio/gallery, whose
 *  windows are computed from it. Empty string clears the date. */
export async function setStandaloneEventDate(
  slug: string,
  eventDate: string,
): Promise<void> {
  const c = await col();
  const trimmed = eventDate.trim();
  if (trimmed) {
    await c.updateOne(
      { slug },
      { $set: { eventDate: trimmed, updatedAt: new Date() } },
    );
  } else {
    await c.updateOne(
      { slug },
      { $unset: { eventDate: "" }, $set: { updatedAt: new Date() } },
    );
  }
}

/** Patches receipt-related fields on a standalone seating record.
 *  Used by the admin panel's receipt dropdown (generate/invalidate/discount). */
export async function patchStandaloneReceipt(
  slug: string,
  changes: {
    receipt_valid?: boolean;
    receipt_created?: string;
    custom_discount?: number;
  },
): Promise<void> {
  const c = await col();
  const setOps: Record<string, unknown> = { updatedAt: new Date() };
  if (changes.receipt_valid !== undefined)
    setOps.receipt_valid = changes.receipt_valid;
  if (changes.receipt_created !== undefined)
    setOps.receipt_created = changes.receipt_created;
  if (changes.custom_discount !== undefined)
    setOps.custom_discount = changes.custom_discount;
  await c.updateOne({ slug }, { $set: setOps });
}

/** Toggles paid add-on flags (audio guest book / QR photo gallery).
 *  Mirrors the couple `paid_for_*` toggles; admin flips these after payment. */
export async function patchStandaloneFeatures(
  slug: string,
  changes: { paid_for_audio?: boolean; paid_for_gallery?: boolean },
): Promise<void> {
  const c = await col();
  const setOps: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof changes.paid_for_audio === "boolean")
    setOps.paid_for_audio = changes.paid_for_audio;
  if (typeof changes.paid_for_gallery === "boolean")
    setOps.paid_for_gallery = changes.paid_for_gallery;
  await c.updateOne({ slug }, { $set: setOps });
}

/** Standalone seatings with the QR photo gallery enabled — the purge cron
 *  iterates these alongside the gallery couples. */
export async function listGalleryStandaloneSeatings(): Promise<
  StandaloneSeating[]
> {
  const c = await col();
  const docs = await c.find({ paid_for_gallery: true }).toArray();
  return docs.map(toApi);
}

/** Idempotency bookkeeping written by the gallery lifecycle cron. */
export async function patchStandaloneGalleryLifecycle(
  slug: string,
  changes: {
    gallery_sms_last_access_sent?: boolean;
    gallery_sms_purge_warning_sent?: boolean;
    gallery_purged_at?: string;
  },
): Promise<void> {
  const c = await col();
  const setOps: Record<string, unknown> = {};
  if (typeof changes.gallery_sms_last_access_sent === "boolean")
    setOps.gallery_sms_last_access_sent = changes.gallery_sms_last_access_sent;
  if (typeof changes.gallery_sms_purge_warning_sent === "boolean")
    setOps.gallery_sms_purge_warning_sent =
      changes.gallery_sms_purge_warning_sent;
  if (typeof changes.gallery_purged_at === "string")
    setOps.gallery_purged_at = changes.gallery_purged_at;
  if (Object.keys(setOps).length === 0) return;
  await c.updateOne({ slug }, { $set: setOps });
}

/** Cascade deletes the seating record AND any saved layout in seating_layouts,
 *  share-link entries, audio guest-book recordings (metadata + Vercel Blob),
 *  and QR gallery photos (metadata + R2 objects). Used when the event has
 *  passed and the admin is cleaning up. */
export async function deleteStandaloneSeating(slug: string): Promise<void> {
  const c = await col();

  // Grab audio blob URLs before we wipe the metadata so we can remove the files.
  let audioBlobUrls: string[] = [];
  try {
    audioBlobUrls = (await getAudioMessages(slug)).map((m) => m.blobUrl);
  } catch {
    // non-critical — metadata delete below still runs
  }

  await c.deleteOne({ slug });
  await Promise.all([
    deleteSeatingLayout(slug),
    deleteShareLinksForProduct("seating", slug),
    deleteAllAudioMessages(slug),
    deleteAllGalleryPhotos(slug),
    deleteByPrefix(`gallery/${slug}/`),
    audioBlobUrls.length > 0
      ? del(audioBlobUrls).catch(() => {})
      : Promise.resolve(),
  ]);
}
