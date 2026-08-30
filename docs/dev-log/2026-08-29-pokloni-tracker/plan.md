# Pokloni (evidencija svadbenih poklona)

- **ID:** 2026-08-29-pokloni-tracker
- **Status:** in-progress (implementation done, verification pending)
- **Created:** 2026-08-29
- **Owner:** Aleksa

## Why

Na dan venčanja par dobija poklone (novac u din/eur, ili predmete) od desetina
gostiju uživo — nema gde to da upiše. Danas `/moje-vencanje` nudi checklistu,
budžet, listu zvanica, meni i audio knjigu, ali ništa za evidenciju ko je šta
poklonio i koliko je ukupno prikupljeno. Bez ovoga par to piše na papiriću ili
u telefonskim beleškama i posle nema ništa u sistemu — baš kao što je i lista
zvanica pre nje rešila problem "ko dolazi" umesto usmene predaje.

## Goals

- Dugme na Pregledu (`OverviewCard.tsx`) koje se pojavljuje **na dan venčanja
  i ostaje zauvek posle** (dok se par ne obriše kaskadno), vodi na novu
  stranicu/tab "Pokloni".
- Prazan početni ekran, pretraga/filter po zvanicama iz postojeće Liste
  zvanica (sa mogućnošću slobodnog unosa imena ako gost nije na listi).
- Unos poklona: **numerička vrednost** (RSD ili EUR, podrazumevano EUR) ili
  **opisni tekst** (npr. "vaza", "poklon bon").
- Lista unetih poklona ispod forme, sa mogućnošću brisanja/izmene.
- Ukupna suma na dnu, sabira sve numeričke unose u jednu baznu valutu (RSD).
- Podaci žive u **novoj MongoDB kolekciji `pokloni`** (eksplicitan zahtev
  vlasnika, ne u `wedding_portal`), uključeni u kaskadno brisanje para.

## Non-Goals

- Nema veze sa gostinjskim (javnim) delom sajta — ovo je isključivo
  privatan alat para, gost ga nikad ne vidi (za razliku od `Meni`).
- ~~Nema izvoza u PDF~~ — **DODATO 2026-08-30 na zahtev vlasnika**, v.
  Impact/Steps ispod (`generatePokloniPDF.ts`). Excel izvoz i dalje van
  obima.
- Nema automatskog povezivanja poklona sa RSVP potvrdom niti sa `Invitee`
  brojem gostiju (`count`) — link je samo referenca na ime, ne menja
  postojeće RSVP/Invitee zapise.
- Nema notifikacija/SMS-a vezanih za ovu funkciju.

## Decisions

1. **Nova kolekcija `pokloni`, jedan dokument po `slug`-u** (`{ slug, gifts:
   GiftEntry[], createdAt, updatedAt }`), po uzoru na `wedding_portal` —
   embedovan niz je dovoljan (svadba ima desetine do ~150 poklona, nikad
   nije potrebna paginacija ili upit po pojedinačnom poklonu). Zasebna
   kolekcija je eksplicitan zahtev vlasnika, iako bi tehnički moglo i kao
   još jedno polje u `wedding_portal` (kao `guestList`).
   - *Alternativa odbačena:* embedovanje u `wedding_portal` — odbačeno jer
     je vlasnik eksplicitno tražio novu kolekciju.
2. **POTVRĐENO (2026-08-29) — besplatna funkcija**, bez `paid_for_pokloni`
   flaga i bez ulaska u `src/lib/payments/kinds.ts`. Prati obrazac
   `checklist` / `budget` / `guestList` / `meni`.
3. **POTVRĐENO (2026-08-29) — BEZ trajne nav stavke.** Pokloni se otvara
   isključivo preko dugmeta na Pregledu, nikad kroz `nav-items.tsx` /
   Sidebar / mobilni bottom-nav. Ovo smanjuje obim: `nav-items.tsx` se NE
   dira, `Sidebar.tsx` se NE dira. `MojeVencanjeClient.tsx` i dalje dobija
   `"pokloni"` kao mogući `ActiveView` (da render-grana i `?tab=pokloni`
   deep-link rade kad se stigne preko dugmeta), ali bez ijednog nav-reda.
4. **Draft parovi (`coupleInfo.draft === true`) ne vide dugme** — draft nema
   pravi datum venčanja koji je "prošao/nastupio", isto kao što Pregled već
   sakriva/blokira više akcija za draft parove.
5. **`EUR_RATE` se izvlači u deljeni helper** (`src/lib/currency.ts`)
   umesto da se duplira treći put — postojao je zasebno u `OverviewCard.tsx`
   I `BudgetCard.tsx` (oba `EUR_RATE = 117.5`), Pokloni je treći potrošač.
   **PROŠIRENO 2026-08-30 na zahtev vlasnika:** vrednost više NIJE
   hardkodovana konstanta — `src/lib/nbs-rate.ts` čita zvanični "srednji
   kurs" direktno sa javne NBS stranice
   (`webappcenter.nbs.rs/ExchangeRateWebApp/ExchangeRate/CurrentMiddleRate`,
   HTML bez potrebe za registracijom — NBS-ov registrovani veb-servis
   sistem TRAŽI pravno lice/preduzetnika, ova javna stranica ne). Keš u
   `site_config` kolekciji (`getCachedEurRateConfig`/`setCachedEurRateConfig`
   u `src/lib/portal.ts`), osvežava se najviše jednom u 24h — organski, pri
   prvom load-u kad je keš zastareo, BEZ novog cron job-a. Fallback lanac:
   sveže sa NBS → poslednja keširana vrednost → `FALLBACK_EUR_RATE = 117.5`
   (samo ako ni jedno ni drugo ne postoji, npr. prvi ikad poziv i NBS
   nedostupan). `toRSD()` sad prima `eurRate` kao parametar (ne čita globalnu
   konstantu) — `OverviewCard.tsx`/`BudgetCard.tsx`/`PokloniCard.tsx` sve
   dobijaju `eurRate` kao prop iz `MojeVencanjeClient.tsx`, koji ga učitava
   jednom po loginu preko nove `getEurRateAction()`. `BudgetCard.tsx` se
   deli sa `raspored-sedenja` standalone portalom — tamo `eurRate` ostaje
   opciono sa fallback default-om, taj poziv NIJE dirnut (van obima ovog
   taska).

## Impact

**Nova kolekcija i facade:**
- `src/lib/pokloni.ts` (nov) — `loadPokloni(slug)`, `saveGifts(slug,
  gifts: GiftEntry[])`, `deletePokloni(slug)`. Prati oblik `src/lib/portal.ts`
  (`col()` helper, `findOneAndUpdate` sa `$setOnInsert` za upsert bez
  dupliranja koda).

**Tipovi:**
- `src/app/moje-vencanje/types.ts` — dodati `GiftEntry` (`id`, `name`,
  `linkedInviteeId?`, `kind: "amount" | "note"`, `amount?: number`,
  `currency?: "RSD" | "EUR"`, `note?: string`, `createdAt`) i `PokloniData`
  (`slug`, `gifts: GiftEntry[]`, `createdAt`, `updatedAt`).

**Server akcije** (`src/app/moje-vencanje/actions.ts`):
- `loadPokloniAction()` / `saveGiftAction(entry)` / `deleteGiftAction(id)` —
  sve kroz postojeći `getAuthSlug()`, nikad klijentski slug.

**UI:**
- `src/app/moje-vencanje/PokloniCard.tsx` (nov) — model po `MeniCard.tsx`
  (forma + lista + save) i `GuestsCard.tsx`'s `InviteePickerModal` (pretraga
  sa `normalizeName()` fuzzy match protiv `guestList.invitees`, fallback na
  slobodan unos imena). Sadrži i prikaz sume na dnu.
- `src/app/moje-vencanje/OverviewCard.tsx` — novi `isOnOrAfterWeddingDay()`
  helper (nedostaje danas: postojeći `daysUntil()` kleštira na 0, ne može da
  razlikuje "danas" od "3 dana posle") + novi CTA blok, uslovljen datumom i
  `!coupleInfo.draft`.
- `src/app/moje-vencanje/nav-items.tsx` — minimalan dodir, samo ono što je
  tipski neizbežno: `"pokloni"` u `ActiveView` union (koristi se u
  `MojeVencanjeClient.tsx` i `Sidebar.tsx` re-exportu) i posledično jedan
  unos u `LOCKED_FEATURE_INFO` (taj `Record<ActiveView, {...}>` mora imati
  SVE ključeve union tipa ili `tsc` puca — čak i za view koji se nikad ne
  zaključava, jer se koristi za gallery-only korisnika ako bi ikad video ovaj
  tab). **`NAV_ITEMS` niz se NE dira** — nema reda za Pokloni, pa se
  nigde ne pojavljuje u Sidebar-u ni mobilnom meniju (odluka #3).
- `src/app/moje-vencanje/MojeVencanjeClient.tsx` — surgical dodaci:
  `React.lazy` uvoz, `validTabs` niz (2x — auto-login i login), `?tab=` URL
  sync efekat, glavni render blok. **Mobilni bottom-nav i mobile sidebar
  overlay se NE diraju** (odluka #3 — bez nav stavke nigde osim Pregleda).

**Kaskadno brisanje:**
- `src/app/api/admin/couples/[slug]/route.ts` (DELETE handler) — dodati
  `deletePokloni(slug)` u postojeći `Promise.all([...])`.
- `scripts/lib/couple-slug.mjs` — dodati `"pokloni"` u `LINKED_COLLECTIONS`
  (koristi ga i `rename-couple-slug.mjs` i `deleteCoupleCascade` helper).

**Deljena cena:**
- `src/lib/pricing.ts` ili `src/data/pricing.ts` — novi izvezeni
  `EUR_RATE` (ili `toRSD(amount, currency)` helper); `OverviewCard.tsx`
  prelazi na njega umesto lokalne konstante.

## Dependencies

- Nema zavisnosti od drugih otvorenih taskova u `HISTORY.md`.
- Zavisi od odgovora na Decisions #2 i #3 pre pisanja koda (menjaju obim:
  da li dirati `payments/kinds.ts` i koliko dirati `nav-items.tsx`/Sidebar).

## Risks

- **`MojeVencanjeClient.tsx` je veliki fajl sa dosta mesta koja moraju ostati
  sinhronizovana** (validTabs nizovi, lazy uvozi, render grane) — lako je
  promeniti jedno mesto a zaboraviti drugo. Mitigacija: `grep -n
  "\"guests\"\|'guests'"` (ili slično za `meni`) pre commit-a da se nabroje
  SVA mesta koja pattern dira, pa se isti spisak primeni na `"pokloni"`.
- **Valutna suma je lako pogrešna** ako se RSD/EUR ne konvertuju dosledno —
  mitigacija: jedan deljeni `toRSD()` helper, jedinični test/ručna provera sa
  mešovitim RSD+EUR+opisnim unosima pre push-a.
- **Kaskadno brisanje se lako zaboravi** (nova kolekcija = novo mesto za
  orphan podatke posle rename/delete) — mitigacija: eksplicitan korak u
  planu (v. Impact) + ručna provera `node scripts/rename-couple-slug.mjs
  <test-slug> <test-slug>-2` (dry-run) posle izmene da se `pokloni` pojavi u
  ispisu.
- **Proizvodna aplikacija** — CLAUDE.md zahteva `npx tsc --noEmit` +
  ručnu proveru u browseru pre svakog push-a; ovaj task ne sme da bude
  izuzetak samo zato što veći deo kucanja radi OpenCode (v. sledeći odeljak).

## Proces implementacije — OpenCode orkestracija

Vlasnik traži da "pešački" (mehanički) deo kucanja koda odradi **OpenCode**
CLI (v1.18.25, instaliran lokalno), dok Claude Code orkestrira: piše tačne
instrukcije po koraku iz ovog plana, pregleda diff koji OpenCode napravi,
pokreće `tsc`/build/ručnu proveru, i vraća OpenCode na popravku ako nešto ne
štima — umesto da Claude sam kuca svaki fajl.

**Blokada koja mora da se reši PRE bilo kakvog delegiranja:**
`opencode providers list` trenutno vraća **0 kredencijala**
(`~/.local/share/opencode/auth.json` prazan). Bez prijave na pravog
provajdera, OpenCode ima pristup jedino besplatnim `opencode/*` "zen" model
imenima (npr. `opencode/big-pickle`) — neprikladno za produkcioni kod na
aplikaciji sa pravim plaćenim korisnicima. Vlasnik treba da pokrene
`opencode providers login` (ili ekvivalent za svoj postojeći Anthropic/OpenAI
nalog/API ključ) pre nego što se korak "Implementacija" iz plana preda
OpenCode-u.

**Predloženi tok rada po koraku:**
1. Claude priprema tačan, uzak prompt za jedan Korak iz `## Steps` (npr. samo
   "napravi `src/lib/pokloni.ts` po uzoru na `src/lib/portal.ts`, evo tačnog
   sadržaja tog fajla za referencu") — nikad ceo feature odjednom.
2. Pokretanje: `opencode run --model <provider>/<model> "<prompt>"` u repo
   direktorijumu (neinteraktivni `run` mod, ne `tui`).
3. Claude čita diff (`git diff`), proverava da li se drži konvencija iz
   CLAUDE.md (Meni/GuestsCard obrasci, auth kroz `getAuthSlug()`, srpski copy
   bez zabranjenih reči), pokreće `npx tsc --noEmit`.
4. Ako nešto ne štima — Claude ILI ručno ispravlja (sitne stvari), ILI šalje
   OpenCode-u tačan follow-up prompt sa greškom (za veće promene).
5. Tek kad SVI koraci prođu `tsc` + ručnu proveru u browseru, predlaže se
   commit — nikad automatski push (CLAUDE.md pravilo).

## Steps

- [x] **Data layer** — `src/lib/pokloni.ts` facade + `pokloni` kolekcija +
      tipovi u `types.ts` (log: 2026-08-30).
- [x] **Kaskadno brisanje** — `deletePokloni` u DELETE ruti +
      `LINKED_COLLECTIONS` u `couple-slug.mjs` (log: 2026-08-30).
- [x] **Server akcije** — `loadPokloniAction`/`saveGiftsAction` u
      `actions.ts` (celokupna lista se čuva odjednom, ne po stavci —
      jednostavnije od originalno planiranog per-entry API-ja, isti
      `getAuthSlug()` auth) (log: 2026-08-30).
- [x] **Deljeni `EUR_RATE`/`toRSD()`** — novi `src/lib/currency.ts` (NE
      `data/pricing.ts` — taj fajl je eksplicitno rezervisan za katalošku
      cenu proizvoda, komentar u fajlu upozorava da nije za FX konverziju);
      `OverviewCard.tsx` I `BudgetCard.tsx` prelaze na njega (obe ranije
      duplirane kopije) (log: 2026-08-30). **Prošireno (log: 2026-08-30,
      drugi unos):** live NBS "srednji kurs" umesto hardkodovane vrednosti
      — `src/lib/nbs-rate.ts` + keš u `site_config`, `toRSD()` prima rate
      kao parametar, sve 3 komponente ga dobijaju kao prop.
- [x] **PDF izvoz** — `src/app/moje-vencanje/generatePokloniPDF.ts` (novi,
      po uzoru na `generateAudioFlyerPDF.ts`: isti font-učitavanje obrazac,
      A4 lista sa paginacijom za duge spiskove, ime skripte para +
      "Pokloni" naslov + tabela gost/vrednost + ukupno + broj opisnih
      poklona van sume) + "Preuzmi PDF" dugme u `PokloniCard.tsx`, koristi
      postojeću `getWeddingDataForPDF()` akciju (ista kao za invitation
      PDF). Ručno testirano u browseru — pravi 43KB PDF, ispravan `%PDF`
      header, vizuelno proveren sadržaj (log: 2026-08-30, treći unos).
- [x] **`PokloniCard.tsx` UI** — prazan state, pretraga/link ka zvanici,
      forma (numerički EUR default / RSD / opisni tekst), lista, suma na
      dnu (log: 2026-08-30). **Ručni test u browseru sa test parom JOŠ NIJE
      urađen — v. log.**
- [x] **Ožičenje navigacije** — dugme na `OverviewCard.tsx`, `nav-items.tsx`
      (samo `ActiveView` union + `LOCKED_FEATURE_INFO`, bez `NAV_ITEMS`
      reda), `MojeVencanjeClient.tsx` (lazy import, validTabs×2, `?tab=`
      sync, render grana — mobile nav/sidebar potvrđeno netaknuti, grep
      posle izmene) (log: 2026-08-30). `tsc --noEmit` čist na svakom koraku.

## Verification

- `npx tsc --noEmit` čist posle svakog koraka.
- Ručna provera u browseru (dev server) sa test parom čiji je
  `event_date` = danas: dugme se pojavljuje, forma radi, suma je tačna,
  `?tab=pokloni` deep-link radi, izgled u mobilnom (PWA) bottom-nav-u.
- Ručna provera da par sa `event_date` u budućnosti NE vidi dugme, i da
  draft par ne vidi dugme čak ni na dan venčanja.
- `node scripts/rename-couple-slug.mjs <slug> <slug>-test --apply=false`
  (dry-run) posle izmene — `pokloni` mora da se pojavi u ispisu footprint-a.
- Kaskadno brisanje testnog para u adminu — `pokloni` dokument nestaje.
- Rollback: sve izmene su aditivne (nova kolekcija, nov fajl, novi
  case-ovi u postojećim switch/if granama) — bezbedno za `git revert` bez
  migracije podataka ako se odustane.

## Open questions

1. ~~Besplatno vs. plaćeno~~ — **REŠENO 2026-08-29: besplatno.**
2. ~~Trajna nav stavka~~ — **REŠENO 2026-08-29: NE, samo dugme na
   Pregledu.**
3. **Da li se poklon sme vezati za VIŠE zvanica odjednom** (npr. "porodica
   Petrović" kao jedan unos koji broji za više ljudi sa liste), ili je svaki
   unos poklona uvek jedna osoba/ime? Plan pretpostavlja jednostavan model:
   jedno ime po unosu (slobodan tekst ili link na jednu `Invitee` stavku).
   I dalje otvoreno — nije eksplicitno pitano, default ostaje osim ako se
   tokom implementacije ispostavi da je previše ograničavajuće.
4. ~~Kredencijali za OpenCode~~ — **REŠENO 2026-08-29: vlasnik koristi
   OpenCode Zen besplatne modele** (`opencode/big-pickle` potvrđen u
   `opencode models`; vlasnik je pomenuo i "0xAlpha", koji trenutno NIJE na
   listi — moguće rotirano ime na Zen strani, pa se podrazumeva
   `opencode/big-pickle` dok se ne vidi drugačije). Nema potrebe za
   `opencode providers login` — nema API ključa uključenog u ovaj task.
   **Rizik koji ostaje:** besplatni Zen modeli su slabiji od plaćenih —
   orkestracija (uzak prompt po koraku + Claude pregled diff-a + `tsc` +
   ručna provera) je jedina zaštita od greške koja prođe neopaženo, pa se
   ovaj korak ne sme preskočiti ni pod pritiskom da se ubrza.
