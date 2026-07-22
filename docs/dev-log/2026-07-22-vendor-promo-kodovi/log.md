# Log — Vendor promo kodovi

## 2026-07-22 — Task kreiran i isplaniran

- **Šta je urađeno:** Napravljen plan (`plan.md`) za per-vendor promo kodove +
  admin sekciju na ORDERS tabu. Istražena postojeća promo infrastruktura
  (`payments/promo.ts` gost-kod stateless HMAC, `promo-redemptions.ts` ledger,
  oba checkout rail-a: `placanje/[kind]/[slug]/page.tsx` IPS i `actions.ts`
  kartica, unlock/`recordRedemption` u webhook + admin approve route). Potvrđeno
  da `PROMO10HU` = 10% na SVE proizvode (reuse za vendor kodove). Dve dizajn
  odluke potvrđene sa korisnikom: **(1) fiksno 10%** (reuse LS kod), **(2)
  provizija po aktivaciji + zbir** u sekciji.
- **Commit / PR:** — (planiranje, bez koda)
- **Na šta utiče dalje:** Implementacija dodaje kolekciju `vendor_promo_codes`
  (ažurirati MongoDB spisak u CLAUDE.md); checkout put dobija vendor granu posle
  gost `verifyPromo`; `promo_redemptions` ostaje nepromenjen.
- **Posledice:** Nema još — plan je aditivan feature, rollback opisan u planu.
- **Šta je rešeno:** Definisan realan marketinški kanal (keš-po-preporuci) umesto
  praznog "featured u direktorijumu" reciprociteta.
- **Šta je odblokirano:** Spremno za implementaciju (5 koraka) po odobrenju.
- **Status:** — → planned
- **Blokade / sledeći korak:** Čeka odobrenje plana. Prvi korak: `vendor-promos.ts`
  facade + `verifyVendorPromo`.

## 2026-07-22 — Re-plan: dva tiera (5% i 10%) + provera webhook-a

- **Šta je urađeno:** Revidiran plan — vendor kod sada nosi `percent` (5|10),
  biran preko dropdown-a u modalu. Korisnik napravio `PROMO5HU` (5%, All products,
  Active) na LS. Dodato: `PROMO_LS_CODE_5` + `lsCodeForPercent()` u `promo.ts`,
  `percent` polje u shemi kolekcije, dropdown u modalu, mapiranje `percent → LS
  kod` na kartičnom rail-u. **Proveren webhook** (`webhook/route.ts:120`) na
  korisnikov upit o validaciji iznosa: potvrđeno da NE treba izmena — money
  invarijanta poredi LS total sa frozen `order.amountRsd` (već snižen za tačan %
  na checkout-u), pa je percent-agnostičan. Verifikovano da su sve trenutne cene
  deljive sa 20 (uslov da 5% padne na ceo dinar).
- **Commit / PR:** — (planiranje)
- **Na šta utiče dalje:** Kartični rail (`actions.ts`) je jedina tačka koja mora
  znati procenat (izbor `discountCode`); IPS i webhook netaknuti. Nova invarijanta
  "cene deljive sa 20" — svaka buduća cena mora je poštovati.
- **Posledice:** Plan i dalje aditivan; rizik proširen dvema stavkama (pogrešan LS
  kod za tier, 5% deljivost) sa mitigacijama.
- **Šta je rešeno:** Ispravljena korisnikova pretpostavka da webhook treba menjati
  za 5% — nije, popravka je mapiranje LS koda na kartici.
- **Šta je odblokirano:** Plan spreman za implementaciju sa oba tiera.
- **Blokade / sledeći korak:** Čeka odobrenje ažuriranog plana.

## 2026-07-22 — Implementacija (svih 5 koraka)

- **Šta je urađeno:**
  - **Data sloj:** nov `src/lib/vendor-promos.ts` — kolekcija `vendor_promo_codes`
    (unique index na `code`, lazy `ensureIndex`), `createVendorPromo` (validacija:
    `^[A-Z0-9]{4,20}$`, ne-`HU`, `percent∈{5,10}`, `commissionRsd` 0–100k),
    `listVendorPromos` (jedna agregacija nad `promo_redemptions` za aktivacije +
    `owedRsd`), `deleteVendorPromo`, `verifyVendorPromo` (DB, `active`+gate+eligible
    kind), i centralni `resolveCheckoutPromo` (gost sa cap-om → pa vendor bez cap-a).
  - **`promo.ts`:** dodati `PROMO_LS_CODE_5="PROMO5HU"`, `lsCodeForPercent()`
    (throw za nepoznat %), export `isPromoEligibleKind()`.
  - **Checkout (oba rail-a + custom):** `actions.ts` (kartica) sada bira
    `discountCode = lsCodeForPercent(appliedPercent)`; `page.tsx` (IPS) i
    `custom-order.ts` koriste `resolveCheckoutPromo`. Uklonjeni direktni
    `verifyPromo`/`countRedemptions`/`PROMO_CAP` importi sa tih mesta.
  - **Admin API:** `GET/POST /api/admin/vendor-promos` + `DELETE /[code]`
    (admin JWT gate).
  - **Admin UI:** collapsed `VendorPromoSection` na vrhu `OrdersAdminTab` (lazy
    load, lista: kod·%·vendor·datum·aktivacije·provizija·duguješ·obriši, zbir
    „duguješ ukupno") + nov `VendorPromoModal` (dropdown 5%/10%). Brisanje preko
    `useConfirmDialog`.
  - **Doc:** `vendor_promo_codes` + `promo_redemptions` dodati u CLAUDE.md.
- **Commit / PR:** — (nije commitovano; čeka korisnikovu vizuelnu verifikaciju)
- **Verifikacija:** `npx tsc --noEmit` čist; `eslint` na svih 9 fajlova čist;
  `next build` iskompajlirao sve (pao tek na prerender `/lokacije/beograd` zbog
  Atlas network timeout-a — nevezano za izmene). Lokalno (`next dev`): sve 3 rute
  vraćaju 401 bez cookie-ja (GET/POST/DELETE registrovane i auth-gate-ovane); DELETE
  dinamička ruta radi pod dev-om (nema 404 gotcha ovde).
- **Na šta utiče dalje:** webhook + `orders.ts` netaknuti (percent-agnostični).
  Nova invarijanta: cene deljive sa 20 (za 5%) — svaka buduća cena mora je poštovati.
- **Posledice:** aditivno; gost-promo put nepromenjen (proba se prvi). Rollback:
  ugasi/obriši vendor kodove ili revert checkout izmena.
- **Šta je rešeno:** koraci 1–5 iz plana implementirani i lokalno verifikovani.
- **Šta je odblokirano:** korisnikova vizuelna verifikacija na `/admin` → Uplate;
  potom commit + deploy.
- **Status:** planned → in-progress
- **Blokade / sledeći korak:** Korisnik verifikuje UI na localhost:3000. Za potpun
  end-to-end test naplate (frozen iznos 5% i 10% na oba rail-a) treba dostupan
  Atlas + `next build && next start`. Ne push-ovati bez toga
  ([[feedback_test_before_push]]).

## 2026-07-22 — Live e2e verifikacija (IPS rail, kod „TEST")

- **Šta je urađeno:** Korisnik napravio vendor kod „TEST" (5%, provizija 1000)
  kroz admin UI. Verifikovano protiv PROD Atlas-a: `.env.local` ima
  `PROMO_ENABLED=1`. Učitan pravi IPS checkout `/placanje/pozivnica/milica-uros/`
  sa i bez `?promo=TEST` → zamrznuti orderi: bez koda 5000 din (promo:null), sa
  kodom **4750 din** (`promo.code=TEST`, discountRsd 250) = tačno 5%. Ceo server
  lanac (`resolveCheckoutPromo`→`verifyVendorPromo` iz baze→`applyPromo`→freeze)
  izvršen stvarno, ne simulirano. Dva test ordera obrisana posle (prod DB).
- **Commit / PR:** — (i dalje necommitovano)
- **Na šta utiče dalje:** Ostaje samo kartični rail e2e (LS `PROMO5HU` naplata =
  frozen 4750) — logika verifikovana kodom/matematikom, live LS test opcion pre
  push-a.
- **Šta je rešeno:** IPS rail vendor-kod end-to-end potvrđen na pravom kodu.
- **Blokade / sledeći korak:** Po želji korisnika: commit + deploy (uz opcion LS
  kartični e2e). Kod „TEST" ostaje u bazi dok ga korisnik ne obriše.

## 2026-07-22 — Proširenje: prijatelj-kodovi (75%, single-use, random)

- **Šta je urađeno:** Prošireno na drugi tip koda uz istu infrastrukturu:
  - **Shema `vendor_promo_codes`:** dodati `type: "vendor"|"friend"` (odsutan →
    „vendor", back-compat) i `maxUses: number|null` (null → neograničeno; 1 za
    friend). `percent` proširen na `5|10|75`.
  - **`verifyVendorPromo`:** enforce cap — ako `maxUses` postavljen, odbij kad
    `countRedemptions(code) >= maxUses` (reason „expired"). Vendor kodovi
    (maxUses null) nepromenjeni.
  - **`createFriendPromo`:** auto-generiše `PRIJATELJ` + 4 RANDOM cifre
    (`crypto.randomInt`, ne sekvencijalno — da kodovi ne otkrivaju redosled/broj
    kad ih prijatelji uporede), collision-retry, `percent 75, maxUses 1,
    commission 0, type friend`.
  - **`promo.ts` `lsCodeForPercent`:** grana za 75 → čita `LS_FRIEND_DISCOUNT_CODE`
    env (throw ako fali). Namerno env, ne hardkod: LS kod se može ukucati direktno
    na LS hosted checkout-u, pa MORA biti random/nepogodljiv (`Q4NJGZNW`) — inače
    bi „PROMO75HU" dao 75% svakome ko pogodi.
  - **API POST:** grana `type==="friend"` → `createFriendPromo`, vraća `{code}`.
  - **Admin UI:** dugme „Generiši prijatelj-kod (75%)" pored „Vendor kod";
    friend redovi dobijaju „prijatelj" + „iskorišćen/neiskorišćen" badge i
    „kopiraj" dugme (za slanje prijatelju) umesto provizije/duguješ.
  - **Doc:** `LS_FRIEND_DISCOUNT_CODE` dodat u CLAUDE.md env sekciju.
- **Commit / PR:** — (necommitovano)
- **Verifikacija (live, IPS, PROD Atlas):** admin auth → generisan `PRIJATELJ7015`
  → IPS checkout zamrzao **1250** (5000 −75%), `promo.code` upisan ✓;
  `type:friend, maxUses:1` ✓; single-use: ubačena lažna aktivacija → checkout
  onda ignoriše kod (puna cena 5000, promo null) ✓. Sav test data očišćen. tsc +
  eslint čisti. Kartični rail (env `Q4NJGZNW`) verifikovan kodom, ne živo.
- **Na šta utiče dalje:** **Vercel env `LS_FRIEND_DISCOUNT_CODE=Q4NJGZNW` mora
  biti postavljen pre deploy-a** (inače kartični friend-checkout baca grešku).
  LS mora imati taj kod kao 75% „All products" aktivan (korisnik napravio).
  Nova invarijanta: cene deljive sa 4 (za 75%) — sve trenutne RSD cene jesu.
- **Posledice:** aditivno; postojeći vendor/gost putevi nepromenjeni (maxUses
  null → nema capa). Rollback: obriši friend kodove / ugasi env.
- **Šta je rešeno:** friend-kod (75%, single-use, random, oba rail-a) implementiran
  i IPS e2e verifikovan.
- **Blokade / sledeći korak:** Korisnik dodaje `LS_FRIEND_DISCOUNT_CODE` u Vercel;
  potom commit + deploy. Opcion LS kartični e2e pre push-a.

## 2026-07-22 — Drugi friend-tier (50%) + push

- **Šta je urađeno:** Dodat drugi prijatelj-tier **50%** (LS kod `K4ODA4NQ`), uz
  75%. Kod izgleda identično (`PRIJATELJ####`) — prijatelj ne vidi tier, admin
  vidi % u listi. Izmene: `createFriendPromo(percent)` prima 50|75 (validacija
  `FRIEND_PERCENTS`); `lsCodeForPercent` grana za 50 i 75 → env
  `LS_FRIEND_DISCOUNT_CODE_50` / `_75` (preimenovano iz jednog
  `LS_FRIEND_DISCOUNT_CODE`); API POST prosleđuje `percent`; admin dva dugmeta
  „Prijatelj 75%" / „Prijatelj 50%"; percent tip proširen `5|10|50|75`. CLAUDE.md
  env sekcija ažurirana na dva simetrična naziva.
- **Commit / PR:** feat(promo): vendor + friend promo codes (commitovano na `deploy`).
- **Verifikacija (live IPS, PROD Atlas):** 50% → 5000 zamrznuto na **2500** ✓,
  `type:friend, maxUses:1, percent:50` ✓. tsc + eslint čisti. (75% i single-use
  već verifikovani u prethodnom entry-ju.) Kartični rail (env) verifikovan kodom.
- **Na šta utiče dalje:** **Vercel env OBAVEZNO pre deljenja friend-kodova za
  karticu:** `LS_FRIEND_DISCOUNT_CODE_75=Q4NJGZNW` i
  `LS_FRIEND_DISCOUNT_CODE_50=K4ODA4NQ`. Oba LS koda (75%/50%, All products) moraju
  biti aktivna (korisnik napravio). Bez env-a: IPS radi, kartica pada u
  „nedostupno". Invarijanta: cene deljive sa 4 (75%) i 2 (50%) — sve trenutne su.
- **Posledice:** aditivno; vendor/gost putevi nepromenjeni. Rollback: obriši
  friend kodove / revert.
- **Status:** in-progress (deployano; ostaje opcion LS kartični e2e u prod).
- **Blokade / sledeći korak:** Korisnik postavi 2 Vercel env vara. Kod „TEST"
  (vendor 5%) i dalje u bazi — obrisati kad ne treba.
