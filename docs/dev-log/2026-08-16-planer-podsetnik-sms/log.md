# Log — SMS podsetnik za neaktivne planer naloge

## 2026-08-16 — Merenje posete uvedeno, podsetnik implementiran i proveren

- **Šta je urađeno:**
  - `src/lib/portal.ts` — `loadPortalData(slug, opts?: { touch?: boolean })`;
    `lastSeenAt` se upisuje kroz **postojeći** `findOneAndUpdate`, dakle bez
    ijednog dodatnog upita.
  - `src/app/moje-vencanje/actions.ts` — `loadPortalDataAction` prosleđuje
    `touch: true`; jedino mesto koje to sme, jer slug dolazi iz verifikovanog
    JWT claim-a.
  - `src/app/moje-vencanje/types.ts` — `PortalData.lastSeenAt?`.
  - `src/app/pozivnica/[slug]/types.ts` — `WeddingData.planner_reminder_sent?`.
  - `src/lib/planer/reminder-sms.ts` — **nov**: pragovi 30/60 dana, tekst poruke,
    `findPlannerReminderCandidates()`.
  - `src/app/api/cron/gallery/route.ts` — slanje u `remind` prolazu, odmah posle
    seating SMS-a; oznaka se upisuje istog trena.
  - `scripts/planer-podsetnik-dry.mjs` — **nov** suvi prolaz; meri i dužinu i
    kodiranje poruke, ne samo kandidate.
- **Commit / PR:** vidi commit ispod ovog unosa u `git log`.
- **Na šta utiče dalje:** `2026-08-16-telefoni-backfill` — par bez telefona je i
  za ovaj tok nevidljiv (`aleksandra-miljan`). Za mesec dana `lastSeenAt` će biti
  dovoljno napunjen da se otvoreno pitanje o drugom podsetniku može odlučiti na
  podacima.
- **Posledice:** dva nova opciona polja, bez migracije. Ponašanje se menja samo
  za `draft: true` parove. Povratak: `git revert` — polja ostaju u bazi i
  bezopasna su. **Kill switch bez deploya:** postaviti
  `planner_reminder_sent: true` na paru koga ne treba dirati.
- **Šta je rešeno:** quick-register nalog koji nikad ništa nije platio nije imao
  **nijedan** kanal kojim bismo ga dosegli posle registracije.
- **Šta je odblokirano:** merenje stvarne upotrebe planera. Do danas se nije
  moglo razlikovati „gleda ali ne upisuje" od „nestao".
- **Status:** planned → done
- **Blokade / sledeći korak:** nema. Prvi prolaz cron-a šalje dve poruke.

### Nalaz vredan pamćenja: planer praktično niko ne koristi

Od **15 predstojećih venčanja, tačno jedno** (`katarina-marko`, 30/63 stavke,
3 kategorije budžeta) ima ijedan upis u planeru. Ostalih 14 imaju `createdAt` i
`updatedAt` identične do sekunde — dakle nijedan snimljen potez, ikada.

To važi i za **plaćene** parove, ne samo za draft naloge. `milica-veljko` ima
venčanje za 14 dana i netaknutu čeklistu. Podsetnik ih po odluci vlasnika ne
dira, ali brojka govori nešto o samom proizvodu, ne o kanalu.

### Zašto merenje nije moglo da odgovori na prvobitno pitanje

Traženo je „ko se nije logovao duže od mesec dana". Takav podatak **ne postoji** —
`updatedAt` se pomera isključivo na snimanje, pa par koji portal otvara nedeljno
a ništa ne dira izgleda identično onom koji je nestao u aprilu.

Zato dve izmene umesto jedne: `lastSeenAt` da pitanje ubuduće ima odgovor, a
prvi talas poruka po signalu `lastSeenAt ?? updatedAt`, koji radi odmah i sam se
izoštrava. Tekst poruke zato ne tvrdi „nije vas bilo" — poziva na nastavak, što
je tačno u oba slučaja.

### Provere koje su izvedene

| Provera | Ishod |
|---|---|
| `$set` uz `$setOnInsert` na istom `findOneAndUpdate` | 5 scenarija na privremenom zapisu: upsert bez/sa `touch`, update bez/sa, `createdAt` netaknut. Zapis obrisan. |
| Javna `/api/portal/[slug]` ne sme da lažira aktivnost | `GET` → 200, `lastSeenAt` i dalje ne postoji |
| Dužina i kodiranje poruke | **120 znakova, čist GSM-7** — jedan SMS |
| Kandidati na produkcionim podacima | 2 (`milica-uros`, `natasa-zlatko-2`); 4 draft para ispala po pragovima |
| `npx tsc --noEmit`, eslint, `next build` | čisto |

Prvi test je bio najvažniji: da Mongo odbija `$set` pored `$setOnInsert`,
**svako otvaranje portala bi padalo**, uključujući plaćene parove.

## 2026-08-16 — ISPRAVKA: nalaz "planer koristi jedan par" je bio pogresan

- **Sta je uradjeno:** premereno na SVIM parovima, ne na uzorku. Nijedna izmena
  koda; SMS tok i pragovi ostaju netaknuti jer se oslanjaju na `draft`, ne na
  ovu brojku.
- **Commit / PR:** vidi commit uz ovaj unos.
- **Na sta utice dalje:** svaki predlog za unapredjenje planera mora da krene od
  ispravljenih brojki. Prethodni nalaz je vec bio prosledjen kao ulaz u analizu
  proizvoda, pa je i ta analiza delom stajala na pogresnoj osnovi.
- **Posledice:** samo dokumentacija.
- **Status:** done → done (bez promene)

### Sta je tacno

|  | ceklista | budzet | lista zvanica |
|---|---|---|---|
| **Buduca vencanja (15)** | **8/15 (53%)** | 3/15 (20%) | 3/15 (20%) |
| Prosla vencanja (18) | 5/18 (28%) | 4/18 (22%) | 0/18 |

Bilo sta dirali: **placeni parovi 13/26 (50%)**, draft/quick-register **1/7 (14%)**.

### Kako je greska nastala

Prvo merenje je gledalo `createdAt` naspram `updatedAt` na **uzorku od 8 slugova**
koje sam vec bio izvukao za SMS analizu — dakle na skupu **odabranom po tome sto
izgleda neaktivno** (draft nalozi i parovi bez telefona). U tom uzorku je zaista
samo `katarina-marko` imao upis, i taj odnos 1/8 sam preneo na svih 15 kao
"1/15". Klasicno zakljucivanje sa pristrasnog uzorka.

Nikad nisu ni pogledani `teodora-uros` (40 zavrsenih stavki, 16 kategorija
budzeta, 53 zvanice), `tamara-aleksandar` (31 / 16 / 10), `emilija-aleksa`
(21 stavka, 160 zvanica), `andjela-milos`, `ljiljana-pavle`, `milenija-milan`,
`anastasija-jovan`. Medju proslim vencanjima `dragana-uros` ima **45/45
zavrsenih** stavki.

Drugi doprinos gresci: oslonac na `updatedAt != createdAt` kao jedini signal.
Ispravno merenje gleda i **sadrzaj** — zavrsene stavke, popunjene kategorije,
unete zvanice.

### Sta ostaje tacno iz prvobitnog nalaza

- **Budzet je stvarno slab** — 20% na buducim vencanjima, i najcesce samo
  nekoliko kategorija.
- **Draft nalozi zaista bezaju** — 14% naspram 50% kod placenih. Ljudi koji su
  dosli bas zbog planera koriste ga najmanje. To je pravi problem, i poklapa se
  sa grupom koju SMS podsetnik gadja.
- Duzina cekliste se razlikuje po parovima (26–65 stavki) jer je podrazumevani
  spisak skracen sa 63 na 38 tokom vremena, a stare kopije su vec materijalizovane
  u `wedding_portal`. To je i razlog zasto ceklista ne sme da se poredi po id-u
  stavke izmedju parova.
