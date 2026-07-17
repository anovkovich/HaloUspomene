# Plan: Self-serve naplata iz buildera `/napravi-pozivnicu` — FINALNA VERZIJA

> Autor: Fable 5, 2026-07-16 (v3 — uklopljene odluke vlasnika). Status: FINALAN, spreman za e2e implementaciju.

## Odluke vlasnika (2026-07-16) — pojednostavljenje

1. **USB suveniri (kaseta 2.500 / bočica 2.000) IZLAZE iz payment sistema.** Fizička stavka → plaćanje POUZEĆEM pri isporuci. Sistem samo: beleži izbor (`paid_for_audio_USB` flag), prikazuje cenu informativno („plaćanje pouzećem"), i obaveštava admina Web3Forms emailom. USB NE ulazi u `computeBuilderMoney` total, NE utiče na `detectPackage`, NE utiče na unlock.
2. **Muzika (1.000), custom boja (600), polaroid slike (600) su BESPLATNE (gratis bonus).** Sistemski besplatne uz SVAKI tier (Odluka Q2 = opcija A, vidi dole); marketinški se reklamiraju kao bonus Kompletan/Premium paketa. Nikad se ne naplaćuju online.

**Posledica: Nalaz-1 rupa iz Amandmana v2 je ELIMINISANA po konstrukciji.** Nijedan flat dodatak više nema online cenu → flag koji „preživi" fiksni tier unlock ne može da procuri ni dinar. „Snapshot-scoped autoritativni unlock" (obaranje flagova, `unsetCoupleFields`, belt provere pri unlock-u) se BRIŠE iz plana — unlock ostaje čisto ADITIVAN, bajt-identičan današnjem za fiksne tiere, plus novi aditivni `custom` case.

## Model

Builder na poslednjem koraku (`detectPackage`):
- **Pun Osnovni (5.000) / pun Kompletan (9.900) / pun Premium (13.900)** → self-serve `/placanje/pozivnica/[slug]/?tier=...` (kartica + IPS, već radi). Gratis dodaci (muzika/boja/slike) i USB ne kvare detekciju.
- **Parcijalna funkcionalna kombinacija** → `?tier=custom`: upsell kartica za pun paket (aktivno odmah) + IPS za custom iznos (ručno admin odobrenje). Nema novih LS proizvoda.

### Custom slučajevi (kompletna lista, cene verifikovane iz pricing.json)

Custom = funkcionalni skup ∉ {∅, sva tri}. Klasik (partial popust 2.000 važi uz raspored+još jedan; premium partial 2.500):
- osnovni+raspored 7.500 · osnovni+audio 8.000 · osnovni+galerija 8.500
- osnovni+raspored+audio 8.500 · osnovni+raspored+galerija 9.000 · **osnovni+audio+galerija 11.500 (> Kompletan 9.900!)**
- premium sam 10.000 · +raspored 12.500 · +audio 13.000 · +galerija 13.500 · +raspored+audio 13.000 · +raspored+galerija 13.500 · **+audio+galerija 17.000 (> Premium 13.900!)**

Upsell ima smisla u SVAKOM custom slučaju; u dva boldovana je custom SKUPLJI od punog paketa → success-screen tada prikazuje SAMO pun paket („Kompletan je jeftiniji i dobijate više"). `detectPackage` vraća `upsellCheaper: rsd >= upsell.rsd` za taj UI.

## Kritični nalazi (istorija, i dalje važe gde je naznačeno)

- **N1** — Builder VEĆ pravi couple (`POST /api/pozivnica/create`); `quickRegisterCouple` NE treba.
- **N2 (ŽIVA RUPA, i dalje otvorena na deploy-u)** — create/upgrade rute upisuju `paid_for_*` flagove kao `true` na draft; korisnik plati osnovni 5.000 karticom → `unlock("osnovni")` samo `draft:false` → funkcionalni dodaci (raspored/audio/galerija) žive neplaćeni. Zatvara **Z1**.
- **N3** — `custom_color` prikazan a nesabran: sada MOOT (boja je gratis) — u UI samo preimenovati u „gratis".
- **N4** — `unlock()` bez `default` case-a; `custom` dobija eksplicitan case.
- **N5** — `/placanje` tiho degradira nepoznat `?tier=`.
- **Amandman-v2 Nalaz-1** — flat leak kroz fiksni tier: ELIMINISAN odlukama vlasnika (vidi gore). Snapshot-scoped unlock POVUČEN.

## Z1 — zatvaranje N2 (pojednostavljeno i prošireno)

Uslov: **bar jedan FUNKCIONALNI dodatak (raspored/audio/galerija)** — flat više nisu naplativi pa „naplativ dodatak" formulacija otpada. USB implicira audio (forma ga briše kad se audio isključi), pa je pokriven tranzitivno.

Implementacija u `kinds.ts` pozivnica adapteru (`tiers()` + `computeOrder()`): za `osnovni` na draft couple-u, ako je `paid_for_raspored || paid_for_audio || paid_for_gallery` → izostavi/odbij `osnovni`, poruka „aktivirajte Kompletan ili platite svoju kombinaciju".

**Provera po FLAGOVIMA, ne po `builder_extras`** — flagovi postoje na SVIM builder draftovima (i legacy, pre ovog deploy-a), pa Z1 štiti i postojeće rekorde koje `builder_extras` pristup ne bi. Admin-vođeni draftovi se ionako ne naplaćuju kroz self-serve osnovni link (admin naplaćuje ručno/IPS); ako ikad zatreba, admin skine flagove. `builder_extras` ostaje potreban SAMO za custom order money (server-side snapshot).

## Custom = IPS-only put (NE nov kind, NE generički tier)

- `tier: "custom"` pod postojećim `pozivnica` kind-om.
- `src/lib/payments/custom-order.ts` — `createCustomPozivnicaOrder(slug)`: iznos 100% server-izračunat iz `builder_extras` snapshot-a u bazi, ne iz klijenta.
- Kartica NIKAD ne vidi custom (`tiers()` ga ne sadrži → `createCardCheckout` odbija; webhook guard: card order sa `tier:"custom"` → quarantine/review).
- `unlock("custom")`: `draft:false` + `true` flagovi TAČNO po frozen `order.customSelection` (funkcionalni trio + `premium_paid` ako je premium). NIKAD ne obara flagove. `revoke` simetrično obara samo ono što je unlock postavio (belt: pre obaranja `paid_for_gallery` proveri `findUnlockedOrderForTuple("galerija", slug)` — standalone kupovina galerije ne sme da se ugasi).
- **Admin approve failure mode**: custom unlock DEFANZIVAN — nedostajuća/korumpirana `customSelection` → `draft:false` + Sentry + adminNote, NIKAD throw (approve ruta prebaci order u `unlocked` PRE unlock-a, retry je no-op). Ne menjati redosled approve rute.

## `builder_extras` snapshot

Novi field na `WeddingData` (types.ts), upisuju ga sve 4 builder rute (classic/premium × create/upgrade): `{ premium, raspored, audio, galerija, music, usb, images, customColor }` = `BuilderSelection`. Služi ISKLJUČIVO za server-side izračun custom IPS iznosa (i admin uvid). Ne briše se posle unlock-a (nema više autoritativnog gazenja, pa ni potrebe za `unsetCoupleFields`). Couple bez `builder_extras` → custom order nemoguć (defanzivna greška), sve ostalo radi kao danas.

## Izmene u `builder-pricing.ts` (fajl već postoji, verifikovan)

1. `computeBuilderMoney`: IZBACI naplatne linije za `usb` (nikad u lines — pouzeće), a `music`/`images`/`customColor` pretvori u **gratis linije `rsd: 0`** kad su selektovane (label „— gratis uz paket") — panel i IPS order ih prikazuju, ne naplaćuju. Bundle-discount logika (all-three / partial) NEPROMENJENA.
2. **OBRIŠI `hasOutOfBundleExtra`** u celosti — flat dodaci više ne guraju u custom.
3. `detectPackage`:
   - klasik: `!raspored && !audio && !galerija && totalRsd === osnovniPrice` → fixed osnovni; `allThree && totalRsd === kompletanPrice` → fixed kompletan; inače custom (upsell kompletan).
   - premium: `allThree && totalRsd === premiumPrice` → fixed premium; inače custom (upsell premium).
   - Custom grana dobija `upsellCheaper: totalRsd >= upsell.rsd`.
   - Guard `totalRsd === tier.price` OSTAJE (pricing.json drift → fail-safe u custom).
4. `BuilderSelection` interfejs OSTAJE pun (sa `usb`/`music`/`images`/`customColor`) — on je i tip `builder_extras` snapshot-a i ulaz za gratis linije; samo mu se menja uloga u novcu.
5. Komentar u zaglavlju ažurirati (gratis/pouzeće semantika).

## Pre-existing bugovi (fix uz ovo — oba i dalje relevantna)

- **Classic upgrade ruta ne upisuje `paid_for_gallery`** (`api/pozivnica/[slug]/upgrade` ~101–106; create ga ima na 162). I dalje bitno: galerija je naplativ funkcionalni dodatak — bez flaga Z1 ne vidi galerija-only config, preview je pogrešan, snapshot netačan. Fix: 1 linija.
- **Premium tok uopšte ne nosi USB**: premium payload u `QuestionnaireForm.tsx` (~3075–3144) ne šalje `paid_for_audio_USB`, premium create/upgrade rute ga ne persistuju, i premium Web3Forms email NEMA „USB suvenir" red (classic ima, ~3339). Pošto je email sada JEDINI kanal naplate USB-a (pouzeće), ovo je direktan gubitak COD prihoda. Fix: dodati u payload + obe premium rute + email red. (Alternativa „sakrij USB u premium modu" ODBAČENA — USB prihod je realan i tok već postoji u UI.)

## Fajlovi

NOVO: `src/lib/payments/custom-order.ts`.
POSTOJI (menja se): `src/lib/payments/builder-pricing.ts` (sekcija gore).
MENJA: `src/app/pozivnica/[slug]/types.ts` (+`builder_extras`); `api/pozivnica/create` + `api/pozivnica/[slug]/upgrade` (snapshot; upgrade +`paid_for_gallery`); `api/premium-pozivnica/create` + `api/premium-pozivnica/[slug]/upgrade` (snapshot; +`paid_for_audio_USB`); `src/lib/orders.ts` (+`customSelection`, exact-amount reuse); `src/lib/payments/kinds.ts` (custom unlock/revoke case + Z1 po flagovima); `src/app/placanje/[kind]/[slug]/page.tsx` (custom grana, N5 poruka); `src/components/payments/CheckoutPanel.tsx` (+`ipsOnly`, `upsell` opt-in, gratis linije); `api/placanje/webhook` (custom guard → review); `src/app/napravi-pozivnicu/QuestionnaireForm.tsx` (suma → `computeBuilderMoney`; USB label „plaćanje pouzećem" van sume; gratis labeli; premium payload/email +USB; success CTA po `detectPackage`); `OrdersAdminTab` (kozmetika: custom stavke + selekcija).
NE DIRA: lemonsqueezy/lemon-overlay/promo/notify, admin approve redosled, ostali adapteri (rodjendan/punoletstvo/raspored/galerija), quick-register, standalone tokovi, middleware, hvala.

## Redosled implementacije (e2e)

1. `builder-pricing.ts` — pojednostavljenje (gratis/USB/detectPackage) + testovi računice.
2. `types.ts` + 4 builder rute — `builder_extras` snapshot + oba bug-fixa (gallery u upgrade, USB u premium).
3. `orders.ts` — `customSelection` + exact-amount reuse.
4. `custom-order.ts` — server-side custom order iz snapshot-a.
5. `kinds.ts` — `custom` case u unlock/revoke (aditivan, defanzivan) + Z1 (flagovi, osnovni).
6. `placanje/page.tsx` + `CheckoutPanel.tsx` — custom grana (ipsOnly + upsell kartica; `upsellCheaper` → samo pun paket).
7. `webhook` — guard: card + `tier:"custom"` → review.
8. `QuestionnaireForm.tsx` — computeBuilderMoney suma, gratis/pouzeće labeli, premium USB, success-screen CTA (iza flag-a).
9. `OrdersAdminTab` — kozmetika.
10. Verifikacija (dole).

## Rollout

Flag `NEXT_PUBLIC_BUILDER_CHECKOUT=1` gate-uje SAMO novi success-screen. Server delovi (Z1, custom case, snapshot) inertni bez builder ulaza — osim Z1 koji je ODMAH aktivan i za legacy draftove (namerno: zatvara živu N2 rupu od Deploy-a 1). Deploy 1 (flag off) → verifikacija → Deploy 2 (flag on). Rollback = flag off.

## Verifikacija (bez pravih para)

`next build && next start` (dev 404-uje non-GET dynamic API rute). Regresija svih fiksnih tokova (pozivnica/rodjendan/punoletstvo/raspored/galerija); builder kombinacije: čist osnovni, osnovni+gratis (→ fixed osnovni 5.000), osnovni+USB+audio (→ custom, USB van sume), pun kompletan (+gratis → i dalje fixed 9.900), pun premium, custom parcijale uklj. audio+galerija (upsellCheaper); custom IPS end-to-end + admin approve + defanzivni unlock; Z1 (draft sa funkcionalnim flagom NE nudi osnovni — i legacy rekord); webhook custom guard → review; premium USB u emailu.

## Zašto je plan sada bezbedan (sažetak invarijanti)

- Ništa flat nije naplativo online → nema šta da procuri kroz aditivan unlock (Nalaz-1 mrtav).
- Fiksni tieri: unlock nepromenjen (aditivan, idempotentan); jedini vektor (osnovni ispod configa) blokira Z1 po flagovima, uklj. legacy.
- Custom: iznos server-frozen iz baze; samo IPS (ručno odobrenje); kartica/webhook ga strukturno odbijaju; unlock tačno po frozen selekciji, samo dodaje.
- Standalone kupovine i admin tokovi netaknuti (nema obaranja flagova nigde osim simetričnog revoke-a sa belt proverom).


## IMPLEMENTACIJA — status (2026-07-16)

GOTOVO + verifikovano (tsc/eslint po fajlu + pun `next build` PROLAZI):
- Korak 1 builder-pricing.ts (finalno: USB napolje, flat gratis, detectPackage+upsellCheaper)
- Korak 2 types.ts builder_extras
- Korak 3 sve 4 builder rute (snapshot + 2 pre-existing baga: classic upgrade paid_for_gallery, premium USB)
- Korak 4 orders.ts customSelection + custom stale-amount reuse
- Korak 5 custom-order.ts
- Korak 6 kinds.ts: Z1 (po flagovima) + custom unlock/revoke (aditivan, defanzivan, gallery belt)
- Korak 7 webhook custom-guard
- Korak 8 placanje/page.tsx custom grana + CheckoutPanel ipsOnly/upsell
- Korak 9 (deo): premium USB payload + success CTA (flag-gated)

OSTAJE (pre nego sto se flag upali):
- Korak 9 (deo): builder price-DISPLAY -> music/boja/slike "gratis", USB "pouzece" (IIFE total + extras labeli). Vidljiva izmena na zivoj formi, sve-ili-nista.
- Premium Web3Forms email USB red (admin sad ionako vidi USB u couple recordu)
- Korak 10: admin OrdersAdminTab kozmetika (custom tier label) + build&&start manuelni prolazak kroz tok sa flagom ON

Sve iza NEXT_PUBLIC_BUILDER_CHECKOUT (OFF) -> inertno. Nista commit-ovano ni deploy-ovano.

## ZAVRSENO (2026-07-16) — SVIH 10 KORAKA + E2E VERIFIKACIJA

Svih 10 koraka gotovo, pun `next build` PROLAZI, e2e verifikovano na produkcijskom build-u:
- Custom checkout (?tier=custom): "Vasa kombinacija" 7.500, upsell Kompletan 9.900, IPS only (kartica sakrivena), order sa frozen customSelection.
- Z1: draft par sa raspored/audio/galerija flagom -> osnovni blokiran, default Kompletan.
- 9b display: muzika/boja/slike = precrtano + zeleno GRATIS; USB = cena + "pri isporuci"; marketing note ispod Ukupno; custom boja note = gratis.
- Admin: custom order -> "Vasa kombinacija" label.

ZA GO-LIVE: NEXT_PUBLIC_BUILDER_CHECKOUT=1 na Vercel (client env -> bake pri build-u, treba redeploy). Z1 + custom backend su aktivni cim se deploy-uje (nezavisni od flaga).
