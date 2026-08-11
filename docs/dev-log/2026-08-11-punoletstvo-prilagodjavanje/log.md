# Log — Prilagođavanje pozivnice za punoletstvo

Append-only. Najstarije prvo.

---

## 2026-08-11 — Galerija + ručice po pozivnici, povodom Sare Vučetić

- **Šta je urađeno:**
  - **Konsolidacija zapisa (samo baza, bez koda):** postojala su dva zapisa
    napravljena 4 minuta razmaka. `sara-vucetic` (draft, nula povezanih zapisa)
    obrisan; `sara-vucetic-2` (draft=false, nosi plaćenu narudžbinu
    `HU249786626008`, 4.500 RSD karticom) preimenovan u `sara-vucetic` uz
    kaskadu na `orders`. Usput ispravljena adresa `Železnicka` → `Železnička` u
    `location.address` i `map_url`. `scripts/rename-couple-slug.mjs` **ne radi
    za ovaj slučaj** — `renameCoupleSlug()` puca kad nema zapisa u `couples`, a
    ovo je `birthday_events`; korišćena jednokratna skripta sa dry-run-om i
    proverom „ne briši ništa što ima narudžbinu".
  - **Galerija:** `paid_for_images` / `images[]` / `image_layout` na
    `BirthdayData`; nova ruta `/api/admin/birthdays/[slug]/images` (POST+DELETE,
    Vercel Blob, do 3 slike, 5 MB, MIME `image/*`); `PolaroidGallery` renderovan
    između heroja i odbrojavanja u `PunoletstvoInvitationClient`.
  - **Boje:** `custom_primary_color` / `custom_background_color`. Primarna ide
    kroz `ThemeProvider`; **pozadina namerno ne** — override-uje se samo
    `--theme-background` na wrapper divu, jer `buildCustomColorOverrides` gura i
    `--theme-surface`/`--theme-surface-alt` pa bi obojila i uokvirene kartice.
  - **Ilustracija u zaglavlju:** `hero_emblem_url` gasi `SunburstRing` + zlatni
    pečat + „18"; upload kroz isti endpoint sa `slot=emblem` (nije gejtovan
    `paid_for_images` — to je izgled, ne plaćena galerija), stari blob se briše
    pri zameni; okvir `w-32/sm:w-48` umesto `w-36/sm:w-60`.
  - **Admin** (`/admin/rodjendan/[slug]`): panel za galeriju, ilustraciju i
    birače boja, vidljiv samo za `type === "eighteenth"`.
  - **`showTitle` prop** na `PolaroidGallery` — venčanja zadržavaju „Naši
    trenuci", punoletstvo ide bez naslova. Podrazumevano `true`, svadbeni
    potrošač ga ne prosleđuje.
  - **Donja ivica** sekcije galerije, simetrična gornjoj (2px,
    `--theme-primary`, 22%) — važi za oba proizvoda, odobreno.
  - **Zatečeni bagovi popravljeni:** (a) `deleteBirthday` nije brisao blobove —
    sada kaskadira `images[]` + `hero_emblem_url`; (b)
    `revalidateBirthdayPaths` nije pokrivao `/punoletstvo/`, pa su admin izmene
    čekale ISR prozor; (c) `canHoverRef` se pisao u efektu a čitao pri renderu —
    upis u ref ne okida render, pa se `onMouseEnter/Leave` **nikad nisu kačili**
    i hover polaroida je bio mrtav na desktopu; prebačeno na
    `useSyncExternalStore` (7 → 0 eslint grešaka).
  - Podaci za Saru: 2 slike, ilustracija, pozadina `#E2F3FD`.

- **Commit / PR:** `cc01202`, `a757fdf`, `eec37b4`, `0f3f301`, `d136413` — sve
  na `deploy`, Vercel success.

- **Na šta utiče dalje:**
  - **`PolaroidGallery` je deljena sa venčanjima** — donja ivica i hover se vide
    i tamo. Svaka sledeća izmena te komponente dira žive venčane pozivnice.
  - **`BirthdayData` je deljen sa dečijim rođendanom** — nova polja su opciona i
    dečiji renderer ih ignoriše. Ako dečiji rođendan ikad zatraži galeriju,
    infrastruktura je već tu: dovoljno je renderovati `PolaroidGallery` u
    `BirthdayClient`.
  - **`LINKED_COLLECTIONS`** u `scripts/lib/couple-slug.mjs` pokriva samo
    `couples`. Ako preimenovanje slugova rođendana postane češće, treba mu
    ekvivalent za `birthday_events` (`birthday_rsvp`, `share_links` po
    `product_kind: "birthday"`, `orders` scope-ovan po `kind`).
  - **Nema `images` tiera u `kinds.ts`** — galerija se naplaćuje ručno i pušta
    admin toggle-om. Dodati tier tek kad drugi/treći klijent zatraži.

- **Posledice:**
  - Ponašanje: hover podizanje polaroida sada **radi** na desktopu (ranije
    mrtvo) — vidljiva promena i na venčanjima. Donja ivica galerije nova svuda.
  - Bez migracije — sva polja su opciona, stari zapisi rade nepromenjeno.
  - `custom_background_color` ima **različit obim po proizvodu**: na venčanju
    boji i kartice, na punoletstvu samo stranu. Zabeleženo u tipu.
  - Revert: ručice su podaci — brisanje polja iz zapisa vraća podrazumevani
    izgled bez deploya. Kod: `git revert` po commitu.

- **Šta je rešeno:** punoletstvo više ne traži novu temu po zahtevu. Šest
  realnih zahteva tog dana (slike, bez naslova, ilustracija, boja, veličina,
  ivica) rešeno je bez ijedne `if (slug === ...)` grane.

- **Šta je odblokirano:** dečiji rođendan može dobiti galeriju bez nove
  infrastrukture. Sledeći „hoću drugu boju / svoju sliku" na punoletstvu rešava
  se u adminu, bez deploya.

- **Status:** — → deployed

- **Blokade / sledeći korak:**
  - Otvoreno: koverta (`EnvelopeLoader`) i dalje nosi zlatni pečat sa „18".
  - `overrides` (tekst po slotovima, dodatne sekcije) svesno odložen do prvog
    stvarnog zahteva za izmenu teksta.

---

## 2026-08-11 — Incident: prvi deploy pao zbog tuđeg importa u mom commitu

- **Šta je urađeno:** Paralelna sesija je dodala `InvitationCredit` u
  `PunoletstvoInvitationClient.tsx` — fajl koji sam i ja menjao. `git add` na
  tom fajlu poneo je i te dve linije (import + upotrebu), dok je sama komponenta
  `src/components/invitation/InvitationCredit.tsx` ostala **nepraćena**. Lokalni
  build prolazi (fajl postoji na disku), Vercel ima samo commitovano pa je pao sa
  `Can't resolve '@/components/invitation/InvitationCredit'`. Popravljeno u
  `eec37b4`: dve linije izbačene iz commita i **vraćene u radno stablo** kao
  nekomitovane, da paralelni rad ne bude ni izgubljen ni objavljen na pola.

- **Commit / PR:** `eec37b4`.

- **Na šta utiče dalje:** Uvedena pred-push provera — **svi `@/` uvozi u
  commitovanom stablu moraju da pokazuju na praćene fajlove**. Kad se radi u
  dve sesije nad istim fajlom, `git add <fajl>` nije bezbedan; treba pogledati
  `git diff --cached` pre commita.

- **Posledice:** Produkcija **nije** bila pokvarena — build nije prošao, pa je
  ostala prethodna verzija. Kredit će se pojaviti kad paralelna sesija commituje
  komponentu zajedno sa `InvitationClient.tsx` i `BirthdayClient.tsx`, da ide na
  sva tri proizvoda odjednom, a ne samo na punoletstvo.

- **Šta je rešeno:** grana `deploy` ponovo gradi.

- **Šta je odblokirano:** dalji push-evi (`0f3f301`, `d136413`).

- **Blokade / sledeći korak:** paralelni rad (8 izmenjenih + 4 nova fajla) i
  dalje stoji nekomitovan lokalno.

- **Zasebno zapažanje (nije vezano za task):** turbopack keš se dvaput pokvario
  između buildova — `next build` prijavi „Compiled successfully" pa padne sa
  `module-not-found` na Google fontovima i ostavi `.next` bez production builda.
  `rm -rf .next` rešava.
