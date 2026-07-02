import type { ChecklistItem, BudgetCategory, ChecklistGroup } from "./types";

let counter = 0;
function id() {
  return `default-${++counter}`;
}

function items(
  group: ChecklistGroup,
  texts: string[]
): ChecklistItem[] {
  return texts.map((text) => ({
    id: id(),
    text,
    completed: false,
    isCustom: false,
    group,
  }));
}

export function getDefaultChecklist(): ChecklistItem[] {
  counter = 0;
  return [
    ...items("12+", [
      "Izabrati datum venčanja (+ rezervni termin)",
      "Rezervisati salu / restoran (potpisati ugovor)",
      "Rezervisati termin crkvenog venčanja",
      "Izabrati kumove",
      "Napraviti okvirnu listu gostiju",
    ]),
    ...items("9-12", [
      "Rezervisati fotografa i videografa",
      "Rezervisati muziku (bend i DJ)",
      "Rezervisati dekoraciju",
      "Početi potragu za venčanicom i odelom",
      "Rezervisati Audio Guest Book (halouspomene.rs)",
    ]),
    ...items("6-9", [
      "Finalizirati listu gostiju (adrese i brojevi)",
      "Naručiti tortu (degustacija)",
      "Rezervisati šminkera i frizera",
      "Isplanirati medeni mesec (letovi, smeštaj, vize)",
    ]),
    ...items("3-6", [
      "Kupiti burme",
      "Naručiti pozivnice (štampane sa QR kodom za potvrdu — @halo_uspomene)",
      "Organizovati prevoz (ukoliko je potrebno)",
    ]),
    ...items("1-3", [
      "Poslati pozivnice",
      "Pratiti potvrde dolaska",
      "Dogovoriti meni (degustacija)",
      "Proba venčanice i odela",
      "Napraviti raspored sedenja",
      "Dogovoriti listu pesama sa muzikom",
      "Organizovati momačko / devojačko veče",
    ]),
    ...items("2-weeks", [
      "Potvrditi konačan broj gostiju (restoran / ketering)",
      "Potvrditi dogovor sa svim vendorima",
      "Podići venčanicu i odelo",
      "Pripremiti koverte za isplatu dobavljača",
      "Dogovor sa fotografom oko plana venčanja",
      "Pripremiti novac u gotovini za običaje i bakšiš",
    ]),
    ...items("day-before", [
      "Potvrditi satnicu sa kumovima i deverom",
      "Pripremiti burme i dokumenta",
      "Odrediti kontakt osobu za vendore i detalje organizacije na sam dan venčanja",
      "Odrediti blagajnika (čuva koverte i novac)",
      "Obezbediti kutiju za koverte (dogovoriti sa dekoraterom)",
    ]),
    ...items("wedding-day", [
      "Predati burme kumu",
      "Poneti keš i dokumenta",
      "Poneti punjač / power bank",
    ]),
  ];
}

export function getDefaultBudgetCategories(): BudgetCategory[] {
  return [
    { id: "cat-1", name: "Sala / Restoran", planned: 0, spent: 0, isCustom: false },
    { id: "cat-2", name: "Ketering / Hrana", planned: 0, spent: 0, isCustom: false },
    { id: "cat-3", name: "Fotograf & Video", planned: 0, spent: 0, isCustom: false },
    { id: "cat-4", name: "Muzika (Bend / DJ)", planned: 0, spent: 0, isCustom: false },
    { id: "cat-5", name: "Dekoracija & Cveće", planned: 0, spent: 0, isCustom: false },
    { id: "cat-6", name: "Venčanica / Odelo", planned: 0, spent: 0, isCustom: false },
    { id: "cat-7", name: "Burme", planned: 0, spent: 0, isCustom: false },
    { id: "cat-8", name: "Torta & Slatki sto", planned: 0, spent: 0, isCustom: false },
    { id: "cat-9", name: "Pozivnice", planned: 0, spent: 0, isCustom: false },
    { id: "cat-10", name: "Prevoz", planned: 0, spent: 0, isCustom: false },
    { id: "cat-11", name: "Medeni mesec", planned: 0, spent: 0, isCustom: false },
    { id: "cat-12", name: "Šminka & Frizura", planned: 0, spent: 0, isCustom: false },
  ];
}

export const GROUP_LABELS: Record<ChecklistGroup, string> = {
  "12+": "12+ meseci pre",
  "9-12": "9–12 meseci pre",
  "6-9": "6–9 meseci pre",
  "3-6": "3–6 meseci pre",
  "1-3": "1–3 meseca pre",
  "2-weeks": "2 nedelje pre",
  "day-before": "Dan pre venčanja",
  "wedding-day": "Dan venčanja & posle",
  custom: "Vaše stavke",
};

export const GROUP_ORDER: ChecklistGroup[] = [
  "12+",
  "9-12",
  "6-9",
  "3-6",
  "1-3",
  "2-weeks",
  "day-before",
  "wedding-day",
  "custom",
];
