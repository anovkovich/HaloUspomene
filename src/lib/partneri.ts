/**
 * INTERNI registar partnera za usluge koje posredujemo.
 *
 * ⚠️ SERVER-ONLY. Ovaj modul se sme uvoziti SAMO iz server koda
 * (`/api/contact/route.ts`). NIKADA ga ne uvoziti u komponentu sa "use client"
 * — Next bi ga tada spakovao u klijentski bundle i imena i telefoni partnera
 * bi bili vidljivi svakome ko otvori izvorni kod stranice.
 *
 * Sve posredovane usluge su white-label: klijent vidi samo HALO Uspomene. Ako
 * bi saznao ko stoji iza usluge, otišao bi direktno i mi bismo izgubili posao.
 *
 * Podaci putuju do nas ovako: klijent posle uspešne verifikacije telefona pita
 * `/api/contact` kome pripada izabrana stavka, server vrati `routing` string, a
 * klijent ga ubaci u mejl (polje "interno_prosledi_partneru"). Da bi neko
 * izvukao ove kontakte, morao bi da prođe reCAPTCHA i SMS verifikaciju broja.
 *
 * ─── KAKO DODATI PARTNERA ILI USLUGU ────────────────────────────────────────
 * 1. Dodaj partnera u `partners` sa `products` (koje usluge pokriva) i, ako je
 *    usluga vezana za konkretne stavke, `itemIds` (npr. id-jevi vozila iz
 *    `src/data/oldtajmeri.ts`).
 * 2. Za novu uslugu dodaj njen kljuc u `RoutingProduct` i granu u
 *    `resolvePartnerRouting`, pa na stranici prosledi `routingProduct` formi.
 * 3. Ako nijedan partner ne odgovara izboru, vraca se spisak SVIH partnera te
 *    usluge — upit nikad ne ostane bez rute.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { oldtimerFleet, vehicleOptionLabel } from "@/data/oldtajmeri";

/** Usluge za koje forma trazi interno rutiranje (vrednost `routingProduct`). */
export type RoutingProduct = "oldtajmeri" | "lazni-maticar";

export interface Partner {
  id: string;
  /** Naziv pod kojim ih vodimo interno. */
  name: string;
  /** Ime osobe za kontakt, ako je poznato. */
  contactPerson?: string;
  /** Telefon; izostavi dok ga nemamo. */
  phone?: string;
  /** Kojim kanalima je taj broj dostupan. */
  channels?: string;
  instagram?: string;
  /**
   * Kratka interna napomena za mejl: šta pokriva ili šta o njemu znamo
   * (npr. „Beograd i bliža okolina"). Pomaže da se odmah zna kome zvati.
   */
  coverage?: string;
  /** Koje usluge ovaj partner pokriva. */
  products: RoutingProduct[];
  /**
   * Id-jevi konkretnih stavki koje partner drzi (za sada samo vozila iz
   * `oldtimerFleet`). Usluge bez stavki ovo izostavljaju.
   */
  itemIds?: string[];
}

export const partners: Partner[] = [
  {
    id: "oldtimer-beograd",
    name: "Oldtimer Beograd",
    phone: "062 445 277",
    channels: "Viber / WhatsApp",
    instagram: "@oldtimer011",
    products: ["oldtajmeri"],
    itemIds: ["fiat-1300-crveni", "fiat-1300-beli"],
  },
  {
    id: "markusev-pancevo",
    name: "Oldtimer iznajmljivanje Markušev",
    contactPerson: "Markušev",
    phone: "063 240-817",
    channels: "Viber",
    instagram: "@iznajmljivanje.oldtajmera.pa",
    products: ["oldtajmeri"],
    itemIds: [
      "pontiac-6-28-phaeton",
      "chevrolet-international-1929",
      "citroen-traction-avant-11b",
    ],
  },
  {
    id: "oldtimer-paracin",
    name: "Oldtajmeri Paraćin (Pomoravlje)",
    contactPerson: "Dejan Stević",
    phone: "063 201-510",
    // TODO: dopuniti kanale (Viber/WhatsApp ili samo pozivi) i Instagram kada
    // stignu od partnera — bez toga u mejlu ne pise kako mu je najbrze prici.
    products: ["oldtajmeri"],
    itemIds: [
      "mercedes-170v-1940",
      "pontiac-six-1931",
      "triumph-herald-1200-1964",
      "moskvic-407-1962",
    ],
  },
  // Za lažnog matičara imamo dva saradnika i nemamo podatak o lokaciji u
  // izboru sa forme, pa u mejl idu OBA — prvi je onaj sa telefonom, da se zna
  // koga zvati odmah. Instagram nalozi im se razlikuju samo po tačkama i
  // donjim crtama, pa pažljivo pri prepisivanju.
  {
    id: "lazni-maticar-sajkovic",
    name: "Lažni matičar Beograd (Šajković)",
    contactPerson: "Dimitrije Šajković",
    phone: "066 919 9332",
    instagram: "@lazni_maticar_beograd",
    coverage: "Beograd i bliža okolina",
    products: ["lazni-maticar"],
  },
  {
    id: "lazni-maticar-beograd",
    name: "Lažni matičar Beograd (prvi saradnik)",
    // TODO: dopuniti ime osobe i telefon kada stignu. Do tada je Instagram
    // jedini kanal koji imamo, pa on ide u mejl.
    instagram: "@lazni.maticar.beograd",
    coverage:
      "nemamo telefon, samo Instagram; od njega su orijentacione cene ispod",
    products: ["lazni-maticar"],
  },
];

/**
 * INTERNI cenovnik po uslugama — ide samo u mejl koji stiže nama uz upit, kao
 * orijentacija dok se ne javimo klijentu. NIKADA se ne prikazuje na stranici:
 * objavljen bi partneru sutra sužavao prostor za dogovor.
 */
const INTERNAL_PRICE_NOTES: Partial<Record<RoutingProduct, string>> = {
  "lazni-maticar":
    "Orijentaciono (cenovnik prvog saradnika, NE objavljivati): Beograd ~15.000 din · Avala/Smederevo do 200 € · Fruška gora 300 € · Niš 350 € · ceremonija na stranom jeziku od 400 €. Sve van Beograda zavisi od udaljenosti i termina.",
};

/** Interna napomena o cenama za datu uslugu, ako je imamo. */
export function internalPriceNote(product: string): string | null {
  return INTERNAL_PRICE_NOTES[product as RoutingProduct] ?? null;
}

/** Jedan red za mejl: "Ime (osoba) — telefon (kanali) — @instagram". */
function formatPartner(p: Partner): string {
  const who = p.contactPerson ? `${p.name} (${p.contactPerson})` : p.name;
  const parts = [who];
  if (p.phone) parts.push(`${p.phone}${p.channels ? ` (${p.channels})` : ""}`);
  if (p.instagram) parts.push(p.instagram);
  if (p.coverage) parts.push(p.coverage);
  return parts.join(" — ");
}

/** Svi partneri koji pokrivaju datu uslugu. */
function partnersFor(product: RoutingProduct): Partner[] {
  return partners.filter((p) => p.products.includes(product));
}

function allPartnersFallback(product: RoutingProduct, reason: string): string {
  const list = partnersFor(product).map(formatPartner);
  if (!list.length) return `Nema upisanog partnera za uslugu "${product}".`;
  if (list.length === 1) return list[0];
  return `${reason}: ${list.join(" | ")}`;
}

/**
 * Kome proslediti upit.
 *
 * `selection` je izbor iz padajuće liste na stranici — za oldtajmere je to
 * labela vozila, pa se po njoj nalazi vozilo i njegov partner. Za usluge sa
 * jednim partnerom `selection` se ignoriše.
 *
 * Vraća `null` za nepoznatu uslugu, da API ne bi slao besmislen tekst u mejl.
 */
export function resolvePartnerRouting(
  product: string,
  selection?: string,
): string | null {
  if (product === "oldtajmeri") {
    const choice = (selection || "").trim();
    const vehicle = choice
      ? oldtimerFleet.find((v) => vehicleOptionLabel(v) === choice)
      : undefined;

    if (vehicle) {
      const partner = partnersFor("oldtajmeri").find((p) =>
        p.itemIds?.includes(vehicle.id),
      );
      if (partner) {
        return `${formatPartner(partner)} — vozilo: ${vehicle.name} (${vehicle.basedIn})`;
      }
    }
    return allPartnersFallback(
      "oldtajmeri",
      "Nije određeno jedno vozilo — proveriti kod svih partnera",
    );
  }

  if (product === "lazni-maticar") {
    return allPartnersFallback(
      "lazni-maticar",
      "Saradnici za lažnog matičara — prvo probati onog sa telefonom",
    );
  }


  return null;
}
