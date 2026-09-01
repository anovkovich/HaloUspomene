/**
 * Podaci za landing stranicu /lazni-maticar.
 *
 * Cene su izdvojene ovde: menja se SAMO ovaj fajl, a stranica, schema.org
 * Offer, FAQ odgovor i skriveni SEO pasus se izvode odavde.
 *
 * ─── ODLUKA O PRIKAZU CENA (2026-08-05) ─────────────────────────────────────
 * Objavljuje se JEDNA cifra — standardna ceremonija u Beogradu. Sve ostalo ide
 * na dogovor, i to namerno:
 *
 *  1. Partner radi selektivno i sam kaže da radi „samo kada se lako dogovorimo".
 *     Pun cenovnik po gradovima (Avala/Smederevo do 200, Fruška gora 300,
 *     Niš 350) postoji, ali objavljen bi mu sutra sužavao prostor za dogovor.
 *  2. Cene za dalje lokacije zavise od udaljenosti i termina, pa jedna cifra
 *     ionako ne bi bila tačna.
 *  3. Ceremonija na stranom jeziku traži poseban rad na tekstu — cena zavisi
 *     od scenarija (poznat primer: mala ceremonija na engleskom = 400 €).
 *
 * Stranica i dalje NE krije cenu: daje tačan iznos za najčešći slučaj i
 * pošteno objašnjava od čega zavisi ostalo. To je razlika u odnosu na
 * konkurenciju, koja ne daje nijednu cifru.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * NAPOMENA: partner se nigde ne imenuje (white-label) — kontakt za interno
 * rutiranje upita je u `src/lib/partneri.ts`, koji je server-only.
 */

/**
 * Standardna ceremonija u Beogradu, u DINARIMA.
 *
 * Do 2026-08-10 je stajalo 150 € (≈ 17.600 din). Odlukom vlasnika cena je
 * spuštena na 15.000 din i prebačena u dinare — domaći par računa u dinarima,
 * a cifra u evrima je delovala skuplje nego što jeste.
 *
 * Prikazuje se kroz `formatPrice()` iz `pricing.ts`, kao i sve ostale cene na
 * sajtu, da format bude isti svuda („15.000 din").
 */
export const priceFrom = 15000;

/** Valuta — ide u schema.org Offer. */
export const priceCurrency = "RSD";

/** Grad na koji se odnosi `priceFrom`. */
export const priceBaseCity = "Beograd";


/** Šta je uvek uključeno u nastup, bez obzira na paket. */
export const includedAlways = [
  "Dolazak na vašu lokaciju u dogovoreno vreme",
  "Ceremonija sa simboličnom lentom i knjigom venčanih — svečan utisak bez ijednog pravnog elementa",
  "Govor pisan po vašoj priči, usaglašen sa vama unapred",
  "Dogovor tona: klasično, emotivno, šaljivo ili kombinovano",
];

/** Dogovara se posebno i ne ulazi u osnovnu cenu. */
export const extras = [
  "Dolazak van Beograda (putni troškovi prema udaljenosti)",
  "Nastup u kasnim večernjim satima",
  "Poseban scenario sa više likova ili rekvizita",
  "Ceremonija na engleskom ili ruskom jeziku",
];

/**
 * Opcije u prvoj padajućoj listi forme: kakav ton ceremonije žele.
 *
 * Redosled nije slučajan: partner javlja da najveći broj parova i dalje bira
 * klasičnu ceremoniju sa standardnim tekstom, jer tako deluje stvarno.
 * Zato klasična stoji prva.
 */
export const toneOptions = [
  "Klasična ceremonija sa standardnim tekstom",
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
