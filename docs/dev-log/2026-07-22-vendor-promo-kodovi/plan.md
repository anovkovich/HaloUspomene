# Vendor promo kodovi (per-vendor referral + admin sekcija)

- **ID:** 2026-07-22-vendor-promo-kodovi
- **Status:** in-progress (implementirano 2026-07-22; čeka vizuelnu verifikaciju + push)
- **Created:** 2026-07-22
- **Owner:** Aleksa

## Zašto
Treba nam marketinški kanal sa realnim reciprocitetom prema vendorima (fotografi,
sale, organizatori…). "Featured u direktorijumu" je prazno obećanje dok nemamo
saobraćaj; **keš po preporuci** je industrijski default (LoveStream/Pixellu rade
~10% + popust klijentu). Već imamo skoro celu infrastrukturu: gost-promo
(`payments/promo.ts` + `promo_redemptions`, 10% preko `PROMO10HU`) je živ u
produkciji. Nedostaje: (1) kodovi vezani za konkretnog vendora (i za onog koji
NIJE u našem `vendors` direktorijumu), (2) atribucija — koliko prodaja je doneo
koji kod, (3) evidencija provizije koju dugujemo, (4) admin UI za sve to.

## Ciljevi
- Vendor promo kod koji daje **5% ili 10%** (biraš u modalu preko dropdown-a),
  mapirano na postojeće LS kodove `PROMO5HU` / `PROMO10HU` (oba "All products",
  Active) — nula nove LS konfiguracije, oba rail-a rade odmah.
- Kod radi nezavisno od `vendors` kolekcije (vendor ne mora biti u direktorijumu).
- Per-kod atribucija: broj realizovanih kupovina = `countRedemptions(code)` iz
  postojeće `promo_redemptions` (bez paralelnog praćenja).
- Evidencija provizije: u modal se unosi "provizija po kupovini" (din); sekcija
  računa `duguješ = aktivacije × provizija` + ukupan zbir.
- Admin: collapsed sekcija na vrhu ORDERS taba — lista aktivnih kodova (kod,
  vendor, datum kreiranja, aktivacije, provizija/duguješ, dugme obriši) + dugme
  "Dodaj novi" koje otvara modal sa svim poljima.

## Non-Goals
- **Proizvoljan popust %** — samo dva tiera, 5% i 10%, jer za svaki postoji gotov
  LS kod (`PROMO5HU`, `PROMO10HU`, oba "All products"). Bilo koji drugi procenat
  bi tražio nov LS kod → van scope-a.
- Automatska isplata provizije (na ~par prodaja mesečno ručni bank transfer je ok).
- Vezivanje koda za `vendors` direktorijum / auto-endorsement.
- Cap na broj iskorišćenja (vendor je poverljiv partner; kontrola je `active` flag).
- Nova B2B landing / self-serve vendor portal.

## Odluke
- **Dva tiera: 5% ili 10%, biraš u modalu (dropdown).** Kod nosi `percent` (5|10);
  kartični rail mapira `percent → PROMO5HU/PROMO10HU` (`lsCodeForPercent`). Oba LS
  koda su "All products", Active → pokrivaju sve `kind`-ove. Za 10% postojeći gost
  ostaje na `PROMO10HU`.
- **Webhook se NE dira.** Money-invarijanta (`webhook/route.ts:120`) poredi LS
  total sa **frozen** `order.amountRsd`, a taj iznos je već snižen za tačan
  procenat na checkout-u (`applyPromo` → `getOrCreatePendingOrder`). Webhook je
  percent-agnostičan; jedina tačka koja mora znati procenat je izbor `discountCode`
  na kartičnom rail-u (`actions.ts`).
- **Invarijanta cena: deljivo sa 20 (za 5%).** `applyPromo` radi
  `Math.round(total*percent/100)`; za 5% to je `total/20`, pa cena mora biti deljiva
  sa 20 da padne na ceo dinar i poklopi se sa LS-om. Provereno: sve trenutne cene
  (600/1000/2000/2500/3000/3500/4500/5000/6900/9900/10000/13900/14000/19000) su
  deljive sa 20; custom kombinacije = zbir add-on-ova (svaki deljiv sa 20) → i zbir
  deljiv sa 20. (Bilo koja NOVA cena mora ostati deljiva sa 20.)
- **Nova kolekcija `vendor_promo_codes`** (`code`, `vendorName`, `contact`,
  `note`, `percent` (5|10), `commissionRsd`, `active`, `createdAt`). Kod se retko
  generiše, ručno →
  DB nije mana nego prednost (za razliku od stateless gost-koda koji se renderuje
  na svakom RSVP ekranu). Unique index na `code`.
- **Atribucija bez novog praćenja:** vendor kodovi su distinktni stringovi, pa je
  `countRedemptions(code)` (postojeća `promo_redemptions`, upis na unlock)
  dovoljan za broj aktivacija. `recordRedemption` se NE menja → manji rizik.
- **Odvojena verifikacija:** `verifyPromo` ostaje sinhrona/čista (crypto gost-kod).
  Dodajemo async `verifyVendorPromo(code, kind)` koji čita DB i vraća isti
  `PromoResult` oblik (`percent: PROMO_PERCENT`). Format se ne sudara: gost-kod je
  `HU-…` (4 dela), vendor kod je alfanumerik bez `HU-` prefiksa → gost-grana ga
  odbija kao `bad_format`, padne u vendor-granu.
- **Bez cap-a na vendor grani** (gost ima `PROMO_CAP=25` anti-leak; vendoru je cilj
  VIŠE realizacija). Validnost = `active:true` + `isPromoEnabled()` (isti master
  gate kao gost-promo, radi konzistentnosti).
- **Modal, ne ConfirmDialog:** unos ima više polja → custom modal po uzoru na
  postojeće `PhoneRentalModal` / `BypassLinkModal`. Brisanje ide preko
  `useConfirmDialog().confirm` (dark varijanta) koji tab već koristi.
- **Validacija koda pri kreiranju:** uppercase A-Z0-9, dužina 4–20, NE počinje sa
  `HU-`, jedinstven. Provizija: nenegativan ceo broj (din).

## Impact
- **Nov fajl:** `src/lib/vendor-promos.ts` (facade: `listVendorPromos()` sa
  aktivacijama+provizijom, `createVendorPromo()`, `deleteVendorPromo()`,
  `verifyVendorPromo()`).
- **Izmena:** `src/lib/payments/promo.ts` — dodati `PROMO_LS_CODE_5 = "PROMO5HU"`
  i `lsCodeForPercent(percent) → "PROMO5HU" | "PROMO10HU"`; gost-logika (10%)
  netaknuta.
- **Izmena (checkout, oba rail-a):**
  - `src/app/placanje/[kind]/[slug]/page.tsx` (IPS) — posle neuspelog gost
    `verifyPromo`, probaj `verifyVendorPromo` (bez cap-a). IPS ne dira LS → radi za
    5% i 10% automatski.
  - `src/app/placanje/[kind]/[slug]/actions.ts` (kartica) — isto + `discountCode`
    mora biti `lsCodeForPercent(appliedPromo.percent)` umesto hardkodovanog
    `PROMO_LS_CODE`. `appliedPromo` proširiti da nosi `percent` (ili LS kod).
  - `src/lib/payments/custom-order.ts` (`createCustomPozivnicaOrder`) — isto, da
    vendor kod radi i na custom pozivnici.
- **NE dira se:** `src/app/api/placanje/webhook/route.ts` — percent-agnostičan
  (validira protiv frozen `order.amountRsd`). `recordRedemption` nepromenjen.
- **Nove API rute:** `src/app/api/admin/vendor-promos/route.ts` (GET/POST),
  `src/app/api/admin/vendor-promos/[code]/route.ts` (DELETE). Admin JWT gate kao
  ostale `/api/admin/*`.
- **Izmena UI:** `src/app/admin/OrdersAdminTab.tsx` — collapsed sekcija + lista.
- **Nov fajl:** `src/app/admin/VendorPromoModal.tsx` — forma za dodavanje.
- **DB:** nova kolekcija `vendor_promo_codes` (+ unique index). `promo_redemptions`
  NEPROMENJENA. Dodati kolekciju u CLAUDE.md MongoDB spisak.
- **Prod:** vendor kodovi žive iza `isPromoEnabled()` (već ON u prod).

## Zavisnosti
- Korak 1 (facade + `verifyVendorPromo`) mora pre koraka 2 (checkout wiring) i 3
  (API rute ga zovu za create/list).
- LS: nikakva izmena — `PROMO10HU` je 10% na SVE proizvode (potvrđeno u memoriji
  `project_promo_codes`), pokriva sve `kind`-ove.
- Master gate `PROMO_ENABLED=1` već aktivan u produkciji.

## Rizici
- **Sudar formata gost/vendor koda** → dupli popust ili pogrešna atribucija.
  Mitigacija: vendor kod zabranjen da počinje `HU-`; gost-grana se proba PRVA i
  odbija ne-`HU-` format pre nego što se dira DB.
- **Pogrešan LS kod za tier** → webhook karantin (LS naplati 90% a frozen 95% ili
  obrnuto). Mitigacija: `lsCodeForPercent(percent)` je jedina tačka mapiranja;
  kartični rail ga koristi umesto hardkoda; test oba tiera na kartici pre push-a.
- **5% ne pada na ceo dinar** ako se ikad uvede cena nedeljiva sa 20 → karantin.
  Mitigacija: invarijanta "deljivo sa 20" zapisana u Odlukama; verifikacija računa
  proveru; sve trenutne cene već zadovoljavaju.
- **Bez cap-a = zloupotreba** ako kod procuri. Mitigacija: `active` flag za
  trenutno gašenje; kod je vezan za poverljivog partnera, ne javno deljen.
- **`verifyPromo` sinhrona, `verifyVendorPromo` async** — oba call-site-a već
  `await`-uju `countRedemptions`, pa je async grana bezopasna; paziti da se ne
  pozove DB kad je gost-kod već validan (early return).
- **Produkcija/plaćanja** — dodiruje checkout put. Mitigacija: gost-grana ostaje
  netaknuta i proba se prva; vendor grana je čist dodatak posle nje; `tsc` +
  ručni test oba rail-a pre push-a (obavezno, [[feedback_test_before_push]]).

## Koraci
- [x] **Data sloj + verifikacija** (log: 2026-07-22) — `src/lib/vendor-promos.ts`: kolekcija
  `vendor_promo_codes` (+ unique index na `code`), `createVendorPromo`
  (validacija: uppercase, ne-`HU-`, jedinstven, `percent∈{5,10}`,
  `commissionRsd≥0`), `listVendorPromos` (spaja `countRedemptions` po kodu +
  računa `owedRsd`), `deleteVendorPromo`, i `verifyVendorPromo(code, kind)` →
  `PromoResult` (`percent` iz dokumenta, samo `active` + `isPromoEnabled`). U
  `promo.ts`: `PROMO_LS_CODE_5` + `lsCodeForPercent(percent)`. _Acceptance:_
  `tsc` prolazi; `verifyVendorPromo` vraća tačan `percent` za seed kod, invalid
  za ugašen/nepostojeći.
- [x] **Checkout wiring (oba rail-a + custom)** (log: 2026-07-22) — u `page.tsx`, `actions.ts`,
  `custom-order.ts`: posle neuspelog gost `verifyPromo`, probaj
  `verifyVendorPromo` (bez `PROMO_CAP`), pa `applyPromo`. Kartica: `appliedPromo`
  nosi `percent`, a `discountCode = lsCodeForPercent(percent)`. _Acceptance:_
  ručni test — vendor kod (i 5% i 10%) na IPS i na kartici daje tačan popust i
  freeze-uje ispravan `amountRsd`; gost-kod i dalje radi nepromenjeno.
- [x] **Admin API** (log: 2026-07-22) — `GET/POST /api/admin/vendor-promos` (+ `DELETE
  /[code]`), admin JWT gate, validacija na POST-u vraća 400 sa porukom.
  _Acceptance:_ `curl` sa admin cookie-jem lista/kreira/briše; bez cookie-ja 401.
- [x] **Admin UI** (log: 2026-07-22) — collapsed sekcija na vrhu `OrdersAdminTab` (lista: kod,
  vendor, **popust %**, datum, aktivacije, provizija, duguješ, obriši) +
  `VendorPromoModal` (kod, vendorName, kontakt, napomena, **dropdown popust
  5%/10%**, provizija/kupovina) + brisanje preko `confirm`. _Acceptance:_
  dodavanje kroz modal (oba tiera) prikaže red sa tačnim %; brisanje ga ukloni uz
  potvrdu; zbir "duguješ" tačan.
- [~] **Verifikacija + doc** (log: 2026-07-22) — DONE: `tsc` čist, `eslint` čist,
  `next build` iskompajlirao, CLAUDE.md ažuriran, lokalne rute 401-gate provereno.
  PENDING: end-to-end test naplate (frozen 5% i 10% na oba rail-a) preko
  `next build && next start` sa dostupnim Atlas-om + korisnikova vizuelna
  verifikacija UI-a. _Acceptance:_ sve zeleno; log entry u `log.md`.

## Verifikacija
- `npx tsc --noEmit` bez grešaka.
- Preko `next build && next start` (ne `next dev` zbog non-GET API 404 gotcha):
  1. Seed dva vendor koda (jedan 5%, jedan 10%) kroz admin modal → oba u listi sa
     0 aktivacija i tačnim %.
  2. IPS checkout sa svakim → tačan popust (5% i 10%), freeze `amountRsd` tačan.
  3. Kartični checkout sa svakim → LS prosleđen `PROMO5HU`/`PROMO10HU` redom, LS
     total = frozen (nema karantina za oba).
  4. Odobri order → `countRedemptions` +1 → lista pokaže 1 aktivaciju, duguješ =
     provizija × 1.
  5. Gost `HU-…` kod i dalje daje 10% (regresija check).
  6. Ugašen (`active:false`) kod → checkout ga ignoriše (puna cena).
  7. (Sanity) proveri da je svaka cena deljiva sa 20 pre push-a.
- **Rollback:** feature je aditivan. Ako nešto krene loše: (a) obriši/ugasi vendor
  kodove (checkout pada na punu cenu), (b) revert checkout izmena vraća gost-only
  ponašanje, (c) kolekcija `vendor_promo_codes` može ostati prazna bez uticaja.

## Proširenje: prijatelj-kodovi (2026-07-22)

Isti sistem, drugi tip koda (detalji u `log.md`):
- **`type: "vendor"|"friend"` + `maxUses`** na `vendor_promo_codes`; friend =
  75%, `maxUses:1` (single-use), provizija 0.
- **`createFriendPromo`** auto-generiše `PRIJATELJ`+4 RANDOM cifre (ne
  sekvencijalno — ne otkriva redosled/broj prijatelja).
- **`verifyVendorPromo`** enforce cap (`countRedemptions >= maxUses` → odbij).
- **`lsCodeForPercent(75)`** čita env `LS_FRIEND_DISCOUNT_CODE` (=`Q4NJGZNW`).
  Env, ne hardkod: LS kod se može ukucati direktno na LS checkout-u pa MORA biti
  random/nepogodljiv.
- **Nova invarijanta:** cene deljive sa **4** (za 75%) — sve trenutne RSD cene su.
- **Deploy prerequisite:** `LS_FRIEND_DISCOUNT_CODE=Q4NJGZNW` u Vercel env + LS
  kod aktivan (75%, All products).
- Verifikovano live na IPS-u: 5000→1250, single-use odbija posle 1 aktivacije.

## Otvorena pitanja
- Da li vendor kod sme na `raspored`/`galerija` (gost-kod ne sme)? Predlog: DA —
  `PROMO10HU` je 10% na SVE, partnerstvo je namerno. Potvrditi pri implementaciji;
  ako ne, ograničiti `verifyVendorPromo` na isti `ELIGIBLE_KINDS` set.
