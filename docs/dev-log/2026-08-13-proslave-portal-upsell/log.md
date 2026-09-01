# Log — Portal za proslave postaje prodajna površina

## 2026-08-13 — Isporuka pristupa, ljuštura, tierovi, galerija, meni i slike

> Zavedeno retroaktivno 2026-08-14, iz istorije commit-ova i beleški sesije.

- **Šta je urađeno:**
  - `ce48537` — `shareProductKind()` u `product-urls.ts`; `/hvala` dopunjena PIN
    granom za `punoletstvo | rodjendan` i mintovanjem `/pristup` linka; isto u
    admin approve ruti za IPS šinu.
  - `0a84ab1` — `src/components/portal/proslava/*` + `src/lib/proslava/portal-actions-core.ts`;
    obrisani `PunoletstvoPortalClient.tsx` i `BirthdayPortalClient.tsx`
    (git ih je prepoznao kao rename R095 — potvrda da je izvlačenje bilo
    doslovno). Autorizacija prebačena sa gole `jwtVerify` na `hasEventSession`.
  - `246ce5d` — `makeBirthdayAdapter` umesto dva skoro identična adaptera;
    `priceEur: 25` za rođendanski raspored; `blockGallery` flag.
  - `52054b6` — `src/lib/gallery/handlers.ts` + `birthday-resolver.ts`; pet novih
    ruta; `gde-sedim` postaje hub; `deleteBirthday` dobio kaskadu za
    `gallery_photos` i R2; `contact_phone` se konačno **čuva**.
  - `1e44a91` — lenj `import("./r2")` u `deleteBirthday`.
  - `8b9e8d1` — `ls-variant-ids.mjs` proverava i dva nova proizvoda.
- **Commit / PR:** `ce48537`, `0a84ab1`, `246ce5d`, `52054b6`, `1e44a91`, `8b9e8d1`
- **Na šta utiče dalje:**
  - Vlasnik mora ručno potvrditi **„Display on storefront OFF"** na dva nova LS
    proizvoda — LS API to ne izlaže, a storefront kupovina nema `order_id` pa
    novac stigne a ništa se ne otključa.
  - Galerija se ne može prodati zapisu bez `contact_phone`; **nijedan postojeći
    zapis ga nema**, novi ga dobijaju automatski.
  - Blokira `2026-08-14-proslave-pregled-print`.
- **Posledice:**
  - `BirthdayData` dobio tri opciona polja — aditivno, dečiji renderer ih
    ignoriše.
  - `MeniCard`, `GalleryCard` i `CheckoutPanel` su deljeni sa venčanjima;
    `description` je opcioni pa je venčani tekst nepromenjen.
  - **Revert:** sve je aditivno; `git revert` po commitu vraća staro stanje,
    nijedna migracija nije rađena.
- **Šta je rešeno:** kupac posle uplate više ne ostaje bez pristupa (slučaj Sara
  Vučetić); duplirani portali; nepostojeća prodajna površina u portalu; blob i
  metapodaci galerije koji bi curili pri brisanju rođendana.
- **Šta je odblokirano:** prodaja tri dodatka iz portala; QR galerija na
  rođendanima; obogaćivanje Pregleda.
- **Status:** — → deployed
- **Blokade / sledeći korak:** ostaje test kartičnog plaćanja na novim
  tierovima i upload slike iz pregledača.

### Zatečeni problemi popravljeni usput

- **`/api/admin/birthday-stats` je padao u build-u.** Statički `import` `r2.ts`
  iz `birthday.ts` uvlačio je ceo `@aws-sdk/client-s3` u graf svakog potrošača —
  pozivnica, OG slika, admin stats — od kojih nijedan ne dira skladište.
  Rešeno lenjim importom.
- **Lokalni `node_modules` pokvaren** — `@aws-sdk/checksums` bez `dist-cjs`,
  build je padao na `/api/admin/seatings`, ruti koja ne dira nijedan naš fajl.
  Popravljeno `npm install`, lockfile netaknut.
- **`contact_phone` se verifikovao SMS-om pa BACAO** u obe create rute.

### Merenja koja su promenila odluke

- **Nula rođendanskih zapisa sa `paid_for_gallery`** → preusmeravanje
  galerijskog QR-a na hub je bezbedno, nijedan kod nije odštampan.
- **Cene: 2015246 = 2.500, 2015251 = 600, galerija reciklira 1912034 = 3.500** —
  sve tri se poklapaju sa kodom, `ls-variant-ids.mjs` bez ijednog upozorenja.
- **SMS: 143–158 znakova na svih 7 kind-ova** → jedan GSM-7 segment. Bez
  `asciiFold` bi „Rođendanska" prebacila poruku u UCS-2 (limit 70) i utrostručila
  cenu.

### Incident

Paralelna sesija je radila na `moje-vencanje` fajlovima kroz ceo dan. Dvaput mi
je `tsc` pukao na njihovom polusnimljenom fajlu, a na kraju je **IPS reorder
utopljen u njihov commit `55aa799`** (verovatno `git add -A` dok je moj
`CheckoutPanel.tsx` bio u radnom stablu). Ništa nije izgubljeno, ali reorder
nema svoj commit ni obrazloženje, i `git revert 55aa799` bi vratio i njihovu
ispravku QR koda i moj reorder.

---

## 2026-08-14 — IPS ispred kartice i SMS zvono

- **Šta je urađeno:** `CheckoutPanel.tsx` — IPS akordeon premešten iznad
  kartice, `open` inicijalno `"ips"` (QR vidljiv bez klika), nov `badge` prop sa
  pilulom „Preporučeno" i blagom podlogom. Tekstovi: IPS „Najjednostavnije — iz
  mBanking aplikacije ili uplatnicom u banci i pošti…", kartica „…Pogodno i za
  uplate iz inostranstva." `notify/route.ts` — serverski SMS adminu preko
  postojećeg Infobipa, sa `asciiFold` i kapom na 160 znakova.
- **Commit / PR:** `8c20384` (SMS); reorder utopljen u `55aa799`.
- **Na šta utiče dalje:** IPS udeo raste, pa svaka uplata traži ručno
  odobravanje — metrika koju vredi pratiti je `notify.at` → `unlockedAt`. Sa
  otvorenim QR-om **više kupaca će platiti a ne kliknuti „Zatraži obradu"**;
  order tad ostaje `pending` i zvono ne zvoni, pa bankovni izvod ostaje deo
  rutine.
- **Posledice:** novčane invarijante nedirane — order se pravi serverski pri
  renderu bez obzira na šinu. `ADMIN_ALERT_PHONE` nije postavljen ⇒ SMS se tiho
  preskače, ponašanje kao pre. **Revert:** reorder je čist JSX + jedna linija
  stanja.
- **Šta je rešeno:** provizija LS-a na malim dodacima (~15% na 600 din) više
  nije podrazumevani put; obećanje „sat vremena" dobilo je zvono koje budi
  telefon, za razliku od mejla koji ide iz browsera.
- **Šta je odblokirano:** IPS može da bude preporučena šina bez nerealnog
  obećanja.
- **Status:** deployed (bez promene)
- **Blokade / sledeći korak:** testirati SMS kroz pravi tok (plati IPS-om →
  „Zatraži obradu" → poruka mora stići). Test poruka na `+381677621766`
  potvrđeno isporučena.

### Odbijeno, sa razlogom

- **„Domaće bez provizije, iz inostranstva provizija"** (predlog vlasnika):
  nijedan kupac ne plaća proviziju ni na jednoj šini — LS naknada je naša — a
  ono što se stranoj kartici dodaje je **PDV**, ne provizija, što protivreči i
  `total − tax` proveri u webhook-u. Namera („kartica je šina za inostranstvo")
  prenesena rečenicom bez novčane tvrdnje; PDV fusnota ostala nepromenjena.
- **„plaćanje računom"** → **„uplatnicom"**: „računom" se čita kao plaćanje po
  fakturi; *uplatnica* je termin koji uplatilac zna i tačan je, jer `NbsQrCode`
  renderuje pun nalog za uplatu.
- **Auto-odobravanje malih IPS uplata** — `notify` je tvrdnja, ne dokaz.
- **Telegram/WhatsApp za zvono** — vlasnik nema Telegram i menja telefon;
  WhatsApp Business Platform traži Meta verifikaciju i odobrenje šablona. SMS
  preko Infobipa već radi u produkciji, ne zavisi ni od jedne aplikacije, i
  **SIM ide sa vlasnikom pri promeni telefona**.
