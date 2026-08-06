# Samostalna QR galerija: eksplicitni marker + admin tab

- **ID:** 2026-08-06-samostalna-galerija-admin
- **Status:** code-complete
- **Created:** 2026-08-06
- **Owner:** Aleksa

## Zašto

Samostalna galerija se prodaje kao zapis u `couples` (`draft: true` +
`paid_for_gallery: true`), ali nijedno polje nije govorilo „ovo je kupac
galerije" — status se **pogađao** iz kombinacije flagova (`src/lib/couples.ts`,
stara `isGalleryOnlyCouple`). Tri posledice:

1. **Produkcijski bag — klijent plaćanjem gubi pristup.** Par registrovan preko
   `/planiranje-vencanja` ima identičan potpis (`draft: true`, sve
   `paid_for_*: false`). Čim dokupi galeriju, `kinds.ts` upali
   `paid_for_gallery: true`, heuristika ga proglasi gallery-only i **zaključa mu
   checklistu, budžet, vendore i goste** koje je legitimno koristio. Latentno —
   nije još pogodilo pravog klijenta (v. nalaz u `log.md`).
2. **Obrnuti false-positive.** Kupac sa `/qr-galerija-slika-sa-vencanja` NIJE
   gallery-only dok ne plati, pa do uplate vidi ceo planer, a posle uplate mu se
   sve zaključa.
3. **Operativna nevidljivost.** Gallery-only kupci stoje izmešani među
   pozivnicama, bez badge-a i filtera, a admin **nije imao način da klijentu
   kreira pristup** — jedini ulaz je javna forma sa reCAPTCHA + SMS.

## Ciljevi

- Eksplicitno polje umesto heuristike, otporno na dokup i na storno.
- Admin kreira pristup klijentu iz panela: slug + lozinka + QR + slanje pristupa.
- Gallery-only kupci vidljivi i odvojeni od pozivnica u adminu.
- Portal pre uplate zaključan, sa CTA ka plaćanju umesto praznog albuma.

## Van obima

- Zasebna `standalone_galleries` kolekcija. Sva infrastruktura galerije (foto
  metapodaci, R2, lifecycle cron, payments adapter, gostinska strana, cascade
  delete) već je vezana za `couples` i radi; nova kolekcija bi bila veliki
  refaktor bez dobitka.
- Promo/discount kod za galeriju (raspored ga ima, galerija i dalje nema).

## Odluke

| Odluka | Obrazloženje |
|---|---|
| `standalone_gallery?: boolean` | Poravnato sa rečnikom `standalone-seating.ts` i sa snake_case flagovima. Enum `product?: "galerija"` odbačen jer bi tražio vrednost za sve ostale tokove nastanka. Ime `gallery_only` odbačeno jer bi lagalo čim klijent dokupi — polje je **poreklo**, ne stanje. |
| Marker se NIKAD ne briše | `paid_for_gallery` se piše sa šest mesta u `kinds.ts` plus admin toggle. Da je polje mutabilno, svako bi moralo da zapamti da ga očisti; jedan propust = zaključan klijent koji je platio. Druga klauzula derivacije („nema drugog plaćenog proizvoda") rešava isto sa nula izmena u `kinds.ts`, i sama se poništava na storno. |
| `paid_for_gallery` IZBAČEN iz derivacije | Kupac je gallery-only od signup-a, pre uplate — nestaje whiplash „ceo portal pa oduzimanje posle plaćanja". |
| Novi, šesti admin tab „Galerija" | Odluka vlasnika. Mutacije (toggle, +1 dan, brisanje) idu na postojeći `/api/admin/couples/[slug]`, pa je nov samo `POST`. |
| Admin-kreirana galerija je odmah plaćena | Admin kreira pristup tek pošto je klijent uplatio; jedan korak manje i nema zaboravljenog toggle-a. |
| Datum i telefon obavezni u admin formi | Lifecycle se računa iz `event_date`; oba SMS podsetnika idu samo ako `contact_phone` počinje sa `+`. Za razliku od self-serve forme, admin nema opravdanje da ih preskoči. |

## Uticaj

- **Model:** `WeddingData.standalone_gallery` (novo polje). `getGalleryCouples`
  projekcija netaknuta — cron gađa `paid_for_gallery`, marker mu ne treba.
- **Portal:** `nav-items` / `LockedFeatureCard` / `MojeVencanjeClient` —
  zaključavanje pre uplate.
- **Admin:** šesti tab, pilula „QR galerija" na redu pozivnice, tab Pozivnice
  filtrira gallery-only.
- **Deljenje:** `/pristup/[token]` dobio `gallery` granu; ranije je kupcu
  galerije nudio link ka nepostojećoj pozivnici.
- **Nedirano namerno:** `payments/kinds.ts`, `api/cron/gallery`,
  `gallery-lifecycle.ts`, `gallery.ts`, cascade delete u `couples/[slug]`.

## Zavisnosti

- Backfill (`scripts/backfill-standalone-gallery.mjs`) morao je da prethodi
  prebacivanju derivacije. **Ispalo bespredmetno** — u produkciji nema nijednog
  gallery-only para, pa je skripta no-op i sve je moglo u jedan deploy.

## Rizici

| Rizik | Stanje |
|---|---|
| Prebacivanje derivacije otključa postojeće gallery-only klijente | **Otklonjen merenjem** — nula takvih zapisa u produkciji. |
| Backfill cementira planer-parove iz baga #1 | Skripta klasifikuje `SET`/`REVIEW` (wedding_portal, locations/timeline, prazan groom + classic_rose) i piše samo `SET`. |
| Stari **neplaćeni** gallery signup-i nisu razlučivi od planer-signup-a | Svesno ne-backfill-uju se; vide pun planer. Greška u korist klijenta; skup se ne širi jer novi signup-i dobijaju marker na create-u. |
| Admin create bi ulogovao admina kao klijenta | Izbegnuto: admin put ide na `upsertCouple`, nikako `quickRegisterCouple` (ona postavlja kolačiće u pregledaču pozivaoca). |

## Koraci

- [x] **Temelj bez promene ponašanja** — `standalone_gallery` u `WeddingData`;
  čist predikat u `src/lib/gallery-only.ts` (bez DB importa, da ga smeju i
  klijentske komponente); `toPortalCoupleInfo` u `couples.ts` i dva duplirana
  potrošača svedena na njega. _Acceptance:_ `tsc` čist, ponašanje nepromenjeno.
  (log: 2026-08-06)
- [x] **Zajednički builder + upis markera** — `src/lib/standalone-gallery.ts`
  (`buildStandaloneGalleryCoupleData`, `createStandaloneGalleryCouple`);
  self-serve akcija prelazi na builder. _Acceptance:_ oba toka prave identičan
  oblik zapisa sa markerom. (log: 2026-08-06)
- [x] **Admin tab i API** — `POST /api/admin/galleries` (`isAdminRequest`),
  `GalleryAdminTab.tsx`, `src/lib/gallery-qr.ts`, šesti tab + pilula.
  _Acceptance:_ 401 bez kolačića, 400 na svaku nevalidnu stavku, 200 vraća
  `{slug, password}`. (log: 2026-08-06)
- [x] **Backfill skripta** — dry-run default, `SET`/`REVIEW` klasifikacija,
  `--apply`, `--exclude`. _Acceptance:_ dry-run na produkciji ispravno javlja
  nula kandidata. (log: 2026-08-06)
- [x] **Prebacivanje derivacije + portal + filter + /pristup**. _Acceptance:_
  dokup otključava portal bez izmene markera; storno vraća. (log: 2026-08-06)
- [x] **Ključ u linku + QR vezan za dan + istekla galerija kao upsell** —
  `gallery_key`, `guestGate`, tri stanja gostinske stranice, `not-found.tsx` sa
  ponudom, keyed link i QR dugme na `/pristup`. _Acceptance:_ QR posle prozora
  daje 404 + ponudu; keyed link radi pre događaja; ni jedan ni drugi ne rade
  posle d1. (log: 2026-08-06)
- [ ] **Deploy + proba na terenu** — kreirati pravu galeriju iz admina,
  odštampati QR, proveriti da SMS podsetnici stižu na d4/d5.
- [ ] **Odluka: isti ključ i na seating galeriji?** — `/raspored-sedenja/...`
  rute nisu dirane i ponašaju se kao pre.

## Verifikacija

`npx tsc --noEmit`, `npx eslint` na dodirnutim fajlovima, `npm run build`, pa
**`npm start`** (ne `next dev` — vraća 404 na non-GET dinamičke API rute:
trailingSlash + Node 24). E2E: admin auth granice → kreiranje → portal login →
gostinska strana → share stranica → simulacija dokupa i storna → gašenje
plaćanja → brisanje sa proverom kaskade. Invarijanta
`rg -l jwtVerify src/app/api/admin/` mora ostati prazna.

Rollback: sve je aditivno. Vraćanje starog tela `isGalleryOnlyCouple` vraća
staro ponašanje; `standalone_gallery` ostaje u bazi kao bezopasno polje.

## Otvorena pitanja

- `/pozivnica/{slug}/` za gallery-only zapis renderuje **prazan freemium
  pregled** sa vodenim žigom (Freemium B3 ponašanje, `draft` više ne 404-uje).
  Noindex je, i postojeći self-serve tok to već proizvodi — ali je besmislena
  stranica za kupca koji nikad nije hteo pozivnicu. Da li je gejtovati?
- Galerija i dalje nema promo/discount kod (`LS_DISCOUNT_*`).
