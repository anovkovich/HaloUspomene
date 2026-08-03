/**
 * Podaci za landing stranicu /lazni-maticar.
 *
 * Cena je namerno izdvojena ovde: partner za sada nije dao pun cenovnik, pa
 * stranica prikazuje orijentacionu donju granicu. Kada stignu tačne cifre,
 * menja se SAMO ovaj fajl — stranica, tabela paketa, schema.org Offer i
 * odgovor u FAQ-u se izvode odavde.
 *
 * ─── KADA STIGNE PUN CENOVNIK ───────────────────────────────────────────────
 * Popuni `packages` (naziv, cena, šta uključuje) i prebaci `pricingApproximate`
 * na false. Stranica tada prikazuje tabelu paketa umesto jedne "od X EUR"
 * cifre, a formulacije o orijentacionoj ceni nestaju same.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * NAPOMENA: partner se nigde ne imenuje (white-label) — kontakt za interno
 * rutiranje upita je u `src/lib/partneri.ts`, koji je server-only.
 */

export interface CeremonyPackage {
  id: string;
  name: string;
  price: number;
  /** Šta ulazi u paket. */
  includes: string[];
}

/** Donja granica cene u EUR. Prikazuje se kao "od X €". */
export const priceFrom = 100;

/**
 * Da li je cena orijentaciona. Dok je `true`, stranica jasno kaže da je cifra
 * okvirna i da tačnu ponudu šaljemo na upit.
 */
export const pricingApproximate = true;

/** Paketi — prazno dok partner ne dostavi cenovnik (v. napomenu iznad). */
export const packages: CeremonyPackage[] = [];

/** Šta je uvek uključeno u nastup, bez obzira na paket. */
export const includedAlways = [
  "Dolazak na vašu lokaciju u dogovoreno vreme",
  "Ceremonija u odelu, sa lentom i knjigom — kao na pravom venčanju",
  "Govor pisan po vašoj priči, usaglašen sa vama unapred",
  "Dogovor tona: emotivno, šaljivo ili kombinovano",
  "Razmena zaveta i simbolično potpisivanje",
];

/** Dogovara se posebno i ne ulazi u osnovnu cenu. */
export const extras = [
  "Dolazak van Beograda (putni troškovi prema udaljenosti)",
  "Nastup u kasnim večernjim satima",
  "Poseban scenario sa više likova ili rekvizita",
  "Ceremonija na stranom jeziku, za goste iz inostranstva",
];

/** Opcije u prvoj padajućoj listi forme: kakav ton ceremonije žele. */
export const toneOptions = [
  "Emotivna ceremonija",
  "Šaljiva ceremonija",
  "Kombinovano — počne ozbiljno, pređe u šalu",
  "Nismo sigurni — treba nam savet",
];

/** Opcije u drugoj padajućoj listi forme: povod. */
export const occasionOptions = [
  "Svadba",
  "Ceremonija za goste (venčani smo u inostranstvu)",
  "Obnova zaveta / godišnjica braka",
  "Proslava na otvorenom bez matičara",
  "Rođendan ili korporativna proslava",
  "Drugo",
];
