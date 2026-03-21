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
      "Odrediti ukupan budžet i plan mesečne štednje",
      "Podeliti budžet po kategorijama (sala, hrana, muzika, foto, dekor, garderoba)",
      "Napraviti početnu listu gostiju (konsultujte roditelje za širu familiju)",
      "Izabrati datum venčanja (proveriti i jedan rezervni termin)",
      "Obići i rezervisati lokaciju / restoran (potpisati ugovor)",
      "Izabrati kumove",
      "Proveriti važnost pasoša (za medeni mesec)",
    ]),
    ...items("9-12", [
      "Rezervisati fotografa i videografa (istražiti stilove, potpisati ugovor)",
      "Rezervisati bend ili DJ-a",
      "Izabrati dekoratera (dogovoriti viziju, boje i stil venčanja)",
      "Rezervisati cvećaru (bidermajer, cvetići za kićenje, dekoracija stolova)",
      "Rezervisati Audio Guest Book (halouspomene.rs)",
      "Početi potragu za venčanicom i odelom",
      "Napraviti sajt za venčanje ili digitalnu \"Save the Date\" najavu",
      "Rezervisati blok soba u hotelu za goste koji dolaze sa strane",
    ]),
    ...items("6-9", [
      "Finalizirati listu gostiju (prikupiti sve adrese i brojeve telefona)",
      "Zakazati degustaciju menija u restoranu",
      "Naručiti svadbenu tortu i slatki sto (zakazati degustaciju)",
      "Rezervisati šminkera i frizera (potvrditi termine za jutro venčanja)",
      "Odabrati odeću za deveruše i najbolje prijatelje",
      "Isplanirati i rezervisati medeni mesec (letovi, smeštaj, vize)",
      "Kupiti poklone za roditelje i kumove",
    ]),
    ...items("3-6", [
      "Kupiti burme",
      "Prva proba venčanice (zakazati kod krojačice za prepravke)",
      "Pronaći odelo za mladoženju (cipele, košulja, manžetne)",
      "Proveriti dokumentaciju za matičara (zakazati opštinu)",
      "Razgovor sa sveštenikom (zakazati crkveno venčanje)",
      "Kupiti svadbene cipele i modne dodatke (nakit, veo)",
      "Naručiti ili dizajnirati pozivnice (papirne ili digitalne)",
      "Odabrati poklone za goste (zahvalnice, bombone, rakijice)",
      "Organizovati prevoz (limuzina, oldtimer ili autobus za goste)",
      "Isplanirati DIY detalje (tabla dobrodošlice, brojevi stolova)",
    ]),
    ...items("1-3", [
      "Poslati pozivnice (najkasnije 2 meseca pre svadbe)",
      "Napraviti preliminarni raspored sedenja",
      "Napisati detaljan plan dana (satnicu) od jutra do kraja",
      "Sastaviti listu pesama (ulazak, prvi ples, torta + \"ne puštaj\" lista)",
      "Organizovati momačko i devojačko veče",
      "Zakazati probnu šminku i frizuru",
      "Napisati zavete (ukoliko planirate lične poruke)",
      "Pratiti RSVP prijave i beležiti potvrde",
      "Potvrditi meni i tortu",
      "Časovi plesa (ukoliko želite uvežban prvi ples)",
    ]),
    ...items("2-weeks", [
      "Potvrditi konačan broj gostiju restoranu i keteringu",
      "Finalizirati raspored sedenja i odštampati tablu",
      "Podići venčanicu i odelo (poslednja provera i peglanje)",
      "Razgaziti svadbene cipele (nosite ih po kući bar 15 min dnevno)",
      "Pripremiti koverte sa gotovinom za isplatu dobavljača",
      "Spakovati torbu za hotel / medeni mesec",
      "Beauty tretmani (manikir, pedikir, depilacija, šišanje)",
      "Potvrditi raspored za fotografisanje",
      "Potvrditi sve dobavljače (poslednji put)",
    ]),
    ...items("day-before", [
      "Potvrditi satnicu sa kumom i deverima",
      "Odrediti \"kontakt osobu\" (neko ko odgovara na pozive vendora umesto vas)",
      "Pripremiti Emergency Kit (zihernadle, hanzaplast, lekovi, voda)",
      "Proveriti da li su burme i dokumenta spremni",
      "Ostaviti telefon sa strane i leći ranije!",
    ]),
    ...items("wedding-day", [
      "Doručkovati! (često jedini obrok mladencima taj dan)",
      "Imati sa sobom maramice i novac u kešu",
      "Predati burme kumu ili deveru",
      "Hidrirati se tokom dana",
      "UŽIVATI! Zaboravite na planove, prepustite se trenutku",
      "Poslati poruke zahvalnice gostima (posle venčanja)",
      "Odneti garderobu na hemijsko čišćenje (posle venčanja)",
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
