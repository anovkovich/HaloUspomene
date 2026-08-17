/**
 * Google recenzije sa našeg Business Profila, preslikane u našu bazu.
 *
 * Zašto uopšte postoji kopija: profil je neverifikovan, pa je zvanični Google
 * Business Profile API nedostupan (`reviews.list` radi samo za verifikovanu
 * lokaciju, a i sama prijava za pristup API-ju traži verifikovan profil star
 * 60+ dana). Places API radi bez verifikacije ali vraća najviše 5 recenzija.
 * Zato ih jednom mesečno dovlači `scripts/sync-google-reviews.mjs` i upisuje
 * ovde, a sajt čita iz baze.
 *
 * Pravila koja ovaj sloj čuva:
 * - `text` je UVEK original na jeziku na kome je recenzija napisana. Google u
 *   svom UI-ju prevodi recenzije; prikazati prevod značilo bi staviti pod tuđe
 *   ime tekst koji ta osoba nikad nije napisala.
 * - Sync NIKAD ne briše. Upsert ide po `review_id`; ako Google sakrije ili
 *   servis zakaže, postojeći prikaz ostaje netaknut.
 * - `hidden` je jedini način da recenzija nestane sa sajta. Dokument ostaje u
 *   bazi, inače bi ga sledeći sync uredno vratio.
 * - Ocena i broj recenzija se NE emituju kao `AggregateRating` strukturirani
 *   podaci — ocenu koju biznis sam objavljuje o sebi Google tretira kao
 *   self-serving i ne prikazuje je kao zvezdice. V. komentar u
 *   `src/data/testimonials.ts`.
 */
import clientPromise from "./mongodb";

export interface GoogleReview {
  /** Outscraper `review_id` — stabilan ključ po kome ide upsert. */
  review_id: string;
  author_name: string;
  author_image?: string;
  rating: number;
  /** Doslovan tekst, na originalnom jeziku. Nikad Google-ov prevod. */
  text: string;
  /** BCP-47 oznaka jezika `text`-a, koliko je servis prepozna. */
  language?: string;
  /** ISO 8601, kada je recenzija ostavljena. */
  published_at: string;
  /** Direktan link na tu recenziju na Google-u, ako ga servis vrati. */
  review_link?: string;
  owner_answer?: string;
  /** Ručno sklonjeno sa sajta. Dokument namerno ostaje u bazi. */
  hidden?: boolean;
  /** Kada ju je sync poslednji put video. */
  synced_at: string;
}

/** Ocena i ukupan broj recenzija kako stoje na profilu. */
export interface GoogleReviewsSummary {
  rating: number;
  /** Ukupno na profilu — uključuje i one bez teksta, koje se ne prikazuju. */
  count: number;
  synced_at?: string;
}

const SUMMARY_KEY = "google_reviews_summary";

async function reviewsCol() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<GoogleReview>("google_reviews");
}

async function summaryCol() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<GoogleReviewsSummary & { key: string }>("site_config");
}

/**
 * Recenzije za prikaz — samo one sa tekstom, najnovije prve.
 *
 * Recenzije bez teksta (samo zvezdice) se ne vraćaju: kartica sa praznim
 * citatom ne govori ništa, a u ukupnom broju su i dalje uračunate preko
 * `getGoogleReviewsSummary()`.
 */
export async function getGoogleReviews(limit?: number): Promise<GoogleReview[]> {
  const col = await reviewsCol();
  const cursor = col
    .find({ hidden: { $ne: true }, text: { $nin: ["", null as never] } })
    .sort({ published_at: -1 })
    .project<GoogleReview>({ _id: 0 });
  if (limit) cursor.limit(limit);
  return cursor.toArray();
}

/**
 * Recenzije bez teksta — samo zvezdice.
 *
 * Odvojene su od `getGoogleReviews()` jer im prazan citat ne stoji: kartica sa
 * navodnicima oko ničega izgleda kao greška u učitavanju. Prikazuju se na dnu,
 * kao tanka traka sa imenima, da se broj kartica poklopi sa ocenom „16
 * recenzija" iznad njih.
 */
export async function getRatingOnlyGoogleReviews(): Promise<GoogleReview[]> {
  const col = await reviewsCol();
  return col
    .find({
      hidden: { $ne: true },
      $or: [{ text: "" }, { text: { $exists: false } }],
    })
    .sort({ published_at: -1 })
    .project<GoogleReview>({ _id: 0 })
    .toArray();
}

/** Ocena i broj sa profila; `null` dok prvi sync ne prođe. */
export async function getGoogleReviewsSummary(): Promise<GoogleReviewsSummary | null> {
  const col = await summaryCol();
  const doc = await col.findOne({ key: SUMMARY_KEY });
  if (!doc) return null;
  return { rating: doc.rating, count: doc.count, synced_at: doc.synced_at };
}
