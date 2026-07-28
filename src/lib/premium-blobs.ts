import { list, del } from "@vercel/blob";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

/**
 * Vercel Blob cleanup for the premium AI invitation pipeline.
 *
 * Three routes write premium blobs, each under its own key scheme:
 *   /api/premium-pozivnica/generate   → premium/results/{bride}_{groom}/{ts}.png
 *   /api/premium-pozivnica/whiten-bg  → premium/whitened/{slug}/{ts}.{ext}
 *   /api/premium-pozivnica/upload     → premium/uploads/{ts}.{ext}
 *
 * Only `whitened` is slug-scoped, so a slug on its own can't reach the rest:
 *   - `results` is keyed by the couple's names, recovered from `couple_names`
 *   - `uploads` is a flat namespace with nothing linking a file to a couple,
 *     so it's reachable only through the exact URL stored on the record
 *
 * The stored URL is also the only handle on blobs written before a slug rename
 * (rename moves the DB documents but leaves Blob paths on the old prefix), so
 * it's deleted explicitly on top of the prefix sweeps. Deleting an already-gone
 * blob is a no-op, so the overlap is harmless.
 *
 * Best-effort by design: a couple must still delete cleanly when Blob is down
 * or the token is missing, so nothing here throws.
 */

/** Delete every blob under a prefix, following pagination. Returns the count. */
async function deleteByPrefix(prefix: string): Promise<number> {
  let deleted = 0;
  let cursor: string | undefined;
  try {
    do {
      const page = await list({ prefix, cursor });
      if (page.blobs.length > 0) {
        const results = await Promise.allSettled(
          page.blobs.map((b) => del(b.url)),
        );
        deleted += results.filter((r) => r.status === "fulfilled").length;
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } catch {
    // Best-effort — a failed sweep must not block the entity delete
  }
  return deleted;
}

/**
 * Remove every premium blob belonging to a couple. Pass the couple record read
 * BEFORE deletion — `couple_names` and `ai_couple_image_url` are the only way
 * to reach the non-slug-scoped paths.
 */
export async function deletePremiumBlobs(
  slug: string,
  couple: WeddingData | null,
): Promise<number> {
  let deleted = await deleteByPrefix(`premium/whitened/${slug}/`);

  // generate/route.ts builds this key as `${bride}_${groom}`, both lowercased
  const bride = couple?.couple_names?.bride?.trim().toLowerCase();
  const groom = couple?.couple_names?.groom?.trim().toLowerCase();
  if (bride && groom) {
    deleted += await deleteByPrefix(`premium/results/${bride}_${groom}/`);
  }

  const url = couple?.ai_couple_image_url;
  if (url?.includes("/premium/")) {
    try {
      await del(url);
      deleted += 1;
    } catch {
      // Already swept by a prefix above, or gone
    }
  }

  return deleted;
}
