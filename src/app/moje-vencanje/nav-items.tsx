import {
  CheckCircle2,
  Wallet,
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

export const NAV_ITEMS: NavItem[] = [
  { view: "overview", label: "Pregled", icon: <Home size={18} /> },
  { view: "checklist", label: "Checklista", icon: <CheckCircle2 size={18} /> },
  { view: "budget", label: "Budžet", icon: <Wallet size={18} /> },
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
    return NAV_ITEMS.map((item) => ({
      ...item,
      locked: item.view !== "galerija",
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
