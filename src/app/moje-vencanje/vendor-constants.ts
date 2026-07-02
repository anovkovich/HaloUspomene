import type { VendorCategoryMeta } from "./types";

export const CITIES = [
  "Beograd",
  "Novi Sad",
  "Subotica",
  "Čačak",
  "Kragujevac",
  "Niš",
] as const;

export type City = (typeof CITIES)[number];

export const CATEGORY_META: Omit<VendorCategoryMeta, "count">[] = [
  { id: "venue", label: "Sala", labelPlural: "Sale" },
  { id: "music", label: "Muzika", labelPlural: "Bendovi & DJ" },
  { id: "photo-video", label: "Foto/Video", labelPlural: "Foto & Video" },
  { id: "cake", label: "Torta", labelPlural: "Torte" },
  { id: "decoration", label: "Dekoracija", labelPlural: "Dekoracije" },
  { id: "flowers", label: "Cveće", labelPlural: "Cveće" },
  { id: "fireworks", label: "Vatromet", labelPlural: "Efekti" },
  { id: "dress", label: "Venčanica", labelPlural: "Venčanice" },
  { id: "makeup", label: "Šminka", labelPlural: "MakeUp" },
  { id: "rings", label: "Burme", labelPlural: "Burme" },
  { id: "gifts", label: "Pokloni", labelPlural: "Pokloni" },
];
