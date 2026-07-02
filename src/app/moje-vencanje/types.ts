export type ChecklistGroup =
  | "12+"
  | "9-12"
  | "6-9"
  | "3-6"
  | "1-3"
  | "2-weeks"
  | "day-before"
  | "wedding-day"
  | "custom";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom: boolean;
  group: ChecklistGroup;
}

export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  spent: number;
  isCustom: boolean;
  currency?: "RSD" | "EUR";
}

export interface PortalBudget {
  totalBudget: number;
  totalBudgetCurrency?: "RSD" | "EUR";
  categories: BudgetCategory[];
}

/* ── Guest List (private planning list of invitees) ─────────── */

export type InviteeStatus =
  | "not-invited" // Nije pozvan (default)
  | "invited" // Pozvan
  | "confirmed" // Potvrdio
  | "declined"; // Otkazao

export type InviteeCategory = "" | "Mladini" | "Mladozenjini" | "Zajednicki";

export interface GuestSection {
  id: string;
  name: string;
}

export interface Invitee {
  id: string;
  name: string;
  count: number; // expected number of people in this party
  sectionId: string; // "" = ungrouped ("Bez celine")
  category: InviteeCategory;
  status: InviteeStatus;
  linkedRsvpId?: string; // id of a matched rsvp_responses entry (manual link)
  note?: string;
}

/** A predefined "key role" slot (kum, barjaktar, …) — a reference album of
 *  important wedding roles. Does NOT count toward the guest/headcount totals.
 *  `name` empty = unfilled placeholder; `inviteeId` set when picked from the
 *  invitee list (free-text names are allowed too). */
export interface KeyRole {
  id: string;
  group: string; // role family: kum, kuma, barjaktar, domacin, kicenje, … or "custom"
  label: string; // display label, e.g. "Kum (crkveni)"
  name: string;
  inviteeId?: string;
}

export interface GuestList {
  sections: GuestSection[];
  invitees: Invitee[];
  keyRoles?: KeyRole[];
}

export interface PortalData {
  slug: string;
  checklist: ChecklistItem[];
  budget: PortalBudget;
  vendorFavorites: string[];
  guestList?: GuestList;
  updatedAt: Date;
  createdAt: Date;
}

/* ── Vendor Directory Types ─────────────────────────────────── */

export type VendorCategory =
  | "venue"
  | "music"
  | "photo-video"
  | "cake"
  | "decoration"
  | "flowers"
  | "fireworks"
  | "dress"
  | "makeup"
  | "rings"
  | "gifts";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  phone?: string;
  website?: string;
  instagram?: string;
  capacity?: string;       // venues: max guest count (e.g. "300" or "300+")
  musicType?: string;      // music: "DJ" | "Bend" | "DJ + Bend" etc.
  serviceType?: string;    // photo-video: "Foto" | "Video" | "Foto + Video" etc.
  bio?: string;            // max 500 chars, short vendor description
  logoUrl?: string;        // Vercel Blob URL for vendor logo (uploaded or IG-imported)
  endorsementCount?: number;
  stats?: VendorStats;     // aggregated click counters (incremented server-side)
}

export interface VendorStats {
  views?: number;            // modal opens
  clicks_phone?: number;
  clicks_website?: number;
  clicks_instagram?: number;
}

export type VendorTrackKind = "view" | "phone" | "website" | "instagram";

export function getEndorsementLevel(count: number): number {
  if (count >= 9) return 3;
  if (count >= 4) return 2;
  if (count >= 1) return 1;
  return 0;
}

export interface VendorCategoryMeta {
  id: VendorCategory;
  label: string;
  labelPlural: string;
  count: number;
}
