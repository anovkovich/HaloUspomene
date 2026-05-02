// Static text translations for wedding invitations
// Three locales: Serbian Latin, Serbian Cyrillic, German (formal "Sie")

export type Lang = "sr-Latn" | "sr-Cyrl" | "de";

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
  locations: string;

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

  // RSVP closed
  rsvpClosed: string;
  rsvpClosedSub: string;

  // Seating lookup
  findSeating: string;
  seatingAvailableNote: string;

  // PDF
  downloadPDF: string;

  // Envelope
  inviteYou: string;

  // Audio guest book
  audioGuestBook: string;
  audioRecordMessage: string;
  audioRecordButton: string;
  audioStopButton: string;
  audioYourName: string;
  audioSendMessage: string;
  audioThankYou: string;
  audioRecordAnother: string;
  audioMaxDuration: string;
  audioNotAvailableYet: string;
  audioDemoTitle: string;
  audioDemoDescription: string;
  audioListenTitle: string;
  audioNoMessages: string;
  audioBeFirst: string;
  audioDownloadAll: string;

  // Date labels
  months: string[];
  months_genitive: string[];
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
  ourDayPlan: "Plan našeg dana",

  // Location
  location: "Lokacija",
  locations: "Lokacije",

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
  notesPlaceholder: "Posebni zahtevi ili poruka mladencima...",
  sending: "Šaljem...",
  confirmAttendance: "Potvrdite dolazak",

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

  // RSVP closed
  rsvpClosed: "Prijave su zatvorene",
  rsvpClosedSub: "Rok za prijavu je istekao.",

  // Seating lookup
  findSeating: "✦ Pronađite mesto sedenja ✦",
  seatingAvailableNote:
    "Dan pre proslave biće dostupna provera gde ste raspoređeni sa sedenjem.",

  // Footer
  thankYouFooter: "Hvala Vam što ste deo naše sreće",

  // PDF
  downloadPDF: "Preuzmi pozivnicu",

  // Envelope
  inviteYou: "Pozivaju Vas na venčanje",

  // Audio guest book
  audioGuestBook: "Audio knjiga utisaka",
  audioRecordMessage: "Ostavite audio poruku mladencima",
  audioRecordButton: "Snimite poruku",
  audioStopButton: "Zaustavite",
  audioYourName: "Vaše ime",
  audioSendMessage: "Pošaljite poruku",
  audioThankYou: "Hvala na poruci!",
  audioRecordAnother: "Snimite još jednu",
  audioMaxDuration: "Maksimalno trajanje: 60 sekundi",
  audioNotAvailableYet: "Audio knjiga utisaka biće dostupna na dan venčanja",
  audioDemoTitle: "Audio knjiga utisaka — Demo",
  audioDemoDescription: "Ovo je demo verzija. Kontaktirajte nas za aktivaciju.",
  audioListenTitle: "Audio poruke gostiju",
  audioNoMessages: "Još uvek nema audio poruka",
  audioBeFirst: "Budite prvi koji će ostaviti poruku!",
  audioDownloadAll: "Preuzmi sve poruke",

  // Date labels
  months: [
    "januar",
    "februar",
    "mart",
    "april",
    "maj",
    "jun",
    "jul",
    "avgust",
    "septembar",
    "oktobar",
    "novembar",
    "decembar",
  ],
  months_genitive: [
    "januara",
    "februara",
    "marta",
    "aprila",
    "maja",
    "juna",
    "jula",
    "avgusta",
    "septembra",
    "oktobra",
    "novembra",
    "decembra",
  ],
  days_week: [
    "Nedelja",
    "Ponedeljak",
    "Utorak",
    "Sreda",
    "Četvrtak",
    "Petak",
    "Subota",
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
  ourDayPlan: "План нашег дана",

  // Location
  location: "Локација",
  locations: "Локације",

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
  notesPlaceholder: "Посебни захтеви или порука младенцима...",
  sending: "Шаљем...",
  confirmAttendance: "Потврдите долазак",

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

  // RSVP closed
  rsvpClosed: "Пријаве су затворене",
  rsvpClosedSub: "Рок за пријаву је истекао.",

  // Seating lookup
  findSeating: "✦ Пронађите место седења ✦",
  seatingAvailableNote:
    "Дан пре прославе биће доступна провера где сте распоређени са седењем.",

  // Footer
  thankYouFooter: "Хвала Вам што сте део наше среће",

  // PDF
  downloadPDF: "Преузми позивницу",

  // Envelope
  inviteYou: "Позивају Вас на венчање",

  // Audio guest book
  audioGuestBook: "Audio knjiga utisaka",
  audioRecordMessage: "Ostavite audio poruku mladencima",
  audioRecordButton: "Snimite poruku",
  audioStopButton: "Zaustavite",
  audioYourName: "Vaše ime",
  audioSendMessage: "Pošaljite poruku",
  audioThankYou: "Hvala na poruci!",
  audioRecordAnother: "Snimite još jednu",
  audioMaxDuration: "Maksimalno trajanje: 60 sekundi",
  audioNotAvailableYet: "Audio knjiga utisaka biće dostupna na dan venčanja",
  audioDemoTitle: "Audio knjiga utisaka — Demo",
  audioDemoDescription: "Ovo je demo verzija. Kontaktirajte nas za aktivaciju.",
  audioListenTitle: "Audio poruke gostiju",
  audioNoMessages: "Još uvek nema audio poruka",
  audioBeFirst: "Budite prvi koji će ostaviti poruku!",
  audioDownloadAll: "Preuzmi sve poruke",

  // Date labels
  months: [
    "јануар",
    "фебруар",
    "март",
    "април",
    "мај",
    "јун",
    "јул",
    "август",
    "септембар",
    "октобар",
    "новембар",
    "децембар",
  ],
  months_genitive: [
    "јануара",
    "фебруара",
    "марта",
    "априла",
    "маја",
    "јуна",
    "јула",
    "августа",
    "септембра",
    "октобра",
    "новембра",
    "децембра",
  ],
  days_week: [
    "Недеља",
    "Понедељак",
    "Уторак",
    "Среда",
    "Четвртак",
    "Петак",
    "Субота",
  ],
};

export const germanTranslations: Translations = {
  // Hero section
  celebrateLove: "Wir feiern die Liebe",
  when: "Wann:",

  // Countdown — "Countdown" is a loanword in German; use a native phrase
  // that reads as a section heading rather than tech jargon.
  countdown: "Bis zum großen Tag",
  days: "Tage",
  hours: "Stunden",
  minutes: "Minuten",
  seconds: "Sekunden",

  // Feature cards
  where: "Wo",
  whenLabel: "Wann",

  // Timeline
  protocol: "Programm",
  ourDayPlan: "Unser Tagesablauf",

  // Location
  location: "Ort",
  locations: "Orte",

  // RSVP
  rsvpTitle: "Antwort erbeten",
  rsvpSubtitle: "Bitte bestätigen Sie Ihre Teilnahme bis",
  nameLabel: "Vor- und Nachname",
  namePlaceholder: "Ihr Name",
  attendingLabel: "Werden Sie kommen?",
  attendingYes: "Ich komme",
  attendingYesSub: "Mit Freude!",
  attendingNo: "Leider nein",
  attendingNoSub: "Alles Gute!",
  guestCount: "Anzahl der Personen (inklusive Sie)",
  additionalNotes: "Anmerkungen",
  notesPlaceholder: "Besondere Wünsche oder eine Nachricht an das Brautpaar...",
  sending: "Wird gesendet...",
  confirmAttendance: "Teilnahme bestätigen",

  // Success messages
  thankYou: "Danke!",
  thankYouResponse: "Danke für Ihre Antwort!",
  confirmationRecorded: "Ihre Bestätigung wurde erfolgreich gespeichert.",
  sorryNotAttending: "Schade, dass Sie nicht dabei sein können.",
  lookingForward: "Wir freuen uns darauf, Sie auf der Feier zu sehen!",
  hopeToSee: "Wir hoffen, uns ein anderes Mal zu sehen.",
  submitAnother: "Neue Antwort senden",
  person: "Person",
  people: "Personen",
  notAttending: "Wird nicht teilnehmen",

  // RSVP closed
  rsvpClosed: "Die Anmeldung ist geschlossen",
  rsvpClosedSub: "Die Anmeldefrist ist abgelaufen.",

  // Seating lookup
  findSeating: "✦ Finden Sie Ihren Sitzplatz ✦",
  seatingAvailableNote:
    "Einen Tag vor der Feier können Sie Ihren Sitzplatz nachschauen.",

  // Footer
  thankYouFooter: "Danke, dass Sie Teil unseres Glücks sind",

  // PDF
  downloadPDF: "Einladung herunterladen",

  // Envelope
  inviteYou: "Laden Sie ein zur Hochzeit",

  // Audio guest book
  audioGuestBook: "Audio-Gästebuch",
  audioRecordMessage: "Hinterlassen Sie eine Audio-Nachricht für das Brautpaar",
  audioRecordButton: "Nachricht aufnehmen",
  audioStopButton: "Stoppen",
  audioYourName: "Ihr Name",
  audioSendMessage: "Nachricht senden",
  audioThankYou: "Danke für Ihre Nachricht!",
  audioRecordAnother: "Noch eine aufnehmen",
  audioMaxDuration: "Maximale Dauer: 60 Sekunden",
  audioNotAvailableYet: "Das Audio-Gästebuch ist am Hochzeitstag verfügbar",
  audioDemoTitle: "Audio-Gästebuch — Demo",
  audioDemoDescription: "Dies ist eine Demo-Version. Kontaktieren Sie uns für die Aktivierung.",
  audioListenTitle: "Audio-Nachrichten der Gäste",
  audioNoMessages: "Noch keine Audio-Nachrichten",
  audioBeFirst: "Hinterlassen Sie als erste/r eine Nachricht!",
  audioDownloadAll: "Alle Nachrichten herunterladen",

  // Date labels
  months: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  months_genitive: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  days_week: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
};

/** Returns translations for the given language. Accepts the legacy boolean
 *  signature (true → Cyrillic, false → Latin) for backward compatibility
 *  with existing call sites in the audio/PDF/sub-routes. */
export function getTranslations(langOrUseCyrillic: Lang | boolean): Translations {
  if (typeof langOrUseCyrillic === "boolean") {
    return langOrUseCyrillic ? cyrillicTranslations : latinTranslations;
  }
  switch (langOrUseCyrillic) {
    case "sr-Cyrl":
      return cyrillicTranslations;
    case "de":
      return germanTranslations;
    case "sr-Latn":
    default:
      return latinTranslations;
  }
}
