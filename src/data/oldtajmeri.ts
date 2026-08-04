/**
 * Flota oldtajmera (retro automobila) za venčanja.
 *
 * Koristi je landing stranica /iznajmljivanje-oldtajmera-za-vencanje.
 *
 * ─── KAKO DODATI NOVO VOZILO ────────────────────────────────────────────────
 * 1. Dodaj novi objekat u niz `oldtimerFleet` (redosled u nizu = redosled na
 *    stranici). Obavezna su samo polja `id`, `name`, `blurb`, `price`.
 * 2. Fotografiju stavi u `public/images/oldtajmeri/` i upiši putanju u `image`.
 *    Bez `image` kartica prikazuje elegantan placeholder ("Fotografija uskoro"),
 *    pa vozilo može da ide live i pre nego što slike stignu.
 * 3. Ako vozilo ima cenu iz novog grada, dodaj i taj grad u `fleetCities` ispod.
 * 4. Ako se doda vozilo van postojećih cenovnih raspona, proveri
 *    `getFleetPriceRange()` — schema.org AggregateOffer se računa iz njega.
 *
 * NAPOMENA: partneri se nikada ne imenuju na stranici (white-label ponuda pod
 * brendom HALO Uspomene) — zato `basedIn` nosi samo grad, ne i ime partnera.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface OldtimerVehicle {
  /** Stabilan id — koristi se za React key, ankere i data-track atribute. */
  id: string;
  /** Puno ime modela onako kako se traži u pretrazi. */
  name: string;
  /** Godina ili period proizvodnje. Izostavi ako nije pouzdano poznata. */
  year?: string;
  /** Kratka oznaka stila, ide ispod naziva. */
  tagline: string;
  /** Badge u gornjem levom uglu kartice. */
  badge: string;
  /** Boja vozila (bitna mladencima zbog usklađivanja sa dekoracijom). */
  color: string;
  /** Tip karoserije — izostavi ako nije potvrđen. */
  bodyType?: string;
  /** Koliko putnika realno staje (opisno, ne broj — venčanica zauzima mesto). */
  seats?: string;
  /** Grad iz kojeg vozilo polazi. */
  basedIn: string;
  /** Putanja do fotografije u /public. Bez nje se prikazuje placeholder. */
  image?: string;
  /** 1–2 rečenice prodajnog opisa. */
  blurb: string;
  /** Cena najma za venčanje. */
  price: {
    /** Donja granica u EUR — koristi se i za AggregateOffer. */
    from: number;
    /** Gornja granica u EUR, ako je cena raspon. */
    to?: number;
    /** Šta cena pokriva i kada se doplaćuje transport. */
    note: string;
  };
}

export const oldtimerFleet: OldtimerVehicle[] = [
  {
    id: "fiat-1300-crveni",
    name: "Fiat 1300",
    year: "Šezdesete",
    tagline: "Crveni klasik",
    badge: "Domaći miljenik",
    color: "Crvena",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Beograd",
    image: "/images/oldtajmeri/fiat-1300-crveni.webp",
    blurb:
      "Automobil koji su naši roditelji i bake vozili — kod nas poznatiji kao tristać. Topla crvena boja odlično se slaže sa belom venčanicom i buketom, pa je jedan od najzahvalnijih retro automobila za fotografisanje.",
    price: {
      from: 250,
      note: "Cena za venčanje u Beogradu. Izlazak van Beograda uz doplatu za transport.",
    },
  },
  {
    id: "fiat-1300-beli",
    name: "Fiat 1300",
    year: "Šezdesete",
    tagline: "Beli klasik",
    badge: "Klasika u belom",
    color: "Bela",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Beograd",
    image: "/images/oldtajmeri/fiat-1300-beli.webp",
    blurb:
      "Ista legenda u belom izdanju — najtradicionalniji izbor za mladence. Ako želite dva usklađena retro automobila u koloni, beli i crveni tristać zajedno izgledaju kao kadar iz starog filma.",
    price: {
      from: 250,
      note: "Cena za venčanje u Beogradu. Izlazak van Beograda uz doplatu za transport.",
    },
  },
  {
    id: "pontiac-6-28-phaeton",
    name: "Pontiac Series 6-28 Phaeton",
    year: "1928",
    tagline: "Predratni kabriolet",
    badge: "Kabriolet",
    color: "Crvena",
    bodyType: "Phaeton — otvoreni kabriolet",
    seats: "Do 4 putnika",
    basedIn: "Pančevo",
    image: "/images/oldtajmeri/pontiac-phaeton-1928.webp",
    blurb:
      "Otvoreni američki kabriolet star skoro sto godina — najefektnije vozilo u floti. Bez krova nema prepreke između mladenaca i gostiju, pa dolazak ispred sale izgleda kao scena iz dvadesetih.",
    price: {
      from: 350,
      to: 400,
      note: "Cena za venčanje u Pančevu. Za ostale gradove transport po dogovoru.",
    },
  },
  {
    id: "chevrolet-international-1929",
    name: "Chevrolet International",
    year: "1929",
    tagline: "Američki predratni klasik",
    badge: "Retkost",
    color: "Crna",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Pančevo",
    image: "/images/oldtajmeri/chevrolet-international-1929.webp",
    blurb:
      "Crni američki klasik s kraja dvadesetih, sa hromiranim detaljima i visokom, upečatljivom linijom. Vozilo koje se na srpskim svadbama praktično ne viđa — a upravo zato ostaje upamćeno.",
    price: {
      from: 350,
      to: 400,
      note: "Cena za venčanje u Pančevu. Za ostale gradove transport po dogovoru.",
    },
  },
  {
    id: "citroen-traction-avant-11b",
    name: "Citroën Traction Avant 11B",
    tagline: "Francuska legenda",
    badge: "Filmski klasik",
    color: "Crna",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Pančevo",
    image: "/images/oldtajmeri/citroen-traction-avant-11b.webp",
    blurb:
      "Jedan od najprepoznatljivijih automobila evropske filmske klasike — niska silueta, duge stepenice i elegantna crna boja. Savršen izbor za mladence koji žele diskretan, otmeni retro stil bez preterivanja.",
    price: {
      from: 350,
      to: 400,
      note: "Cena za venčanje u Pančevu. Za ostale gradove transport po dogovoru.",
    },
  },
];

/** Gradovi iz kojih flota polazi — koristi se u schema.org areaServed i u copy-ju. */
export const fleetCities = ["Beograd", "Pančevo"];

/** Najniža i najviša cena u floti — za AggregateOffer i za "od X €" u hero sekciji. */
export function getFleetPriceRange(): { low: number; high: number } {
  const lows = oldtimerFleet.map((v) => v.price.from);
  const highs = oldtimerFleet.map((v) => v.price.to ?? v.price.from);
  return { low: Math.min(...lows), high: Math.max(...highs) };
}

/**
 * Flota grupisana po gradu polaska, redosledom kojim se gradovi pojavljuju u
 * nizu. Stranica prikazuje ponudu po gradovima jer je to za mladence korisna
 * logistička informacija (transport se doplaćuje van matičnog grada).
 *
 * `priceNote` se popunjava samo ako je napomena identična za sva vozila u
 * gradu — tada se ispisuje jednom iznad grupe umesto na svakoj kartici.
 */
/**
 * Genitiv naziva grada, za naslove oblika „Oldtajmeri za venčanje iz Beograda".
 *
 * Ne postoji pouzdan način da se srpski genitiv izvede pravilom (Beograd →
 * Beograda, ali Novi Sad → Novog Sada, a Jagodina → Jagodine), pa se gradovi
 * upisuju ručno. Nepoznat grad se vraća u nominativu — naslov tada glasi
 * „…iz Kikinda" umesto „…iz Kikinde", što je ružno ali ne lomi stranicu.
 * **Kada dodaješ vozilo iz novog grada, dopiši grad i ovde.**
 */
const CITY_GENITIVE: Record<string, string> = {
  Beograd: "Beograda",
  Pančevo: "Pančeva",
  "Novi Sad": "Novog Sada",
  Niš: "Niša",
  Kragujevac: "Kragujevca",
  Subotica: "Subotice",
  Čačak: "Čačka",
  Paraćin: "Paraćina",
  Jagodina: "Jagodine",
  Ćuprija: "Ćuprije",
  Zrenjanin: "Zrenjanina",
  Kraljevo: "Kraljeva",
};

export function cityGenitive(city: string): string {
  return CITY_GENITIVE[city] ?? city;
}

export function getFleetByCity(): {
  city: string;
  vehicles: OldtimerVehicle[];
  priceNote?: string;
}[] {
  const cities = Array.from(new Set(oldtimerFleet.map((v) => v.basedIn)));
  return cities.map((city) => {
    const vehicles = oldtimerFleet.filter((v) => v.basedIn === city);
    const notes = new Set(vehicles.map((v) => v.price.note));
    return {
      city,
      vehicles,
      priceNote: notes.size === 1 ? vehicles[0].price.note : undefined,
    };
  });
}

/** "1 vozilo" / "2 vozila" — srpska množina za brojanje vozila. */
export function vehicleCountLabel(n: number): string {
  return `${n} ${n === 1 ? "vozilo" : "vozila"}`;
}

/**
 * Labela vozila u padajućoj listi forme.
 *
 * Po ovoj labeli server naknadno mapira izbor nazad na vozilo (v.
 * `src/lib/partneri.ts`), zato je izvor jedan — da se izmena
 * formata ne odrazi samo na jednoj strani i tiho pokvari rutiranje upita.
 */
export function vehicleOptionLabel(v: OldtimerVehicle): string {
  return v.year
    ? `${v.name} (${v.year}, ${v.color.toLowerCase()})`
    : `${v.name} (${v.color.toLowerCase()})`;
}

/** Opcije za padajuću listu u formi za upit — izvedene iz flote, plus opšte stavke. */
export function getVehicleOptions(): string[] {
  return [
    ...oldtimerFleet.map(vehicleOptionLabel),
    "Više vozila / svadbena kolona",
    "Nisam siguran — treba mi savet",
  ];
}
