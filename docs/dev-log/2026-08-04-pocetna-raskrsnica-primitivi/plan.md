# Početna kao raskrsnica + dizajn primitivi

- **ID:** 2026-08-04-pocetna-raskrsnica-primitivi
- **Status:** in-progress
- **Created:** 2026-08-04
- **Owner:** Aleksa

Izvor: `C:\Users\Aleksa\.claude\plans\jebeno-mi-se-svidja-glistening-hennessy.md`

## Why

Početna se „beskrajno lista". Merenje je dalo neočekivan nalaz — broj reči nije
bio daleko od konkurencije (pozivamote.rs), ali je stranica nosila **16 sekcija
za osam proizvoda**, sa `PainPointSolution` i `Concept` kao dve sekcije iste
poruke (obe bez ijednog CTA), `HowItWorks` koji prepričava četiri sekcije iznad
sebe, i `sr-only` blokom koji duplira sve.

Dizajn sistem nije postojao kao kod: blok zaglavlja sekcije bio je prepisan 91
put u 23 fajla, uz 10 varijanti H2, 4 skale paddinga, 25 varijanti kartica i 20
varijanti istog dugmeta.

## Goals

- Početna **usmerava**, ne prodaje sve odjednom — pune priče na proizvodnim stranicama
- 16 → 8 sekcija; opaženi skrol znatno kraći
- Dizajn primitivi kao kod, sa analitikom ugrađenom u njih
- Usput popraviti zatečene greške (v. „Rešeno" u logu)

## Non-Goals

- Menjanje brenda (boje, serif naslovi, natpisi razmaknutih slova) — ostaje netaknut
- Skraćivanje teksta na podstranicama (Faza 5, tek 4 nedelje posle deploy-a)
- Diranje gradskih i vendor lista u podnožju (rizik R6)

## Decisions

1. Početna je **raskrsnica**; ton ostaje „vi".
2. Blog izlazi iz zaglavlja u podnožje kao „Saveti i ideje"; `/blog` se ne menja.
3. Zaglavlje: `Cene · Pozivnice · Raspored i pano ▾ · Iznajmljivanje ▾ · [MOJE VENČANJE]`.
4. `sr-only` blokovi se uklanjaju.
5. **Odstupanje od skice plana:** `Product.priceNote` je funkcija `() => string`,
   ne `string`. Skica plana ga je definisala kao string, ali tvrđe pravilo
   „nijedna cena se ne piše kao string" pobeđuje — `priceNote` nosi cene
   (`uz pozivnicu 2.500 din`), pa mora da se računa lenjo iz `pricing.json`.
6. **FAQ ostaje na 8 pitanja, nije skraćen na 6.** Plan je tražio 8 → 6, ali R1
   propisuje da GSC izveštaj bude *uslov* pre brisanja sadržaja — a FAQ je
   upravo *odredište* za upite koji gube svoju sekciju. Skraćivati ga pre nego
   što se zna koji upiti rangiraju je obrnuto od namere. Odluka se preispituje
   kad stignu GSC podaci.
7. **Stare landing komponente se ne brišu odmah** iako su bez ijedne reference.
   Next ih ne pakuje (tree-shaking), ne koštaju ništa u bundle-u, a drže
   povlačenje na jedan `git revert`. Brišu se tek kad GSC potvrdi da ništa nije
   izgubljeno.

## Impact

- `src/app/page.tsx` — prepisan
- `src/components/ui/{Section,SectionHeader,Card,CtaButton}.tsx` — novi primitivi
- `src/data/products.ts` — nov, jedini izvor istine za spisak proizvoda
- `src/components/landing/{ProductGrid,WhyUs,Process,PriceStrip,SectionKontakt}.tsx` — nove
- `src/components/layout/header/Navbar.tsx` — `navLinks` izveden iz `products.ts`
- `src/components/layout/footer/Footer.tsx` — kolona „Blog" → „Saveti i ideje"
- `src/components/analytics/AnalyticsProvider.tsx` — popravljen `faq_interaction`
- Obrisano: `layout/header/{NavbarShell,MobileMenu}.tsx` (mrtav kod)
- **Bez reference, zadržano radi povlačenja:** `Concept`, `PainPointSolution`,
  `HowItWorks`, `CTABar`, `Packages`, `Section{Invitations,Raspored,Premium,
  Planer,Audio,Galerija,Rodjendani}`

## Dependencies

- **Faza 0 (merenje) je blokirala Fazu 2 preko R1** — GA4/GSC pristup nije
  postojao. Rešeno instaliranjem `ga4` i `gsc` MCP servera; čeka se samo da
  service account dobije Viewer/Full pristup.
- Faza 4 (12 marketinških stranica) zavisi od primitiva iz Faze 1 ✓
- Faza 5 zavisi od GSC podataka **4 nedelje posle** deploy-a Faze 3

## Risks

| # | Rizik | Ublažavanje |
|---|---|---|
| R1 | Početna gubi tekst pa pada za generičke upite | GSC izveštaj kao uslov pre brisanja sekcija; FAQ zadržan na 8 pitanja |
| R2 | Rangiranje se seli sa početne na proizvodne stranice | Namerno — smanjenje kanibalizacije. Pozicija i CTR mogu pasti 2–4 nedelje, ne reagovati panično |
| R3 | Tiho gašenje analitike (`section_view`, `cta_click`, `faq_interaction`) | Tri tvrda ograničenja ugrađena u primitive + provera brojanjem u `curl`-ovanom HTML-u |
| R4 | Anchor linkovi u prazno | Svih 7 `id`-jeva provereno u renderovanom HTML-u |
| R7 | Pad konverzije jer početna više ne prodaje detaljno | Meriti klikove iz mreže naspram ranijih klikova iz sekcija. Povlačenje: vratiti pune sekcije za tri glavna proizvoda (komponente su namerno zadržane) |
| R8 | Produkcija bez staging-a | Preview deploy na Vercelu + provera na stvarnom telefonu. **Nikad dve faze u jednom deployu** |

## Steps

- [x] **Faza 1 — dizajn primitivi** — `Section`/`SectionHeader`/`Card`/`CtaButton` u `src/components/ui/`. _Acceptance:_ `git status` ne pokazuje nijednu izmenjenu postojeću stranicu. (log: 2026-08-04)
- [x] **Faza 2 — nova početna** — `products.ts` + 5 novih sekcija + prepisan `page.tsx`. _Acceptance:_ 8 `<section>` u `<main>`, svih 7 `id`-jeva prisutno, tačno 1 `FAQPage` schema, svih 15 linkova 200. (log: 2026-08-04)
- [x] **Faza 3 — navigacija** — zaglavlje iz `products.ts`, blog u podnožje. _Acceptance:_ `/raspored-sedenja` prvi put ima link u zaglavlju. (log: 2026-08-04)
- [x] **Faza 6 — čišćenje** — mrtav kod obrisan, `CLAUDE.md` ažuriran, dev-log zaveden. (log: 2026-08-04)
- [x] **Faza 0 — merenje** — GSC pročitan u punom obimu (180 dana) preko `scripts/analytics-baseline.mjs`; `baseline.json` + `gsc-izvestaj.md` u ovom folderu. GA4 raščlanjenje po `section_id`/`depth_percent` za prošlost NE POSTOJI i ne može se dobiti — v. sledeći korak. (log: 2026-08-04)
- [x] **Analitika vraćena i podešena** — GA4 + Clarity ponovo montirani (uklonjeni 2026-03-19 zbog brzine), `AnalyticsProvider` prvi put montiran i popravljen (obnavljanje po ruti, prag za visoke sekcije), GA4 property dobio 12 custom dimenzija + key event + 14 meseci retencije. _Acceptance:_ CDP provera hvata `cta_click`/`faq_interaction`/`scroll_depth`/`section_view` na gtag-u. (log: 2026-08-04)
- [ ] **Deploy** — analitika i refaktor početne kao **dva odvojena deploy-a** (R8), da se efekat može razdvojiti. Preview na Vercelu, provera na telefonu, pa merge.
- [ ] **Faza 4 — primitivi na 12 marketinških stranica** — jedan commit po stranici. _Acceptance:_ po stranici isti broj H2 i identičan izvučen tekst (`diff` pre/posle).
- [ ] **Faza 5 — `sr-only` i duge stranice** — tek 4 nedelje posle deploy-a Faze 3, sa GSC podacima.

## Verification

Posle svake faze:
1. `npx tsc --noEmit` i `npx eslint` na izmenjenim fajlovima
2. `NEXT_BUILD_CPUS=1 npx next build` — sa više radnika build lokalno pada na generisanju OG slika
3. `npx next start -p 3000` pa provere preko `curl` (ne u pregledaču — greške u analitici se ne vide vizuelno)
4. `document.body.scrollHeight` na 390px i 1440px preko CDP-a, poređenje sa produkcijom

**Povlačenje:** `git revert` commita. Stare landing komponente su namerno
zadržane u stablu, pa je vraćanje pune sekcije za bilo koji proizvod izmena od
jedne linije u `page.tsx`.

## Open questions

- Koji upiti sa GSC pozicijom ≤10 vise o obrisanim sekcijama? (blokira Fazu 5 i
  konačnu odluku o brisanju starih komponenti)
- Da li FAQ ipak ide na 6 pitanja — odluka čeka GSC podatke.
