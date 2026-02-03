// Static text translations for wedding invitations
// Latin (default) and Cyrillic versions

export interface Translations {
  // Hero section
  celebrateLove: string;
  when: string;

  // Countdown
  countdown: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;

  // Feature cards
  where: string;
  whenLabel: string;

  // Timeline
  protocol: string;
  ourDayPlan: string;

  // Location
  location: string;

  // RSVP
  rsvpTitle: string;
  rsvpSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  attendingLabel: string;
  attendingYes: string;
  attendingYesSub: string;
  attendingNo: string;
  attendingNoSub: string;
  guestCount: string;
  additionalNotes: string;
  notesPlaceholder: string;
  sending: string;
  confirmAttendance: string;

  // Success messages
  thankYou: string;
  thankYouResponse: string;
  confirmationRecorded: string;
  sorryNotAttending: string;
  lookingForward: string;
  hopeToSee: string;
  submitAnother: string;
  person: string;
  people: string;
  notAttending: string;

  // Footer
  thankYouFooter: string;

  // Envelope
  inviteYou: string;

  // Date labels
  months: string[];
  days_week: string[];
}

export const latinTranslations: Translations = {
  // Hero section
  celebrateLove: "Slavimo ljubav",
  when: "Kada:",

  // Countdown
  countdown: "Odbrojavanje",
  days: "Dana",
  hours: "Sati",
  minutes: "Minuta",
  seconds: "Sekundi",

  // Feature cards
  where: "Gde",
  whenLabel: "Kada",

  // Timeline
  protocol: "Protokol",
  ourDayPlan: "Plan našeg zajedničkog dana",

  // Location
  location: "Lokacija",

  // RSVP
  rsvpTitle: "Potvrda dolaska",
  rsvpSubtitle: "Molimo Vas da svoj dolazak potvrdite do",
  nameLabel: "Ime i prezime",
  namePlaceholder: "Vaše ime",
  attendingLabel: "Da li dolazite?",
  attendingYes: "Dolazim",
  attendingYesSub: "Sa radošću!",
  attendingNo: "Nažalost ne",
  attendingNoSub: "Sve najlepše!",
  guestCount: "Broj osoba (uključujući Vas)",
  additionalNotes: "Dodatne napomene",
  notesPlaceholder: "Alergije, posebni zahtevi, poruka mladencima...",
  sending: "Šaljem...",
  confirmAttendance: "Potvrdi dolazak",

  // Success messages
  thankYou: "Hvala Vam!",
  thankYouResponse: "Hvala na odgovoru!",
  confirmationRecorded: "Vaša potvrda je uspešno zabeležena.",
  sorryNotAttending: "Žao nam je što nećete moći da prisustvujete.",
  lookingForward: "Radujemo se što ćemo vas videti na proslavi!",
  hopeToSee: "Nadamo se da ćemo se videti nekom drugom prilikom.",
  submitAnother: "Pošalji novi odgovor",
  person: "osoba",
  people: "osobe",
  notAttending: "Neće prisustvovati",

  // Footer
  thankYouFooter: "Hvala Vam što ste deo naše sreće",

  // Envelope
  inviteYou: "Pozivaju Vas na venčanje",

  // Date labels
  months: [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun",
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
  ],
  days_week: [
    "Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"
  ],
};

export const cyrillicTranslations: Translations = {
  // Hero section
  celebrateLove: "Славимо љубав",
  when: "Када:",

  // Countdown
  countdown: "Одбројавање",
  days: "Дана",
  hours: "Сати",
  minutes: "Минута",
  seconds: "Секунди",

  // Feature cards
  where: "Где",
  whenLabel: "Када",

  // Timeline
  protocol: "Протокол",
  ourDayPlan: "План нашег заједничког дана",

  // Location
  location: "Локација",

  // RSVP
  rsvpTitle: "Потврда доласка",
  rsvpSubtitle: "Молимо Вас да свој долазак потврдите до",
  nameLabel: "Име и презиме",
  namePlaceholder: "Ваше име",
  attendingLabel: "Да ли долазите?",
  attendingYes: "Долазим",
  attendingYesSub: "Са радошћу!",
  attendingNo: "Нажалост не",
  attendingNoSub: "Све најлепше!",
  guestCount: "Број особа (укључујући Вас)",
  additionalNotes: "Додатне напомене",
  notesPlaceholder: "Алергије, посебни захтеви, порука младенцима...",
  sending: "Шаљем...",
  confirmAttendance: "Потврди долазак",

  // Success messages
  thankYou: "Хвала Вам!",
  thankYouResponse: "Хвала на одговору!",
  confirmationRecorded: "Ваша потврда је успешно забележена.",
  sorryNotAttending: "Жао нам је што нећете моћи да присуствујете.",
  lookingForward: "Радујемо се што ћемо вас видети на прослави!",
  hopeToSee: "Надамо се да ћемо се видети неком другом приликом.",
  submitAnother: "Пошаљи нови одговор",
  person: "особа",
  people: "особе",
  notAttending: "Неће присуствовати",

  // Footer
  thankYouFooter: "Хвала Вам што сте део наше среће",

  // Envelope
  inviteYou: "Позивају Вас на венчање",

  // Date labels
  months: [
    "Јануар", "Фебруар", "Март", "Април", "Мај", "Јун",
    "Јул", "Август", "Септембар", "Октобар", "Новембар", "Децембар"
  ],
  days_week: [
    "Недеља", "Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"
  ],
};

export function getTranslations(useCyrillic: boolean): Translations {
  return useCyrillic ? cyrillicTranslations : latinTranslations;
}
