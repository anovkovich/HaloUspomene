// Public API for the shared seating editor library.
//
// Storage helpers (`loadSeatingLayout`, `saveSeatingLayout`, `deleteSeatingLayout`)
// operate on the slug-keyed `seating_layouts` MongoDB collection and are shared
// across all editor consumers (wedding, birthday, standalone).
//
// Types (`TableData`, `TableType`, `SeatAssignment`, etc.) are the canonical
// shape persisted in that collection — wrapper routes import from here rather
// than redefining them.
//
// The interactive editor lives at `@/lib/seating/editor/RasporedClient` and the
// PDF helpers at `@/lib/seating/pdf/*`. Those are imported directly by route
// wrappers to keep this index server-safe.

export {
  loadSeatingLayout,
  saveSeatingLayout,
  deleteSeatingLayout,
} from "./storage";

export type {
  TableType,
  TableData,
  SeatAssignment,
  DecorationType,
  EntranceDirection,
} from "./types";
