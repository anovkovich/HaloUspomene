/**
 * Venue hall scheme library (`hall_venues` collection).
 *
 * A venue ("Restoran Kristal", Zrenjanin) holds one or more halls ("Velika
 * sala", "Mala sala 1"), each with a ready-made table layout that a client can
 * later load into their own seating editor instead of drawing tables by hand.
 *
 * Deliberately NOT stored in `seating_layouts`: that collection's invariant is
 * one document per product slug, and it is cascade-deleted by the couple /
 * standalone cleanup flows. A third namespace in there would risk taking hall
 * schemes down with a deleted event.
 *
 * Halls are embedded in the venue document — a hall layout is a few kilobytes,
 * and embedding gives the admin list and the client picker everything they need
 * in a single query.
 */

import clientPromise from "./mongodb";
import type { TableData } from "./seating";
import {
  computeLayoutStats,
  normalizeTablesToOrigin,
} from "./seating/geometry";
import { normalizeName } from "./seating/lookup";

export interface HallTemplate {
  id: string;
  /** "Velika sala", "Mala sala 1" */
  name: string;
  tables: TableData[];
  /** Derived server-side on every layout save — never trusted from the client. */
  tableCount: number;
  totalSeats: number;
  updatedAt: string;
}

export interface HallVenue {
  slug: string;
  /** "Restoran Kristal" */
  name: string;
  /** Free text on purpose — the venue list spans far more cities than the six
   *  in `vendor-constants.ts` (Pančevo, Smederevo, Vrnjačka Banja, …). */
  city: string;
  address?: string;
  /** Diacritic-folded `name + " " + city`, so search works for "cacak" too. */
  searchKey: string;
  halls: HallTemplate[];
  createdAt: string;
  updatedAt: string;
}

/** Listing shape — halls without their table arrays. */
export type HallVenueSummary = Omit<HallVenue, "halls"> & {
  halls: Omit<HallTemplate, "tables">[];
};

interface HallVenueDocument extends Omit<HallVenue, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<HallVenueDocument>("hall_venues");
}

/** Diacritic- and script-insensitive key.
 *
 *  Delegates to the guest-lookup transliterator so a client typing "Кристал"
 *  on a Cyrillic keyboard finds a venue stored as "Kristal" — folding here by
 *  hand would strip Cyrillic to an empty string and silently return every
 *  venue instead of a match. */
function fold(input: string): string {
  return normalizeName(input);
}

function normalizeSlugPart(input: string): string {
  return fold(input).replace(/\s+/g, "-");
}

function randomSuffix(len = 4): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function newHallId(): string {
  return `hall-${Date.now()}-${randomSuffix(5)}`;
}

function toApi(doc: HallVenueDocument): HallVenue {
  return {
    slug: doc.slug,
    name: doc.name,
    city: doc.city,
    address: doc.address,
    searchKey: doc.searchKey,
    halls: doc.halls ?? [],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toSummary(doc: HallVenueDocument): HallVenueSummary {
  const { halls, ...rest } = toApi(doc);
  return {
    ...rest,
    halls: halls.map((h) => ({
      id: h.id,
      name: h.name,
      tableCount: h.tableCount,
      totalSeats: h.totalSeats,
      updatedAt: h.updatedAt,
    })),
  };
}

/** Strips seat assignments and normalises coordinates. Templates carry tables
 *  only — a hall scheme must never ship a guest name into someone else's event. */
function sanitizeTables(tables: TableData[]): TableData[] {
  const cleaned = tables.map((t) => ({
    ...t,
    assignments: Array(Math.max(0, t.seats)).fill(null),
  }));
  return normalizeTablesToOrigin(cleaned);
}

function buildHall(name: string, tables: TableData[] = []): HallTemplate {
  const clean = sanitizeTables(tables);
  const { tableCount, totalSeats } = computeLayoutStats(clean);
  return {
    id: newHallId(),
    name,
    tables: clean,
    tableCount,
    totalSeats,
    updatedAt: new Date().toISOString(),
  };
}

async function generateUniqueVenueSlug(
  name: string,
  city: string
): Promise<string> {
  const c = await col();
  const base =
    [normalizeSlugPart(name), normalizeSlugPart(city)]
      .filter(Boolean)
      .join("-") || "sala";
  if (!(await c.findOne({ slug: base }))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${randomSuffix(3)}`;
    if (!(await c.findOne({ slug: candidate }))) return candidate;
  }
  throw new Error("Nije moguće generisati jedinstvenu adresu za salu.");
}

export interface CreateHallVenueInput {
  name: string;
  city: string;
  address?: string;
  /** Name of the first hall. Defaults to "Velika sala". */
  firstHallName?: string;
}

export async function createHallVenue(
  input: CreateHallVenueInput
): Promise<HallVenue> {
  const c = await col();
  const name = input.name.trim();
  const city = input.city.trim();
  const slug = await generateUniqueVenueSlug(name, city);
  const now = new Date();

  const address = input.address?.trim();
  const doc: HallVenueDocument = {
    slug,
    name,
    city,
    // Omitted rather than set to `undefined`: the driver runs without
    // `ignoreUndefined`, so an undefined value would be stored as literal null.
    ...(address ? { address } : {}),
    searchKey: fold(`${name} ${city}`),
    halls: [buildHall((input.firstHallName || "Velika sala").trim())],
    createdAt: now,
    updatedAt: now,
  };

  await c.insertOne(doc);
  return toApi(doc);
}

export async function listHallVenues(): Promise<HallVenueSummary[]> {
  const c = await col();
  const docs = await c
    .find({}, { projection: { "halls.tables": 0 } })
    .sort({ city: 1, name: 1 })
    // Serbian collation, so "Čačak" sorts where a reader expects it rather
    // than after "Zrenjanin" by raw byte order.
    .collation({ locale: "sr" })
    .toArray();
  return docs.map(toSummary);
}

/** Free-text search over venue name + city. Empty query returns everything so
 *  the picker can show the full list before the user types. */
export async function searchHallVenues(
  query: string
): Promise<HallVenueSummary[]> {
  const c = await col();
  // Every word must appear somewhere in the key, so "zrenjanin kristal" finds
  // the same venue as "kristal zrenjanin".
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const filter = terms.length
    ? {
        $and: terms.map((t) => ({
          searchKey: { $regex: escapeRegex(t), $options: "i" },
        })),
      }
    : {};
  const docs = await c
    .find(filter, { projection: { "halls.tables": 0 } })
    .sort({ city: 1, name: 1 })
    // Serbian collation, so "Čačak" sorts where a reader expects it rather
    // than after "Zrenjanin" by raw byte order.
    .collation({ locale: "sr" })
    .limit(50)
    .toArray();
  return docs.map(toSummary);
}

export async function getHallVenue(slug: string): Promise<HallVenue | null> {
  const c = await col();
  const doc = await c.findOne({ slug });
  return doc ? toApi(doc) : null;
}

export async function patchHallVenue(
  slug: string,
  changes: { name?: string; city?: string; address?: string }
): Promise<boolean> {
  const c = await col();
  const existing = await c.findOne({ slug });
  if (!existing) return false;

  const name = changes.name?.trim() || existing.name;
  const city = changes.city?.trim() || existing.city;
  const address = changes.address?.trim();
  const set: Partial<HallVenueDocument> = {
    name,
    city,
    searchKey: fold(`${name} ${city}`),
    updatedAt: new Date(),
  };
  if (address) set.address = address;

  const res = await c.updateOne({ slug }, {
    $set: set,
    // Clearing the address removes the field instead of storing null.
    ...(changes.address !== undefined && !address
      ? { $unset: { address: "" } }
      : {}),
  });
  return res.matchedCount > 0;
}

export async function deleteHallVenue(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}

export async function addHall(
  slug: string,
  name: string
): Promise<HallTemplate | null> {
  const c = await col();
  const hall = buildHall(name.trim() || "Nova sala");
  const res = await c.updateOne(
    { slug },
    { $push: { halls: hall }, $set: { updatedAt: new Date() } }
  );
  return res.matchedCount > 0 ? hall : null;
}

export async function renameHall(
  slug: string,
  hallId: string,
  name: string
): Promise<boolean> {
  const c = await col();
  const res = await c.updateOne(
    { slug, "halls.id": hallId },
    {
      $set: {
        "halls.$.name": name.trim(),
        "halls.$.updatedAt": new Date().toISOString(),
        updatedAt: new Date(),
      },
    }
  );
  return res.matchedCount > 0;
}

export async function deleteHall(
  slug: string,
  hallId: string
): Promise<boolean> {
  const c = await col();
  const res = await c.updateOne(
    { slug, "halls.id": hallId },
    { $pull: { halls: { id: hallId } }, $set: { updatedAt: new Date() } }
  );
  // `matchedCount` would be true for a venue that never had this hall — the
  // filter above makes the match itself the existence check.
  return res.matchedCount > 0;
}

export async function getHallTemplate(
  slug: string,
  hallId: string
): Promise<HallTemplate | null> {
  const venue = await getHallVenue(slug);
  if (!venue) return null;
  return venue.halls.find((h) => h.id === hallId) ?? null;
}

/** Persists a hall layout. Coordinates are normalised and the capacity figures
 *  recomputed here, so the stored stats can never drift from the stored tables. */
export async function saveHallLayout(
  slug: string,
  hallId: string,
  tables: TableData[]
): Promise<boolean> {
  const c = await col();
  const clean = sanitizeTables(tables);
  const { tableCount, totalSeats } = computeLayoutStats(clean);

  const res = await c.updateOne(
    { slug, "halls.id": hallId },
    {
      $set: {
        "halls.$.tables": clean,
        "halls.$.tableCount": tableCount,
        "halls.$.totalSeats": totalSeats,
        "halls.$.updatedAt": new Date().toISOString(),
        updatedAt: new Date(),
      },
    }
  );
  return res.matchedCount > 0;
}

/** Distinct cities already in the library — feeds the admin form's suggestions. */
export async function listHallVenueCities(): Promise<string[]> {
  const c = await col();
  const cities = await c.distinct("city");
  return cities.filter(Boolean).sort((a, b) => a.localeCompare(b, "sr"));
}
