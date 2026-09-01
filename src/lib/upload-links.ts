import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { generateLinkToken } from "./link-token";

/**
 * Token-only link that lets a client upload the invitation photos themselves
 * (`/slike/{token}/`), so we don't have to collect them over Viber and upload
 * them by hand from the admin panel.
 *
 * Deliberately separate from `share_links`: that token is forwarded to guests
 * and must never carry write access. One token per (product_kind, slug).
 */
export type UploadProductKind = "couple" | "birthday";

export interface UploadLink {
  token: string;
  product_kind: UploadProductKind;
  slug: string;
  created_at: string;
  last_visited_at?: string;
  visit_count: number;
  upload_count: number;
}

interface UploadLinkDoc {
  _id?: ObjectId;
  token: string;
  product_kind: UploadProductKind;
  slug: string;
  created_at: Date;
  last_visited_at?: Date;
  visit_count: number;
  upload_count: number;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<UploadLinkDoc>("upload_links");
}

function toApi(doc: UploadLinkDoc): UploadLink {
  return {
    token: doc.token,
    product_kind: doc.product_kind,
    slug: doc.slug,
    created_at: doc.created_at.toISOString(),
    last_visited_at: doc.last_visited_at?.toISOString(),
    visit_count: doc.visit_count ?? 0,
    upload_count: doc.upload_count ?? 0,
  };
}

/** Returns the existing upload link for this product, or creates a new one.
 *  Stable per (product_kind, slug) — a second click hands out the same link
 *  instead of orphaning the one already sent to the client. */
export async function createOrGetUploadLink(
  product_kind: UploadProductKind,
  slug: string,
): Promise<UploadLink> {
  const c = await col();
  const existing = await c.findOne({ product_kind, slug });
  if (existing) return toApi(existing);

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateLinkToken();
    const clash = await c.findOne({ token }, { projection: { _id: 1 } });
    if (clash) continue;
    const doc: UploadLinkDoc = {
      token,
      product_kind,
      slug,
      created_at: new Date(),
      visit_count: 0,
      upload_count: 0,
    };
    await c.insertOne(doc);
    return toApi(doc);
  }
  throw new Error("Could not generate unique upload token after 5 attempts");
}

export async function getUploadLinkByToken(
  token: string,
): Promise<UploadLink | null> {
  const c = await col();
  const doc = await c.findOne({ token });
  return doc ? toApi(doc) : null;
}

/** Fire-and-forget bookkeeping so admin can see the client actually opened it. */
export async function recordUploadLinkVisit(token: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { token },
    { $set: { last_visited_at: new Date() }, $inc: { visit_count: 1 } },
  );
}

export async function recordUploadLinkUpload(token: string): Promise<void> {
  const c = await col();
  await c.updateOne({ token }, { $inc: { upload_count: 1 } });
}

/** Cascade hook: called when the underlying product is deleted. */
export async function deleteUploadLinksForProduct(
  product_kind: UploadProductKind,
  slug: string,
): Promise<void> {
  const c = await col();
  await c.deleteMany({ product_kind, slug });
}
