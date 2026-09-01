# Log — Biblioteka šema sala (`hall_venues`)

## 2026-08-03 — Planiranje, implementacija obe faze i verifikacija u browseru

- **Šta je urađeno:**

  **Zid kao novi tip elementa**
  - `src/lib/seating/types.ts` — `"wall"` dodat u `DecorationType` (aditivno;
    stari zapisi ga nikad ne sadrže).
  - `src/lib/seating/geometry.ts` — grana u `rectFor` za zid (bez `HEADER_H`,
    jer zid nema traku sa naslovom), konstante `WALL_DEFAULT_W/H` (1400×950),
    plus dve nove čiste funkcije: `computeLayoutStats` (broj stolova + mesta,
    preskače dekoracije) i `normalizeTablesToOrigin` (pomera bbox na 80,80).
  - `src/lib/seating/editor/TableNode.tsx` — nova `WallOutline` komponenta.
    Wrapper je `pointer-events: none`, a pointer primaju samo 4 ivične trake
    (14px), ručka za veličinu u donjem desnom uglu i natpis iznad gornje ivice —
    inače bi pravougaonik od 1400×950 progutao klikove na sve stolove u sali.
    Ne poziva `raiseSelf()` i ima `zIndex: 0`, pa uvek ostaje iza stolova.
    Granice veličine `WALL_MIN/MAX` 200–6000 × 200–4500 (postojeće
    `DECO_MAX_W/H` od 500/400 su daleko premale za salu).
  - `src/lib/seating/editor/RasporedClient.tsx` — `canvasTables` memo sortira
    zidove na početak (DOM redosled odlučuje slaganje); `addDecoration` za zid
    automatski obmota postojeće stolove (bbox + 60px), a na praznom platnu
    koristi podrazumevanu veličinu.
  - `src/lib/seating/pdf/generatePDF.ts` — grana za zid (pun `#c9c9c9` okvir,
    bez ispune i labele) + isti sort. ⚠ Ovaj fajl **duplira** `rectFor` i
    konstante iz `geometry.ts`, pa su menjane obe kopije.
  - `src/app/pozivnica/[slug]/gde-sedim/HallMap.tsx` — grana za zid (tanak pun
    `#d5d5d5` okvir, puna providnost, bez prigušivanja kao ostale dekoracije).

  **Biblioteka šema**
  - `src/lib/hall-venues.ts` (novo) — kolekcija `hall_venues`. Tipovi
    `HallVenue` / `HallTemplate` / `HallVenueSummary`; CRUD za objekte i
    dvorane; `searchHallVenues` traži po `searchKey` (dijakritika presavijena,
    svaka reč mora da se pojavi, pa „zrenjanin kristal" nalazi isto što i
    „kristal zrenjanin"); `saveHallLayout` pre upisa pusti
    `normalizeTablesToOrigin`, ponuli sve `assignments` i prebroji
    `tableCount`/`totalSeats`.
  - `src/app/api/admin/hall-venues/**` (4 rute) — lista+kreiranje objekta,
    patch/delete objekta, kreiranje dvorane, get/patch/delete dvorane. Svaka
    kopira postojeći inline `isAdmin()` obrazac sa `jwtVerify` nad
    `admin_token`. `PATCH {tables}` strukturno validira svaki element.

  **Admin**
  - `src/app/admin/HallSchemesSection.tsx` (novo) — sekcija „Šeme sala" na vrhu
    „Raspored sedenja" taba: kreiranje objekta (naziv, grad sa `<datalist>`
    postojećih gradova, adresa, naziv prve dvorane), lista koja se širi u
    dvorane sa „N stolova · M mesta", preimenovanje i brisanje uz
    `useConfirmDialog`. `SeatingAdminTab.tsx` dobio samo import + jedan red.
  - `src/app/admin/sale/[venueSlug]/[hallId]/{page.tsx,HallTemplateEditorRoot.tsx}`
    (novo) — renderuje deljeni editor u `templateMode` sa `attending={[]}`;
    `actions` su obični `fetch` omotači ka admin API-ju (ruta je već pokrivena
    `/admin/:path*` matcher-om, pa kolačić ide sam).
  - `templateMode` u `RasporedClient` / `Toolbar` / `AddTablePanel`: skriva
    `GuestSidebar`, mobilno dugme „Gosti" i brojač slobodnih mesta, izbacuje
    ceo download meni, menja natpis dugmeta u „Sačuvaj šemu", dodaje „Zidovi
    sale" u Specijalne elemente, i prikazuje `N stolova · M mesta · ŠxV ✓/⚠`
    (⚠ kad šema pređe 1440×940 i neće stati na telefonsko platno).

  **Faza 2 — učitavanje kod klijenata**
  - `src/lib/seating/hall-actions.ts` (novo, `"use server"`) —
    `searchHallVenuesAction` i `loadHallTemplateAction`.
  - `src/lib/seating/editor/SchemePreview.tsx` (novo) — read-only SVG pregled
    nad `rectFor`/`computeBoundingBox`.
  - `src/lib/seating/editor/LoadHallSchemeModal.tsx` (novo) — pretraga sa
    debounce-om, rezultati grupisani po objektu, pregled izabrane dvorane sa
    kapacitetom.
  - `loadHallScheme` u `RasporedClient` — `ConfirmDialog` kad platno nije
    prazno, regeneracija svih `id`-jeva, prazna sedišta, `members` netaknut,
    pa namestanje `pan`/`zoom` da šema stane u vidno polje.
  - `enableHallSchemes` prosleđen iz `WeddingRasporedRoot`,
    `BirthdayRasporedRoot` i `StandaloneRasporedRoot`.

  **Usput**
  - Ispravljen zatečen bag u `HallMap.tsx`: `height="auto"` na `<svg>` nije
    validna SVG dužina i browser je prijavljivao grešku na svakom učitavanju →
    prebačeno u CSS (`style={{ height: "auto" }}`).
  - `CLAUDE.md` — `hall_venues` u listi kolekcija + nova sekcija „Hall Scheme
    Library (šeme sala)" sa invarijantama (normalizacija na snimanju, zid u
    `tables[]`, tri mesta gde geometrija mora ostati sinhrona).

- **Commit / PR:** — (nije commit-ovano; radno stablo ima i dosta drugog
  nepovezanog nekomitovanog posla, pa commit treba selektivno)

- **Na šta utiče dalje:**
  - Serijal snimanja može da počne — alat je spreman za unos sala iz
    `docs/sale-outreach-seme-sala.md` (95 sala, outreach u toku).
  - Svaka buduća izmena geometrije stolova mora u **tri** fajla:
    `src/lib/seating/geometry.ts`, inline kopija u `pdf/generatePDF.ts`, i
    `gde-sedim/HallMap.tsx`. Duplikacija je zatečena i namerno nije dirana u
    ovoj izmeni.
  - Ako se jednom napravi javna stranica sa digitalizovanim salama, treba i
    `public/llms.txt` i `sitemap.ts`.
  - Ostaju **zatečene** lint greške u `src/lib/seating/editor/CursorGuestBadge.tsx`
    (setState u efektu ×2) i `MobileSeatSheet.tsx` (uslovni `useMemo`) — nisu
    dirane jer nisu u obimu, a popravka `MobileSeatSheet`-a je pravi refaktor
    žive komponente.

- **Posledice:**
  - **Nova kolekcija** `hall_venues`; nijedna postojeća nije menjana. Nema
    migracije.
  - **Format `seating_layouts` se nije promenio** — zid jaše u postojećem
    `tables[]` nizu kao dekoracija. Rasporedi sačuvani pre ove izmene se
    učitavaju i ponovo snimaju identično (`parseEditorPayload` nije diran, i
    dalje prihvata i stari format golog niza).
  - Rasporedi u kojima klijent učita šemu sadržaće `decorationType: "wall"`.
    U starijem deployu bi se prikazao kao obična isprekidana dekoracija — ne
    pada.
  - Nema breaking change-a po tri živa proizvoda: sve nove grane su iza
    `templateMode` / `enableHallSchemes` koji podrazumevano stoje na `false`.
  - **Revert:** ukloniti `enableHallSchemes` sa tri wrappera i sakriti
    `HallSchemesSection`; kolekcija je samostalna i može se dropovati bez
    posledica po postojeće zapise.

- **Šta je rešeno:** klijenti su morali da crtaju raspored od nule; sada
  postoji mesto gde šema sale živi i odakle se učitava. Salama se u outreach-u
  konkretno nudi „vaša sala ostaje sačuvana sa spremljenom šemom" i to sada
  stvarno postoji.

- **Šta je odblokirano:** snimanje Instagram serijala; unos 95 sala iz outreach
  liste; kasnije — javna SEO stranica po sali i povezivanje sa `vendors`
  direktorijumom.

- **Status:** — → code-complete

- **Blokade / sledeći korak:** čeka ručni test korisnika, pa selektivan commit i
  deploy. Čeklista za ručni test:
  1. **Admin CRUD** — kreiranje objekta, dodavanje 2–3 dvorane, preimenovanje,
     brisanje (svaki put potvrda), datalist gradova.
  2. **Crtanje** — stolovi + „Zidovi sale" (zid se sam obmota), **klik na sto
     unutar zida mora da radi**, hvatanje zida za ivicu, veličina iz ugla,
     dupli klik za preimenovanje, drugi zid za L-oblik, ✓/⚠ indikator veličine,
     Sačuvaj → F5 → sve isto.
  3. **Klijent** — „Učitaj šemu sale", pretraga bez kvačica („cacak") i po
     obrnutom redosledu reči, pregled, učitavanje na praznom pa na punom platnu
     (potvrda + Otkaži), pa rasporediti goste i sačuvati.
  4. **Regresija (najbitnije)** — postojeći raspored pravog para: pomeranje
     stola, dodela gosta, snimanje, PDF, `/gde-sedim`; isto na pozivnici i
     rođendanu, ne samo na standalone rasporedu; telefon (zid se ne prikazuje
     kao kartica u listi stolova).
  5. **Rubovi** — prazna dvorana (dugme onemogućeno), istekla admin sesija,
     `/admin/sale/nepostojeca/hall-x` → 404.

### Verifikacija odrađena pre predaje

`tsc --noEmit`, `eslint` (na dodirnutim fajlovima) i `next build` — čisto.
Testirano u pravom Chromium-u preko `next build && next start` (ne `next dev`,
zbog `project_dev_server_gotcha`):

- kreiranje objekta kroz admin UI sa srpskim slovima („Vila Đurđevak", Vršac) —
  naziv sačuvan sa dijakritikom, slug i `searchKey` presavijeni;
- crtanje 3 stola + zid, `3 stolova · 36 mesta · 330×330 ✓`, snimanje, reload —
  identično;
- normalizacija potvrđena: raspored snimljen na (5000,4000) vraćen na (80,80),
  dodela gosta („Curilo Jovan") obrisana, `tableCount: 3` / `totalSeats: 30`
  (zid i muzika preskočeni);
- klijentska strana: dugme vidljivo, pretraga „cacak" nalazi „Čačak", pregled se
  iscrtava, učitavanje na praznom platnu prolazi bez pitanja a na punom traži
  potvrdu, snimanje persistira (`seatingStats` 30/0);
- PDF sa zidom generisan (67 KB, bez grešaka), `/gde-sedim` iscrtava zid kao
  najtiši element;
- **regresija:** tri postojeća prava standalone rasporeda
  (`nikolina-danijel-an7f` 229/230 mesta, `teodora-aleksandar-xrv5` 227/241,
  `maja-ostoja-p4in`) renderovana kroz `/gde-sedim` — identično, nula grešaka;
- svi test zapisi (2 objekta + 1 standalone raspored) obrisani iz baze.

## 2026-08-03 — Tri runde reviewa, popravke i deploy

- **Šta je urađeno:**
  - Tri runde adversarijalnog reviewa pre puštanja. Runda 1 podigla dva prava
    nalaza, runda 2 još šest, runda 3 potvrdila da je sve zatvoreno.
  - **Zaobilaženje plaćanja (runda 1):** `loadHallScheme` nije prolazio kroz
    isti gejt kao `addTable`, pa je neplaćen par mogao da učita gotovu šemu od
    30 stolova i odštampa je (PDF nikad nije gejtovan). Sada traži
    `recheckPaid()` i prikazuje `UpgradeModal`.
  - **Bezbednost (runda 1, eskalirana u rundi 2):** izdvojeno u zaseban task
    [[2026-08-03-server-action-auth]] — akcije za pretragu sala bile su javno
    pozive, a u istoj klasi otkriveno je i neautentifikovano prepisivanje
    tuđeg rasporeda.
  - **Runda 2, ostalo:** prazno dugme u alert dijalogu (`cancelLabel: ""`);
    istekla sesija se prikazivala kao „nema takve sale" (sada `{ok, venues}` i
    zasebna poruka); `checkPaidStatus` gejtovan; `fold()` prebačen na
    `normalizeName` pa ćirilična pretraga radi umesto da vrati sve; srpska
    množina (`src/lib/seating/labels.ts` — „1 sto", „3 stola", „12 stolova");
    tihe greške u admin akcijama sada idu kroz dijalog; srpski navodnici
    izbačeni iz JS-a; `deleteHall` filter; `statedCapacity` (mrtav kod)
    uklonjen; `address` se `$unset`-uje umesto da postane `null`; srpska
    kolacija na sortiranju; validacija `seats` na ceo broj 0–30.
  - **Nije urađeno namerno:** `patchHallVenue` i njegova ruta nemaju UI
    poziv (API-only, ostavljeno); jedinstveni indeks na `hall_venues.slug`
    (jedan admin, `generateUniqueVenueSlug` već pokušava ponovo).

- **Commit / PR:** `c46154f` na grani `deploy` (bezbednost zasebno u `8d87c4b`).

- **Na šta utiče dalje:** `SeatingAdminTab.tsx` je commit-ovan **samo sa moja
  tri reda** (import + render `HallSchemesSection`) — ostatak izmena tog fajla
  iz paralelnog posla (pozivnica za događaj, vrsta događaja) ostaje
  nekomitovan u radnom stablu i ide sa tim poslom.

- **Posledice:** ako u produkciji već postoje `hall_venues` dokumenti napravljeni
  pre ovog commita, njihov `searchKey` je računat starim `fold`-om — jednom ih
  presnimiti kroz `patchHallVenue` da se poravna. Kolekcija je bila prazna pri
  deployu, pa je ovo samo napomena za slučaj.

- **Šta je rešeno:** feature je prošao review i pušten u produkciju.

- **Šta je odblokirano:** unos sala iz outreach liste i snimanje serijala.

- **Status:** code-complete → deployed

- **Blokade / sledeći korak:** uneti prve sale i snimiti prvi video. Ostaje
  ručni test na terenu (čeklista u prethodnom unosu).
