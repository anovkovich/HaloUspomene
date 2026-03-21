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
      "Odrediti okvirni budžet",
      "Izabrati datum venčanja",
      "Rezervisati salu / restoran",
      "Napraviti listu gostiju (prva verzija)",
      "Izabrati fotografa i/ili videografa",
      "Izabrati bend ili DJ-a",
    ]),
    ...items("6-12", [
      "Izabrati venčanicu / odelo",
      "Rezervisati cvetnu dekoraciju",
      "Organizovati degustaciju menija",
      "Naručiti pozivnice (digitalne ili štampane)",
      "Izabrati tortu / svadbeni kolač",
      "Organizovati prevoz za dan venčanja",
    ]),
    ...items("3-6", [
      "Poslati pozivnice gostima",
      "Potvrditi sve dobavljače",
      "Izabrati burme",
      "Organizovati muziku za ceremoniju",
      "Planirati raspored sedenja",
      "Rezervisati audio guest book",
    ]),
    ...items("1-3", [
      "Finalizovati listu gostiju",
      "Probna šminka i frizura",
      "Potvrditi meni i tortu",
      "Pripremiti govore / zakletve",
      "Organizovati probu venčanja",
      "Potvrditi raspored za fotografisanje",
    ]),
    ...items("last-week", [
      "Potvrditi sve dobavljače (poslednji put)",
      "Pripremiti koverte za kumove / svedoke",
      "Spakovati torbu za dan venčanja",
      "Potvrditi prevoz i raspored",
      "Opustiti se i uživati!",
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
    { id: "cat-8", name: "Torta", planned: 0, spent: 0, isCustom: false },
    { id: "cat-9", name: "Pozivnice", planned: 0, spent: 0, isCustom: false },
    { id: "cat-10", name: "Prevoz", planned: 0, spent: 0, isCustom: false },
  ];
}

export const GROUP_LABELS: Record<ChecklistGroup, string> = {
  "12+": "12+ meseci pre",
  "6-12": "6–12 meseci pre",
  "3-6": "3–6 meseci pre",
  "1-3": "1–3 meseca pre",
  "last-week": "Poslednja nedelja",
  custom: "Vaše stavke",
};

export const GROUP_ORDER: ChecklistGroup[] = [
  "12+",
  "6-12",
  "3-6",
  "1-3",
  "last-week",
  "custom",
];
