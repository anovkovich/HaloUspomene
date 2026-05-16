import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

/**
 * Stable category — does NOT distinguish classic vs premium pozivnica or
 * deciji-rodjendan vs punoletstvo. The URL form is derived live from the
 * underlying product so toggling premium/type after creation Just Works.
 */
export type ProductKind = "couple" | "birthday" | "seating";

export interface ShareLink {
  token: string;
  product_kind: ProductKind;
  slug: string;
  created_at: string;
  last_visited_at?: string;
  visit_count: number;
}

interface ShareLinkDoc {
  _id?: ObjectId;
  token: string;
  product_kind: ProductKind;
  slug: string;
  created_at: Date;
  last_visited_at?: Date;
  visit_count: number;
}

// No 0/O/o, 1/l/I to keep tokens legible if someone reads one over the phone.
const TOKEN_CHARS =
  "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOKEN_LEN = 10;

function generateToken(): string {
  const bytes = randomBytes(TOKEN_LEN);
  let out = "";
  for (let i = 0; i < TOKEN_LEN; i++) {
    out += TOKEN_CHARS[bytes[i] % TOKEN_CHARS.length];
  }
  return out;
}

async function col() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<ShareLinkDoc>("share_links");
}

function toApi(doc: ShareLinkDoc): ShareLink {
  return {
    token: doc.token,
    product_kind: doc.product_kind,
    slug: doc.slug,
    created_at: doc.created_at.toISOString(),
    last_visited_at: doc.last_visited_at?.toISOString(),
    visit_count: doc.visit_count ?? 0,
  };
}

/** Returns the existing share link for this product, or creates a new one.
 *  Stable per (product_kind, slug) — calling this repeatedly returns the
 *  same token. Retries on token collision (statistically near-zero). */
export async function createOrGetShareLink(
  product_kind: ProductKind,
  slug: string,
): Promise<ShareLink> {
  const c = await col();
  const existing = await c.findOne({ product_kind, slug });
  if (existing) return toApi(existing);

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateToken();
    const clash = await c.findOne({ token }, { projection: { _id: 1 } });
    if (clash) continue;
    const doc: ShareLinkDoc = {
      token,
      product_kind,
      slug,
      created_at: new Date(),
      visit_count: 0,
    };
    await c.insertOne(doc);
    return toApi(doc);
  }
  throw new Error("Could not generate unique share token after 5 attempts");
}

export async function getShareLinkByToken(
  token: string,
): Promise<ShareLink | null> {
  const c = await col();
  const doc = await c.findOne({ token });
  return doc ? toApi(doc) : null;
}

/** Fire-and-forget: increments visit_count and stamps last_visited_at. */
export async function recordShareLinkVisit(token: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { token },
    {
      $set: { last_visited_at: new Date() },
      $inc: { visit_count: 1 },
    },
  );
}

/** Cascade hook: called when the underlying product is deleted. */
export async function deleteShareLinksForProduct(
  product_kind: ProductKind,
  slug: string,
): Promise<void> {
  const c = await col();
  await c.deleteMany({ product_kind, slug });
}

/** Bulk visit-stats lookup keyed by slug. Used by admin lists to render
 *  "Otvoreno X puta" without N+1 queries. */
export async function getShareLinksForProducts(
  product_kind: ProductKind,
  slugs: string[],
): Promise<Record<string, ShareLink>> {
  if (slugs.length === 0) return {};
  const c = await col();
  const docs = await c
    .find({ product_kind, slug: { $in: slugs } })
    .toArray();
  const out: Record<string, ShareLink> = {};
  for (const d of docs) out[d.slug] = toApi(d);
  return out;
}
