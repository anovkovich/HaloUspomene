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
 *    Ako želiš da vozilo bude prvo u hero karuselu, stavi `featured: true`.
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
  /**
   * Izdvojeno vozilo — ulazi u hero karusel. Ako je bar jedno vozilo izdvojeno,
   * karusel vrti SAMO izdvojena; ako nijedno nije, vrti celu flotu. Tako se
   * hero menja jednom zastavicom, bez diranja stranice. Ne utiče na redosled
   * u floti ispod.
   */
  featured?: boolean;
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

/**
 * Napomena o cenama za Pomoravlje: ista je za sva četiri vozila, pa se na
 * stranici ispisuje jednom iznad grupe umesto na svakoj kartici
 * (v. `getFleetByCity`). Ako se za jedno vozilo promeni, napomena se
 * automatski vraća na kartice — zato je držati identičnom dok god važi.
 */
const POMORAVLJE_NOTE =
  "Cena važi za venčanja u Paraćinu, Ćupriji i Jagodini, kao i u krugu od oko 50 km. Dalje od toga doplaćuje se prevoz auto-transporterom, po ceni osetno povoljnijoj od uobičajenog evra po kilometru. Za Beograd se cena dogovara posebno.";

export const oldtimerFleet: OldtimerVehicle[] = [
  {
    id: "mercedes-170v-1940",
    name: "Mercedes-Benz 170 V",
    year: "1940",
    tagline: "Predratna nemačka klasa",
    badge: "Predratna limuzina",
    color: "Crna",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Paraćin",
    image: "/images/oldtajmeri/mercedes-benz-170v-1940.webp",
    featured: true,
    blurb:
      "Crna predratna limuzina sa hromiranom maskom i prostranom zadnjom klupom — od svih naših vozila najkomotnija za venčanicu sa punom suknjom. Model kojim je Mercedes posle rata ponovo pokrenuo proizvodnju, a ratna godišta se danas retko viđaju na našim putevima.",
    price: { from: 300, note: POMORAVLJE_NOTE },
  },
  {
    id: "pontiac-six-1931",
    name: "Pontiac serija 6 - 401",
    year: "1931",
    tagline: "Predratna limuzina",
    badge: "Američka legenda",
    color: "Bordo i crna",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Paraćin",
    image: "/images/oldtajmeri/pontiac-six-401-1931.webp",
    featured: true,
    blurb:
      "Američka predratna limuzina sa V-maskom, žičanim točkovima i belim zidovima na gumama. Visoka, uspravna karoserija znači i da se u nju ulazi lakše nego u niska moderna vozila — a ovakav automobil se na svadbama kod nas praktično ne viđa.",
    price: { from: 300, note: POMORAVLJE_NOTE },
  },
  {
    id: "triumph-herald-1200-1964",
    name: "Triumph Herald 1200",
    year: "1964",
    tagline: "Engleski kabriolet",
    badge: "Otvoreni krov",
    color: "Tamnozelena",
    bodyType: "Kabriolet, 2 vrata",
    seats: "Mladenci napred, do 4 ukupno",
    basedIn: "Paraćin",
    image: "/images/oldtajmeri/triumph-herald-1200-kabriolet-1964.webp",
    featured: true,
    blurb:
      "Tamnozeleni engleski kabriolet iz šezdesetih, rad italijanskog dizajnera Đovanija Mikelotija — redak slučaj otvorenog automobila sa četiri prava sedišta. Spušten krov znači da veo i frizura nemaju o šta da se zakače, a fotograf dobija kadar bez ijedne prepreke.",
    price: { from: 300, note: POMORAVLJE_NOTE },
  },
  {
    id: "moskvic-407-1962",
    name: "Moskvič 407",
    year: "1962",
    tagline: "Crveno-beli klasik",
    badge: "Retro reli",
    color: "Crveno-bela",
    bodyType: "Limuzina, 4 vrata",
    seats: "Do 4 putnika",
    basedIn: "Paraćin",
    image: "/images/oldtajmeri/moskvic-407-1962-crveno-beli.webp",
    blurb:
      "Vedar crveno-beli klasik iz šezdesetih, sa relijskim pedigreom s kraja pedesetih — otuda nalepnice i beli zidovi na gumama. Izbor za mladence koji ne žele ni crnu limuzinu ni predratnu ozbiljnost, nego auto koji se na fotografijama smeje.",
    price: { from: 300, note: POMORAVLJE_NOTE },
  },
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
    name: "Pontiac serija 6 - Phaeton",
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
      note: "Cena za venčanje u Pančevu. Za ostale gradove transport po dogovoru.",
    },
  },
];

/** Vozilo koje sigurno ima fotografiju — za mesta gde placeholder nema smisla. */
export type OldtimerWithImage = OldtimerVehicle & { image: string };

/**
 * Vozila za hero karusel, redosledom iz `oldtimerFleet`.
 *
 * Ako je bar jedno vozilo označeno sa `featured`, karusel vrti samo njih —
 * tako se u hero stavlja izdvojena ponuda (npr. vozila partnera kome dajemo
 * prioritet). Ako nijedno nije izdvojeno, vrti se cela flota, pa hero nikad
 * ne ostane prazan.
 */
export function getHeroFleet(): OldtimerWithImage[] {
  const withImage = oldtimerFleet.filter((v): v is OldtimerWithImage =>
    Boolean(v.image),
  );
  const featured = withImage.filter((v) => v.featured);
  return featured.length ? featured : withImage;
}

/**
 * Redosled gradova na stranici — i u rečenicama i u grupisanju flote.
 *
 * Namerno se NE izvodi iz flote, jer je stvar isticanja a ne podatak: prvo idu
 * gradovi kojima dajemo prioritet, Beograd poslednji. Grad koji ovde nije
 * naveden ide na kraj, redosledom pojavljivanja u floti — tako novo vozilo iz
 * novog grada radi i pre nego što se ovaj spisak dopuni.
 */
const CITY_ORDER = ["Paraćin", "Pančevo", "Beograd"];

function byCityOrder(a: string, b: string): number {
  const rank = (c: string) => {
    const i = CITY_ORDER.indexOf(c);
    return i === -1 ? CITY_ORDER.length : i;
  };
  return rank(a) - rank(b);
}

/**
 * Gradovi iz kojih flota polazi — koristi se u schema.org areaServed, u tekstu
 * stranice i za grupisanje flote. Sadržaj se izvodi iz `oldtimerFleet`, a
 * redosled iz `CITY_ORDER`.
 */
export const fleetCities = Array.from(
  new Set(oldtimerFleet.map((v) => v.basedIn)),
).sort(byCityOrder);

/** Najniža i najviša cena u floti — za AggregateOffer i za "od X €" u hero sekciji. */
export function getFleetPriceRange(): { low: number; high: number } {
  const lows = oldtimerFleet.map((v) => v.price.from);
  const highs = oldtimerFleet.map((v) => v.price.to ?? v.price.from);
  return { low: Math.min(...lows), high: Math.max(...highs) };
}

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

/**
 * „Paraćina, Beograda i Pančeva" — za rečenice o tome odakle flota polazi.
 * Postoji da se spisak gradova ne bi prepisivao rukom po tekstu stranice:
 * novo vozilo iz novog grada tako sam menja svaku takvu rečenicu.
 */
export function fleetCitiesGenitive(): string {
  const list = fleetCities.map(cityGenitive);
  if (list.length < 2) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} i ${list[list.length - 1]}`;
}

/**
 * Flota grupisana po gradu polaska, redosledom iz `CITY_ORDER`. Stranica
 * prikazuje ponudu po gradovima jer je to za mladence korisna logistička
 * informacija (transport se doplaćuje van matičnog grada).
 *
 * `priceNote` se popunjava samo ako je napomena identična za sva vozila u
 * gradu — tada se ispisuje jednom iznad grupe umesto na svakoj kartici.
 */
export function getFleetByCity(): {
  city: string;
  vehicles: OldtimerVehicle[];
  priceNote?: string;
}[] {
  return fleetCities.map((city) => {
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
