/**
 * INTERNI registar partnera za oldtajmer flotu.
 *
 * ⚠️ SERVER-ONLY. Ovaj modul se sme uvoziti SAMO iz server koda
 * (`/api/contact/route.ts`). NIKADA ga ne uvoziti u komponentu sa "use client"
 * — Next bi ga tada spakovao u klijentski bundle i imena i telefoni partnera
 * bi bili vidljivi svakome ko otvori izvorni kod stranice.
 *
 * Cela oldtajmer ponuda je white-label: mladenci vide samo HALO Uspomene i grad
 * iz kojeg vozilo polazi. Ako bi znali od koga je vozilo, otišli bi direktno.
 *
 * Zašto ovde a ne u `src/data/oldtajmeri.ts`: taj fajl uvozi landing stranica,
 * pa iako je server komponenta, držanje kontakata odvojeno znači da slučajno
 * renderovanje ne može da procuri podatke.
 *
 * Podaci putuju do nas ovako: klijent posle uspešne verifikacije telefona pita
 * `/api/contact` kome pripada izabrano vozilo, server vrati `routing` string,
 * a klijent ga ubaci u mejl (polje "interno_prosledi_partneru"). Da bi neko
 * izvukao ove kontakte, morao bi da prođe reCAPTCHA i SMS verifikaciju broja.
 *
 * ─── KAKO DODATI PARTNERA ───────────────────────────────────────────────────
 * Dodaj objekat u `partners` i nabroji `vehicleIds` (id-jevi iz
 * `src/data/oldtajmeri.ts`). Vozila bez partnera padaju na fallback koji u mejl
 * upisuje sve partnere, pa upit nikad ne ostane bez rute.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { oldtimerFleet, vehicleOptionLabel } from "@/data/oldtajmeri";

export interface OldtimerPartner {
  id: string;
  /** Naziv pod kojim ih vodimo interno. */
  name: string;
  /** Ime osobe za kontakt, ako je poznato. */
  contactPerson?: string;
  phone: string;
  /** Kojim kanalima je dostupan taj broj. */
  channels: string;
  instagram: string;
  /** Id-jevi vozila iz `oldtimerFleet` koja pripadaju ovom partneru. */
  vehicleIds: string[];
}

export const partners: OldtimerPartner[] = [
  {
    id: "oldtimer-beograd",
    name: "Oldtimer Beograd",
    phone: "062 445 277",
    channels: "Viber / WhatsApp",
    instagram: "@oldtimer011",
    vehicleIds: ["fiat-1300-crveni", "fiat-1300-beli"],
  },
  {
    id: "markusev-pancevo",
    name: "Oldtimer iznajmljivanje Markušev",
    contactPerson: "Markušev",
    phone: "063 240-817",
    channels: "Viber",
    instagram: "@iznajmljivanje.oldtajmera.pa",
    vehicleIds: [
      "pontiac-6-28-phaeton",
      "chevrolet-international-1929",
      "citroen-traction-avant-11b",
    ],
  },
];

/** Jedan red za mejl: "Oldtimer Beograd — 062 445 277 (Viber / WhatsApp) — @oldtimer011". */
function formatPartner(p: OldtimerPartner): string {
  const who = p.contactPerson ? `${p.name} (${p.contactPerson})` : p.name;
  return `${who} — ${p.phone} (${p.channels}) — ${p.instagram}`;
}

/**
 * Kome proslediti upit, na osnovu izabrane stavke iz padajuće liste "Vozilo".
 *
 * Za konkretno vozilo vraća njegovog partnera; za "više vozila / svadbena
 * kolona", "nisam siguran" ili nepoznatu vrednost vraća sve partnere, jer tada
 * i ne znamo kome tačno ide upit.
 */
export function resolvePartnerRouting(selectedVehicle?: string): string {
  const selection = (selectedVehicle || "").trim();

  const vehicle = selection
    ? oldtimerFleet.find((v) => vehicleOptionLabel(v) === selection)
    : undefined;

  if (vehicle) {
    const partner = partners.find((p) => p.vehicleIds.includes(vehicle.id));
    if (partner) {
      return `${formatPartner(partner)} — vozilo: ${vehicle.name} (${vehicle.basedIn})`;
    }
  }

  return `Nije određeno jedno vozilo — proveriti kod oba partnera: ${partners
    .map(formatPartner)
    .join(" | ")}`;
}
