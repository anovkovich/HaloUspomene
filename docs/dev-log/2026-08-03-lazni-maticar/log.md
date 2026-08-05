# Log — Lažni matičar (nova usluga + landing)

## 2026-08-03 — Istraživanje, stranica, blog post

- **Šta je urađeno:**
  - SEO istraživanje tržišta (novi partner: laznimaticarbeograd.com). Nalazi:
    ceo prostor ima **dve** srpske komercijalne stranice; **niko ne objavljuje
    cene**; **niko nema FAQ ni schema markup**; hrvatski sajtovi rangiraju u
    srpskom SERP-u jer Google nema domaći sadržaj; ponuda pretežno živi na
    Instagramu i TikToku. Tražnja je dokazana medijskim talasom 2023–2026.
  - Nova stranica `/lazni-maticar` (~1.900 reči): definicija u prva dva pasusa
    (snippet bait), tok ceremonije u 4 koraka, emotivna vs šaljiva varijanta,
    5 scenarija upotrebe, cena, **eksplicitna pravna sekcija**, gradovi,
    14 FAQ pitanja, forma. Schema: `Service` + `Offer`, `FAQPage`,
    `BreadcrumbList`. Plus OG slika sa fotografijom rekvizita.
  - Blog post `lazni-maticar-kako-izgleda` (~2.250 reči, komičan ton, kategorija
    Saveti), sa proverenim izvorima i tačnim pravnim statusom.
  - Nav: peta stavka u padajućoj listi IZNAJMLJIVANJE. Ime liste je zadržano po
    odluci korisnika, iako ovo nije najam nego usluga.
  - Footer, sitemap, `llms.txt`, cache header, ukrštanje sa blogom.
  - **Refaktor:** `src/lib/oldtajmeri-partneri.ts` → `src/lib/partneri.ts` —
    registar sada pokriva sve posredovane usluge, sa `products` po partneru i
    jednim `resolvePartnerRouting(product, selection)`. `/api/contact` više ne
    zna za konkretne proizvode.
  - **Refaktor:** `VehicleRentalLeadForm` → `ServiceLeadForm` — polja su sada
    generička (`primary`/`secondary`, sa labelom, ikonicom i ključem za mejl
    kroz props), pa ista forma opslužuje i uslugu koja nije najam vozila.
    Na ovoj stranici polja su "Ton ceremonije" i "Povod".
- **Odluke korisnika:** white-label (partner se ne imenuje i ne linkuje);
  lažni matičar ostaje u listi IZNAJMLJIVANJE; cena orijentaciono "od 100 €"
  dok ne stigne pun cenovnik.
- **Posledice:** Cena i paketi su izdvojeni u `src/data/lazni-maticar.ts` sa
  `pricingApproximate` prekidačem — kad stigne pun cenovnik, popuni se
  `packages`, prekidač ide na false, i formulacije o orijentacionoj ceni
  nestaju same. Stranica tada prikazuje tabelu paketa.
- **Verifikacija:** `tsc` + `eslint` čisti; `next build` prolazi (388 stranica,
  `/lazni-maticar` i OG statički prerenderovani); sve rute 200; title, H1 i
  schema provereni u HTML-u; **0 pojavljivanja partnera** u HTML-u stranice i u
  `.next/static` bundle-ovima.
- **Status:** code-complete
- **Blokade / sledeći korak:**
  1. **Telefon i ime osobe kod partnera** — u `src/lib/partneri.ts` za sada
     stoji samo Instagram handle, pa mejl sa upitom nosi samo taj kanal.
  2. Pun cenovnik (v. gore) — trenutna cifra je orijentaciona.
  3. Galerija i video sa nastupa — partner ih ima; video bi doneo `VideoObject`
     schema i verovatno jedini video rich snippet u ovom SERP-u.
  4. Deploy, pa Search Console: `/lazni-maticar/` i
     `/blog/lazni-maticar-kako-izgleda/` na indeksiranje.

## 2026-08-03 — Doterivanje posle pregleda

- **Šta je urađeno:**
  - Zamenjena hero fotografija (novi kadar, 1200×496, providna pozadina); OG
    PNG regenerisan iz iste slike. Obrisan `.next/cache/images` pre builda.
  - Senka ispod hero slike preko `drop-shadow` filtera, ne `box-shadow` —
    fotografija je bez pozadine, pa bi `box-shadow` pratio pravougaonik i visio
    u praznom prostoru oko objekta.
  - **Izbačena tvrdnja** da zvanični čin i lepa ceremonija "skoro nikada ne mogu
    na istom mestu" — bila je prejaka i nije tačna. Novi ugao: razlika nije u
    mestu nego u osećaju; mladenci su opušteniji jer nema obrasca ni pritiska, a
    za glumca znaju samo oni i kumovi, pa je reakcija gostiju iskrena.
  - Pravni status objašnjen na dva mesta i preciznije: ceremonija nema nijedan
    zakonski element i namenjena je parovima koji su brak **već sklopili** (u
    opštini ili inostranstvu), a piše se po želji mladenaca. Isto uneto i u
    skriveni SEO pasus.
  - Scenariji: izbačen "Svadba je uveče ili vikendom"; "Čist program i
    iznenađenje" zamenjen sa "Građansko venčanje ste obavili pre svadbe"
    (najčešći domaći slučaj). Sekcija sada ima 4 kartice u rasporedu 2×2.
  - Uvodni pasusi obostrano poravnati (`text-justify` + `hyphens-auto`, radi jer
    je `<html lang="sr">`).
- **Verifikacija:** `tsc` + `eslint` čisti, build prolazi, provereno u HTML-u da
  su stare formulacije nestale a nove prisutne.
- **Status:** code-complete

## 2026-08-05 — CTA raspored (konsultovan Fable 5) + tracking

- **Problem:** stranica je imala JEDAN CTA (hero) i formu na samom dnu, iza 16
  FAQ pitanja. Ko se predomisli u sredini stranice nema kuda.
- **Odluka (Fable 5):** ne pomerati formu i ne menjati redosled sekcija — padajuci
  izbor tona u formi pretpostavlja da je covek procitao stranicu, a pravna sekcija
  mora da se procita pre upita. Umesto toga tri nova izlaza:
  - `cena` — dugme UNUTAR crne kartice, odmah ispod recenice „Javite datum i
    lokaciju i dobijate tacnu ponudu". Ta recenica je poziv na akciju bez akcije;
    ispod dve krem kartice bi izgubila vezu sa cifrom.
  - `scenariji` — posle mrezice scenarija, gde se posetilac tek prepoznao.
  - `gradovi` — posle mrezice gradova, poslednji izlaz pre FAQ zida.
- **Tracking:** sekundarno hero dugme (`#kako-izgleda`) nije imalo `data-track`;
  dodato. `/lazni-maticar` sada ima 5 pracenih CTA-ova.
- **Usput:** `/telefon-uspomena` nije imala NIJEDAN `data-track` — 3 CTA-a
  (hero rezervacija, hero paketi, dugme u kartici paketa) sada su pracena.
- **Verifikacija:** `tsc` cist, `next build` prolazi, u serverskom HTML-u
  `/lazni-maticar` = 5 i `/telefon-uspomena` = 3 `data-track="cta_click"`;
  kartica sa cenom snimljena na 1440 i 420 px.
- **Status:** code-complete
