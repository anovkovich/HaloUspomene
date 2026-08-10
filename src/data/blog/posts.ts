import fs from "fs";
import path from "path";
import { BlogPost } from "./types";

function loadContent(slug: string): string {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "blog",
    "content",
    `${slug}.mdx`,
  );
  return fs.readFileSync(filePath, "utf-8");
}

// All posts including scheduled/unpublished ones
const allBlogPosts: BlogPost[] = [
  // ── Klaster za autoritet domena, objavljen 2026-08-04 ──────────────────────
  // Sedam tekstova iz plana u `docs/vodici/pozivnice-i-pr-vodic.pdf`: tri vezana
  // za naše proizvode (spisak gostiju, satnica, save the date) i četiri široke
  // svadbene teme koje grade autoritet domena — obrazac po kome konkurencija
  // pobeđuje. Datumi su namerno raspoređeni unazad kroz praznine u kalendaru
  // objava; v. „O datumima objave" u
  // `docs/dev-log/2026-08-04-pocetna-raskrsnica-primitivi/faza-5-plan.md`.
  {
    // GLAVNI STUB klastera o pozivnicama. Za upit „digitalne pozivnice za
    // venčanje" nijedan konkurent ne rangira blog tekstom — svi rangiraju
    // sopstvenom početnom, jer je njihova početna stranica O POZIVNICAMA.
    // Naša početna je multi-proizvodni brend, pa `/pozivnice` autoritet dobija
    // iznutra: ovaj tekst linkuje na nju tri puta plus CTA, a ostali tekstovi
    // klastera linkuju na njega. Ne brisati te linkove pri uređivanju.
    slug: "digitalne-pozivnice-za-vencanje",
    title: "Digitalne Pozivnice za Venčanje: Sve Što Treba da Znate",
    description:
      "Šta su digitalne pozivnice za venčanje, kako rade, šta sadrže i koliko koštaju. Potvrde dolaska, slanje preko Vibera, PDF za štampu i saveti za starije goste.",
    category: "Vodič",
    tags: [
      "digitalne pozivnice za venčanje",
      "digitalna pozivnica",
      "website pozivnica za venčanje",
      "online pozivnice za svadbu",
      "elektronska pozivnica",
      "pozivnice za venčanje",
      "potvrde dolaska",
      "cena digitalne pozivnice",
      "HALO Uspomene",
    ],
    publishDate: "2026-03-08",
    readTime: 13,
    featured: true,
    content: loadContent("digitalne-pozivnice-za-vencanje"),
  },
  {
    slug: "spisak-gostiju-za-svadbu",
    title:
      "Spisak Gostiju za Svadbu: Kako Ga Sastaviti Bez Drame i Prepisivanja",
    description:
      "Kako napraviti spisak gostiju za svadbu: tri liste umesto jedne, koga zvati a koga ne, rokovi, koliko ljudi otkaže i kako se spisak pretvara u raspored sedenja.",
    category: "Vodič",
    tags: [
      "spisak gostiju za svadbu",
      "lista gostiju za svadbu",
      "spisak zvanica",
      "koliko gostiju pozvati na svadbu",
      "potvrde dolaska",
      "raspored sedenja",
      "organizacija venčanja",
      "HALO Uspomene",
    ],
    publishDate: "2026-04-14",
    readTime: 10,
    content: loadContent("spisak-gostiju-za-svadbu"),
  },
  {
    slug: "satnica-vencanja-redosled-dana",
    title: "Satnica Venčanja: Redosled Dana od Jutra do Večere",
    description:
      "Realna satnica venčanja sat po sat: spremanje mlade, kupovina, ceremonija, fotografisanje, doček i večera. Šta se najčešće kasni i kako se to nadoknađuje.",
    category: "Vodič",
    tags: [
      "satnica venčanja",
      "redosled venčanja",
      "kako izgleda dan svadbe",
      "program dana venčanja",
      "satnica svadbe",
      "organizacija venčanja",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-17",
    readTime: 11,
    content: loadContent("satnica-vencanja-redosled-dana"),
  },
  {
    slug: "save-the-date-vencanje",
    title: "Save the Date: Šta Je, Kada se Šalje i Kada Vam Zaista Treba",
    description:
      "Save the date za venčanje: šta jeste a šta nije, rokovi slanja, šta mora da sadrži, kome se šalje i iskren odgovor na pitanje da li vam uopšte treba.",
    category: "Vodič",
    tags: [
      "save the date",
      "save the date venčanje",
      "save the date kada se šalje",
      "najava venčanja",
      "pozivnice za venčanje",
      "HALO Uspomene",
    ],
    publishDate: "2026-06-07",
    readTime: 11,
    content: loadContent("save-the-date-vencanje"),
  },
  {
    slug: "koliko-se-daje-na-svadbi",
    title: "Koliko se Daje na Svadbi 2026: Koverat, Kum i Ostali Gosti",
    description:
      "Koliko se daje na svadbi 2026 u dinarima: po ulozi gosta, razlike Beograd i manja mesta, po osobi ili po paru, šta sa decom i kako se koverat predaje.",
    category: "Saveti",
    tags: [
      "koliko se daje na svadbi",
      "koliko se daje u koverti",
      "koverat za svadbu",
      "koliko daje kum na svadbi",
      "svadbeni običaji",
      "HALO Uspomene",
    ],
    publishDate: "2026-06-18",
    readTime: 11,
    content: loadContent("koliko-se-daje-na-svadbi"),
  },
  {
    slug: "koliko-kosta-svadba-u-srbiji",
    title: "Koliko Košta Svadba u Srbiji 2026: Realan Budžet po Broju Gostiju",
    description:
      "Koliko košta svadba u Srbiji 2026: rasponi po kategorijama, tri scenarija za 50, 120 i 250 gostiju, šta najviše diže cenu i koliko se realno vrati kroz koverte.",
    category: "Vodič",
    tags: [
      "koliko košta svadba u srbiji",
      "budžet za venčanje",
      "cena svadbe",
      "troškovi venčanja",
      "kalkulator budžeta za venčanje",
      "planiranje venčanja",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-02",
    readTime: 12,
    content: loadContent("koliko-kosta-svadba-u-srbiji"),
  },
  {
    slug: "obaveze-kuma-na-svadbi",
    title: "Obaveze Kuma na Svadbi: Šta Kupuje, Šta Plaća i Šta Radi",
    description:
      "Obaveze kuma na svadbi: šta tradicionalno kupuje i plaća, koliko daje u koverti, uloga kume, zadaci po satnici dana i šta kum ne mora da radi.",
    category: "Saveti",
    tags: [
      "obaveze kuma na svadbi",
      "šta kum kupuje",
      "koliko kum daje",
      "uloga kume",
      "zdravica kuma",
      "svadbeni običaji u srbiji",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-13",
    readTime: 12,
    content: loadContent("obaveze-kuma-na-svadbi"),
  },
  {
    slug: "cestitke-za-vencanje",
    title: "Čestitke za Venčanje: 45 Gotovih Poruka za Mladence",
    description:
      "45 gotovih čestitki za venčanje: kratke za koverat, klasične, emotivne, duhovite, od kuma i roditelja, na ćirilici i engleskom. Kopirajte i pošaljite.",
    category: "Vodič",
    tags: [
      "čestitke za venčanje",
      "čestitka za svadbu",
      "šta napisati mladencima",
      "poruke za mladence",
      "čestitke za venčanje kratke",
      "čestitka na koverti",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-23",
    readTime: 13,
    content: loadContent("cestitke-za-vencanje"),
  },
  {
    slug: "tekst-za-pozivnicu-za-vencanje",
    title:
      "Tekst za Pozivnicu za Venčanje: 25 Gotovih Primera Koje Možete Odmah Iskoristiti",
    description:
      "25 gotovih tekstova za pozivnice za venčanje: klasični, moderni, duhoviti i kratki primeri, poziv za kuma, ćirilica i saveti kako napisati pozivnicu.",
    category: "Vodič",
    tags: [
      "tekst za pozivnicu za venčanje",
      "tekstovi za pozivnice",
      "kako napisati pozivnicu za venčanje",
      "šta napisati u pozivnici za venčanje",
      "tekst pozivnice za svadbu",
      "pozivnica za venčanje tekst primeri",
      "poziv za venčanje tekst",
      "tekst za pozivnicu kum",
      "kratak tekst za pozivnicu",
      "duhovit tekst za pozivnicu",
      "tekst za pozivnicu na ćirilici",
      "HALO Uspomene",
    ],
    publishDate: "2026-08-03",
    readTime: 13,
    featured: true,
    content: loadContent("tekst-za-pozivnicu-za-vencanje"),
  },
  {
    slug: "lazni-maticar-kako-izgleda",
    title: "Kobajagi Matičar, Prave Suze: Kako Izgleda Simbolična Ceremonija",
    description:
      "Šta je lažni matičar i kako izgleda simbolična ceremonija venčanja: zašto se angažuje, kako teče, koliko košta i zašto papiri idu u opštinu.",
    category: "Saveti",
    tags: [
      "lažni matičar",
      "lazni maticar",
      "šaljivi matičar",
      "simbolična ceremonija venčanja",
      "lažni matičar cena",
      "lažni matičar iskustva",
      "iznenađenje za mladence",
      "obnova zaveta",
      "venčanje u prirodi",
      "matičar izlazak na teren",
      "kobajagi matičar",
      "HALO Uspomene",
    ],
    publishDate: "2026-08-02",
    readTime: 11,
    featured: true,
    content: loadContent("lazni-maticar-kako-izgleda"),
  },
  {
    slug: "oldtajmer-za-vencanje-zasto-retro",
    title:
      "Oldtajmer za Venčanje: Zašto Mladenci Sve Češće Biraju Retro Umesto Modernih Limuzina",
    description:
      "Zašto parovi sve češće biraju oldtajmer za venčanje umesto moderne limuzine: trend u brojkama, poređenje, najtraženiji retro modeli, cene i saveti.",
    category: "Trendovi",
    tags: [
      "oldtajmer za venčanje",
      "oldtajmer za svadbu",
      "oldtimer za venčanje",
      "retro auto za svadbu",
      "vintage venčanje",
      "oldtajmer ili limuzina za svadbu",
      "stari automobili za venčanje",
      "fića na svadbi",
      "buba za venčanje",
      "oldtajmer cena",
      "svadbena kolona",
      "HALO Uspomene",
    ],
    publishDate: "2026-08-01",
    readTime: 13,
    featured: true,
    content: loadContent("oldtajmer-za-vencanje-zasto-retro"),
  },
  {
    slug: "kada-slati-pozivnice-za-vencanje",
    title: "Kada Slati Pozivnice za Venčanje: Kompletan Vremenski Vodič",
    description:
      "Kada se šalju pozivnice za venčanje? Save the date 6-12 meseci, glavne pozivnice 6-8 nedelja ranije, rok za potvrde dolaska — kompletan vremenski vodič za Srbiju.",
    category: "Vodič",
    tags: [
      "kada slati pozivnice za venčanje",
      "koliko ranije se šalju pozivnice za venčanje",
      "kada se šalju pozivnice za venčanje",
      "save the date venčanje",
      "rok za potvrdu dolaska",
      "kada naručiti pozivnice za venčanje",
      "pozivnice za venčanje u inostranstvo",
      "potvrda dolaska",
      "website pozivnica",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-21",
    readTime: 10,
    featured: true,
    content: loadContent("kada-slati-pozivnice-za-vencanje"),
  },
  {
    slug: "stampane-pozivnice-sa-qr-kodom-za-potvrdu",
    title: "Štampane pozivnice sa QR kodom za potvrdu dolaska — vodič",
    description:
      "Kako štampane pozivnice sa QR kodom omogućavaju online potvrdu dolaska: gost skenira kod, vi pratite goste uživo. Uz website pozivnicu — gratis PDF za štampu.",
    category: "Vodič",
    tags: [
      "štampane pozivnice sa QR kodom",
      "pozivnice za venčanje sa QR kodom",
      "papirna pozivnica QR kod",
      "pozivnica QR kod za potvrdu dolaska",
      "PDF pozivnica za štampu",
      "potvrda dolaska",
      "digitalne pozivnice",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-17",
    readTime: 9,
    featured: true,
    content: loadContent("stampane-pozivnice-sa-qr-kodom-za-potvrdu"),
  },
  {
    slug: "pozivnice-za-deciji-rodjendan-online",
    title: "Pozivnice za Dečji Rođendan Online: Vodič za Roditelje",
    description:
      "Kako napraviti online pozivnicu za dečji rođendan: teme za dečake i devojčice, potvrda dolaska jednim klikom i deljenje linkom — vodič za roditelje.",
    category: "Vodič",
    tags: [
      "pozivnice za dečji rođendan",
      "dečja rođendanska pozivnica",
      "online pozivnica za rođendan",
      "pozivnica za rođendan online",
      "digitalna pozivnica rođendan",
      "potvrda dolaska",
      "teme za rođendan",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-25",
    readTime: 9,
    featured: true,
    content: loadContent("pozivnice-za-deciji-rodjendan-online"),
  },
  {
    slug: "pozivnica-za-prvi-rodjendan-ideje",
    title: "Pozivnica za prvi rođendan: ideje, teme i online izrada",
    description:
      "Ideje i teme za prvi rođendan deteta, gotovi tekstovi pozivnica i vodič kako da napravite online pozivnicu za 1. rođendan — sa potvrdama dolaska, od 4.500 din.",
    category: "Saveti",
    tags: [
      "pozivnica za prvi rođendan",
      "prvi rođendan pozivnica",
      "ideje za prvi rođendan",
      "online pozivnica prvi rođendan",
      "pozivnica 1 rođendan",
      "dečji rođendan",
      "prvi rođendan",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-29",
    readTime: 9,
    featured: true,
    content: loadContent("pozivnica-za-prvi-rodjendan-ideje"),
  },
  {
    slug: "pozivnica-za-punoletstvo-18-rodjendan",
    title: "Pozivnica za punoletstvo — moderna pozivnica za 18. rođendan",
    description:
      "Kako izgleda moderna digitalna pozivnica za punoletstvo: bordo i zlatna ili teget i zlatna tema, potvrda dolaska, odbrojavanje i cena od 4.500 dinara.",
    category: "Vodič",
    tags: [
      "pozivnica za punoletstvo",
      "pozivnica za 18 rođendan",
      "punoletstvo pozivnica",
      "online pozivnica punoletstvo",
      "digitalna pozivnica 18 rođendan",
      "18. rođendan",
      "potvrda dolaska",
      "HALO Uspomene",
    ],
    publishDate: "2026-06-12",
    readTime: 9,
    featured: true,
    content: loadContent("pozivnica-za-punoletstvo-18-rodjendan"),
  },
  {
    slug: "digitalna-vs-papirna-pozivnica",
    title: "Digitalna vs papirna pozivnica za venčanje: veliko poređenje",
    description:
      "Digitalna ili papirna pozivnica za venčanje? Poredimo cenu, brzinu, potvrde dolaska, ekologiju i doživljaj — i zašto je kombinacija najbolji izbor.",
    category: "Poređenje",
    tags: [
      "digitalna vs papirna pozivnica",
      "digitalna pozivnica",
      "papirna pozivnica venčanje",
      "online vs štampana pozivnica",
      "koje pozivnice izabrati",
      "website pozivnica",
      "potvrda dolaska",
      "HALO Uspomene",
    ],
    publishDate: "2026-03-22",
    readTime: 9,
    featured: true,
    content: loadContent("digitalna-vs-papirna-pozivnica"),
  },
  {
    slug: "kako-napraviti-pozivnicu-za-vencanje-online",
    title:
      "Kako Napraviti Pozivnicu za Venčanje Online: Vodič Korak po Korak",
    description:
      "Izrada pozivnica online u 4 koraka: popunite upitnik, izaberite temu i font, pozivnica je gotova odmah, a otključavate je nakon plaćanja. Od 5.000 din.",
    category: "Vodič",
    tags: [
      "izrada pozivnica online",
      "kako napraviti pozivnicu za venčanje",
      "online pozivnica za venčanje",
      "napraviti pozivnicu online",
      "pozivnica za venčanje sami napraviti",
      "website pozivnica",
      "digitalne pozivnice",
      "HALO Uspomene",
    ],
    publishDate: "2026-04-06",
    readTime: 9,
    featured: true,
    content: loadContent("kako-napraviti-pozivnicu-za-vencanje-online"),
  },
  {
    slug: "potvrda-dolaska-rsvp-na-vencanju",
    title: "Potvrda Dolaska na Venčanju (RSVP): Vodič za Online Praćenje",
    description:
      "Kako digitalna potvrda dolaska na venčanju štedi vreme: gosti potvrđuju online, vi pratite sve u realnom vremenu i lako slažete raspored sedenja.",
    category: "Vodič",
    tags: [
      "potvrda dolaska venčanje",
      "RSVP venčanje",
      "potvrda dolaska online",
      "praćenje potvrda dolaska",
      "forma za potvrdu dolaska",
      "website pozivnica",
      "raspored sedenja",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-03",
    readTime: 8,
    featured: true,
    content: loadContent("potvrda-dolaska-rsvp-na-vencanju"),
  },
  {
    slug: "cena-pozivnica-za-vencanje-srbija",
    title: "Cena pozivnica za venčanje u Srbiji 2026: kompletan vodič",
    description:
      "Koliko koštaju pozivnice za venčanje u Srbiji 2026? Realne cene papirnih i digitalnih pozivnica, HALO Uspomene paketi od 5.000 din i gratis PDF za štampu.",
    category: "Vodič",
    tags: [
      "cena pozivnica za venčanje",
      "koliko koštaju pozivnice za venčanje",
      "cena pozivnica Srbija",
      "pozivnice za venčanje cena",
      "jeftine pozivnice za venčanje",
      "website pozivnica",
      "digitalne pozivnice",
      "HALO Uspomene",
    ],
    publishDate: "2026-04-19",
    readTime: 9,
    featured: true,
    content: loadContent("cena-pozivnica-za-vencanje-srbija"),
  },
  {
    slug: "trendovi-pozivnica-za-vencanje-2027",
    title: "Trendovi Pozivnica za Venčanje 2027 — Digitalne i Premium",
    description:
      "Trendovi pozivnica za venčanje 2027: premium AI pozivnice, parallax animacije, QR kod za potvrdu dolaska, video pozivnice i minimalizam — uz realne cene.",
    category: "Trendovi",
    tags: [
      "pozivnice za venčanje 2027",
      "trendovi pozivnica 2027",
      "moderne pozivnice za venčanje",
      "premium pozivnice",
      "digitalne pozivnice trend",
      "website pozivnica",
      "QR kod venčanje",
      "HALO Uspomene",
    ],
    publishDate: "2026-06-24",
    readTime: 9,
    featured: true,
    content: loadContent("trendovi-pozivnica-za-vencanje-2027"),
  },
  {
    slug: "kako-poslati-pozivnicu-whatsapp-viber",
    title: "Kako poslati pozivnicu preko WhatsApp-a, Vibera i e-maila",
    description:
      "Vodič kako poslati pozivnicu gostima preko WhatsApp-a, Vibera i e-maila: deljenje pozivnice linkom, gotove poruke i praćenje potvrda dolaska u realnom vremenu.",
    category: "Saveti",
    tags: [
      "kako poslati pozivnicu",
      "slanje pozivnica online",
      "pozivnica preko WhatsApp",
      "poslati pozivnicu Viber",
      "deljenje pozivnice link",
      "website pozivnica",
      "potvrda dolaska",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-24",
    readTime: 8,
    featured: true,
    content: loadContent("kako-poslati-pozivnicu-whatsapp-viber"),
  },
  {
    slug: "audio-knjiga-utisaka-cena-kako-funkcionise",
    title: "Audio Knjiga Utisaka — Cena i Kako Funkcioniše 2026",
    description:
      "Šta je audio knjiga utisaka, kako funkcioniše i koliko košta u Srbiji 2026. Digitalna QR audio knjiga uz pozivnicu ili retro telefon uspomena — cene, koraci i saveti.",
    category: "Vodič",
    tags: [
      "audio knjiga utisaka",
      "audio knjiga utisaka cena",
      "digitalna audio knjiga",
      "knjiga utisaka venčanje",
      "audio guest book",
      "retro telefon uspomena",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-08",
    readTime: 8,
    featured: true,
    content: loadContent("audio-knjiga-utisaka-cena-kako-funkcionise"),
  },
  {
    slug: "qr-galerija-slika-sa-vencanja-kako-gosti-dele",
    title: "QR Galerija Slika sa Venčanja — Kako Gosti Dele Slike",
    description:
      "Kako gosti dele fotografije sa venčanja skeniranjem QR koda. Šta je QR galerija slika sa venčanja, kako funkcioniše, privatnost, životni ciklus i cena u Srbiji 2026.",
    category: "Vodič",
    tags: [
      "qr galerija slika sa venčanja",
      "galerija slika sa venčanja",
      "kako gosti dele slike sa venčanja",
      "zajednička galerija venčanje",
      "qr kod za slike venčanje",
      "foto galerija venčanje",
      "HALO Uspomene",
    ],
    publishDate: "2026-07-08",
    readTime: 9,
    featured: true,
    content: loadContent("qr-galerija-slika-sa-vencanja-kako-gosti-dele"),
  },
  {
    slug: "sta-je-audio-guest-book",
    title: "Šta je Audio Guest Book i Zašto je Hit na Venčanjima u Srbiji?",
    description:
      "Saznajte šta je audio guest book, kako funkcioniše na venčanjima u Srbiji, i zašto sve više parova bira ovu uslugu umesto klasične knjige utisaka. HALO Uspomene objašnjava sve.",
    category: "Vodič",
    tags: [
      "audio guest book",
      "venčanje",
      "Srbija",
      "knjiga utisaka",
      "HALO Uspomene",
    ],
    publishDate: "2025-09-27",
    readTime: 8,
    featured: true,
    content: loadContent("sta-je-audio-guest-book"),
  },
  {
    slug: "audio-guest-book-vs-knjiga-utisaka",
    title: "Audio Guest Book vs Klasična Knjiga Utisaka: Kompletno Poređenje",
    description:
      "Detaljno poređenje audio guest book-a i klasične knjige utisaka za venčanja. Prednosti, mane, cene i iskustva parova u Srbiji. Saznajte koja opcija je bolja za vaše venčanje.",
    category: "Poređenje",
    tags: [
      "audio guest book",
      "knjiga utisaka",
      "poređenje",
      "venčanje Srbija",
      "HALO Uspomene",
    ],
    publishDate: "2025-10-25",
    readTime: 10,
    featured: true,
    content: loadContent("audio-guest-book-vs-knjiga-utisaka"),
  },
  {
    slug: "kako-funkcionise-audio-guest-book",
    title: "Kako Funkcioniše Audio Guest Book: Kompletan vodič",
    description:
      "Kompletni vodič o tome kako funkcioniše audio guest book na venčanjima. Od rezervacije do preuzimanja snimaka — korak po korak objašnjenje HALO Uspomene usluge u Srbiji.",
    category: "Vodič",
    tags: [
      "kako funkcioniše",
      "audio guest book",
      "vodič",
      "venčanje",
      "HALO Uspomene",
      "Srbija",
    ],
    publishDate: "2025-11-29",
    readTime: 9,
    featured: true,
    content: loadContent("kako-funkcionise-audio-guest-book"),
  },
  {
    slug: "audio-guest-book-cena",
    title: "Audio Guest Book Cena u Srbiji 2026: Koliko Košta?",
    description:
      "Transparentan pregled cena audio guest book usluge u Srbiji 2026. HALO Uspomene paketi, dodatne opcije, poređenja na tržištu i bundle popusti za website pozivnicu.",
    category: "Vodič",
    tags: [
      "audio guest book cena",
      "cena iznajmljivanja",
      "koliko košta audio guest book",
      "HALO Uspomene cene",
      "venčanje budžet",
    ],
    publishDate: "2026-02-28",
    readTime: 8,
    featured: true,
    content: loadContent("audio-guest-book-cena"),
  },
  {
    slug: "originalne-ideje-za-vencanja",
    title:
      "Originalne Ideje za Venčanja 2026/2027 — Trendovi koji Oduševljavaju",
    description:
      "Moderne i originalne ideje za venčanja 2026 i 2027. Od audio guest book-a do interaktivnih iskustava — saznajte koji su najnoviji trendovi za nezaboravnu svadbu u Srbiji.",
    category: "Trendovi",
    tags: [
      "originalne ideje za venčanja",
      "moderne ideje za venčanja 2026",
      "trendovi venčanja",
      "venčanje Srbija",
      "audio guest book",
      "HALO Uspomene",
    ],
    publishDate: "2026-03-01",
    readTime: 10,
    featured: true,
    content: loadContent("originalne-ideje-za-vencanja"),
  },
  {
    slug: "planiranje-vencanja-checklista",
    title: "Planiranje Venčanja 2026: Kompletna Checklista",
    description:
      "Kompletna checklista za planiranje venčanja u Srbiji 2026 — korak po korak od 12 meseci pre do dana venčanja. Budžet, lokacija, vendor-i, dekoracija i svi detalji na jednom mestu.",
    category: "Checklista",
    tags: [
      "planiranje venčanja",
      "checklista venčanje",
      "organizacija svadbe",
      "venčanje Srbija",
      "audio guest book",
    ],
    publishDate: "2026-03-28",
    readTime: 12,
    featured: true,
    content: loadContent("planiranje-vencanja-checklista"),
  },
  {
    slug: "ideje-za-vencanje-srbija",
    title: "10 Originalnih Ideja za Venčanje u Srbiji 2026",
    description:
      "Originalne ideje za venčanje u Srbiji 2026 — od vojvođanskih salaša i Fruške Gore do beogradskih rooftop-ova i Zlatibora. Lokacije, food stanice, rakija bar i audio guest book.",
    category: "Trendovi",
    tags: [
      "ideje za venčanje Srbija",
      "srpska venčanja",
      "originalna svadba",
      "Vojvodina salaš",
      "Fruška Gora",
      "Zlatibor",
    ],
    publishDate: "2026-03-29",
    readTime: 10,
    featured: true,
    content: loadContent("ideje-za-vencanje-srbija"),
  },
  {
    slug: "najbolji-gadgeti-za-proslave",
    title: "Najbolji Gadgeti za Proslave i Venčanja u 2026 — Vodič za Parove",
    description:
      "Pregled najboljih gadgeta za proslave i venčanja u 2026. Audio guest book, foto kabina, neon znaci i još mnogo toga — kompletni vodič za nezaboravan dan.",
    category: "Saveti",
    tags: [
      "najbolji gadgeti za proslave i venčanja",
      "gadgeti za venčanje",
      "audio guest book",
      "proslave",
      "HALO Uspomene",
      "Srbija",
    ],
    publishDate: "2026-04-25",
    readTime: 9,
    featured: true,
    content: loadContent("najbolji-gadgeti-za-proslave"),
  },
  {
    slug: "audio-guest-book-iskustva",
    title: "Audio Guest Book Iskustva: Šta Kažu Parovi",
    description:
      "Stvarna iskustva parova koji su koristili HALO Uspomene audio guest book na venčanjima u Srbiji. Recenzije, utisci i saveti od Jelene & Marka, Sare & Nikole i Marine & Aleksandra.",
    category: "Saveti",
    tags: [
      "audio guest book iskustva",
      "recenzije",
      "utisci parova",
      "HALO Uspomene utisci",
      "venčanje Srbija",
    ],
    publishDate: "2026-04-26",
    readTime: 9,
    featured: true,
    content: loadContent("audio-guest-book-iskustva"),
  },
  {
    slug: "website-pozivnica-audio-guest-book",
    title: "Website Pozivnica + Audio Guest Book: Savršena Kombinacija",
    description:
      "Kako website pozivnica i audio guest book zajedno čine savršen digitalni paket za venčanje. Prednosti, bundle popust od 30% i primeri iz prakse — HALO Uspomene vodič.",
    category: "Saveti",
    tags: [
      "website pozivnica venčanje",
      "online pozivnica",
      "audio guest book",
      "HALO Uspomene",
      "pozivnica i audio guest book",
    ],
    publishDate: "2026-05-30",
    readTime: 8,
    featured: true,
    content: loadContent("website-pozivnica-audio-guest-book"),
  },
  {
    slug: "website-pozivnica-kompletan-vodic",
    title:
      "Od Pozivnice do Rasporeda Sedenja: Kako smo rešili celu organizaciju venčanja",
    description:
      "Kompletan vodič kroz HALO Uspomene — od slanja linka gostima, potvrda dolaska, rasporeda sedenja, PDF pozivnice za štampu, do Audio Knjige Utisaka i Retro Telefona Uspomena.",
    category: "Vodič",
    tags: [
      "website pozivnica venčanje",
      "online pozivnica",
      "RSVP forma venčanje",
      "raspored sedenja venčanje",
      "audio guest book venčanje",
      "retro telefon uspomena",
      "PDF pozivnica",
      "organizacija venčanja",
      "HALO Uspomene",
    ],
    publishDate: "2026-03-15",
    readTime: 14,
    featured: true,
    content: loadContent("website-pozivnica-kompletan-vodic"),
  },
  {
    slug: "srpske-svadbene-tradicije-moderni-trendovi",
    title: "Srpske Svadbene Tradicije i Moderni Trendovi",
    description:
      "Kako moderni parovi u Srbiji čuvaju svadbene tradicije uz moderne trendove. Kupovina mlade, lomljenje čaše, kum, audio guest book i evolucija srpske svadbe.",
    category: "Trendovi",
    tags: [
      "srpske svadbene tradicije",
      "moderni trendovi venčanja",
      "srpska svadba",
      "tradicionalno venčanje Srbija",
    ],
    publishDate: "2026-05-31",
    readTime: 10,
    featured: true,
    content: loadContent("srpske-svadbene-tradicije-moderni-trendovi"),
  },
  {
    slug: "raspored-sedenja-za-svadbu-vodic",
    title: "Raspored Sedenja za Svadbu — Kompletan Vodič 2026",
    description:
      "Kako napraviti raspored sedenja za svadbu — od konačne liste gostiju i šeme sale do QR Panoa dobrodošlice za ulaz. Korak po korak vodič, česte greške, cene i saveti iz prakse u Srbiji 2026.",
    category: "Vodič",
    tags: [
      "raspored sedenja",
      "raspored sedenja za svadbu",
      "raspored sedenja online",
      "raspored sedenja za venčanje",
      "QR pano dobrodošlice",
      "kako napraviti raspored sedenja",
      "alat za raspored sedenja",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-08",
    readTime: 12,
    featured: true,
    content: loadContent("raspored-sedenja-za-svadbu-vodic"),
  },
  {
    slug: "qr-pano-dobrodoslice-trend",
    title:
      "QR Pano Dobrodošlice — Najbrže Rastući Svadbeni Trend u Srbiji 2026",
    description:
      "Šta je QR Pano dobrodošlice, kako funkcioniše, zašto je najbrže rastući svadbeni trend u Srbiji 2026 i koliko košta. Estetika, štampa, stilski saveti i pravila postavljanja u sali.",
    category: "Trendovi",
    tags: [
      "QR pano dobrodošlice",
      "qr pano za venčanje",
      "qr pano za svadbu",
      "pano za salu",
      "raspored sedenja online",
      "moderna svadba",
      "trendovi venčanja 2026",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-09",
    readTime: 10,
    featured: true,
    content: loadContent("qr-pano-dobrodoslice-trend"),
  },
  {
    slug: "moje-vencanje-planer",
    title:
      "Moje Venčanje — Besplatan Online Planer Venčanja sa Checklistom, Budžetom i Vendorima",
    description:
      "Online planer venčanja koji objedinjuje checklistu, budžet, listu gostiju, vendor direktorijum i audio guest book na jednom mestu. Besplatno uz HALO Uspomene pozivnicu, lokalizovano za Srbiju.",
    category: "Vodič",
    tags: [
      "planer venčanja",
      "online planer venčanja",
      "moje venčanje",
      "planiranje venčanja Srbija",
      "checklista venčanje",
      "budžet venčanje",
      "vendor direktorijum",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-10",
    readTime: 11,
    featured: true,
    content: loadContent("moje-vencanje-planer"),
  },
  {
    slug: "auto-za-vencanje-vodic",
    title:
      "Auto za Venčanje — Kako Izabrati Luksuzan Automobil za Mladence, Kuma i Barjaktara",
    description:
      "Kako izabrati auto za venčanje u Srbiji 2026 — luksuzni Mercedes E, S, GLE i G klasa sa vozačem za mladence, kuma i barjaktara. Cene po satu i za ceo dan, svadbena kolona i saveti kada rezervisati.",
    category: "Vodič",
    tags: [
      "auto za venčanje",
      "iznajmljivanje automobila za venčanje",
      "mercedes za venčanje",
      "auto za mladence",
      "auto za kuma",
      "auto za barjaktara",
      "svadbena kolona",
      "luksuzni automobil za svadbu",
      "rent a car za venčanje",
      "HALO Uspomene",
    ],
    publishDate: "2026-06-29",
    readTime: 10,
    featured: true,
    content: loadContent("auto-za-vencanje-vodic"),
  },
  {
    slug: "premium-ai-pozivnice",
    title:
      "Premium Pozivnice za Venčanje 2026/2027 — Luksuzne Digitalne Pozivnice",
    description:
      "Premium digitalne pozivnice za venčanje sa parallax hero animacijama, animiranim kovertom i tri tematska doživljaja: akvarelna pozadina vašeg venčanog mesta, papirni svet sa AI ilustracijom para, ili scena sa animiranim parom belih golubova. Lokalizovano za Srbiju.",
    category: "Trendovi",
    tags: [
      "premium pozivnica",
      "luksuzne pozivnice",
      "premium pozivnice za venčanje",
      "moderne pozivnice 2026",
      "parallax pozivnica",
      "akvarel pozivnica",
      "watercolor pozivnica",
      "fountain pozivnica",
      "burgundy pozivnica",
      "pozivnica sa golubovima",
      "animirana pozivnica",
      "AI ilustracija para",
      "HALO Uspomene",
    ],
    publishDate: "2026-05-11",
    readTime: 12,
    featured: true,
    content: loadContent("premium-ai-pozivnice"),
  },
];

// Published posts, newest first. Dev shows everything; production hides
// posts whose publishDate is still in the future.
//
// Computed PER-CALL (not a build-time constant) so that with ISR revalidation
// on the blog pages, a scheduled post surfaces automatically once its
// publishDate arrives — no rebuild/redeploy needed.
export function getPublishedPosts(): BlogPost[] {
  const now = new Date();
  const visible =
    process.env.NODE_ENV === "development"
      ? allBlogPosts
      : allBlogPosts.filter((post) => new Date(post.publishDate) <= now);
  return [...visible].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return getPublishedPosts().map((post) => post.slug);
}

export function getPostsByCategory(category: BlogPost["category"]): BlogPost[] {
  return getPublishedPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const current = getBlogPost(currentSlug);
  if (!current) return [];

  return getPublishedPosts()
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const aSharedTags = a.tags.filter((t) => current.tags.includes(t)).length;
      const bSharedTags = b.tags.filter((t) => current.tags.includes(t)).length;
      return bSharedTags - aSharedTags;
    })
    .slice(0, limit);
}
