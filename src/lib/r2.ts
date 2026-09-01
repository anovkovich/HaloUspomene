import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 storage wrapper (S3-compatible API).
 *
 * Used by the QR photo gallery. Chosen over Vercel Blob because gallery photos
 * are egress-heavy (guests view the gallery repeatedly) and R2 has $0 egress.
 *
 * Env vars (server-only):
 *   R2_ACCOUNT_ID         Cloudflare account id
 *   R2_ACCESS_KEY_ID      R2 API token access key
 *   R2_SECRET_ACCESS_KEY  R2 API token secret
 *   R2_BUCKET_NAME        e.g. "halouspomene-gallery"
 *   R2_PUBLIC_URL         public base URL (custom domain or r2.dev), no trailing slash
 *
 * Object key convention: `gallery/{slug}/{timestamp}-{random}.{ext}`
 */

const BUCKET = process.env.R2_BUCKET_NAME ?? "";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

/** True when all required env vars are present. Callers should guard on this. */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      BUCKET &&
      PUBLIC_URL
  );
}

let _client: S3Client | null = null;

function client(): S3Client {
  if (!_client) {
    if (!isR2Configured()) {
      throw new Error("R2 is not configured — missing R2_* env vars");
    }
    // Default jurisdiction endpoint. If the bucket was created under a specific
    // jurisdiction (e.g. EU → `<account>.eu.r2.cloudflarestorage.com`), set
    // R2_ENDPOINT to override. A plain EEUR *location hint* uses the default.
    const endpoint =
      process.env.R2_ENDPOINT ||
      `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    _client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

/** Public URL for a stored object key. */
export function publicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Presigned PUT URL so the browser can upload the file directly to R2
 * (bypasses Vercel's 4.5MB body limit and costs no Vercel bandwidth).
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600 // 10 min
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client(), command, { expiresIn });
}

/** Delete a single object. Safe to call even if the object is already gone. */
export async function deleteObject(key: string): Promise<void> {
  await client().send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}

/**
 * Delete every object under a prefix (e.g. all photos for one slug).
 * Used by the couple cascade-delete. Handles pagination and R2's
 * 1000-keys-per-batch limit. Best-effort: never throws.
 */
export async function deleteByPrefix(prefix: string): Promise<number> {
  if (!isR2Configured()) return 0;
  let deleted = 0;
  let continuationToken: string | undefined;

  try {
    do {
      const listed = await client().send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );
      const keys = (listed.Contents ?? [])
        .map((o) => o.Key)
        .filter((k): k is string => Boolean(k));

      if (keys.length > 0) {
        await client().send(
          new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
          })
        );
        deleted += keys.length;
      }
      continuationToken = listed.IsTruncated
        ? listed.NextContinuationToken
        : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error("R2 deleteByPrefix failed:", err);
  }

  return deleted;
}

/** Build a collision-safe object key for a gallery photo. */
export function galleryKey(slug: string, ext: string): string {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `gallery/${safeSlug}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
}
