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

export interface PortalData {
  slug: string;
  checklist: ChecklistItem[];
  budget: PortalBudget;
  vendorFavorites: string[];
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
  bio?: string;            // max 250 chars, short vendor description
  endorsementCount?: number;
}

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
