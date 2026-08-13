import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

// ─────────────────────────────────────────────────────────────────────────────
// `payment_refs` — lookup table "poziv na broj → koji je ovo proizvod".
//
// Postoje DVA načina na koja poziv na broj nastaje:
//
//   1. `/placanje` (self-serve)  → `orders.ipsRef`, već se upisuje u bazu.
//      Ta kolekcija ostaje izvor istine i ovde se NE duplira — pretraga samo
//      gleda i tamo (v. `lookupPaymentRef`).
//
//   2. `/racun` (račun koji admin generiše) → do 2026-08-14 se poziv na broj
//      izvodio iz `t: Date.now()` unutar base64 linka i NIJE se nigde čuvao.
//      Kad uplata stigne, taj broj nije mogao da se veže ni za šta, a dva
//      klika na "kopiraj link" davala su dva različita broja. Ova kolekcija
//      zatvara tu rupu.
//
// Jedan proizvod sme da ima VIŠE redova — svaka dokupovina je nov račun i nov
// poziv na broj, pa je istorija uplata po kupcu vidljiva sama od sebe.
// ─────────────────────────────────────────────────────────────────────────────

/** `kind` iz `orders` + "custom" za samostalne račune koji ne pokazuju ni na
 *  jedan entitet (kolekcija `custom_receipts`). */
export type PaymentRefKind =
  | "pozivnica"
  | "rodjendan"
  | "punoletstvo"
  | "raspored"
  | "galerija"
  | "dogadjaj"
  | "telefon"
  | "custom";

export interface PaymentRefDocument {
  _id?: ObjectId;
  ref: string; // poziv na broj, same cifre (unique)
  kind: PaymentRefKind;
  slug: string; // slug entiteta, ili id custom računa
  displayName: string; // ime para / deteta / događaja — za prikaz u rezultatu
  amountRsd: number;
  items: Array<{ l: string; p: number }>;
  bankAccountIdx: number;
  /** Trenutak od kojeg je poziv na broj izveden — isti `t` koji je u linku. */
  issuedAt: Date;
  createdAt: Date;
  /** Popunjava se kad se uplata ručno označi kao viđena. */
  settledAt?: Date | null;
  note?: string;
}

async function col() {
  const client = await clientPromise;
  return client
    .db("halouspomene")
    .collection<PaymentRefDocument>("payment_refs");
}

let indexesEnsured = false;
async function ensureIndexes() {
  if (indexesEnsured) return;
  const c = await col();
  // Unique je nosivo, ne kozmetika: na njemu se lomi generisanje kad dva računa
  // padnu u istu minutu, pa `recordReceiptRef` zna da pomeri minut.
  await c.createIndex({ ref: 1 }, { unique: true }).catch(() => {});
  await c.createIndex({ kind: 1, slug: 1 }).catch(() => {});
  indexesEnsured = true;
}

/** `t` (ms) → poziv na broj `YYYYMMDDHHmm`, isto kako ga `/racun` prikazuje.
 *  Mora da ostane identično računici u `src/app/racun/page.tsx` (`receiptNo`),
 *  inače bi zapis i link imali različite brojeve. */
export function refFromTimestamp(t: number): string {
  const d = new Date(t);
  return (
    `${d.getFullYear()}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${String(d.getDate()).padStart(2, "0")}` +
    `${String(d.getHours()).padStart(2, "0")}` +
    `${String(d.getMinutes()).padStart(2, "0")}`
  );
}

/** Očisti poziv na broj kako ga admin nalepi iz izvoda ili m-bankinga.
 *
 *  Podnosi: `202608140905`, `00202608140905` (model 00 iz IPS QR-a),
 *  `HU914950274680` (orderId), razmake i crtice.
 *
 *  Skidanje vodećih `00` je bezbedno: računi počinju godinom (`20…`), a
 *  `generateOrderId` bira iz opsega koji nikad ne počinje nulom. */
export function normalizePaymentRef(raw: string): string {
  const digits = raw.trim().replace(/^HU/i, "").replace(/\D/g, "");
  return digits.length > 12 && digits.startsWith("00")
    ? digits.slice(2)
    : digits;
}

/** Upisuje izdati poziv na broj. Ako je taj broj već zauzet (dva računa u istoj
 *  minuti), pomera se minut unapred dok se ne nađe slobodan — zato vraća i `t`
 *  koje je stvarno upotrebljeno, da pozivalac njime izgradi link. */
export async function recordReceiptRef(input: {
  kind: PaymentRefKind;
  slug: string;
  displayName: string;
  amountRsd: number;
  items: Array<{ l: string; p: number }>;
  bankAccountIdx: number;
  t: number;
}): Promise<{ ref: string; t: number }> {
  await ensureIndexes();
  const c = await col();

  let t = input.t;
  for (let attempt = 0; attempt < 60; attempt++) {
    const ref = refFromTimestamp(t);
    try {
      await c.insertOne({
        ref,
        kind: input.kind,
        slug: input.slug,
        displayName: input.displayName,
        amountRsd: input.amountRsd,
        items: input.items,
        bankAccountIdx: input.bankAccountIdx,
        issuedAt: new Date(t),
        createdAt: new Date(),
        settledAt: null,
      });
      return { ref, t };
    } catch (e) {
      const code = (e as { code?: number }).code;
      if (code !== 11000) throw e;
      t += 60_000; // ta minuta je zauzeta — probaj sledeću
    }
  }
  throw new Error("Nije nadjen slobodan poziv na broj ni posle 60 pokusaja");
}

/** Zavodi tačno ovaj `t`, BEZ pomeranja minuta — za slučajeve gde `t` nije naš
 *  izbor nego već zapisan podatak (npr. `custom_receipts.created_at`, iz kojeg
 *  se link uvek iznova izvodi). Duplikat se tiho preskače: dva takva računa u
 *  istoj minuti ionako daju isti poziv na broj i u samom linku. */
export async function recordReceiptRefExact(input: {
  kind: PaymentRefKind;
  slug: string;
  displayName: string;
  amountRsd: number;
  items: Array<{ l: string; p: number }>;
  bankAccountIdx: number;
  t: number;
}): Promise<string> {
  await ensureIndexes();
  const c = await col();
  const ref = refFromTimestamp(input.t);
  try {
    await c.insertOne({
      ref,
      kind: input.kind,
      slug: input.slug,
      displayName: input.displayName,
      amountRsd: input.amountRsd,
      items: input.items,
      bankAccountIdx: input.bankAccountIdx,
      issuedAt: new Date(input.t),
      createdAt: new Date(),
      settledAt: null,
    });
  } catch (e) {
    if ((e as { code?: number }).code !== 11000) throw e;
  }
  return ref;
}

export async function getPaymentRef(
  ref: string,
): Promise<PaymentRefDocument | null> {
  const c = await col();
  return c.findOne({ ref });
}

/** Svi pozivi na broj izdati za jedan entitet, najnoviji prvi. */
export async function listPaymentRefsFor(
  kind: PaymentRefKind,
  slug: string,
): Promise<PaymentRefDocument[]> {
  const c = await col();
  return c.find({ kind, slug }).sort({ issuedAt: -1 }).toArray();
}

export async function markPaymentRefSettled(
  ref: string,
  note?: string,
): Promise<boolean> {
  const c = await col();
  const r = await c.updateOne(
    { ref },
    { $set: { settledAt: new Date(), ...(note ? { note } : {}) } },
  );
  return r.matchedCount > 0;
}
