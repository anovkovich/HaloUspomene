## 2026-08-29 — Task kreiran i isplaniran

- **Šta je urađeno:** Napisan `plan.md` za novu funkciju "Pokloni" (evidencija
  svadbenih poklona) na `/moje-vencanje` — dugme na Pregledu koje se
  pojavljuje na dan venčanja i ostaje trajno, nova MongoDB kolekcija
  `pokloni` (eksplicitan zahtev vlasnika, ne embedovanje u `wedding_portal`),
  pretraga/link ka postojećoj Listi zvanica, numerički (RSD/EUR) ili opisni
  unos, suma na dnu. Istraženi postojeći obrasci: `MeniCard.tsx` (forma+lista
  po uzoru), `GuestsCard.tsx` `InviteePickerModal` (fuzzy pretraga zvanica),
  `src/lib/portal.ts` (facade oblik), DELETE kaskada u
  `src/app/api/admin/couples/[slug]/route.ts`, `LINKED_COLLECTIONS` u
  `scripts/lib/couple-slug.mjs`. Nema pisanog koda — čisto planiranje.
- **Commit / PR:** —
- **Na šta utiče dalje:** Implementacija čeka odgovore na 4 otvorena pitanja
  (besplatno vs. plaćeno, trajna nav stavka da/ne, jedan-poklon-jedno-ime
  model, i OpenCode provider/API ključ) — v. `plan.md` Open questions.
- **Posledice:** Nema još — čist planning dokument, ništa u kodu nije
  dirnuto.
- **Šta je rešeno:** Definisan tačan data model, spisak fajlova koje treba
  dirati (uključujući lako-zaboravljena mesta: kaskadno brisanje, rename
  skript, `MojeVencanjeClient.tsx`-ova višestruka mesta za `?tab=`), i proces
  delegiranja implementacije OpenCode CLI-ju pod Claude orkestracijom.
- **Šta je odblokirano:** Ništa još — implementacija čeka vlasnikovu potvrdu
  otvorenih pitanja i prijavu OpenCode-a na pravog model provajdera
  (`opencode providers list` trenutno vraća 0 kredencijala).
- **Status:** — → planned
- **Blokade / sledeći korak:** (1) vlasnik odgovara na 4 pitanja iz
  `plan.md`; (2) vlasnik pokreće `opencode providers login` sa pravim
  provajderom; tek onda Claude počinje korak "Data layer" i deleguje
  implementaciju.

## 2026-08-29 — Odluke potvrđene, spreman za implementaciju

- **Šta je urađeno:** Vlasnik odgovorio na otvorena pitanja: (1) Pokloni je
  **besplatna** funkcija — bez `payments/kinds.ts`; (2) **BEZ trajne nav
  stavke** — dostupno isključivo preko dugmeta na Pregledu (smanjuje obim:
  `NAV_ITEMS` u `nav-items.tsx` i mobilni bottom-nav/sidebar overlay u
  `MojeVencanjeClient.tsx` se ne diraju; `ActiveView` union + jedan
  `LOCKED_FEATURE_INFO` unos i dalje neophodni zbog `Record<ActiveView,...>`
  tipa); (3) za OpenCode orkestraciju — **bez API ključa**, koriste se
  OpenCode Zen besplatni modeli (vlasnik pomenuo "0xAlpha" i "BigPickle";
  samo `opencode/big-pickle` potvrđen u `opencode models`). `plan.md`
  ažuriran: Decisions #2/#3 označene rešenim, Impact/Steps/Open questions
  usklađeni sa smanjenim obimom, Status → in-progress.
- **Commit / PR:** —
- **Na šta utiče dalje:** Implementacija (Steps iz `plan.md`) može da počne.
  Sledeći korak je "Data layer" (`src/lib/pokloni.ts` + tipovi), delegiran
  OpenCode-u pod uzanim promptovima po koraku.
- **Posledice:** Nema izmena u kodu još. Rizik zabeležen: besplatni Zen
  modeli su slabiji, pa svaka OpenCode izmena mora proći `tsc --noEmit` +
  ručnu proveru pre nego što se pređe na sledeći korak.
- **Šta je rešeno:** Sva tri glavna otvorena pitanja o obimu i alatu.
- **Šta je odblokirano:** Implementacija — nema više spoljnih blokada.
- **Status:** planned → in-progress
- **Blokade / sledeći korak:** Nema blokada. Sledeći korak: OpenCode piše
  `src/lib/pokloni.ts` + `GiftEntry`/`PokloniData` tipove u `types.ts`, Claude
  pregleda diff i pokreće `tsc --noEmit`.

## 2026-08-30 — Implementacija (svih 6 koraka) kroz OpenCode orkestraciju

- **Šta je urađeno:** Rad odrađen na lokalnoj grani `pokloni-tracker`
  (odvojena od `deploy` pre bilo kakve izmene koda — produkciona grana se ne
  dira dok se ne verifikuje). Svih 6 koraka iz `plan.md` predato OpenCode-u
  (`opencode/big-pickle`, besplatan Zen model) kao uzani promptovi sa TAČNO
  specificiranim sadržajem po fajlu (Claude je dizajnirao svaki fajl unapred,
  OpenCode je mehanički pisao/menjao): `src/lib/pokloni.ts` (nov),
  `GiftEntry`/`PokloniData`/`GiftKind` u `types.ts`, `deletePokloni` u admin
  DELETE kaskadi + `LINKED_COLLECTIONS` u `couple-slug.mjs`,
  `loadPokloniAction`/`saveGiftsAction` u `actions.ts`, novi `src/lib/currency.ts`
  (izvučen `EUR_RATE`/`toRSD` — ranije duplirano u `OverviewCard.tsx` I
  `BudgetCard.tsx`, obe prepravljene da koriste zajednički izvor), nov
  `PokloniCard.tsx` (forma sa pretragom zvanica, numerički/opisni unos, lista,
  suma), i ožičenje (`nav-items.tsx` ActiveView+LOCKED_FEATURE_INFO bez
  NAV_ITEMS reda, CTA dugme na `OverviewCard.tsx` gejtovano novim
  `isOnOrAfterWeddingDay()` helperom, `MojeVencanjeClient.tsx` lazy
  import/validTabs×2/`?tab=` sync/render grana). Svaki korak nezavisno
  provera Claude posle OpenCode-a: pun `git diff` protiv tačne specifikacije,
  ne samo OpenCode-ov sopstveni izveštaj, plus `npx tsc --noEmit` i
  `npx eslint` na kraju — oba čista.
- **Commit / PR:** — (namerno nekomitovano; grana `pokloni-tracker` čeka
  ručnu proveru u browseru pre commit-a)
- **Na šta utiče dalje:** Sledeći task koji dira `OverviewCard.tsx`,
  `BudgetCard.tsx`, `MojeVencanjeClient.tsx`, `nav-items.tsx` ili
  `types.ts` treba da zna za ove izmene (git diff na grani je izvor
  istine). Kaskadno brisanje i rename skript sada nose `pokloni` — svaki
  budući task koji dodaje NOVU slug-keyed kolekciju treba isti tretman.
- **Posledice:** Aditivne izmene, bez migracije. `EUR_RATE`
  ekstrakcija je jedina izmena postojeće logike (mehanička, isto ponašanje)
  — pomno provereno da nijedna vrednost formule nije promenjena.
  **VAŽAN NALAZ o alatu:** `opencode/big-pickle` je DVA PUTA (Koraci 5 i 6)
  ignorisao eksplicitnu instrukciju "ne diraj ovaj fajl" i samoinicijativno
  dodao `pathname.includes("/gde-sedim")` (i još par ruta za
  BirthdayPassedGuard) u `EventPassedGuard.tsx` / novi
  `BirthdayPassedGuard.tsx` — verovatno realan, ali NEVERIFIKOVAN nalaz
  (moguće da `/gde-sedim` posle isteka venčanja treba da ostane dostupan
  kao i `/audio-knjiga`/`/galerija`, ali to nije provereno niti traženo u
  ovom tasku). Oba puta uhvaćeno `git diff` pregledom i vraćeno
  (`git checkout --`) PRE nego što je ušlo u bilo šta. Ovo potvrđuje rizik
  već zapisan u `plan.md` (besplatni model, orkestracija je jedina zaštita)
  — **svaki naredni korak sa ovim modelom mora proći isti pun `git diff`
  pregled, ne samo model-ov sopstveni izveštaj o promenama.**
- **Šta je rešeno:** Svih 6 koraka iz `plan.md` implementirano.
- **Šta je odblokirano:** Ostaje samo ručna provera pre commit-a/push-a
  (CLAUDE.md pravilo — nikad push bez lokalne verifikacije): dev server +
  test par sa `event_date` = danas, provera dugmeta/forme/sume, provera da
  draft i parovi sa budućim datumom NE vide dugme, `?tab=pokloni` deep-link.
  Odvojeni, manji task: proveriti da li `/gde-sedim` stvarno treba da
  bude u management-route izuzetku oba guard-a (nalaz OpenCode-a, netaknuto
  ovde).
- **Status:** in-progress (implementacija gotova, verifikacija u toku)
- **Blokade / sledeći korak:** Vlasnik treba da odluči: (a) da Claude sam
  napravi privremeni test par (event_date=danas) u dev bazi za ručnu
  browser proveru, ili (b) vlasnik sam radi tu proveru sa postojećim
  parom/nalogom. Tek posle toga: commit (bez push-a dok vlasnik ne odobri).

## 2026-08-30 — Browser verifikacija (Playwright) + live NBS kurs na zahtev vlasnika

- **Šta je urađeno:** (1) **Ručna browser provera, odrađena od strane
  Claude-a** (vlasnik nije morao sam): privremeni test par (`test-pokloni`,
  `event_date`=danas, lozinka `Marko1234`, 3 zvanice) kreiran preko novog
  `scripts/create-test-pokloni.mjs` (dry-run/`--clean` konvencija kao
  ostali `create-test-*` skriptovi). Pošto `next dev` 404-uje dinamičke
  non-GET API rute (poznat gotcha iz memorije), testirano je kroz `npm run
  build && npm run start`. Playwright (privremeno instaliran `--no-save`,
  posle uklonjen) je odradio pun tok: login → CTA vidljivo tačno na dan
  venčanja → prazan state → pretraga i link ka zvanici (Petar Petrović,
  Jovana Jovanović pronađeni) → slobodan unos imena van liste (Komšija
  Zoran) → numerički EUR/RSD i opisni unos → suma tačna → brisanje stavke
  → **F5 reload i podaci ostaju** (potvrđuje pravi upis u bazu, ne samo
  lokalni state) → nula grešaka u konzoli. Screenshotovi u
  `%TEMP%/.../scratchpad/shots/` (van repo-a). Test podaci i privremeni
  `pokloni-e2e.mjs` skript posle uklonjeni; `playwright` dev-dependency
  deinstaliran (`--no-save`, nikad nije ušao u `package.json`).
  (2) **Vlasnik je usred provere primetio da je `EUR_RATE = 117.5`
  hardkodovan** i tražio da se čita sa zvaničnog sajta NBS umesto
  hardkodovanja. Istraženo: NBS-ov registrovani veb-servis sistem
  (`nbs.rs/sr/.../sistem-veb-servisa-NBS/`) zahteva prijavu kao pravno lice
  ili preduzetnik (vlasnik posluje kao frilenser bez firme — v.
  `project_pravni_status` memorija — verovatno ne bi kvalifikovao), ALI
  postoji javna, bez-registracije HTML stranica na istom `nbs.rs` domenu:
  `webappcenter.nbs.rs/ExchangeRateWebApp/ExchangeRate/CurrentMiddleRate`
  — testirano uživo, vraća 200 i tačan "srednji kurs" (117,3707 na dan
  provere). Implementirano: `src/lib/nbs-rate.ts` (scrape + parse te
  stranice, sanity-guard 50–300 opseg), keš u `site_config` kolekciji preko
  novih `getCachedEurRateConfig`/`setCachedEurRateConfig` u
  `src/lib/portal.ts`, osvežava se organski (najviše jednom u 24h, pri
  prvom load-u posle isteka — bez novog cron job-a), fallback lanac sveže →
  keširano → `FALLBACK_EUR_RATE`. `toRSD()` u `src/lib/currency.ts` sad
  prima `eurRate` kao parametar; `OverviewCard.tsx`/`BudgetCard.tsx`/
  `PokloniCard.tsx` ga dobijaju kao prop iz `MojeVencanjeClient.tsx`
  (učitava se jednom preko nove `getEurRateAction()` u `actions.ts`).
  `BudgetCard.tsx` je deljen sa `raspored-sedenja` standalone portalom —
  taj poziv ostaje netaknut, `eurRate` mu je opciono sa fallback default-om.
  **Ponovljena browser provera POSLE ove izmene**: ista sekvenca, suma sad
  tačno **10.869 din** (živi kurs ~117,3707) umesto **10.875 din** (stari
  hardkodovan 117.5) — razlika potvrđuje da živi kurs stvarno stiže do UI-a,
  ne samo da se kod kompajlira.
- **Commit / PR:** — (i dalje nekomitovano)
- **Na šta utiče dalje:** `src/lib/currency.ts`/`src/lib/nbs-rate.ts`/
  `src/lib/portal.ts` (`getCachedEurRateConfig`) postaju referentni izvor
  za bilo koju BUDUĆU EUR/RSD konverziju u planeru — ne dupliraj kurs
  ponovo. Ako `webappcenter.nbs.rs` ikad promeni HTML format, regex u
  `nbs-rate.ts` prestaje da nalazi red i tiho pada nazad na keširanu/fallback
  vrednost (nikad ne baca grešku ka korisniku) — vredi proveriti povremeno.
- **Posledice:** Novi spoljni mrežni poziv (server-side, ka `nbs.rs`) u
  putanji učitavanja Pregleda/Budžeta/Poklona, ali gejtovan 24h kešom pa
  pogađa spoljni sajt najviše jednom dnevno po instanci; nikad ne blokira
  render duže od 8s (timeout) i nikad ne baca — najgori slučaj je tiha
  vrednost od pre 24h+. Nema migracije; rollback je trivijalan (vrati
  `EUR_RATE` konstantu, ukloni 2 nova fajla).
- **Šta je rešeno:** Vlasnikov zahtev da kurs ne bude hardkodovan +
  potvrđeno da cela Pokloni funkcija radi u pravom browseru sa pravim
  upisom u bazu, ne samo `tsc`.
- **Šta je odblokirano:** Implementacija je sada END-TO-END verifikovana.
  Ostaje samo commit (i push, tek uz eksplicitnu vlasnikovu potvrdu).
- **Status:** bez promene (in-progress — implementacija+verifikacija
  gotove, čeka commit)
- **Blokade / sledeći korak:** Nema tehničkih blokada. Sledeći korak je
  vlasnikova odluka o commit-u/push-u.

## 2026-08-30 — PDF izvoz dodat na zahtev vlasnika

- **Šta je urađeno:** Vlasnik pitao da li postoji PDF izvoz liste poklona —
  nije bio deo prvobitnog plana (eksplicitan Non-Goal). Na "dodaj",
  implementiran: novi `src/app/moje-vencanje/generatePokloniPDF.ts` (jsPDF,
  po uzoru na `generateAudioFlyerPDF.ts` — isti font-loading obrazac,
  Cormorant za ćirilicu / JosefinSans za latinicu po `reference_pdf_fonts`
  memoriji, ime para u skript fontu), A4 lista sa automatskom paginacijom
  za duge spiskove (test parovi mogu imati 100+ poklona), tabela
  gost/vrednost, ukupno u din, broj opisnih poklona istaknut odvojeno.
  "Preuzmi PDF" dugme dodato u `PokloniCard.tsx` ispod sume, koristi
  postojeću `getWeddingDataForPDF()` akciju (ista koja već servira
  invitation PDF export) da dobije couple_names/scriptFont/useCyrillic/
  event_date. **Napomena o procesu:** prvi pokušaj sam napisao fajl
  direktno (Write alat) umesto da ga predam OpenCode-u — primećeno i
  ispravljeno pre verifikacije (fajl obrisan, ponovo urađen kroz
  `opencode run` da ostane dosledno vlasnikovom zahtevu za orkestraciju).
  Verifikovano: `git status` pokazuje TAČNO 2 nova/izmenjena fajla (nema
  van-obimskih izmena ovog puta), `diff` protiv tačne specifikacije —
  identično, `tsc --noEmit` i `eslint` čisti. **Browser provera**: build+start
  server, Playwright klik na "Preuzmi PDF", presreo pravi download event,
  sačuvao fajl — 43.391 bajtova, počinje sa `%PDF` headerom, vizuelno
  pregledan (Read alat čita PDF) — ispravan izgled, imena para u skript
  fontu, tabela, tačna suma (5.869 din za 50 EUR po živom NBS kursu).
- **Commit / PR:** — (i dalje nekomitovano)
- **Na šta utiče dalje:** Ništa spolja — nov, samostalan fajl + jedno dugme
  u već novom `PokloniCard.tsx`, nema uticaja na postojeće PDF generatore.
- **Posledice:** Aditivno, nema migracije. Rollback: obriši
  `generatePokloniPDF.ts` i ukloni dugme + `handleExportPDF` iz
  `PokloniCard.tsx`.
- **Šta je rešeno:** Vlasnikov zahtev za PDF izvoz.
- **Šta je odblokirano:** Ništa dodatno — feature je sad kompletan i po
  ovoj poslednjoj stavci. I dalje čeka samo commit/push odluku.
- **Status:** bez promene (in-progress — implementacija+verifikacija
  gotove, čeka commit)
- **Blokade / sledeći korak:** Isto kao pre — vlasnikova odluka o
  commit-u/push-u.
