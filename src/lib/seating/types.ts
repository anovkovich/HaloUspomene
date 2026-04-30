/** rectangular: seats top+bottom | circle: radial | single-sided: one row only | decoration: no seats */
export type TableType = "rectangular" | "circle" | "single-sided" | "decoration";

export type DecorationType = "music" | "dancing" | "entrance" | "custom";

export type EntranceDirection = "up" | "down" | "left" | "right";

export interface SeatAssignment {
  guestId: string;
  guestName: string;
}

export interface TableData {
  id: string;
  type: TableType;
  /** rectangular/single-sided: 4–20 (step 2) | circle: 8–12 (step 1) | decoration: 0 */
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
}
