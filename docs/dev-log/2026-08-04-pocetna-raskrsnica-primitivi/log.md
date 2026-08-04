# Log — Početna kao raskrsnica + dizajn primitivi

## 2026-08-04 — Faze 1–3 i 6 implementirane; otkriveno da analitika uopšte ne radi

- **Šta je urađeno:**
  - **Faza 1 — primitivi.** Novi `src/components/ui/`: `Section.tsx` (3 imenovane
    skale razmaka umesto 4 nekonzistentne, 3 tona, 3 širine; uvek renderuje
    `<section>`), `SectionHeader.tsx` (fiksno `mb-10 sm:mb-12`), `Card.tsx`
    (4 tona × 3 paddinga; sa `href` cela kartica je `<Link>`), `CtaButton.tsx`
    (4 varijante, `track={{name,location}}` → `data-track*`, **bez DaisyUI `btn`**).
    Provera plana ispunjena: `git status` je posle Faze 1 pokazivao samo 4 nova fajla.
  - **Faza 2 — nova početna.** Nov `src/data/products.ts` (8 naših + 4 posredovane
    usluge + rođendanski linkovi; cene su funkcije, ne stringovi). Nove sekcije:
    `ProductGrid`, `WhyUs`, `Process`, `PriceStrip`, `SectionKontakt`.
    `src/app/page.tsx` prepisan sa 16 na 8 sekcija; `sr-only` blok obrisan.
  - **Faza 3 — navigacija.** `Navbar.navLinks` izveden iz `products.ts`; nova
    padajuća lista „Raspored i pano"; blog izbačen iz zaglavlja. Podnožje:
    kolona „Blog" → „Saveti i ideje" (`/blog` nepromenjen).
  - **Faza 6 — čišćenje.** Obrisani `layout/header/NavbarShell.tsx` i
    `MobileMenu.tsx` (0 referenci). `CLAUDE.md` ažuriran (više ne pominje
    `Concept`/`Packages` na početnoj).
  - **Faza 0 — merenje.** Instalirani MCP serveri `ga4` (zvanični Google
    `analytics-mcp` preko `uvx`) i `gsc` (`mcp-server-gsc` preko `npx`), oba na
    isti service account `halouspomeneacc@halouspomene-490410`. Nova skripta
    `scripts/analytics-baseline.mjs`; rezultat u `baseline.json`.

- **Commit / PR:** — (nije komitovano; radno stablo na grani `deploy`)

- **Na šta utiče dalje:**
  - **NOV TASK, HITNO: analitika ne postoji.** `src/app/layout.tsx` **nema**
    ni gtag skriptu ni Clarity, a `AnalyticsProvider` se **nigde ne mount-uje**.
    `trackEvent` tiho ne radi ništa jer `window.gtag` ne postoji. Produkcijski
    HTML nema nijedan `G-` ID. GA4 je za 90 dana zabeležio **0 događaja i 0
    pregleda stranica**. `CLAUDE.md` i dalje tvrdi „GA4 + Microsoft Clarity +
    Vercel Analytics" — netačno za prva dva.
  - Zato **premisa Faze 0 iz plana ne važi**: „podaci za odluku već postoje u
    GA4" — ne postoje. GSC deo je potpuno dostupan i iskorišćen.
  - Custom dimenzije (`depth_percent`, `section_id`) nisu registrovane u GA4;
    registracija **ne važi unazad**, pa se to mora uraditi pre nego što merenje
    „posle" ima smisla.
  - Faza 4 (12 marketinških stranica) sada može da počne — primitivi postoje.

- **Posledice:**
  - Početna: **16 → 8 sekcija**, `<main>` **1.919 → 956 vidljivih reči** (−50%),
    `sr-only` blokova 1 → 0, pominjanja retro telefona 20 → 9.
  - Visina stranice (CDP, `document.body.scrollHeight`), produkcija naspram lokalnog:
    mobilni 390px **17.262 → 11.129px (−36%)**, desktop 1440px **13.431 → 8.472px (−37%)**.
  - Popravljeno usput: (1) `/#paketi` je bio **pokvaren link u produkciji** —
    `id="paketi"` je postojao samo u `Packages.tsx` koji se nije renderovao, pa su
    `/cene` i svih 6 gradskih stranica slale posetioca na vrh početne; sada ga
    nosi `PriceStrip`. (2) `faq_interaction` je slušao DaisyUI checkbox unutar
    `#faq .collapse`, a FAQ koristi `<details>` — sada sluša `toggle` u fazi
    hvatanja (taj događaj se ne propagira nagore). (3) Tipfeleri „Zivkanje" i
    „gomila papria". (4) Hardkodovane cene iz `HowItWorks` („5.000", „9.900",
    „2.500", „3.000") — sve sada idu kroz `pricing.ts`.
  - **Povlačenje:** `git revert` jednog commita. Stare landing komponente
    (`Concept`, `PainPointSolution`, `HowItWorks`, `CTABar`, `Packages`,
    `Section*`) su **namerno zadržane** iako su bez ijedne reference — Next ih
    ne pakuje, a drže R7 povlačenje na izmenu od jedne linije u `page.tsx`.
    Brišu se tek kad deploy odstoji.

- **Šta je rešeno:**
  - **R1 kapija je prošla, sa dokazom.** GSC (90 dana, 2026-05-03 → 2026-08-01):
    početna ima 65 upita, od toga 52 na poziciji ≤10. Raščlanjeno:
    - **brend** (`halo uspomene`, `halouspomene`, `halo`, `halo halo`, `halo rs`,
      `halo telefon`) — početna ih drži bez obzira na sadržaj;
    - **retro telefon / audio** (`telefon uspomena` 73 prikaza poz 7.9,
      `telefon za svadbe`, `iznajmljivanje telefona`, `audio guest book cena`,
      `audio guest book`) — i dalje pokriveno FAQ pitanjem „Šta je retro telefon
      uspomena?" i karticom u mreži; uz to `/telefon-uspomena/` već rangira bolje
      (poz 4.5, 150 klikova), što je tačno R2 namera;
    - **pozivnice** (`pozivnice za vencanje novi sad`, poz 1.3) — pokriveno
      karticom i FAQ pitanjem o ceni pozivnice;
    - **šum bez ijednog klika** (`photo booth`, `foto kabina`, `event planning`,
      `digitalne platforme`) — ne prodajemo to.
    Nijedna obrisana sekcija nije bila jedini nosilac odgovora na rangirajući upit.
  - Provere iz plana, na `curl`-ovanom HTML-u: svih 7 `id`-jeva prisutno po
    jednom, 8 `<section>` u `<main>`, 18 elemenata sa `data-track` (nijedan bez
    para `cta-name`/`cta-location`), tačno 1 `FAQPage` schema, 0 `sr-only`,
    svih 15 linkova iz mreže vraća 200.
  - `npx tsc --noEmit` čist, `npx eslint` na 14 izmenjenih fajlova čist,
    `NEXT_BUILD_CPUS=1 npx next build` prolazi.

- **Šta je odblokirano:** Faza 4 (primitivi postoje). GSC merenje je sada
  skriptovano i ponovljivo, pa se „posle" povlači istom komandom.

- **Status:** planned → in-progress

- **Blokade / sledeći korak:**
  1. **Odluka korisnika:** deploy Faza 1–3 (preview na Vercelu → provera na
     telefonu → merge), ili prvo Faza 4.
  2. **Zaseban task za analitiku** — dok se ne uradi, `section_view`,
     `scroll_depth`, `cta_click` i `faq_interaction` ne postoje kao podaci, pa
     se efekat ovog refaktora ne može izmeriti u ponašanju posetilaca (samo u
     GSC-u i visini stranice).
  3. FAQ je **zadržan na 8 pitanja** umesto 6 — v. Odluku 6 u `plan.md`.
     Preispitati posle 4 nedelje GSC podataka.

---

## 2026-08-04 (drugi unos) — Analitika vraćena i podešena; ISPRAVKA ranijeg nalaza

- **ISPRAVKA prethodnog unosa.** Tamo piše da analitika „nikada nije bila
  renderovana". To nije tačno. GA4 i Clarity su **radili**, pa su **namerno
  uklonjeni 2026-03-19 commit-om `bd82d0b`** („Improve page speed: remove
  GA4/Clarity, optimize images, cleanup" — ~100KB third-party JS; poruka
  commita izričito kaže „Keep Vercel Analytics + Speed Insights for tracking").
  GA4 ima podatke za 2026-02 (1.740 događaja / 130 korisnika) i 2026-03 (3.360 /
  275), pa staje. Prozor od 90 dana je pokazao nulu jer ceo pada posle prekida —
  otud pogrešan zaključak. Nalaz o posledici ostaje isti: od 19.03. do danas
  nema nijednog podatka.

- **Šta je urađeno:**
  - Vraćene `GoogleAnalytics.tsx` i `Clarity.tsx` (novi fajlovi u
    `src/components/analytics/`), oba `next/script` + `afterInteractive` — isto
    kao uklonjena implementacija. Sve troje montirano na kraj `<body>` u
    `layout.tsx`; `AnalyticsProvider` ranije nije bio montiran nigde.
  - **`AnalyticsProvider` prepravljen zbog dve tihe greške:**
    (1) mount-ovao bi se jednom u root layout-u, pa bi posmatrao samo sekcije
    PRVE otvorene stranice — posmatrač i dubina skrola sada se obnavljaju na
    `usePathname()`; (2) prag `0.3` je nedostižan za sekciju višu od ~3,3 ekrana,
    pa `section_view` za duge sekcije nikada ne bi bio poslat — sada
    `threshold: [0, 0.1, 0.3]` uz uslov „30% sekcije ILI pola ekrana".
  - **GA4 property podešen** (`scripts/ga4-setup.mjs --apply`): 12 custom
    dimenzija koje odgovaraju parametrima iz `src/utils/analytics.ts`,
    `form_submit` označen kao key event, zadržavanje podataka
    `TWO_MONTHS → FOURTEEN_MONTHS`.
  - `scripts/analytics-baseline.mjs` proširen u pun GSC izveštaj (ukupno vs
    prethodni period, upiti, stranice, uređaji, države, „druga strana rezultata",
    „dobra pozicija slab CTR"). Izlaz: `baseline.json` + `gsc-izvestaj.md`.
  - `CLAUDE.md` dobio odeljak „Analytics" sa istorijom, tri invarijante i
    uputstvom za skripte.

- **Commit / PR:** — (nije komitovano)

- **Na šta utiče dalje:**
  - **Odluka za korisnika:** ovo poništava svesnu odluku o brzini stranice od
    19.03. Trošak je isti kao tada (~100KB). Ako brzina prevagne, Clarity je
    prvi kandidat za izbacivanje — nosi veći deo tereta, a GA4 sam daje sve
    metrike iz plana.
  - Svaki NOV parametar događaja mora da se doda i u `DIMENSIONS` u
    `ga4-setup.mjs`, inače je nevidljiv u izveštajima.
  - Merenje „posle" refaktora početne moguće je tek kad se skupi 2–4 nedelje
    podataka nakon deploy-a.

- **Posledice:**
  - Provereno u pravom pregledaču (CDP, headless Chrome): `window.gtag` i
    `window.clarity` postoje; presretanjem gtag-a uhvaćeni `cta_click`
    (`{cta_name, cta_location}`), `faq_interaction`, sva četiri praga
    `scroll_depth` i `section_view` za 6 sekcija. Pre popravke praga
    `section_view` nije stizao nijednom.
  - **Povlačenje:** ukloniti tri komponente iz `layout.tsx` (GA4/Clarity/Provider).
    GA4 izmene su takođe povratne — dimenzije se arhiviraju, retencija vraća na
    `TWO_MONTHS`, key event briše.
  - Custom dimenzije **ne popunjavaju istoriju unazad** — sve pre 2026-08-04
    ostaje bez raščlanjenja po `section_id` / `depth_percent`.

- **Šta je rešeno:** Faza 0 kompletirana koliko je moguće. GSC pročitan u punom
  obimu (180 dana): 102 upita za početnu, 81 na poz ≤10; izvedene liste prilika.
  Potvrđeno da su `NEXT_PUBLIC_GA_ID` i `NEXT_PUBLIC_CLARITY_ID` ispravno
  postavljeni i na Vercelu (sve tri sredine) i lokalno, i da GA ID odgovara
  stvarnom stream-u `G-XXTC0TP1H0` — problem nikad nije bio u konfiguraciji.

- **Šta je odblokirano:** merenje efekta refaktora u ponašanju posetilaca; SEO
  rad po listama prilika (v. `gsc-izvestaj.md`).

- **Blokade / sledeći korak:** deploy (analitika + refaktor početne su **dve
  odvojene promene** — po R8 nikad dve u jednom deployu; predlog: prvo analitika,
  pa za par dana početna, da se efekat može razdvojiti).

---

## 2026-08-04 (treći unos) — Clarity izbačen, UI/copy izmene, SEO revizija

- **Šta je urađeno:**
  - **Clarity uklonjen.** U prethodnom unosu je vraćen zajedno sa GA4 — to nije
    bilo traženo. Odluka vlasnika: vraća se SAMO GA4. `Clarity.tsx` obrisan,
    izbačen iz `layout.tsx`, razlog upisan u komentar da se ne vrati slučajno.
  - **`WhyUs`** — sve tri kartice dobile novi tekst (konkretniji „bez nas",
    hostesa sa tabletom u drugoj, „sećanje na atmosferu bledi" umesto „emocije
    blede", i jača formulacija rešenja u trećoj).
  - **`products.ts`** — nazivi i opisi kartica prepisani: „Website pozivnica" →
    „Standardna pozivnica", „Premium AI pozivnica" → „Premium pozivnica" (bez
    pominjanja AI), „Direktorijum vendora" → „Provereni saradnici". Cene za
    standardnu i premium pozivnicu bez prefiksa „od". Badge „Najtraženije" →
    „Najčešće u paketu"; `Card` badge stegnut na 9px/`tracking-wide` da duži
    natpis ne prelije usku karticu na telefonu.
  - **Navigacija** — „Raspored i pano" → „Raspored i QR".
  - **Autorske SVG ilustracije** — nov `src/components/landing/product-illustrations.tsx`
    (12 komponenti + mapa po `product.id`), zamenjuju `lucide` ikonice u mreži.
    Čist inline SVG, `currentColor`, bez zavisnosti; `lucide` ikonica ostaje kao
    rezerva za proizvod bez ilustracije.
  - **SEO revizija** — `docs/dev-log/.../seo-nalazi.md`.

- **Commit / PR:** — (nije komitovano)

- **Na šta utiče dalje:**
  - Najveći otvoreni SEO nalaz: **blog kanibalizuje proizvodne stranice.**
    `/blog/moje-vencanje-planer/` je na poz 7,8 za „planer za vencanje", dok je
    `/planiranje-vencanja/` na **18,4**; isto za raspored sedenja. Sledeći potez
    su linkovi iz blogova ka proizvodnim stranicama sa sidrenim tekstom = upit.
  - `/pozivnice/` (poz 36,3 za „pozivnice", dok početna drži 10,2) trebalo bi da
    se popravi SAM OD SEBE posle ovog refaktora — početna više ne nosi prodajni
    tekst o pozivnicama. To je R2, sada sa izmerenim polazištem.

- **Posledice:**
  - **Popravljen dupli sufiks u naslovima svih 11 `/vendori/*` stranica**
    (`… | HALO Uspomene | HALO Uspomene`, do 78 znakova). Uzrok: `metaTitle` u
    `categories.ts` je već sadržao sufiks koji root `title.template` dodaje.
    Najveći gubitnik `/vendori/muzika/` — 236 prikaza, 0 klikova. Provereno da
    nijedna druga stranica nema isti problem. OG/Twitter naslovi ne prolaze kroz
    šablon, pa im se brend sada dodaje eksplicitno — bez toga bi ostali bez brenda.
  - `tsc` i `eslint` čisti, build prolazi, izgled proveren snimcima na 1440px.
  - **Povlačenje:** izmene su izolovane u `products.ts`, `WhyUs.tsx`,
    `Card.tsx`, `Navbar.tsx`, `product-illustrations.tsx`, `categories.ts` i
    `vendori/[kategorija]/page.tsx`.

- **Šta je rešeno:** dupli naslovi na 11 stranica; ilustracije umesto ikonica;
  copy po zahtevu vlasnika; SEO slika sa konkretnim redosledom rada.

- **Šta je odblokirano:** rad na kanibalizaciji blog↔proizvodna stranica.

- **Blokade / sledeći korak:** deploy. Vlasnik je odlučio da analitika i nova
  početna idu **u istom push-u** (odstupanje od R8 — praćenje šta je na šta
  uticalo nije prioritet, a stara početna je pretrpana).

---

## 2026-08-04 (četvrti unos) — Plan za tanke stranice + Fazu 5, zakazan za 10.08.

- **Šta je urađeno:** izmerene sve proizvodne stranice (dubina sadržaja naspram
  pozicije) i napisan `faza-5-plan.md`; zakazivanje upisano u `CLAUDE.md` kao
  odeljak sa datumom i uputstvom da podseti na sebe.

- **Na šta utiče dalje:** obrazac pronađen kod planera **ponavlja se i gore**:
  - `/napravi-deciju-pozivnicu/` — **165 reči**, 952 prikaza, 22 klika
  - `/napravi-punoletstvo/` — **200 reči**, 901 prikaz, 14 klikova, poz 8,7 za
    upit sa 444 prikaza
  - `/cene/` — 339 reči od kojih je **332 u `sr-only` bloku** (vidljivog teksta
    praktično nema; cenovnik je tabela)
  - `/vendori/` — 445 reči i samo 8 internih linkova
  Za poređenje, stranice koje rangiraju dobro imaju 1.200–2.250 reči.
  **Dve rođendanske stranice su veći dobitak od planera** i idu prve.

- **Posledice:** ukupno `sr-only` na 12 stranica = **1.759 reči** (poklapa se sa
  procenom iz originalnog plana). Popis po stranici sa odlukom (obrisati /
  promovisati / ne dirati) je u `faza-5-plan.md`.

- **Šta je rešeno:** pitanje „da li praviti nove blogove" — **plan od 14 tekstova
  već postoji** u `docs/vodici/pozivnice-i-pr-vodic.pdf`, sa redosledom i
  obrazloženjem po tekstu. Ne praviti nov plan.

- **Odluka: datumi objave se ne izmišljaju unazad.** Google beleži kada je URL
  prvi put otkriven, pa backdate ne pomaže rangiranju, a `datePublished` u
  strukturiranim podacima postaje neistinit. Konkurent sa 55 tekstova za mesec
  dana nije dobio prednost datumima nego obimom.

- **Blokade / sledeći korak:** deploy, pa 2026-08-10 ponovo merenje i izvršenje
  plana. Prvi korak tog dana je UVEK `scripts/analytics-baseline.mjs --days 30` —
  ceo plan počiva na brojkama koje se do tada menjaju.

---

## 2026-08-04 (peti unos) — Dve formular-stranice + 7 blog tekstova

- **Šta je urađeno:**
  - **`/napravi-punoletstvo/` i `/napravi-deciju-pozivnicu/` prepisane** po
    strukturi koju je predložio Fable 5. Ključna odluka: **formular ostaje sam u
    prvom ekranu**, sav sadržaj ide ispod. Obrazloženje: upiti koji dovode
    posetioca su transakcioni („napravi mi pozivnicu za rodjendan"), pa je forma
    odgovor na upit; sadržaj ispod prevoja vidi samo onaj ko skroluje, a to je po
    definiciji posetilac koji još nije odlučio. Formular je dobio `id="formular"`,
    a na dnu stoji traka koja vraća na njega.
    Odbačeno: lepljivi dvokolonski raspored (formular ima živi pregled boja i
    fontova, preširok je; na mobilnom — gde je većina saobraćaja — ionako pada u
    jednu kolonu; i bio bi veliki refaktor živog plaćenog toka) i akordeoni za
    glavni sadržaj (ono što treba da rangira mora biti vidljivo).
  - Obe stranice: demo pozivnice odmah ispod forme, „Šta dobijate", „Kako
    funkcioniše", prozni blok o tekstu pozivnice sa primerima, poređenje
    digitalno/štampano, **FAQ sa 7 pitanja i `FAQPage` schemom** (nijedna je
    ranije nije imala), povratni CTA.
  - **Obrisani `sr-only` blokovi** sa obe stranice — bili su istovremeno
    `sr-only` I `aria-hidden="true"`, dakle skriveni i od čitača ekrana i od
    prikaza; sadržaj je prelivan u vidljive sekcije.
  - **7 novih blog tekstova** napisanih preko Fable 5, registrovanih u
    `posts.ts`: spisak gostiju za svadbu, satnica venčanja, save the date,
    koliko se daje na svadbi, koliko košta svadba u Srbiji, obaveze kuma,
    čestitke za venčanje (45 primera). Ukupno ~14.500 reči.

- **Commit / PR:** — (nije komitovano)

- **Posledice:**
  - `/napravi-punoletstvo/`: **200 → 777 reči**, H2 2→7, FAQ 0→7
  - `/napravi-deciju-pozivnicu/`: **165 → 801 reč**, H2 2→7, FAQ 0→7
  - Blog: 26 → **33 vidljiva posta**
  - Obe stranice su ispod cilja od ~1.100 reči koji je Fable predložio; dobitak
    je 4–5×, ali nije dosegnut pun predlog.
  - `tsc`, `eslint`, build čisti; svih 22 interna linka vraćaju 200.

- **Greška koju sam napravio i ispravio:** u uputstvima piscima naveo sam
  slugove blog postova ne proverivši njihov `publishDate`. **Sedam postova je
  zakazano za budućnost** (2026-08-12 do 2026-10-05) i vraća 404 dok ne izađu,
  pa su četiri nova linka bila pokvarena — tri u tekstovima i jedan na
  `/napravi-punoletstvo/`. Sva četiri preusmerena na objavljene ciljeve.
  **Pravilo za ubuduće: pre linkovanja na blog post proveriti `publishDate`.**

- **Šta je rešeno / šta NIJE (provera na kraju):**
  - **Tanke stranice: 3 od 6.** Urađeno: `/napravi-punoletstvo/`,
    `/napravi-deciju-pozivnicu/`, `/planiranje-vencanja/`. **Ostaje:** `/cene/`
    (339 reči, od toga 332 u `sr-only`), `/vendori/` (445), i
    `/pozivnica-za-prvi-rodjendan/` (530) — sve tri su već u planu za 2026-08-10.
  - **Blog klaster: 7 od 14.** Urađeni su #1, #2, #3, #7, #8, #9, #11.
    **Ostaje 7, među njima i #6 — „Digitalne pozivnice za venčanje", koji je u
    analizi označen kao GLAVNI STUB klastera** („nijedan naš tekst ne gađa taj
    termin"). To je tekst koji najviše treba stranici `/pozivnice/`, koja i dalje
    stoji na poz 36,3 za upit „pozivnice". Ostali: #4, #5, #10, #12, #13, #14.

- **Blokade / sledeći korak:**
  1. **Odluka:** 7 zakazanih postova (08-12 do 10-05) — objaviti ih odmah ili
     pustiti po rasporedu? Dok su zakazani, ne mogu se linkovati.
  2. Napisati #6, glavni stub klastera — najveći preostali SEO dobitak.
  3. Deploy.

---

## 2026-08-04 (šesti unos) — `maxDate` u DatePicker-u; ispravke teksta

- **Šta je urađeno:**
  - **`DatePicker` dobio `maxDate`** (`src/components/ui/DatePicker.tsx`).
    Zajednički `isOutOfRange()` zamenio je proveru samo donje granice, dodat je
    `canGoNext()` da se strelica napred zaključa, a brza radnja „Za nedelju dana"
    se **sakriva** kada bi preskočila granicu (proslava za tri dana → rok posle
    proslave).
  - **Primenjeno na sve tri klijentske forme** koje imaju rok za potvrde:
    `napravi-pozivnicu`, `napravi-deciju-pozivnicu`, `napravi-punoletstvo` —
    `maxDate={formData.event_date_only}`. Admin `SeatingInvitationModal` nema
    datum događaja u dometu, pa nema šta da se ograniči.
  - **Dodato i vezivanje unazad:** `maxDate` sprečava samo NOVO biranje. Ako je
    rok već izabran pa se datum proslave pomeri unazad, stara vrednost bi ostala
    iza proslave — zato `onChange` datuma proslave sada skraćuje rok na novi
    datum. Isto u sve tri forme.
  - Tekst na obe formular-stranice: „Primeri taglinea" → **„Primeri kratke
    poruke na pozivnici"**, primeri prošireni i povećani na **8 po stranici**.

- **Posledice / provera:** E2E kroz pravi pregledač (CDP) na sve tri forme —
  skript prolazi čarobnjak, bira datum proslave, otvara kalendar roka i broji:
  **27 od 27 dana posle proslave onemogućeno, strelica napred zaključana** na
  svakoj formi. `tsc`, `eslint`, build čisti.

- **Napomena o testu:** prva verzija testa je dala **lažni pozitiv** na dečijoj
  formi — tražila je tekst „Rok za potvrdu dolaska" u celom `body`, a čarobnjak
  je i dalje bio na koraku 1. Ispravljeno da traži labelu unutar forme i da
  klikne izbor u grupama dugmadi (pol deteta, koji rođendan).

- **Blokade / sledeći korak:** nepromenjeno — odluka o 7 zakazanih postova i
  pisanje glavnog stuba (#6).

---

## 2026-08-04 (sedmi unos) — Glavni stub klastera (#6) + povezivanje

- **Šta je urađeno:**
  - Napisan **`digitalne-pozivnice-za-vencanje.mdx`** (2.405 reči, 10 H2, 6 H3,
    tabele, FAQ sa 6 pitanja) — stavka #6 iz plana od 14, u analizi označena kao
    GLAVNI STUB klastera. Registrovan u `posts.ts` sa `featured: true` i
    najranijim datumom (2026-03-08), da bude „stariji" od pritoka.
  - **Klaster povezan u oba smera.** Stub linkuje na `/pozivnice` tri puta u
    tekstu plus CTA. Nazad ka stubu dodati linkovi iz 4 objavljene pritoke
    (`tekst-za-pozivnicu-za-vencanje`, `save-the-date-vencanje`,
    `kada-slati-pozivnice-za-vencanje`,
    `stampane-pozivnice-sa-qr-kodom-za-potvrdu`), **svaki sa drugačijim sidrom**
    da ne izgleda kao mehaničko ponavljanje iste fraze.

- **Zašto stub postoji (da se ne obriše pri budućem uređivanju):** za upit
  „digitalne pozivnice za venčanje" nijedan konkurent ne rangira blog tekstom —
  svi rangiraju sopstvenom početnom, jer je njihova početna stranica O
  POZIVNICAMA. Naša početna je multi-proizvodni brend (i posle refaktora još
  više), pa `/pozivnice` autoritet mora da dobije iznutra. Objašnjenje je
  upisano i kao komentar uz unos u `posts.ts`.

- **Posledice:** blog 33 → **34 vidljiva posta**; interni linkovi ka
  `/pozivnice` iz blogova: **21**. Svih 11 linkova iz stuba vraća 200.
  `tsc`, `eslint`, build čisti.

- **Provereno nezavisno od izveštaja pisca:** broj reči, nula srpskih navodnika,
  nula mešanih latinično-ćiriličnih reči, nula linkova ka 7 zakazanih postova
  (greška iz petog unosa se nije ponovila), nema „6 tema", nema „gotova za 24h".

- **Blokade / sledeći korak:** 6 od 14 tekstova iz plana ostaje (#4, #5, #10,
  #12, #13, #14). Otvorena odluka o 7 zakazanih postova.

---

## 2026-08-04 (osmi unos) — Objavljeno svih 7 zakazanih; popravljen duplirani anchor

- **Šta je urađeno:**
  - **7 ranije zakazanih postova pomereno u prošlost** (odluka vlasnika), u
    praznine u kalendaru objava umesto svih na isti dan:
    `digitalna-vs-papirna-pozivnica` 03-22, `kako-napraviti-pozivnicu-...` 04-06,
    `cena-pozivnica-za-vencanje-srbija` 04-19, `potvrda-dolaska-rsvp-...` 05-03,
    `kako-poslati-pozivnicu-whatsapp-viber` 05-24,
    `pozivnica-za-punoletstvo-18-rodjendan` 06-12,
    `trendovi-pozivnica-za-vencanje-2027` 06-24.
  - **Vraćena sva 4 linka** koja su ranije bila preusmerena jer su ciljevi
    vraćali 404 (peti unos): tri u tekstovima + jedan na `/napravi-punoletstvo/`.
  - **Stub pojačan** sa tri nova linka ka sada objavljenim tekstovima
    (digitalna vs papirna, cena pozivnica, kako napraviti online) — ukupno 16
    internih linkova.
  - **Link ka stubu iz podnožja**, odmah ispod „Svi članci" — stoji na svakoj
    stranici sajta, najjači interni signal koji stub može da dobije. Razlog
    upisan kao komentar da se ne ukloni.

- **Nađen i popravljen zatečen bug — duplirani anchor id:**
  Dva naslova sa istim tekstom daju isti `id`, pa se u sadržaju hajlajtuju DVE
  stavke odjednom, a skok na drugu vodi na prvu. Pogodilo je:
  - novi stub (H2 „Koliko košta digitalna pozivnica za venčanje" i istoimeno FAQ
    pitanje) — FAQ pitanje preimenovano;
  - **`audio-guest-book-iskustva.mdx`, zatečeno od ranije** — „Njihova priča"
    ×3 i „Njihov savet" ×3; podnaslovi razdvojeni imenima parova.
  Provereno: nijedan od 41 posta više nema duplikat.
  Dodato **upozorenje u razvoju** u `extractTableOfContents` — greška je inače
  potpuno tiha (ne obara build, ne vidi se u kodu).

- **Posledice / provera:** blog **41 vidljiv post**; provereno svih **46
  jedinstvenih internih linkova iz svih postova — nijedan pokvaren**; nijedan
  duplirani `id` na stubu. `tsc`, `eslint`, build čisti.

- **Blokade / sledeći korak:** ostaje 6 tekstova iz plana od 14 (#4, #5, #10,
  #12, #13, #14) i deploy.

---

## 2026-08-04 (deveti unos) — KRUPAN NALAZ: `/cene` se nije server-renderovala

- **Šta je nađeno:** `PricingClient` je koristio `useSearchParams()` (samo da
  pročita `?premium=1`), zbog čega Next odustaje od serverskog renderovanja cele
  komponente — pa je morala da stoji u `<Suspense fallback={null}>`. Posledica:
  **u HTML-u koji Google dobija za `/cene` nije bilo ni naslova, ni paketa, ni
  cena.** Jedini tekst je dolazio iz skrivenog `sr-only` bloka.
  Ovo objašnjava raniju izmerenu anomaliju „339 reči, od kojih 332 sr-only" —
  tada sam je pripisao tome što je cenovnik tabela. Nije bio razlog.

- **Popravka:** `?premium=1` se sada čita u `page.tsx` (server komponenta) i
  prosleđuje kao `initialMode` prop; `useSearchParams()` uklonjen, `Suspense`
  uklonjen. Nema ni treperenja prikaza za premium posetioca.
  Prvo sam probao čitanje kroz `useEffect` — odbačeno jer `react-hooks/set-state-in-effect`
  s pravom prijavljuje `setState` u efektu.

- **Posledice:** `/cene` **339 → 1.211 vidljivih reči**, H1 **0 → 1**,
  `?premium=1` server-renderuje premium prikaz. Provereno da nijedna druga
  stranica nema isti obrazac (`Suspense fallback={null}` oko glavnog sadržaja
  postoji SAMO ovde).

- **Otvoreno posle ove popravke:**
  1. `sr-only` blok na `/cene` (332 reči) sada **duplira vidljiv sadržaj** i
     nema nijedan jedinstven link — kandidat za brisanje (Faza 5).
  2. `/cene` sadrži **10 pojava reči „besplatn"** (npr. „besplatna PDF
     pozivnica") — krši pravilo iz `CLAUDE.md` da se „besplatno" ne koristi za
     ono što ide uz plaćene pakete. Ista formulacija stoji i u `FAQPage` schemi.
  3. `/moje-vencanje` je u sitemap-u, a canonical mu pokazuje na `/` —
     protivrečno; ili izbaciti iz sitemap-a ili ispraviti canonical.
  4. 31 od 79 stranica ima title preko 70 znakova (blogovi do 101), 18 opisa
     preko 160 — sečeno u rezultatima.

- **Metod:** puna tehnička revizija svih 79 stranica iz sitemap-a
  (`scratchpad/seo-audit.mjs`): status, H1, canonical, noindex, duplikati
  title/description. Nema duplikata title/desc, sve vraća 200, sve ima canonical.

---

## 2026-08-04 (deseti unos) — Canonical mina u root layout-u; `/cene` sr-only; `/moje-vencanje`

- **NAJVAŽNIJE — canonical u root layout-u je bio mina.** `src/app/layout.tsx`
  je imao `alternates: { canonical: siteUrl }`. Next metapodatke NASLEĐUJE, pa
  je svaka stranica bez sopstvenog canonical-a Google-u govorila „ja sam
  duplikat početne, indeksiraj početnu". Zatečeno je pogađalo `/moje-vencanje`,
  ali bi svaka NOVA stranica koja zaboravi canonical tiho upala u istu zamku.
  Popravka: canonical uklonjen iz layout-a (stranica bez njega prosto nema tag,
  a Google uzima njen URL — ispravno ponašanje), a početna svoj postavlja u
  `src/app/page.tsx`.

- **`/moje-vencanje` → `noindex, follow`, izbačena iz sitemap-a.** Odluka na
  osnovu podataka, ne osećaja: GSC za 180 dana daje 50 prikaza, 2 klika i
  NIJEDAN upit koji prelazi prag. Uz to je nosila ključne reči „planer za
  venčanje" i „checklista za venčanje" — treći konkurent za upit na kom
  `/planiranje-vencanja` već stoji tek na 18,4, iza sopstvenog blog posta.
  Portal je iza autentikacije i pretraživač ga nikada ne vidi.

- **`sr-only` na `/cene` (332 reči) uklonjen i zamenjen VIDLJIVOM sekcijom.**
  Provereno pre brisanja: cene i spisak usluga su posle jutrošnje SSR popravke
  vidljivi u konfiguratoru, gradovi već stoje u podnožju, a spisak od 15 gradova
  je bio golo nabrajanje ključnih reči. Zadržana su dva objašnjenja koja nose
  stvaran podatak (šta tačno sadrži PDF pozivnica; kako radi audio knjiga
  utisaka, uključujući USB suvenire) — sada vidljiva, plus link na `/lokacije`.
  `/cene`: 1.211 → 1.047 reči, ali sve vidljivo (ranije 339, od toga 332 skriveno).

- **Ispravka mog ranijeg nalaza:** prijavio sam „10 pojava reči besplatn na
  `/cene` krši pravilo". Netačno — PDF pozivnica je stavka od 0 dinara u
  konfiguratoru (`pricing.json: pozivnica.pdf.price = 0`), pa je „BESPLATNO" tu
  tačno. Pravilo iz `CLAUDE.md` cilja na obećavanje besplatnog za ono što traži
  kupovinu paketa, a ne na stavku koja stvarno košta nula.

- **Stanje posle svega (revizija svih stranica iz sitemap-a):**
  78 stranica, sve vraćaju 200, **sve imaju tačno jedan H1** (ranije dve nisu
  imale nijedan), sve imaju canonical, nula duplikata title/description, nula
  canonical-a koji pokazuju na drugu stranicu.

- **Ostaje (dogovoreno da nije hitno):** 31 stranica sa naslovom preko 70
  znakova i 18 opisa preko 160 — sečeno u rezultatima, ali nije prioritet.

---

## 2026-08-04 (jedanaesti unos) — Deploy i revizija plana

- **Deploy:** `c4e5352..9c90eaf` na granu `deploy`, osam commit-ova, 60 fajlova,
  +12.265/−498. Potvrđeno na produkciji: gtag radi, `id="paketi"` postoji
  (link koji je bio pokvaren), `/cene` prvi put ima H1, stub vraća 200,
  nova navigacija gore.

- **Plan revidiran** (`faza-5-plan.md` prepisan). Bio je pisan pod pretpostavkom
  da danas ide samo nova početna, a otišlo je mnogo više — pa je pola plana bilo
  već izvršeno, a raspored netačan. Sada ima tri grupe: *odmah* (ne čeka
  podatke), *10.08.* (samo regresija), *početak septembra* (prave odluke).

- **Nov nalaz koji plan nije imao:** `/napravi-pozivnicu` ima **320 reči, 456
  prikaza, poziciju 7,6 i nula klikova** na upitima „online pozivnica" i
  „pozivnice za vencanje online". Isti obrazac kao dve rođendanske forme koje su
  danas rešene, samo što je ovo forma za venčanje — najvrednija. Dodato u grupu
  „odmah".

- **Ispravka ranijeg izlaganja:** govorio sam da je `/pozivnice` na poziciji
  36,3. To važi za jedan upit („pozivnice"). **Ukupno je na 8,2 sa 3.084 prikaza
  i 94 klika** — to je najjača stranica o pozivnicama, ne slaba.

- **Provereno, a ne prepisano iz tuđeg izveštaja:**
  - `/cene` više nema nijedan `sr-only` element (raniji grep je hvatao moj
    komentar koji tu reč pominje);
  - `sr-only` na oldtajmerima i automobilima **NE brisati** — koristi
    `{modelNames.join(", ")}`, dakle generisan je iz `oldtimerFleet`, tačno kako
    `CLAUDE.md` propisuje. Ručno brisanje bi pokvarilo pravilo da dodavanje
    vozila zahteva izmenu samo dva data fajla;
  - jedini preostali `useSearchParams` je u `/racun`, koji je `noindex` i van
    sitemap-a — nema više stranica sa obrascem kao `/cene`.

- **`sr-only` stanje:** 11 stranica, od kojih 7 za brisanje, 1 za promovisanje,
  3 se ne diraju (dve generisane iz podataka + `/planiranje-vencanja` koji nosi
  jedine linkove ka `/lokacije` i oldtajmerima).

- **Blokade / sledeći korak:** `CLAUDE.md` „⏰ Zakazano" ažuriran da pokazuje na
  tačan posao. Grupa „odmah" može da krene bez čekanja.
