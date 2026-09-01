# Log — Samostalna QR galerija: eksplicitni marker + admin tab

## 2026-08-06 — Indeksi, grupisanje u bazi, ZIP u delovima, QR sa ikonicom

- **Šta je urađeno:**
  - **`scripts/create-gallery-indexes.mjs` + pokrenuto na produkciji.**
    `gallery_photos` je imala samo `_id_`, a svaki upload confirm radi TRI
    `countDocuments` (po slugu, po uređaju, po IP-u) pre upisa — svadba sa 500
    slika je pravila ~1500 punih skanova nad kolekcijom koja raste celo veče.
    Dodato: `{slug, approved, createdAt}`, `{slug, uploaderId}`, `{slug, ip}`.
  - **Grupisanje po gostu preseljeno u Mongo** — nova
    `getGalleryUploaderStacks()` (`$match` → `$sort` → `$group` → `$sort`).
    Javna stranica je učitavala do 2000 redova da bi nacrtala ~100 gomilica;
    sada dobija tačno onoliko redova koliko ima gostiju. Prebačena sva tri
    potrošača: `/pozivnica/[slug]/galerija`, `/pozivnica/[slug]/gde-sedim`,
    `/raspored-sedenja/[slug]/gde-sedim`. `GalerijaClient` radi nad
    `initialStacks` (uz `stacksFromPhotos` kao rezervu) i posle slanja sam
    ažurira svoju gomilicu. `PUBLIC_LOAD_CAP` više nije potreban.
  - **ZIP se deli na delove od 200 MB** (`GalleryCard.downloadSelected`).
    Zipovanje drži i izvorne blobove i arhivu u memoriji taba; jedan ZIP preko
    cele svadbe je rušio pregledač na telefonu. Jedan deo zadržava staro ime
    fajla; više delova dobija `-deo-N-od-M` i razmak od 800 ms da pregledač ne
    odbaci uzastopna preuzimanja.
  - **QR za galeriju dobio ikonicu fotoaparata** — `galleryQrDataUrl()` crta QR
    na canvas sa `errorCorrectionLevel: "H"` i utisne belu pločicu sa lucide
    „camera" glifom u brend crvenoj. Pločica pokriva 22% širine ≈ 4,8% površine,
    daleko unutar 30% koje nivo H podnosi. Primenjeno na **oba** mesta gde se
    QR za galeriju generiše: `downloadGalleryQR` (admin tab + `/pristup`) i
    `PortalClient` (PNG + A6 flajer preko novog `qrDataUrl` u `QrFlyerInput`).
    Audio QR namerno ostaje bez ikonice.
- **Commit / PR:** —
- **Na šta utiče dalje:** `GalerijaClient` više ne prima listu slika za javni
  prikaz; svaki nov potrošač treba da šalje `initialStacks`.
- **Posledice:**
  - Javna stranica: payload je sa ~500 KB (2000 redova) pao na ~5 KB (broj
    gostiju), i ne raste sa brojem slika. Nema više tihog odsecanja na 2000.
  - Upiti nad `gallery_photos` sada koriste indeks (potvrđeno `explain` →
    IXSCAN umesto COLLSCAN).
  - Rollback: indeksi se mogu obrisati bez posledica po kod; grupisanje se vraća
    prosleđivanjem `initialPhotos` umesto `initialStacks`.
- **Šta je rešeno:** tri uska grla koja bi se prvi put videla tek na velikoj
  svadbi — kad je najgore vreme da se vide.
- **Šta je odblokirano:** galerija bez straha na svadbi sa nekoliko stotina
  gostiju.
- **Status:** code-complete (nepromenjen)
- **Blokade / sledeći korak:** —

### Verifikacija

30 test slika kroz 5 gostiju (uključujući jednog bez imena): agregacija vraća 5
grupa sa tačnim brojevima, prazno ime → „Gost", cover je najnovija slika svakog
gosta. Stranica ispisuje „30 fotografija · 5 gostiju", a u HTML-u se pojavljuje
5 URL-ova umesto 30. `explain` potvrđuje IXSCAN. `tsc`, `eslint` i `build`
čisti; test zapis obrisan kaskadno.

## 2026-08-06 — Ključ u linku, QR vezan za dan, istekla galerija kao upsell

- **Šta je urađeno:**
  - `gallery_key` na `WeddingData` + **novo** `src/lib/gallery-key.ts`
    (`generateGalleryKey` preko `randomBytes(12)`, `ensureGalleryKey` za lenji
    backfill starih parova, `galleryKeyMatches`). Ključ se kuje odmah pri
    kreiranju samostalne galerije.
  - `gallery-lifecycle.ts`: `canGuestUpload` dobio `hasKey`, nov `guestGate()`
    koji vraća `open | before | closed`. **Dva ulaza, dva prozora:** štampani QR
    (bez parametra) radi na dan događaja i dan posle; prosleđeni link (`?k=`)
    dodatno radi i pre događaja. Posle d1 ne radi nijedan.
  - `galleryShareUrl(slug, key)` u `gallery-qr.ts`; `galleryGuestUrl` ostaje bez
    ključa i baš to ide u QR.
  - Gostinska stranica sada ima tri stanja umesto jedne linije teksta:
    **pre** (bogato — kada se otvara, „Kako to ide" u tri koraka, podsetnik da
    se sačuva link), **otvoreno** (upload), **zatvoreno** → `notFound()`.
  - **Novo** `galerija/not-found.tsx` — istekla/nepostojeća galerija više nije
    ćorsokak nego ponuda: „Ova galerija više nije dostupna", tri koraka kako to
    radi, glavno dugme na `/qr-galerija-slika-sa-vencanja`, sporedni link na
    `/cene`. Rendera ga `notFound()`, pa **status ostaje 404** — nema soft-404.
  - Suptilan jednoredni upsell u dnu aktivne galerije (ne u hub tabu).
  - `sign` / `confirm` / `rename` rute primaju `k` i prosleđuju `hasKey`; provera
    je i na `confirm`, jer on piše.
  - `/pristup`: poruka za goste nosi keyed link, pored „Kopiraj poruku" stoji
    **„Preuzmi QR (PNG)"** (bez ključa) uz objašnjenje razlike.
  - Admin tab: red „Link za goste" je keyed, QR dugme nije.
  - **Usput popravljeno:** `sr-RS` u ICU-u se razrešava u ćirilicu, pa je datum
    izlazio ćirilicom nasred latinične stranice — sad `sr-Latn-RS` / `sr-Cyrl-RS`
    eksplicitno, i u `SharePageClient` (gde je bilo pre-postojeće). Uklonjena i
    dupla tačka u „Otvara se …". Popravljene zastarele `useCallback` zavisnosti
    u `GalerijaClient` (`base` je nedostajao i pre ove izmene).
- **Commit / PR:** — (necommitovano)
- **Na šta utiče dalje:**
  - **Standalone seating galerija (`/raspored-sedenja/...`) NIJE dirana** — njene
    `sign`/`confirm`/`rename` rute i dalje zovu `canGuestUpload` bez ključa, što
    je isto ponašanje kao pre. Ako se ključ želi i tamo, to je zaseban prolaz.
  - `PortalClient` u seating portalu i dalje generiše QR bez ključa — ispravno,
    ali nema keyed link za deljenje.
- **Posledice:**
  - **Promena ponašanja:** javna galerija se od d2 nadalje više ne otvara
    gostima (ranije je do d5 prikazivala gomilice sa brojem slika). Sad ide 404
    + ponuda. Namerna odluka vlasnika.
  - Ključ nije tajna — putuje kroz grupne poruke i prosleđuje se dalje. Jedina
    moć mu je da otvori prozor pre događaja; ne otvara ništa posle d1 i ne
    otkriva tuđe slike.
  - Stari parovi nemaju `gallery_key`; `ensureGalleryKey` ga kuje pri prvom
    deljenju, pa nema migracije.
  - Rollback: `guestGate` vratiti na staru `galleryPhase` granu u `page.tsx` i
    obrisati `not-found.tsx`.
- **Šta je rešeno:** štampani QR sa stola posle svadbe više nije mrtav link nego
  lead; gost koji poraniti sa skeniranjem dobija objašnjenje umesto jedne
  rečenice; par može da pošalje link pre svadbe a da QR ostane vezan za dan.
- **Šta je odblokirano:** QR se može štampati na zahvalnicama bez straha da će
  godinama kasnije voditi u prazno.
- **Status:** code-complete (nepromenjen)
- **Blokade / sledeći korak:** odluka da li isto uvesti i na seating galeriju.

### Verifikacija (sve prošlo, `npm start`)

| Provera | Rezultat |
|---|---|
| QR bez ključa, pre događaja | 200, „Galerija se otvara na dan venčanja" + „Kako to ide" |
| Link sa ključem, pre događaja | 200, upload otvoren |
| Pogrešan ključ | tretira se kao QR |
| `sign` bez ključa pre događaja | 403 |
| `sign` sa ključem pre događaja | 200 |
| Događaj u prošlosti (d5), QR | **404** + upsell stranica |
| Isto, sa ključem | 404 (ključ ne produžava posle d1) |
| `sign` posle prozora, sa ključem | 403 |
| Nepostojeći slug | 404 + upsell stranica |
| Share stranica | keyed link u poruci, „Preuzmi QR (PNG)" bez ključa |
| Datum | „Otvara se 20. septembar 2026." — latinica, jedna tačka |

## 2026-08-06 — Marker `standalone_gallery`, admin tab „Galerija", zaključavanje pre uplate

- **Šta je urađeno:**
  - `WeddingData.standalone_gallery?: boolean` (`src/app/pozivnica/[slug]/types.ts`)
    — imutabilan marker porekla, upisuje se pri kreiranju i nikad ne briše.
  - **Novo:** `src/lib/gallery-only.ts` (čist predikat + `GalleryOnlyInput`, bez
    DB importa da ga smeju i klijentske komponente), `src/lib/standalone-gallery.ts`
    (`buildStandaloneGalleryCoupleData`, `createStandaloneGalleryCouple`,
    `generateGalleryPassword`, `galleryNameParts`), `src/lib/gallery-qr.ts`
    (`downloadGalleryQR` + `galleryGuestUrl`, izvučeno iz `admin/page.tsx`),
    `src/app/api/admin/galleries/route.ts` (samo `POST`, `isAdminRequest`),
    `src/app/admin/GalleryAdminTab.tsx`, `scripts/backfill-standalone-gallery.mjs`.
  - `couples.ts`: stara heuristika uklonjena, predikat se re-eksportuje; dodat
    `toPortalCoupleInfo` i na njega svedeni auth ruta i `verifyAuth` (ranije dva
    duplikata istog objekta od 10 polja koja su se menjala u paru).
  - Nova derivacija: `standalone_gallery && !(draft === false || paid_for_raspored
    || paid_for_audio || premium_paid)`. `paid_for_gallery` namerno IZBAČEN iz
    uslova. Marker se ne briše na dokupu — druga klauzula to pokriva bez ijedne
    izmene u `payments/kinds.ts` (gde se `paid_for_gallery` piše sa šest mesta).
  - Self-serve `qr-galerija-slika-sa-vencanja/actions.ts` prešao na zajednički
    builder (izgubio duplirani literal, dobio marker).
  - Admin: šesti tab „Galerija" (create modal, faza lifecycle-a, reveal/copy
    lozinke, QR, ShareLink, +1 dan, toggle, brisanje), pilula „QR galerija" na
    redu pozivnice, tab Pozivnice filtrira gallery-only **izvedenim** uslovom
    (klijent koji dokupi pozivnicu se sam vraća u listu).
  - Portal: `nav-items` zaključava i sam tab Galerija dok nije plaćen;
    `LockedFeatureCard` dobio `ctaHref`/`ctaLabel`/`ctaNote`; `MojeVencanjeClient`
    vodi na `/placanje/galerija/[slug]/` umesto na prazan album.
  - `/pristup/[token]`: nova `gallery` grana — ranije je kupcu galerije nudila
    link ka nepostojećoj pozivnici.
  - **Usput popravljeno u `admin/page.tsx`:** `?tab=` whitelist nije imao
    `"galerija"` (deep-link se ne bi vratio); `buildReceiptUrl`, `receiptTotalFor`
    i sortiranje po datumu izmešteni na modul-nivo. Ovo poslednje je bilo
    latentno: dinamički `import("qrcode")` u telu komponente obarao je React
    Compiler analizu i time gušio dve `react-hooks/purity` greške — čim je QR
    izvučen u `lib/`, greške su isplivale. Dva `set-state-in-effect` slučaja
    (hydration guard i čitanje URL-a) ostavljena uz `eslint-disable` i
    obrazloženje — oba su legitimna sinhronizacija sa spoljnim sistemom.
- **Commit / PR:** — (necommitovano, čeka odluku o deployu)
- **Na šta utiče dalje:**
  - `docs/dev-log/2026-07-23-bypass-telefon-forme/` — bypass tok za
    `qr-galerija` formu i dalje radi, ali akcija sada gradi zapis preko
    builder-a; svaka izmena oblika zapisa ide u `standalone-gallery.ts`.
  - `llms.txt` po `CLAUDE.md` treba dopuniti ako se galerija počne oglašavati
    kao proizvod koji admin kreira za klijenta.
  - Ako se ikad doda još jedan samostalni proizvod na `couples`, marker prelazi
    u enum — tada i `gallery-only.ts` menja oblik.
- **Posledice:**
  - Aditivno; postojeći parovi bez markera ponašaju se identično (prva linija
    predikata odmah vraća `false`).
  - **Merenje pre prebacivanja:** u produkciji 36 parova, 3 sa
    `paid_for_gallery: true` — sva tri imaju i raspored/audio/premium, dakle
    **nula gallery-only zapisa**. Backfill je no-op, prebacivanje derivacije ne
    može nikoga ni otključati ni zaključati, pa je plan od dva deploya sveden na
    jedan. Bag #1 iz plana je time potvrđeno **latentan** — nije pogodio nijednog
    pravog klijenta.
  - Promena ponašanja za nove self-serve kupce: do uplate više ne vide ceo
    planer, nego zaključan portal sa CTA ka plaćanju.
  - Rollback: vratiti staro telo `isGalleryOnlyCouple`; polje ostaje u bazi kao
    bezopasno.
- **Šta je rešeno:**
  - Bag u kom planer-par plaćanjem galerije gubi checklistu, budžet, vendore i
    goste.
  - Obrnuti false-positive (pun planer pre uplate, oduzimanje posle).
  - Admin nije imao način da klijentu kreira pristup galeriji.
  - Gallery-only kupci nisu bili razlučivi u admin listi.
  - `/pristup` je kupcu galerije slao link ka nepostojećoj pozivnici.
- **Šta je odblokirano:** prodaja galerije preko telefona/žiralno bez javne
  forme; štampa QR-a pre nego što klijent uopšte otvori portal.
- **Status:** (nov task) → code-complete
- **Blokade / sledeći korak:** ništa ne blokira. Sledeće: deploy, pa probna
  galerija na terenu — potvrditi da SMS podsetnici stižu na d4/d5 i da
  odštampani QR vodi na tačnu stranicu.

### Verifikacija (sve prošlo)

`tsc` čist · `eslint` čist na svim dodirnutim fajlovima · `npm run build` prošao ·
`rg -l jwtVerify src/app/api/admin/` prazno.

E2E preko `npm start` (ne `next dev` — 404 na non-GET dinamičkim API rutama):

| Provera | Rezultat |
|---|---|
| `POST /api/admin/galleries/` bez kolačića | 401 |
| kratko ime / bez datuma / loš telefon | 400 uz srpsku poruku |
| ispravno kreiranje | 200 → `{slug, password}` |
| portal login | `galleryOnly: true`, `paid_for_gallery: true` |
| pogrešna lozinka | 401 |
| gostinska `/pozivnica/{slug}/galerija/` | 200 |
| share stranica | „QR galerija fotografija", link ka galeriji, portal, bez pozivnice |
| dokup (`paid_for_raspored: true`) | `galleryOnly: false` bez izmene markera |
| storno (nazad na `false`) | `galleryOnly: true` |
| gašenje `paid_for_gallery` | gostinska strana 404, i dalje `galleryOnly: true` |
| brisanje iz admina | kaskada čista: 0 zapisa u `couples`, `gallery_photos`, `seating_layouts`, `rsvp_responses`, `wedding_portal`, `audio_messages`, `share_links`; baza vraćena na 36 parova |

**Nalaz koji nije bag:** `/pozivnica/{slug}/` za gallery-only zapis vraća 200, ne
404 — `draft` od Freemium B3 renderuje pregled sa vodenim žigom. Stranica je
noindex i prazna; postojeći self-serve tok je već proizvodi. Zavedeno kao
otvoreno pitanje u `plan.md`.
