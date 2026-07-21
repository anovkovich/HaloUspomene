/** Partner-preview lock.
 *
 *  Pages that are finished but awaiting partner approval. While the
 *  PARTNER_PREVIEW_KEY env var is set, every path listed here is hidden from
 *  the public: middleware serves a 404, the sitemap and footer drop the link,
 *  and the page metadata switches to noindex. The page opens only with
 *  ?key=<PARTNER_PREVIEW_KEY> in the URL (middleware then sets a cookie so
 *  the partner can navigate and refresh without re-adding the key).
 *
 *  To unlock: delete PARTNER_PREVIEW_KEY on Vercel and redeploy.
 *  NOTE: the middleware matcher in src/middleware.ts lists these paths as
 *  literals — keep it in sync when adding a path here. */
export const PREVIEW_LOCKED_PATHS = ["/iznajmljivanje-opreme-za-vencanje"];

export const PREVIEW_COOKIE = "partner_preview";

export function previewKey(): string | undefined {
  return process.env.PARTNER_PREVIEW_KEY || undefined;
}

/** True when the lock is active and the given pathname falls under it. */
export function isPathPreviewLocked(pathname: string): boolean {
  if (!previewKey()) return false;
  return PREVIEW_LOCKED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
