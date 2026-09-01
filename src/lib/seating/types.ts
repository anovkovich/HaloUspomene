/** rectangular: seats top+bottom | circle: radial | single-sided: one row only | decoration: no seats */
export type TableType = "rectangular" | "circle" | "single-sided" | "decoration";

/** `wall` outlines the hall perimeter: a border-only rectangle that always sits
 *  behind the tables and holds no seats. Added for the venue scheme library, so
 *  layouts saved before it never contain one. */
export type DecorationType =
  | "music"
  | "dancing"
  | "entrance"
  | "custom"
  | "wall"
  | "sweets"
  | "buffet";

export type EntranceDirection = "up" | "down" | "left" | "right";

/** Reserved `guestId`s for the two occupants a bridal table seats by itself.
 *  They are not RSVP entries, so anything that counts real guests must skip
 *  them — see `isLockedSeat`. */
export const BRIDE_GUEST_ID = "__mlada__";
export const GROOM_GUEST_ID = "__mladozenja__";

export interface SeatAssignment {
  guestId: string;
  guestName: string;
  /** Auto-placed and undeletable (the bride and groom on a bridal table).
   *  Such a seat can be rearranged but never cleared. */
  locked?: boolean;
}

/** True for an occupant the editor placed itself, not a guest off the list. */
export function isLockedSeat(a: SeatAssignment | null): boolean {
  return !!a?.locked;
}

export interface TableData {
  id: string;
  type: TableType;
  /** rectangular/single-sided: 4–20 (step 2) | circle: 8–14 (step 1) | decoration: 0 */
  seats: number;
  x: number;
  y: number;
  label: string;
  assignments: (SeatAssignment | null)[];
  decorationType?: DecorationType;
  /** For entrance: which side the arrow points */
  entranceDirection?: EntranceDirection;
  /** For resizable zones (music, dancing) */
  decoWidth?: number;
  decoHeight?: number;
  /** Rectangular only: portrait orientation (seats on left/right) */
  rotated?: boolean;
  /** Single-sided only: put seats on the opposite side of the table surface
   *  (bottom instead of top in landscape; right instead of left when rotated). */
  flipped?: boolean;
  /** The wedding party's own table, added from Specijalni elementi. Seats the
   *  bride and groom by itself and keeps them put. A plain single-sided table
   *  (the same shape, used as a head table at other events) never carries it,
   *  and layouts saved before this existed never do either. */
  bridal?: boolean;
}
