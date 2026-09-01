import { nanoid } from "nanoid";
import clientPromise from "./mongodb";
import {
  PHONE_UNITS_DEFAULT,
  occupies,
  weekendKey,
  weekendDates,
  type PhoneRental,
} from "./phone-rentals-shared";

// The pure rules (weekend bucketing, occupancy, the fleet default) live in
// phone-rentals-shared.ts so `"use client"` code can apply the identical logic
// without pulling MongoDB into the browser bundle. Re-exported here so every
// server-side caller keeps importing from one place.
export {
  PHONE_UNITS_DEFAULT,
  HOLD_MS,
  occupies,
  weekendKey,
  weekendDates,
} from "./phone-rentals-shared";
export type { PhoneRental } from "./phone-rentals-shared";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db("halouspomene");
  return db.collection<PhoneRental>("phone_rentals");
}

export async function getAllPhoneRentals(): Promise<PhoneRental[]> {
  const col = await getCollection();
  return col
    .find({})
    .sort({ rental_date: 1 })
    .toArray();
}

export async function getPhoneRentalById(id: string): Promise<PhoneRental | null> {
  const col = await getCollection();
  return col.findOne({ id });
}

export async function createPhoneRental(data: Omit<PhoneRental, "id" | "created_at">): Promise<PhoneRental> {
  const id = "tel-" + nanoid(8);
  const created_at = new Date().toISOString();
  const doc: PhoneRental = {
    ...data,
    id,
    created_at,
  };
  const col = await getCollection();
  await col.insertOne(doc);
  return doc;
}

export async function patchPhoneRental(
  id: string,
  updates: Partial<PhoneRental>
): Promise<PhoneRental | null> {
  const col = await getCollection();
  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  );
  return result ?? null;
}

export async function deletePhoneRental(id: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.deleteOne({ id });
  return result.deletedCount > 0;
}

// ── fleet size ───────────────────────────────────────────────────────────────

/** Live fleet size from `site_config`. Read on every capacity check rather than
 *  cached: the admin changes it precisely when they are about to book something,
 *  and a stale value would either sell a phone we don't have or refuse one we do. */
export async function getPhoneUnits(): Promise<number> {
  const client = await clientPromise;
  const doc = await client
    .db("halouspomene")
    .collection<{ key: string; value?: number }>("site_config")
    .findOne({ key: "phone_units" });
  const n = doc?.value;
  return Number.isInteger(n) && (n as number) > 0 ? (n as number) : PHONE_UNITS_DEFAULT;
}

export async function setPhoneUnits(units: number): Promise<void> {
  const n = Math.round(units);
  if (!Number.isInteger(n) || n < 1 || n > 20) {
    throw new Error("phone_units must be an integer 1–20");
  }
  const client = await clientPromise;
  await client
    .db("halouspomene")
    .collection("site_config")
    .updateOne({ key: "phone_units" }, { $set: { value: n } }, { upsert: true });
}

// ── availability ─────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function parseDay(date: string): number {
  return Date.parse(date.slice(0, 10) + "T00:00:00Z");
}

function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Rentals competing with `date` for a phone, optionally ignoring one row — used
 *  when re-checking capacity for a rental that already exists. Counts the whole
 *  weekend bucket, not the single day: booking Friday and Saturday of the same
 *  weekend needs two phones, exactly like booking Saturday twice. */
export async function countOccupied(
  date: string,
  exceptId?: string,
): Promise<number> {
  const col = await getCollection();
  const key = weekendKey(date);
  const rows = await col
    .find({ rental_date: { $in: weekendDates(key) } })
    .toArray();
  const now = Date.now();
  return rows.filter((r) => r.id !== exceptId && occupies(r, now)).length;
}

/** Dates with no phone left, from today onward — the self-serve form greys them
 *  out before the buyer picks one. A full weekend greys out all seven of its
 *  days. Returns bare YYYY-MM-DD strings only: this feeds a public page, so no
 *  name, phone or any other rental field may leak. */
export async function getFullDates(): Promise<string[]> {
  const col = await getCollection();
  const today = new Date().toISOString().slice(0, 10);
  // Reach back three days: a Saturday already booked can still fill the bucket
  // of next Monday or Tuesday, which are both still in the future.
  const from = formatDay(parseDay(today) - 3 * DAY_MS);
  const rows = await col.find({ rental_date: { $gte: from } }).toArray();

  const now = Date.now();
  const units = await getPhoneUnits();
  const perWeekend = new Map<string, number>();
  for (const r of rows) {
    if (!occupies(r, now)) continue;
    const key = weekendKey(r.rental_date);
    perWeekend.set(key, (perWeekend.get(key) ?? 0) + 1);
  }

  const full = new Set<string>();
  for (const [key, n] of perWeekend) {
    if (n < units) continue;
    for (const d of weekendDates(key)) if (d >= today) full.add(d);
  }
  return [...full].sort();
}
