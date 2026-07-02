import type { VendorCategory } from "@/app/moje-vencanje/types";
import { CITIES } from "@/app/moje-vencanje/vendor-constants";

type CityName = (typeof CITIES)[number];

export const CATEGORY_SLUGS: Record<VendorCategory, string> = {
  venue: "sale",
  music: "muzika",
  "photo-video": "foto-video",
  cake: "torte",
  decoration: "dekoracija",
  flowers: "cvece",
  fireworks: "vatromet",
  dress: "vencanice",
  makeup: "sminka",
  rings: "burme",
  gifts: "pokloni",
};

export const SLUG_TO_CATEGORY: Record<string, VendorCategory> =
  Object.fromEntries(
    Object.entries(CATEGORY_SLUGS).map(([k, v]) => [v, k as VendorCategory]),
  );

export const CITY_SLUGS: Record<CityName, string> = {
  Beograd: "beograd",
  "Novi Sad": "novi-sad",
  Subotica: "subotica",
  Čačak: "cacak",
  Kragujevac: "kragujevac",
  Niš: "nis",
};

export interface CategoryContent {
  category: VendorCategory;
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  faq: { q: string; a: string }[];
  cityIntros: Partial<Record<CityName, string>>;
  keywords: string[];
}

const COMMON_CITY_INTRO_FALLBACK = (what: string, city: string): string =>
  `Pregled ${what} koje saradjujemo sa parovima u gradu ${city}. Sve više detalja, kontakte i preporuke parova videćete u Moje Venčanje planeru posle besplatne registracije.`;

export const CATEGORY_CONTENT: CategoryContent[] = [
  // ── 1. VENUE / SALE ──────────────────────────────────────────────────
  {
    category: "venue",
    slug: "sale",
    h1: "Sale za venčanje u Srbiji",
    metaTitle: "Sale za venčanje u Srbiji | HALO Uspomene",
    metaDescription:
      "Svadbene sale u Srbiji — Beograd, Novi Sad, Subotica, Čačak, Kragujevac, Niš. Kapacitet i kontakt u besplatnom Moje Venčanje planeru.",
    intro:
      "Sala je najveća pojedinačna stavka u budžetu venčanja i najčešći prvi korak u organizaciji. Od izbora sale zavisi datum, broj zvanica i ton cele svadbe — pa zato nije čudno što se rezerviše šest do dvanaest meseci unapred. Mi smo na jednom mestu okupili sale širom Srbije sa kojima su parovi koji koriste HALO Uspomene saradjivali ili koje smo preporučili. Pregled je sortiran po gradu! Detaljnije informacije o kapacitetu, kontakt podacima i recenzijama parova nalaze se u Moje Venčanje planeru posle besplatne registracije.",
    faq: [
      {
        q: "Kada da rezervišem salu za venčanje?",
        a: "Najbolje 9-12 meseci pre datuma, posebno za maj, jun i septembar. Popularne beogradske sale se često bukiraju i godinu i po unapred za vrhunac sezone.",
      },
      {
        q: "Koliko košta zakup sale za venčanje u Srbiji?",
        a: "Cenovni raspon je širok — od 50€ po osobi u manjim mestima do 150€+ po osobi u Beogradu, sa hranom i pićem uključenim. Sam zakup prostora je obično deo paketa, ne posebna stavka.",
      },
      {
        q: "Kako da znam koji kapacitet sale mi treba?",
        a: "Pravilo je: kapacitet sale = broj potvrđenih zvanica + 10-15% rezerve. Ako planirate 150 ljudi, gledajte sale za 170-180. U Moje Venčanje planeru imate RSVP sistem koji vam pokazuje tačan broj.",
      },
      {
        q: "Da li sale uključuju i meni i piće?",
        a: "Većina sala u Srbiji nudi all-inclusive paket: meni + piće + dekoracija stolova. Otvoreni bar, kafa nakon ponoći i specijalna pića se obično doplaćuju.",
      },
      {
        q: "Šta ako gosti ne mogu da dođu na zadati datum?",
        a: "Zato je ključno koristiti RSVP sistem što ranije. HALO Uspomene digitalna pozivnica šalje gostima link za potvrdu i automatski računa attendance — pa znate stvarnu cifru pre nego što potvrdite meni.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći izbor sala u Srbiji — od luksuznih hotelskih sala u centru do velikih svadbenih kompleksa na obodima grada. Cene i kapacitet variraju jako, a popularne lokacije se bukiraju i preko godinu dana unapred.",
      "Novi Sad":
        "Novi Sad nudi mešavinu sala u centru grada i restoranskih kompleksa duž Dunava. Sale obično primaju 100-300 gostiju i većina ima paket aranžmane sa lokalnim caterring-om.",
      Subotica:
        "Subotičke sale često imaju jaku tradiciju i odličan odnos kvaliteta i cene. Mađarska kulinarska tradicija u meniju je prepoznatljiva odlika venčanja u ovom gradu.",
      Čačak:
        "U Čačku ćete naći pristupačnije sale sa porodičnom atmosferom — idealno za venčanja od 80 do 200 zvanica. Cene su značajno niže nego u Beogradu uz isti kvalitet.",
      Kragujevac:
        "Kragujevac ima paletu sala različitog kapaciteta, od urbanih restorana do većih banketnih prostora. Centralna pozicija u Srbiji čini ga praktičnim za parove koji okupljaju goste iz cele zemlje.",
      Niš: "Niš ima rastuću scenu svadbenih lokacija — kombinacija tradicionalnih restorana i modernijih event sala. Pejzaž oko grada se često koristi i za destination venčanja iz drugih delova Srbije.",
    },
    keywords: [
      "sale za venčanje",
      "sale za svadbu",
      "svadbene sale srbija",
      "sale za venčanje beograd",
      "sale za venčanje novi sad",
      "rezervacija sale za venčanje",
      "kapacitet sale za venčanje",
      "izbor sale za svadbu",
    ],
  },

  // ── 2. MUSIC / MUZIKA ────────────────────────────────────────────────
  {
    category: "music",
    slug: "muzika",
    h1: "Bendovi i DJ-evi za venčanje u Srbiji",
    metaTitle: "Bendovi i DJ za venčanje — muzika za svadbu | HALO Uspomene",
    metaDescription:
      "Svadbeni bendovi i DJ-evi širom Srbije. Live muzika, DJ setovi i kombinacije za venčanja u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Muzika je razlika između venčanja koje se pamti i venčanja na kome se gosti dosađuju. U Srbiji postoji bogata scena svadbenih bendova — od narodnjačkih sastava sa harmonikom i klarinetom, preko kombinacija pop-rok-narodno repertoara, do modernih DJ-eva sa profesionalnim svetlima i zvukom. Ovde smo okupili izvođače koji aktivno sviraju na venčanjima i koje su naši parovi preporučili. Filtriramo po gradu jer iako mnogi bendovi putuju, lokalni izvođači obično imaju bolju cenu i poznaju repertoar koji će proći kod publike iz tog kraja. ",
    faq: [
      {
        q: "Kada da bukira bend ili DJ-a za venčanje?",
        a: "Bend — 6 do 9 meseci unapred, popularni izvođači i godinu dana. DJ — 3 do 6 meseci. Popularne datume (subote u maju, junu, septembru) bukirajte ranije.",
      },
      {
        q: "Koliko košta bend ili DJ za venčanje u Srbiji?",
        a: "Bend (4-6 članova) — od 800€ do 2500€ za celo veče. DJ — od 300€ do 800€. Cena varira po dužini sviranja, opremi (svetla, dim, LED) i potrebi za putovanjem.",
      },
      {
        q: "Bend ili DJ — šta je bolje za venčanje?",
        a: "Bend daje atmosferu i emociju, ali ima pauze i ograničen repertoar. DJ pokriva sve žanrove bez pauze i može da ide do jutra. Sve više parova bira kombinaciju: bend za prva 3-4 sata, pa DJ do kraja.",
      },
      {
        q: "Da li bend uključuje ozvučenje za salu?",
        a: "Većina bendova ima sopstveno ozvučenje i mikseta, ali za sale preko 200 gostiju se obično doplaćuje pojačano ozvučenje. Pitajte sale i bend pre potpisa.",
      },
      {
        q: "Kako da budem siguran kakav je bend uživo?",
        a: "Tražite demo snimak sa stvarnog venčanja, ne studio snimak. U Moje Venčanje planeru možete da vidite preporuke parova koji su već imali to bend na svom venčanju.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beogradska scena ima najveći broj profesionalnih bendova i DJ-eva, sa cenama u višem rasponu. Konkurencija znači i kvalitet — ovde su mnogi izvođači koji putuju po celoj Srbiji.",
      "Novi Sad":
        "Novosadski bendovi često kombinuju vojvođansku tradiciju sa modernim aranžmanima. DJ scena je u rastu i mnogi sviraju i u Beogradu vikendom.",
      Subotica:
        "Subotica ima karakterističnu mađarsko-srpsku muzičku scenu — često ćete naći bendove koji sviraju i čardaš i kolo u istom setu, što odlično prolazi na mešanim svadbama.",
      Čačak:
        "U Čačku i okolini je živa narodnjačka scena sa odličnim harmonikašima i klarinetistima. Cene su povoljnije od Beograda, a kvalitet izvođača na vrhunskom nivou.",
      Kragujevac:
        "Kragujevac i Šumadija imaju jaku trubačku tradiciju ali i moderne bendove. Centralna pozicija znači da mnogi izvođači pokrivaju i okolne gradove.",
      Niš: "Niška muzička scena se odlikuje južnjačkim repertoarom i temperament svadbe. Mnogi bendovi iz Niša često putuju i u Makedoniju i Bugarsku.",
    },
    keywords: [
      "bend za venčanje",
      "bend za svadbu",
      "dj za venčanje",
      "muzika za svadbu",
      "bendovi za venčanje srbija",
      "dj za svadbu beograd",
      "muzika za venčanje novi sad",
      "svadbeni bend cena",
    ],
  },

  // ── 3. PHOTO-VIDEO / FOTO-VIDEO ──────────────────────────────────────
  {
    category: "photo-video",
    slug: "foto-video",
    h1: "Fotografi i video produkcija za venčanje u Srbiji",
    metaTitle: "Fotografi i snimatelji za venčanje | HALO Uspomene",
    metaDescription:
      "Fotografi i video produkcija za venčanja u Srbiji. Foto, video i kombinovane usluge za svadbe u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Izbor fotografa i snimatelja je jedna od najvažnijih odluka — sa ovim ljudima ćete provesti više sati nego sa bilo kim drugim na dan venčanja, i njihov stil će definisati kako ćete se sećati cele priče. Ovde su okupljeni profesionalci koje smo prepoznali u radu sa našim parovima — od klasičnih fotografa do video timova sa drone snimcima. Stilovi se značajno razlikuju (klasični, dokumentarni, fine art, cinematic), pa preporučujemo da uvek pogledate primerke radova pre angažovanja. Kontakt informacije, linkove do njihovih portfolia i utiske mladenaca možete pogledati u našem Moje Venčanje planeru.",
    faq: [
      {
        q: "Kada da bukira fotografa za venčanje?",
        a: "Najbolje 6-9 meseci unapred. Top fotografi se bukiraju i godinu dana ranije za vrhunac sezone (maj-septembar). Za zimska venčanja možete dostati više vremena.",
      },
      {
        q: "Koliko košta fotograf za venčanje u Srbiji?",
        a: "Osnovni paket (8h, 200-400 obrađenih fotografija) — od 400€ do 800€. Premium paketi sa albumom, drugim fotografom i pre-wedding sesijom — do 2000€+.",
      },
      {
        q: "Foto, video, ili oba?",
        a: "Foto je standard. Video je sve češći zbog social medija i mogućnosti da se događaj 'vrati' kasnije. Mnogi parovi biraju kombinaciju — paketi za oboje su povoljniji nego dva odvojena izvođača.",
      },
      {
        q: "Kada dobijam fotografije nakon venčanja?",
        a: "Standard je 3-6 nedelja za obrađene fotografije, 2-3 meseca za video montažu. Pitajte unapred i traži pisani rok u ugovoru.",
      },
      {
        q: "Šta da gledam u portfoliju fotografa?",
        a: "Konzistentan stil kroz različita venčanja, kvalitet kompozicije u zatvorenom (sala uveče), prirodni momenti pored postavljenih kadrova, i detalji (prsten, dekoracija) — to pokazuje pažnju.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveću koncentraciju fotografa svih stilova — od klasičnog do modernog dokumentarnog. Cene su u višem rasponu ali izbor je nenadmašen.",
      "Novi Sad":
        "Novosadska foto/video scena je jaka i raznovrsna, sa puno mladih timova koji rade u modernom dokumentarnom stilu. Mnogi pokrivaju i Beograd.",
      Subotica:
        "Subotički fotografi često rade na venčanjima u severnoj Bačkoj i u Mađarskoj. Vrlo dobar odnos cene i kvaliteta.",
      Čačak:
        "U Čačku i okolini ima sjajnih fotografa po pristupačnijim cenama nego u Beogradu. Mnogi pokrivaju ceo Zlatiborski region i venčanja na planinama.",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju. Mnogi fotografi i video timovi putuju za venčanja po celoj zemlji.",
      Niš: "Niški foto/video timovi pokrivaju jug Srbije, često i Makedoniju i Bugarsku. Više dokumentarnog stila i pristupačnije cene od Beograda.",
    },
    keywords: [
      "fotograf za venčanje",
      "fotograf za svadbu",
      "snimatelj za venčanje",
      "video za venčanje",
      "fotograf za venčanje beograd",
      "fotograf za venčanje novi sad",
      "wedding fotograf srbija",
      "svadbena fotografija cena",
    ],
  },

  // ── 4. CAKE / TORTE ──────────────────────────────────────────────────
  {
    category: "cake",
    slug: "torte",
    h1: "Svadbene torte u Srbiji",
    metaTitle: "Svadbene torte — poslastičari za venčanje | HALO Uspomene",
    metaDescription:
      "Svadbene torte i poslastičari u Srbiji. Mladenačke torte, candy bar i deserti za venčanja u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Svadbena torta je centralni momenat slavlja — i fotografski, i kao desert. U Srbiji je tradicija višespratnih torti i dalje jaka, ali sve češće se vidja i naked cake stil, drip torte sa cvećem, pa i veliki dessert table. Mi okupljamo poslastičare koji rade specifično za venčanja — sa iskustvom u dostavi, podizanju višespratnih konstrukcija i dekoraciji koja prati temu. U pregledu su poslastičari iz svih krajeva Srbije, organizovani po gradu jer torte se obično prave lokalno (transport višespratne torte na duga rastojanja je rizičan). Više o svakom ponaosob pogledajte u Moje Venčanje planeru.",
    faq: [
      {
        q: "Kada da bukira torta za venčanje?",
        a: "Standard je 2-3 meseca unapred. Popularni poslastičari (i specifični datumi) se bukiraju i 6 meseci ranije.",
      },
      {
        q: "Koliko košta svadbena torta u Srbiji?",
        a: "Cena je obično po kilogramu — od 18€/kg do 35€/kg za standardne torte, do 50€+/kg za fondan torte sa složenom dekoracijom. Za 100 zvanica računajte 6-8 kg torte.",
      },
      {
        q: "Koliko kilograma torte za koliko zvanica?",
        a: "Pravilo: 80-100g torte po osobi. Za 150 zvanica — 12-15 kg torte. Ako imate i druge slatkiše (candy bar), idite na 60-70g po osobi.",
      },
      {
        q: "Fondan ili krem torta — šta da biram?",
        a: "Fondan: bolji izgled (glatka površina, kompleksne dekoracije), manje ukusa. Krem: bolji ukus, manje impresivan izgled. Mnogi parovi rade kombinaciju — fondan spoljni sloj sa krem filom.",
      },
      {
        q: "Da li poslastičar dolazi i postavlja tortu u sali?",
        a: "Većina višespratnih torti zahteva postavljanje na licu mesta jer ne može da se transportuje sastavljena. Dostava i podizanje su obično uračunati u cenu, proverite uvek pre potpisivanja.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći izbor poslastičara — od tradicionalnih do modernih kafea-poslastičara koji rade u savremenom stilu. Cene više nego u manjim gradovima.",
      "Novi Sad":
        "Novosadski poslastičari prepoznatljivi su po kombinaciji vojvođanske tradicije i modernih trendova. Često rade i candy bar koncepte.",
      Subotica:
        "Subotički poslastičari često uključuju mađarsku poslastičarsku tradiciju u svoj rad — torte sa tradicionalnim filovima koje su prepoznatljive.",
      Čačak:
        "U Čačku ima odličnih poslastičara po nižim cenama. Mnogi pokrivaju i venčanja u okolnim mestima i planinskim hotelima.",
      Kragujevac:
        "Kragujevačka poslastičarska scena pokriva centralnu Srbiju. Tradicionalan pristup sa sve više inovacija u dekoraciji.",
      Niš: "Niški poslastičari rade torte u tradicionalnom i modernom stilu, sa cenama prijatnijim od beogradskih.",
    },
    keywords: [
      "svadbena torta",
      "torta za venčanje",
      "mladenačka torta",
      "torta za svadbu beograd",
      "svadbena torta cena",
      "poslastičar za venčanje",
      "candy bar venčanje",
      "torta za venčanje novi sad",
    ],
  },

  // ── 5. DECORATION / DEKORACIJA ───────────────────────────────────────
  {
    category: "decoration",
    slug: "dekoracija",
    h1: "Dekoracija za venčanje u Srbiji",
    metaTitle: "Dekoracija sale i venčanja — dekorateri | HALO Uspomene",
    metaDescription:
      "Dekorateri venčanja i sala u Srbiji. Stoni aranžmani, lukovi, dekoracija za svadbu u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Dekoracija definiše ton venčanja — da li će biti rustično, klasično, romantično, glamurozno ili minimalistički. Sve više parova traži profesionalne dekoratere koji rade kompletan koncept (od prijemne stranice do stonih aranžmana) umesto da kombinuju nekoliko različitih izvođača. Ovde okupljamo dekoratere sa iskustvom u svadbenoj postavi — od velikih lukova i pozadina za fotografisanje, do detaljne stone dekoracije i osvetljenja. Stilovi se vrlo razlikuju, pa preporučujemo da uvek pogledate primerke pre angažovanja. Više o svakom ponaosob pogledajte u Moje Venčanje planeru.",
    faq: [
      {
        q: "Kada da bukira dekoratera za venčanje?",
        a: "4-6 meseci unapred za standardna venčanja. Veliki konceptualni projekti — 6-9 meseci. Hitno (2 meseca pre datuma) je moguće ali sa ograničenim izborom.",
      },
      {
        q: "Koliko košta dekoracija za venčanje u Srbiji?",
        a: "Osnovna stona dekoracija (cveće + sveće) — od 15€ po stolu. Kompletna sala dekoracija (luk, prijemna, stoni aranžmani, osvetljenje) — od 1000€ do 5000€+ za 150 zvanica.",
      },
      {
        q: "Da li sala već ima neku dekoraciju u ceni?",
        a: "Većina sala uključuje stolnjake, salvete, čaše i osnovne svećnjake. Cveće, lukovi, posebno osvetljenje, naslovni stolovi i tematska dekoracija su skoro uvek extra.",
      },
      {
        q: "Šta je tipično u dekoraciji venčanja u Srbiji?",
        a: "Stoni aranžmani sa cvećem i svećama, prijemna stranica sa welcome znakom, mladenački sto sa pozadinom, ulazni luk ili kapija, decorativno osvetljenje (string lights, candle path).",
      },
      {
        q: "Mogu li sam da uradim deo dekoracije?",
        a: "Sitnice — da (welcome znak, place cards, sitne detalje). Cveće, lukovi i osvetljenje — bolje profesionalca jer postavka traje sate i kvari ostalu spremnost na dan venčanja.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveću scenu dekoratera sa profesionalnim timovima koji rade u svim stilovima — od klasičnih do najmodernijih trendova. Cene više nego u manjim mestima.",
      "Novi Sad":
        "Novosadski dekorateri prepoznatljivi su po elegantnim, vojvođanski-inspirisanim postavama uz savremen pristup.",
      Subotica:
        "Subotička dekoraterska scena meša srpsku i mađarsku estetiku — često specifične postavke koje se ne vidjaju drugde.",
      Čačak:
        "U Čačku i okolini ima jakih dekoratera po pristupačnijim cenama. Mnogi rade i za venčanja na planinskim lokacijama (Zlatibor, Kopaonik).",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju, sa naglaskom na klasičnoj eleganciji i prirodnim materijalima.",
      Niš: "Niški dekorateri rade u rasponu od tradicionalnog do modernog stila, sa cenama prilagodjenim lokalnoj sceni.",
    },
    keywords: [
      "dekoracija za venčanje",
      "dekoracija sale za venčanje",
      "dekoracija svadbe",
      "stoni aranžman venčanje",
      "dekorater za venčanje srbija",
      "dekoracija za venčanje beograd",
      "luk za venčanje",
      "rustična dekoracija venčanje",
    ],
  },

  // ── 6. FLOWERS / CVECE ──────────────────────────────────────────────
  {
    category: "flowers",
    slug: "cvece",
    h1: "Cveće za venčanje u Srbiji",
    metaTitle: "Cveće za venčanje — buketi i aranžmani | HALO Uspomene",
    metaDescription:
      "Cvećare i floristi za venčanja u Srbiji. Mladenački buket, butonijere, stoni aranžmani u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Cveće na venčanju ide od malog (buket mlade i butonijere) do ogromnih scena (cvetni lukovi, viseći aranžmani, cvetni zidovi). Cvet biranje povezano je sa sezonom, bojom palete i celokupnom estetikom — pa preporučujemo da floriste angažujete tek nakon što imate definisanu temu venčanja. Ovde su cvećare i floristi koji aktivno rade za venčanja u Srbiji, sa iskustvom u koordinaciji isporuke pre venčanja i dekoraciji u sali. Sezonski cvet je obično povoljniji i svežiji od uvoznog. Više pogledajte u Moje Venčanje planeru!",
    faq: [
      {
        q: "Kada da bukira floristu za venčanje?",
        a: "3-5 meseci unapred. Za retko cveće (božur, peonia van sezone) — i 6+ meseci jer se naručuje iz inostranstva.",
      },
      {
        q: "Koliko košta cveće za venčanje u Srbiji?",
        a: "Mladenački buket — 50€ do 150€. Butonijere — 8€ do 15€ po komadu. Stoni aranžmani — 25€ do 80€ po stolu. Cvetni luk — 200€ do 800€. Ukupno za prosečno venčanje — 800€ do 3000€.",
      },
      {
        q: "Sezonski cvet ili uvozni?",
        a: "Sezonski — povoljniji, sveži, ekološki. Uvozni — više opcija ali skuplje. Idealno: cvet biranje uskladiti sa mesecom venčanja, koristiti sezonske kao bazu i samo akcente uvozne.",
      },
      {
        q: "Šta sa cvećem nakon venčanja?",
        a: "Većina parova ostavlja stoni aranžmani gostima da ih ponesu. Mladenački buket često ide kao tradicionalni 'buket za neudate'. Profesionalni floristi mogu da isporuče i kući deo aranžmana ako platite.",
      },
      {
        q: "Veštačko ili pravo cveće?",
        a: "Pravo — bolji izgled, miris, autentičnost. Veštačko (kvalitetno) — povoljnije, ne vene, može se zadržati. Mnogi parovi miksuju: pravo na ključnim mestima (buket, glavni sto), veštačko na sekundarnim aranžmanima.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći broj cvećara sa pristupom uvoznom cveću. Cene više ali izbor enorman, posebno za egzotične i sezonske varijante.",
      "Novi Sad":
        "Novosadski floristi imaju jaku tradiciju i odličan pristup vojvođanskom poljskom cveću u sezoni — često koriste lokalni cvet u dizajnima.",
      Subotica:
        "Subotičke cvećare često sarađuju sa cvećarama iz Mađarske, što znači šire portfolija u svim mesecima.",
      Čačak:
        "U Čačku ima cvećara po pristupačnim cenama, sa pristupom Zlatiborskom regionu — savršeno za venčanja na planinskim lokacijama.",
      Kragujevac:
        "Kragujevačka scena cvećara pokriva centralnu Srbiju, sa solidnim izborom za sve sezone.",
      Niš: "Niški floristi rade sa pristupačnijim cenama i imaju pristup grčkom i bugarskom cveću u sezoni.",
    },
    keywords: [
      "cveće za venčanje",
      "buket za venčanje",
      "mladenački buket",
      "cveće za svadbu",
      "florista za venčanje",
      "cveće za venčanje beograd",
      "cveće za venčanje novi sad",
      "cvetni luk venčanje",
    ],
  },

  // ── 7. FIREWORKS / VATROMET ──────────────────────────────────────────
  {
    category: "fireworks",
    slug: "vatromet",
    h1: "Vatromet i specijalni efekti za venčanje u Srbiji",
    metaTitle: "Vatromet i efekti za venčanje — pirotehnika | HALO Uspomene",
    metaDescription:
      "Vatromet, hladni pirotehnički efekti i CO2 topovi za venčanja u Srbiji. Profesionalni izvođači u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Vatromet i specijalni efekti su sve češći deo srpskih venčanja — od klasičnog vatrometa u dvorištu sale, preko hladnog vatrometa za prvi ples, do CO2 topova i dim mašina za sliku 'on fire'. Profesionalni izvođači obezbeđuju dozvole, postavljaju opremu i izvode efekte sigurno. Hladni pirotehnički efekti (sparklers) su sve traženiji jer rade i u zatvorenom prostoru, sigurni su za goste i daju neverovatan vizuelni efekat za fotografije. U pregledu su izvođači koji rade specijalno za venčanja, sa iskustvom u koordinaciji sa salama i fotografima.",
    faq: [
      {
        q: "Kada da bukira vatromet za venčanje?",
        a: "2-4 meseca unapred je dovoljno za hladne pirotehničke efekte. Klasičan vatromet — najmanje 4 meseca jer treba i dozvola, koja traje par nedelja.",
      },
      {
        q: "Koliko košta vatromet za venčanje u Srbiji?",
        a: "Hladni pirotehnički efekti (10-12 sparklers + tehničar) — 200€ do 500€. CO2 topovi za sat-dva — 300€ do 600€. Klasičan vatromet — od 800€ do 3000€ zavisno od trajanja i kompozicije.",
      },
      {
        q: "Mogu li hladni efekti da se koriste u sali?",
        a: "Da, dizajnirani su za zatvoren prostor — bez dima, bez vrućine, sigurni za sve goste. Mnoge sale ih čak preporučuju umesto klasičnih sparklers koji ostavljaju ugljen i dim.",
      },
      {
        q: "Da li sala dozvoljava vatromet?",
        a: "Mora da se proveri unapred. Vanjski vatromet zahteva otvoreno dvorište i sigurno udaljenje. Sale u urbanim sredinama često ne dozvoljavaju, pa se rešava hladnim efektima.",
      },
      {
        q: "Šta je 'first dance' efekat?",
        a: "Hladni pirotehnički sparklers koji su postavljeni okolo bine ili podijum tokom prvog plesa mladenaca. Daju filmski efekat za fotografije i video, traje 30-60 sekundi.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najviše pirotehničkih timova sa kompletnom opremom za sve vrste efekata. Cene više ali raspoloživost najveća.",
      "Novi Sad":
        "Novosadski timovi rade po celoj Vojvodini, sa dobrom raspoloživošću i kompetitivnim cenama.",
      Subotica:
        "Subotičke firme često rade i u Mađarskoj i imaju širok izbor specijalnih efekata.",
      Čačak:
        "U Čačku i okolini ima manji broj timova — preporučujemo da bukira ranije nego u većim gradovima.",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju sa pristupačnim cenama.",
      Niš: "Niški pirotehnički timovi rade na jugu Srbije, često i u Makedoniji za destinacijska venčanja.",
    },
    keywords: [
      "vatromet za venčanje",
      "vatromet za svadbu",
      "hladni vatromet",
      "pirotehnika venčanje",
      "co2 top venčanje",
      "vatromet za venčanje beograd",
      "specijalni efekti venčanje",
      "sparklers venčanje",
    ],
  },

  // ── 8. DRESS / VENCANICE ─────────────────────────────────────────────
  {
    category: "dress",
    slug: "vencanice",
    h1: "Venčanice i salon venčanica u Srbiji",
    metaTitle: "Venčanice — salon venčanica i dizajneri | HALO Uspomene",
    metaDescription:
      "Saloni venčanica i dizajneri u Srbiji. Venčanice za iznajmljivanje i kupovinu u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Venčanica je za većinu mlada najemotivniji deo priprema. U Srbiji postoji čitav spektar opcija — od saloni sa konfekcijom po meri, preko dizajnera koji prave po porudžbini, do mogućnosti iznajmljivanja venčanica koje često uključuje i krojenje. Ovde okupljamo salone i dizajnere koji su prepoznati od strane parova koji koriste HALO Uspomene. Stilovi su raznovrsni — princeza, A-line, mermaid, boho, fit & flare — pa preporučujemo da posetite više salona pre konačnog izbora. Detaljne opise i kontakte za proveru termina za probanje pronađite u našem planeru!",
    faq: [
      {
        q: "Kada da kupim ili poručim venčanicu?",
        a: "Konfekciona venčanica iz salona — 4-6 meseci unapred (krojenje, doteranja). Po porudžbini od dizajnera — 8-12 meseci. Iznajmljivanje — 2-3 meseca.",
      },
      {
        q: "Koliko košta venčanica u Srbiji?",
        a: "Iznajmljivanje — 200€ do 600€. Konfekciona venčanica iz salona — 500€ do 2500€. Po meri od dizajnera — od 1500€ do 8000€+. Cena uključuje obično 2-3 probe i krojenje.",
      },
      {
        q: "Iznajmiti ili kupiti venčanicu?",
        a: "Iznajmljivanje — povoljnije, više opcija po istom budžetu, manje stvari za čuvanje. Kupovina — uspomena, mogućnost prepravke u 'after-party' verziju, sentimentalna vrednost. Većina mlada bira ono što priušti najbolje.",
      },
      {
        q: "Koliko proba treba?",
        a: "Standardno 2-3 probe nakon prve odluke. Prva — odluka o modelu. Druga — početak krojenja. Treća (ili više) — finalna doterivanja 2-3 nedelje pre venčanja kada se telo 'stabilizuje'.",
      },
      {
        q: "Šta sa veliima i dodacima?",
        a: "Većina salona ima veliki izbor velove, krunica, jastučića za prsten i dodataka u paketu sa venčanicom. Pitajte unapred jer cene odvojeno mogu da budu visoke.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći broj salona venčanica i nezavisnih dizajnera u Srbiji. Brendovi iz inostranstva (Pronovias, Maggie Sottero, italijanski) dostupni su preko više salona.",
      "Novi Sad":
        "Novosadski saloni nude solidan izbor, sa boljim cenama nego u Beogradu. Mnogi dizajneri rade po porudžbini.",
      Subotica:
        "Subotički saloni često rade sa mađarskim dizajnerima i imaju pristup brendovima koji nisu inače u Srbiji.",
      Čačak:
        "U Čačku ima salona sa pristupačnijim cenama. Često se posećuju i iz okolnih gradova zbog odnosa cene i kvaliteta.",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju, sa kombinacijom konfekcionih salona i krojača koji rade po meri.",
      Niš: "Niški saloni venčanica imaju pristupačne cene i sve više modernog izbora. Dobra alternativa za parove iz cele južne Srbije.",
    },
    keywords: [
      "venčanica",
      "venčanice za iznajmljivanje",
      "salon venčanica",
      "venčanica beograd",
      "venčanica novi sad",
      "venčanica po meri",
      "dizajner venčanica",
      "venčanica cena",
    ],
  },

  // ── 9. MAKEUP / SMINKA ──────────────────────────────────────────────
  {
    category: "makeup",
    slug: "sminka",
    h1: "Šminkeri i frizeri za venčanje u Srbiji",
    metaTitle: "Šminka i frizura za venčanje | HALO Uspomene",
    metaDescription:
      "Šminkeri i frizeri za venčanje u Srbiji. Make-up i hair styling za mladu i pratnju u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu.",
    intro:
      "Šminka i frizura mlade traju 14+ sati i moraju da preživi suze, ples, fotografije sa blicom i prirodnu svetlost. To je posao za profesionalca koji radi specijalno za venčanja, ne za standardni salonski tretman. Mnogi parovi rezervisu i sminkanje za majke, deveruše, sestre — što znači da treba ili tim ili kasnije rezervisanje pojedinačnih termina. Ovde okupljamo šminkere i hair stiliste koji rade venčanja u Srbiji. Mnogi nude i probnu šminku-frizuru pre datuma. Detalje i kontakte za proveru termina za probanje pronađite u našem planeru!",
    faq: [
      {
        q: "Kada da bukira šminkera za venčanje?",
        a: "3-6 meseci unapred. Top šminkeri se bukiraju i 6 meseci ranije. Probnu šminku obično raditi 2-4 nedelje pre datuma.",
      },
      {
        q: "Koliko košta šminka i frizura za mladu u Srbiji?",
        a: "Šminka mlade — 80€ do 200€. Frizura — 80€ do 200€. Paket (oboje) — 150€ do 350€. Probna sesija je obično 50€-80€, neretko se odbija od finalne cene ako rezervišete.",
      },
      {
        q: "Šminka za majku/deveruše — koliko?",
        a: "30€ do 80€ po osobi. Mnogi šminkeri imaju paket cene za grupu. Ako mlade nije primarni klijent, paket je ekonomičan.",
      },
      {
        q: "Šminka u salonu ili kod kuće?",
        a: "Sve više šminkera dolazi kući mlade — manje stresa, više vremena, fotografi mogu da snimaju 'getting ready' kadrove. Doplata za dolazak je 20€-50€ obično.",
      },
      {
        q: "Šta da očekujem od probne šminke?",
        a: "Šminker testira ten, koje boje rade na vašem licu, koliko šminke treba za fotografije sa blicom. Donesite slike koje volite i fotografiju vaše venčanice.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveću scenu profesionalnih šminkera i frizera za venčanja, sa mnogo specijalista u airbrush tehnici i ekstenzijama.",
      "Novi Sad":
        "Novosadski make-up artisti i hair stilisti imaju jaku scenu sa kompetitivnim cenama i visokim kvalitetom.",
      Subotica:
        "Subotički šminkeri često rade i u severnoj Bačkoj i u Mađarskoj — širok pristup trendovima.",
      Čačak:
        "U Čačku ima profesionalnih šminkera po pristupačnim cenama. Mnogi pokrivaju i venčanja na planinskim lokacijama.",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju, sa rastućom zajednicom mladih make-up artista.",
      Niš: "Niški šminkeri i frizeri imaju pristupačne cene i specijalizaciju za venčanja u stilu južne Srbije.",
    },
    keywords: [
      "šminka za venčanje",
      "šminka za mladu",
      "frizura za venčanje",
      "make up za venčanje",
      "šminker za svadbu",
      "šminka za venčanje beograd",
      "šminka za venčanje novi sad",
      "frizura za mladu cena",
    ],
  },

  // ── 10. RINGS / BURME ────────────────────────────────────────────────
  {
    category: "rings",
    slug: "burme",
    h1: "Burme i venčano prstenje u Srbiji",
    metaTitle: "Burme za venčanje — zlatari i juvelirnice | HALO Uspomene",
    metaDescription:
      "Burme za venčanje u Srbiji. Zlatari i juvelirnice u Beogradu, Novom Sadu, Subotici, Čačku, Kragujevcu, Nišu — klasične i savremene burme.",
    intro:
      "Burme su jedini deo venčanja koji nosite ceo život. Zato izbor zlatara i materijala (žuto zlato, belo zlato, ružičasto zlato, platina, kombinacije) zahteva više pažnje nego što se obično očekuje. U Srbiji postoji jaka tradicija ručnog izrade burmi po meri, ali sve više i savremenih juvelirnica koje rade u modernom stilu. Ovde okupljamo zlatare i juvelirnice koje rade specifično za parove — sa katalogom modela, mogućnošću prilagođavanja i graviranja. Ne zaboravite vremena potrebnog za proizvodnju (4-8 nedelja za burme po meri). Detalje i kontakt informacije pronađite u planeru.",
    faq: [
      {
        q: "Kada da naručim burme?",
        a: "2-3 meseca unapred za standardne modele. 4-6 meseci za burme po meri ili sa složenim graviranjem.",
      },
      {
        q: "Koliko koštaju burme u Srbiji?",
        a: "Standardne burme od žutog zlata 14k (par) — 400€ do 800€. Belo zlato 14k — 500€ do 1000€. Platina — 800€ do 2000€. Ručno izrađene sa graviranjem — od 600€ do 3000€+ zavisno od dizajna.",
      },
      {
        q: "Žuto, belo, ili roze zlato — šta da biram?",
        a: "Žuto — klasično, toplo, najtradicionalniji izbor u Srbiji. Belo — savremeno, neutralan, ide uz oba tipa kože. Roze — romantično, popularno za žensku burmu kao samostalnu kombinaciju.",
      },
      {
        q: "Mogu li burme da se gravira?",
        a: "Da, skoro sve. Standardno: imena partnera + datum venčanja sa unutrašnje strane. Mnogi parovi pišu i citate, koordinate mesta gde su se upoznali, ili samo simbol koji ima značenje za njih.",
      },
      {
        q: "Šta sa veličinom prstena?",
        a: "Zlatar meri pre porudžbine i pravi par testnih prstenova. Telo se menja kroz život — zlatari obično nude besplatno prilagodjavanje veličine u prvih 6-12 meseci nakon kupovine.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći izbor zlatara i juvelirnica — od tradicionalnih radionica do savremenih dizajnera koji rade u modernom stilu. Cene više ali izbor neuporediv.",
      "Novi Sad":
        "Novosadski zlatari rade u kombinaciji tradicije i modernog dizajna, sa pristupačnijim cenama nego u Beogradu.",
      Subotica:
        "Subotički zlatari često rade sa kupcima iz Mađarske i imaju širok izbor evropskih dizajna.",
      Čačak:
        "U Čačku ima zlatara sa odličnom tradicijom ručnog rada po pristupačnim cenama. Specijalitet su personalizovane burme.",
      Kragujevac:
        "Kragujevačka zlatarska scena ima dugu istoriju i pokriva centralnu Srbiju sa solidnim izborom.",
      Niš: "Niški zlatari rade po pristupačnijim cenama i imaju specijalizovanu izradu za parove iz cele južne Srbije.",
    },
    keywords: [
      "burme",
      "burme za venčanje",
      "venčano prstenje",
      "zlatar burme beograd",
      "burme po meri",
      "burme od belog zlata",
      "burme cena",
      "burme novi sad",
    ],
  },

  // ── 11. GIFTS / POKLONI ─────────────────────────────────────────────
  {
    category: "gifts",
    slug: "pokloni",
    h1: "Pokloni za goste na venčanju u Srbiji",
    metaTitle: "Pokloni za goste venčanja | HALO Uspomene",
    metaDescription:
      "Pokloni za goste, favor-i, zahvalnice i kutijice za venčanje u Srbiji. Personalizovani pokloni za svadbe u Beogradu, Novom Sadu i drugim gradovima.",
    intro:
      "Pokloni za goste (favor-i) su način da se zahvalite ljudima što su deo vašeg dana. U Srbiji to obično ide od malih jestivih sitnica (med, rakija, čokolada sa imenima), preko personalizovanih sapuna i mirisa, do većih pokloni za bliske prijatelje i familiju (kutijice sa sadržajem). Trend ide u smer svrsishodnog (ne 'sitnica koja završi u kanti') i personalizovanog. Ovde okupljamo izvođače koji prave personalizovane poklone, gravirane stvari, prirodne kozmetike i specijalnih jestivih artikala za venčanja. Više informacija o svakom od navedenih pronađite u planeru Moje Venčanje!",
    faq: [
      {
        q: "Kada da naručim poklone za goste?",
        a: "1-3 meseca unapred. Personalizovani (graviranje, štampa imena) — minimum 6 nedelja jer se prave po porudžbini.",
      },
      {
        q: "Koliko košta poklon za goste venčanja?",
        a: "Standard: 1.5€ do 5€ po gostu za favor-e. Veći personalizovani pokloni za bliske — 8€ do 20€. Za 100 gostiju računajte ukupno 200€ do 500€.",
      },
      {
        q: "Šta su popularni pokloni za goste u Srbiji?",
        a: "Med u staklenim teglicama sa vašim imenom, domaća rakija u personalizovanim flašicama, čokoladice sa štampanim etiketama, sapuni i mirisi, sećanje (magnet, drvena pločica).",
      },
      {
        q: "Da li poklon mora svakom gostu pojedinačno?",
        a: "Tradicija je da — jedan po osobi ili jedan po paru. Sve više parova bira simbolične poklone gde svako uzme jedan sa welcome stola umesto da se postavlja na svako mesto.",
      },
      {
        q: "Šta sa pakovanjem?",
        a: "Većina izvođača nudi i pakovanje (kutijice, kese, mašnice) — proverite cenu i da li je u paketu. Personalizovane etikete i štampa obično su doplata.",
      },
    ],
    cityIntros: {
      Beograd:
        "Beograd ima najveći izbor proizvođača personalizovanih poklona — od graveroka do specijalizovanih radionica za favor-e.",
      "Novi Sad":
        "Novosadska scena izrade poklona ima jaku tradiciju u prirodnoj kozmetici i jestivim artiklima (med, rakija) sa lokalnim sadržajem.",
      Subotica:
        "Subotički proizvođači često rade i sa mađarskim klijentima i imaju širok izbor specifičnih poklon kombinacija.",
      Čačak:
        "U Čačku ima izvođača specijalizovanih za drvene i ručno rađene predmete po pristupačnim cenama.",
      Kragujevac:
        "Kragujevačka scena pokriva centralnu Srbiju sa kombinacijom tradicionalnih i modernih izrada.",
      Niš: "Niški izvođači imaju dobre cene i specijalizaciju za prirodne proizvode (med, rakija, vino) iz južne Srbije.",
    },
    keywords: [
      "pokloni za goste venčanja",
      "favor venčanje",
      "personalizovani pokloni venčanje",
      "kutijice za goste venčanje",
      "pokloni za goste svadbe",
      "wedding favor srbija",
      "pokloni za venčanje beograd",
      "pokloni za venčanje novi sad",
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryContent | null {
  return CATEGORY_CONTENT.find((c) => c.slug === slug) ?? null;
}

export function getCityIntro(
  content: CategoryContent,
  city: CityName,
  fallbackWhat: string,
): string {
  return (
    content.cityIntros[city] || COMMON_CITY_INTRO_FALLBACK(fallbackWhat, city)
  );
}
