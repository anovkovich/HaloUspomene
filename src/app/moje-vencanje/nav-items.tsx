import {
  CheckCircle2,
  Star,
  Users,
  Mic,
  Images,
  UtensilsCrossed,
  Home,
} from "lucide-react";

export type ActiveView =
  | "overview"
  | "checklist"
  | "budget"
  | "vendors"
  | "audio"
  | "galerija"
  | "meni"
  | "guests";

export interface NavItem {
  view: ActiveView;
  label: string;
  icon: React.ReactNode;
}

/**
 * Sidebar entries.
 *
 * `budget` is deliberately absent. Measured 2026-08-16: of 15 upcoming weddings
 * the checklist is used by 8 (53%) but the budget by 3 (20%), usually a couple
 * of categories. A dead entry in a short sidebar spends attention that the live
 * features need. The view itself is untouched — the Pregled tile opens it and
 * `?tab=budget` still resolves, so existing links keep working. Restoring it is
 * one line.
 */
export const NAV_ITEMS: NavItem[] = [
  { view: "overview", label: "Pregled", icon: <Home size={18} /> },
  { view: "checklist", label: "Checklista", icon: <CheckCircle2 size={18} /> },
  { view: "vendors", label: "Vendori", icon: <Star size={18} /> },
  { view: "audio", label: "Audio knjiga", icon: <Mic size={18} /> },
  { view: "galerija", label: "Galerija", icon: <Images size={18} /> },
  { view: "meni", label: "Meni", icon: <UtensilsCrossed size={18} /> },
  { view: "guests", label: "Gosti", icon: <Users size={18} /> },
];

export interface NavItemWithLock extends NavItem {
  locked: boolean;
}

export function getNavItems(opts: {
  paidForGallery?: boolean;
  galleryOnly?: boolean;
}): NavItemWithLock[] {
  const { paidForGallery, galleryOnly } = opts;

  if (galleryOnly) {
    // Gallery itself stays locked until it's paid for, so the tab shows the
    // payment CTA instead of an empty album.
    return NAV_ITEMS.map((item) => ({
      ...item,
      locked: item.view !== "galerija" || !paidForGallery,
    }));
  }

  return NAV_ITEMS.filter(
    (item) => item.view !== "galerija" || paidForGallery
  ).map((item) => ({ ...item, locked: false }));
}

export const LOCKED_FEATURE_INFO: Record<
  ActiveView,
  { title: string; description: string }
> = {
  overview: {
    title: "Pregled",
    description:
      "Pregledajte sve važne informacije o vašem venčanju na jednom mestu — broj gostiju, potvrde dolaska, preostalo vreme.",
  },
  checklist: {
    title: "Checklista za venčanje",
    description:
      "Organizujte pripremu venčanja korak po korak — od 12 meseci pre do samog dana. Nikad ne propustite važan zadatak.",
  },
  budget: {
    title: "Budžet venčanja",
    description:
      "Pratite troškove po kategorijama, planirajte izdatke i držite sve pod kontrolom — bez neprijatnih iznenađenja.",
  },
  vendors: {
    title: "Katalog vendora",
    description:
      "Pronađite najbolje fotografe, DJ-eve, cveće, torte i druge vendore u vašem gradu — svi provereni i preporučeni.",
  },
  audio: {
    title: "Audio knjiga gostiju",
    description:
      "Gosti vam ostavljaju glasovne poruke putem retro telefona — sačuvajte uspomene koje možete slušati zauvek.",
  },
  galerija: {
    title: "QR Galerija slika",
    description: "Gosti skeniraju QR kod i dele slike direktno u vašu galeriju.",
  },
  meni: {
    title: "Meni za venčanje",
    description:
      "Kreirajte i delite meni sa gostima — uz opciju izbora jela za svakog gosta.",
  },
  guests: {
    title: "Lista gostiju",
    description:
      "Pratite potvrde dolaska, kategorizujte goste i imajte uvek tačan broj za sve vendore.",
  },
};
