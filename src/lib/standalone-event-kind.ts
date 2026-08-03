/**
 * What a standalone seating was bought for.
 *
 * Lives in its own module — free of any MongoDB import — so client components
 * (the admin tab, the portal shell) can import the helpers as *values* without
 * dragging `standalone-seating.ts` and the driver into the browser bundle.
 * `standalone-seating.ts` re-exports everything here, so server code can keep
 * importing from the one place it already does.
 */

/** Drives which portal features make sense: the wedding checklist and wedding
 *  budget are meaningless for a conference or a company party. Missing on a
 *  record ⇒ "wedding", so every pre-existing seating keeps its current
 *  behavior without a backfill. */
export type StandaloneEventKind = "wedding" | "corporate" | "other";

export const STANDALONE_EVENT_KINDS: StandaloneEventKind[] = [
  "wedding",
  "corporate",
  "other",
];

/** Serbian labels for the admin select + badge. */
export const EVENT_KIND_LABELS: Record<StandaloneEventKind, string> = {
  wedding: "Venčanje",
  corporate: "Korporativni događaj",
  other: "Druga proslava",
};

/** Narrows untrusted admin input before it reaches the DB. */
export function isEventKind(v: unknown): v is StandaloneEventKind {
  return (
    typeof v === "string" && (STANDALONE_EVENT_KINDS as string[]).includes(v)
  );
}

/** Single source of truth for the default — read every record through this. */
export function isWeddingSeating(s: {
  eventKind?: StandaloneEventKind;
}): boolean {
  return (s.eventKind ?? "wedding") === "wedding";
}
