# Plan — Biblioteka šema sala (`hall_venues`)

- **ID:** 2026-08-02-seme-sala-biblioteka
- **Status:** deployed (commit `c46154f`; bezbednosne popravke zasebno u `8d87c4b`)
- **Kreiran:** 2026-08-02
- **Vlasnik:** Aleksa

## Zašto

Pokreće se Instagram serijal u kome se obilaze svečane sale po Srbiji i snima
digitalizacija njihovog rasporeda stolova. Salama se nudi promo-snimak, a
zauzvrat daju šemu stolova (outreach poruke i lista od ~95 sala već postoje u
`docs/sale-outreach-seme-sala.md`).

Do sada nije postojalo mesto gde bi ta šema živela — `seating_layouts` je vezan
za konkretan slug para/događaja, pa svaki klijent crta stolove od nule. Cilj je
dvostruk: alat kojim se šema unosi (i snima za Instagram), i korist za klijenta
koji kasnije nađe svoju salu i učita gotov raspored.

## Ciljevi

- Admin iz „Raspored sedenja" taba dodaje objekat (sala + grad) sa jednom ili
  više dvorana („Mala sala 1", „Velika sala").
- Editor bez gostiju u kome se rasporede stolovi i po želji ocrtaju zidovi sale.
- Sačuvane šeme sa izvedenim kapacitetom (broj stolova + broj mesta).
- Klijent u svom editoru pretraži sale i učita gotovu šemu umesto ručnog unosa.

## Van obima

- Javna SEO stranica sa spiskom digitalizovanih sala.
- Povezivanje `hall_venues` sa `vendors` kolekcijom (kategorija `venue`).
- Mogućnost da parovi sami crtaju zidove svoje sale.
- Ulazna tačka za učitavanje šeme na telefonu (učitana šema se na telefonu
  vidi, ali se pokreće sa desktopa).

## Odluke

1. **Nova kolekcija `hall_venues`, dvorane ugnežđene u dokument objekta.**
   Ne koristi se `seating_layouts` sa rezervisanim prefiksom sluga — ta
   kolekcija ima invariantu „jedan dokument po slugu proizvoda" i briše se
   kaskadno iz `deleteStandaloneSeating` / DELETE rute za parove; treća namena
   u njoj bi otvorila rizik da se šema obriše sa nekim događajem. Dvorana ima
   ~30 stolova (~10 KB), pa je ugnežđivanje bezbedno i daje listu sa
   kapacitetima u jednom upitu.

2. **Zid = `decorationType: "wall"` unutar `tables[]`.** Format čuvanja
   (`EditorPayload`, `storage.ts`, save/load akcije triju proizvoda) se ne
   menja, pa zid automatski prolazi kroz snimanje, PDF i `/gde-sedim`.
   Odbačen je alternativni pristup sa zasebnim `room: {x,y,w,h}` poljem —
   tražio bi izmene kroz payload, bazu, PDF i HallMap, a ne bi podržavao
   L-oblik sale. L-oblik se ovako dobija sa dva preklopljena zida, bez ijedne
   dodatne linije koda. Odbačen je i polygon editor (novi model interakcije za
   miš i dodir, tri renderera, matematika za PDF — previše za v1).

3. **`RasporedClient` se ponovo koristi, uz `templateMode` prop**, umesto
   zasebnog lakšeg editora. Komponenta je već građena za varijacije kroz
   propove (`hideBackButton`, `hideWeddingOnlyElements`, `hideDecorations`,
   `themeVarsOverride`, injektovan `actions`). Zaseban editor bi značio
   duplikat pan/zoom logike, spawn pozicija i mobilnog toka — ~600 linija koje
   bi vremenom divergirale.

4. **Pretraga sala ide kao server akcije, ne kao javna API ruta**, jer jedan
   modul tako pokriva sva tri proizvoda.

   ⚠ **Prvobitno obrazloženje je bilo pogrešno** i ostavljeno je ovde da se ne
   ponovi: mislili smo da je dovoljno to što `matcher` u `src/middleware.ts`
   pokriva rute na kojima se editor renderuje. Nije — server akcija se izvršava
   na *bilo kom* URL-u koji se razrešava u rutu iz njenog modula, a
   `/raspored-sedenja/prijava/` se razrešava u `[slug]` rutu koju middleware
   namerno propušta. Akcije zato same proveravaju sesiju preko
   `src/lib/seating/action-auth.ts`; v. [[2026-08-03-server-action-auth]].

5. **Zid ne sme da guta klikove.** Wrapper je `pointer-events: none`; samo
   četiri ivične trake, ručka za veličinu i natpis primaju pointer. Bez toga bi
   pravougaonik od 1400×950 prekrio sve stolove u sali.

6. **Grad je slobodan tekst**, ne `CITIES` enum iz `vendor-constants.ts` — taj
   enum ima 6 gradova, a outreach lista pokriva Pančevo, Smederevo, Kruševac,
   Vrnjačku Banju, Novi Pazar, Zrenjanin i druge. Admin forma nudi `<datalist>`
   sa gradovima koji već postoje u bazi.

## Uticaj

- **Baza:** nova kolekcija `hall_venues`. Postojeće kolekcije netaknute.
- **Deljeni editor** (`src/lib/seating/`): `types.ts`, `geometry.ts`,
  `editor/{RasporedClient,TableNode,Toolbar,AddTablePanel}.tsx`,
  `pdf/generatePDF.ts` — sve nove grane iza propova koji podrazumevano stoje na
  `false` ili iza novog `decorationType`.
- **Tri živa proizvoda** (venčanje / rođendan / standalone) dobijaju dugme
  „Učitaj šemu sale" kroz `enableHallSchemes` na svom wrapperu.
- **Guest-facing:** `gde-sedim/HallMap.tsx` i PDF plan sale iscrtavaju zid.
- **Admin:** nova sekcija na „Raspored sedenja" tabu + nova ruta
  `/admin/sale/[venueSlug]/[hallId]`.
- **Geometrija je duplirana na tri mesta** — `geometry.ts`, inline kopija u
  `pdf/generatePDF.ts`, i `gde-sedim/HallMap.tsx`. Svaka izmena mora u sva tri.

## Zavisnosti

- Faza 1 (admin alat) je preduslov za Fazu 2 (učitavanje kod klijenata) — bez
  sačuvanih šema nema šta da se učita.
- Serijal snimanja zavisi od Faze 1; outreach salama je već u toku
  (`docs/sale-outreach-seme-sala.md`).

## Rizici

- **Regresija u `RasporedClient`** (1745 linija, tri živa plaćena proizvoda) —
  ublaženo: sve iza propova koji podrazumevano stoje na `false`, diff je
  isključivo dodavanje uslova, plus ručna regresija na tri postojeća prava
  rasporeda.
- **Duplirana geometrija u `generatePDF.ts`** — mora se menjati u istom commit-u
  kao `geometry.ts`, inače PDF crta zid pogrešne visine.
- **Zid u rasporedu para koji bi prošao kroz propuštenu putanju renderovanja** —
  degradira u generičku isprekidanu dekoraciju, ne u pad stranice (potvrđen
  fallback u PDF-u i HallMap-u).
- **Prevelika sala prelazi mobilno platno** (fiksnih 1600×1100) — nije nova
  regresija (isto važi za svaki preveliki ručno nacrtan raspored), ali admin to
  ne bi primetio; zato toolbar prikazuje dimenzije sa ✓/⚠.

## Koraci

- [x] **Zid kao element** — `"wall"` u `DecorationType`, grana u `rectFor`,
      `WallOutline` u `TableNode`, grana u `generatePDF` (i njegovoj dupliranoj
      geometriji) i u `HallMap`. _Prihvatanje:_ zid se crta iza stolova u sva
      tri renderera i ne guta klikove. (log: 2026-08-03)
- [x] **Geometrijski helperi** — `computeLayoutStats` i
      `normalizeTablesToOrigin` u `geometry.ts`. _Prihvatanje:_ čiste funkcije
      bez browser API-ja, pozive ih i server i klijent. (log: 2026-08-03)
- [x] **Fasada `src/lib/hall-venues.ts`** — tipovi + CRUD; `saveHallLayout`
      normalizuje koordinate, briše dodele i prebroji kapacitet na serveru.
      _Prihvatanje:_ sačuvana statistika ne može da odstupi od sačuvanih
      tabela. (log: 2026-08-03)
- [x] **Admin API** — 4 rute pod `/api/admin/hall-venues` sa `isAdmin()`
      obrascem. _Prihvatanje:_ 401 bez kolačića, 404 za nepostojeće,
      validacija naziva/grada/rasporeda. (log: 2026-08-03)
- [x] **`templateMode`** u `RasporedClient` / `Toolbar` / `AddTablePanel`.
      _Prihvatanje:_ bez gostiju, bez download menija, sa „Zidovi sale";
      živi proizvodi nepromenjeni. (log: 2026-08-03)
- [x] **Admin UI** — `HallSchemesSection` + ruta
      `/admin/sale/[venueSlug]/[hallId]`. _Prihvatanje:_ ceo CRUD kroz UI, sve
      brisanje uz `ConfirmDialog`. (log: 2026-08-03)
- [x] **Faza 2 — „Učitaj šemu sale"** — server akcije, `SchemePreview`,
      `LoadHallSchemeModal`, `loadHallScheme` + namestanje pogleda,
      `enableHallSchemes` na tri wrappera. _Prihvatanje:_ pretraga bez
      dijakritike, pregled, potvrda pri zameni, dodele obrisane a lista gostiju
      netaknuta. (log: 2026-08-03)
- [x] **Review + popravke + deploy** — tri runde adversarijalnog reviewa,
      popravke, deploy. _Prihvatanje:_ prošla regresija na pravim rasporedima.
      (log: 2026-08-03)
- [ ] **Ručni test na terenu** — čeklista u log entry-ju od 2026-08-03.

## Verifikacija

Automatski: `npx tsc --noEmit`, `npx eslint`, `npx next build` — sve čisto.

⚠ Admin API rute testirati kroz `next build && next start`, **ne** kroz
`next dev` — dev server 404-uje ne-GET dinamičke API rute (`trailingSlash` +
Node 24, v. memory `project_dev_server_gotcha`).

Ručno (odrađeno u headless Chromium-u, v. log): kreiranje objekta kroz admin UI
sa srpskim slovima, crtanje i čuvanje šeme, reload sa istim brojevima,
učitavanje kod klijenta, potvrda pri zameni, snimanje, PDF, `/gde-sedim`.
Regresija: tri postojeća prava rasporeda renderovana bez razlike i bez grešaka.

**Rollback:** sve izmene su aditivne. Povlačenje feature-a = ukloniti
`enableHallSchemes` sa tri wrappera (dugme nestaje) i sakriti
`HallSchemesSection`. Kolekcija `hall_venues` je samostalna i njeno brisanje ne
dira nijedan postojeći zapis. Jedina izmena koja dodiruje postojeće podatke je
`decorationType: "wall"` u `tables[]` — pojavljuje se samo u rasporedima gde je
neko učitao šemu, i u starijem kodu bi se prikazao kao obična dekoracija.

## Otvorena pitanja

- Da li parovi treba da mogu sami da crtaju zidove svoje sale (za sada ne).
- Da li praviti javnu SEO stranicu sa digitalizovanim salama uz Instagram
  serijal — ako da, treba i `llms.txt` + `sitemap.ts` ažurirati.
