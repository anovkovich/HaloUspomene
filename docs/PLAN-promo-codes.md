# Promo codes — implementation plan (Option A)

> Autor: Fable 5, grounded protiv repo-a. Odluka „Opcija A" (LS discount kod +
> validnost na našoj strani, 6 proizvoda ne 12) je zaključana — vidi
> [[project_promo_codes]] memoriju.

## Jezgro: stateless HMAC kod + tanak redemption ledger
Kodovi su **stateless HMAC tokeni** (bez DB upisa pri renderu RSVP success ekrana — kritično, inače bi svaki RSVP pisao u bazu). Iskupljenja se prate u sićušnoj kolekciji samo zbog abuse-cap-a. Popust je **fiksan EUR iznos** (nikad procenat) da LS-ov flat discount kod i naš `computeOrder` ne mogu da razdrift-uju zaokruživanjem.

**Konstante (jedini „consistency ugovor"):**
```
PROMO_DISCOUNT_EUR   = 10        // MORA = vrednost LS discount koda
PROMO_DISCOUNT_RSD   = 1000      // IPS-only; nezavisno
PROMO_LS_CODE        = "SVADBA10" // jedan reusable LS kod
PROMO_VALIDITY_DAYS  = 45        // prozor posle event_date para X
PROMO_CAP            = 25        // max iskupljenja po kodu (leak cap)
```
Eligible **kind = `pozivnica` samo** (poklapa se sa „napravi svoju pozivnicu"; zaobilazi raspored „EUR fiksno 45" kvirk). €10 < €45 min tier → nema negativnih totala.

## A. Data model — kod se DERIVIRA, ne skladišti
Format (copyable, per-couple): `HU-{b32(expDay)}-{coupleTag}-{b32(sig)}`
- `expDay = floor((event_date + 45d)/86400000)` (unix dan)
- `coupleTag = b32(HMAC(SECRET, slug))[:3]` (razdvaja parove istog datuma)
- `sig = HMAC(SECRET, "${expDay}.${coupleTag}")[:5B]`
Verifier čita expDay+coupleTag iz stringa, recompute sig, `timingSafeEqual`, `expDay >= danas`. Svi gosti para X dobijaju ISTI kod (namerno — „kod para X").

**`promo_redemptions` kolekcija** (`src/lib/promo-redemptions.ts`): `{code, orderId, slug, kind, at}`, index `{code:1}`. `countRedemptions(code)`, `recordRedemption(...)`. Piše se pri **unlock**-u, ne pri freeze-u.

**`OrderDocument` dobija** `promo?: { code; discountEur; discountRsd }`. Secret: `PROMO_SECRET` env (ili reuse `JWT_SECRET`).

## B. Validacija + primena — gde popust „sleti"
`src/lib/payments/promo.ts` (server-only):
```
issuePromo(eventDate, slug) -> { code, validUntil } | null
resolvePromo(code, kind, tier) -> { valid, discountRsd, discountEur, validUntil, reason }
applyPromo(money, promo) -> { lines, totalRsd, totalEur }   // dodaje negativnu liniju, floor 0
```
`applyPromo` je **jedina tačka primene** — sloj POSLE `adapter.computeOrder`, PRE `getOrCreatePendingOrder`, u OBA (page + card action). Adapteri netaknuti:
```ts
let money = adapter.computeOrder(entity, tierId);
const promo = code ? resolvePromo(code, kind, tierId) : null;
if (promo?.valid) money = applyPromo(money, promo);   // {l:"Promo popust", rsd:-1000, eur:-10}
const order = await getOrCreatePendingOrder({ ...money, promo: promo?.valid ? {...} : undefined });
```

**Hard part 1 — freeze + tuple-reuse:** promo postaje deo **identiteta ordera**. U `getOrCreatePendingOrder` filter dodaj `"promo.code": input.promo?.code ?? { $exists: false }`. Posledice: gost koji je prvo ušao bez koda zamrznuo je non-promo red; povratak sa kodom → drugi identitet → svež promo red sa popustom; ako kod istekne → fallback na non-promo identitet (puna cena). Card action i page dele identitet `(kind,slug,tier,promo.code)`.

**Hard part 2 — dva koloseka bez drifta:** sistem VEĆ traži `priceEur == LS variant cena` (webhook: `total === amountEur*100`). Promo čuva jednakost oduzimajući isti flat €10 na obe strane (naša: `totalEur = priceEur − 10`; LS: flat €10 kod). Jedini drift = čovek promeni jedno od `{PROMO_DISCOUNT_EUR, LS kod}` bez drugog → pada u postojeći `amount mismatch → quarantine` (fail-safe na admin review, nikad tihi pogrešan unlock). Procenti zabranjeni (rounding drift).

## C. Kartica
- `lemonsqueezy.ts` `CreateCheckoutParams` + `discountCode?` → `checkout_data.discount_code`.
- `actions.ts` `createCardCheckout(kind,slug,tierId,promoCode?)`: re-`resolvePromo` server-side (nikad ne veruj klijentskom iznosu — samo string koda), `applyPromo`, freeze istim promo identitetom, prosledi `discountCode: PROMO_LS_CODE` samo kad `promo.valid`.

## D. IPS
Ništa dodatno. `applyPromo` snizi `totalRsd` pre freeze-a → `order.amountRsd` diskontovan → `<NbsQrCode total={amountRsd}>` renderuje diskontovan QR. Linija „−1.000 din" u sažetku. Redemption pri admin odobrenju.

## E. Surfacing + putovanje koda
**Izdavanje:** `InvitationOfferCTA` dobija `promoCode`+`promoValidUntil` (server-side `issuePromo(event_date, slug)`). Classic `RSVPFrom` je client → `pozivnica/[slug]/page.tsx` računa kod i prosleđuje ga kao prop. Premium/birthday forme već imaju couple data na server pretku.
**Put (URL izvor istine + localStorage/manual backstop):** `?promo=CODE` na CTA linku → `/izrada-pozivnica-online`+`/napravi-pozivnicu` u `localStorage["hu_promo"]` (preživi kreiranje novog slug-a) → builder doda `?promo=` na redirect ka `/placanje` → page čita `searchParams.promo` → `resolvePromo`. Backstop: „Imate promo kôd?" polje na `/placanje` (navigira na `?promo=` → server re-freeze).

**Microcopy (sr):**
- CTA reveal: „**Poklon kôd za vašu pozivnicu**" · chip `HU-7K2-M9Q-XA4` · „Uštedite 10 € — kôd važi do 24.08.2026." · „Kopiraj kôd"
- Panel primenjen: zeleni baner „Promo kôd primenjen — ušteda 1.000 din" + linija „Promo popust −1.000 din"
- Polje: „Imate promo kôd?" / „Primeni" · Nevažeći: „Kôd nije važeći ili je istekao."

## F. Fajlovi + redosled + edge case-ovi + ops
**Create:** `src/lib/payments/promo.ts`, `src/lib/promo-redemptions.ts`
**Modify:** `orders.ts` (promo u identitet), `lemonsqueezy.ts` (discountCode), `placanje/[kind]/[slug]/page.tsx`, `.../actions.ts`, `CheckoutPanel.tsx`, `InvitationOfferCTA.tsx`, RSVP success surfaces (`RSVPFrom.tsx`, `PremiumRsvpForm.tsx`, `StandaloneRSVPForm.tsx`, `BirthdayRSVPForm.tsx` + server pretke), `webhook/route.ts` (recordRedemption posle unlock), `admin/orders/[orderId]/route.ts` (recordRedemption posle approve).

**Build order:** (1) `promo.ts` pure funkcije + test HMAC round-trip/expiry → (2) `orders.ts` promo-u-identitet → (3) money path: LS discountCode + page + card action → (4) `promo_redemptions` + cap + record na oba unlock mesta → (5) surfacing (CTA + builder localStorage + polje).

**Edge (top 5):** istekao → fallback puna cena; already-unlocked → „Već aktivirano" pre promo; kind/tier mismatch → resolvePromo odbije (kind≠pozivnica); LS-vs-naš drift → quarantine; reuse/abuse → cap + kratka expiry + per-couple `coupleTag`.

**Ops runbook:** u LS napravi JEDAN discount, **fiksni €10**, primeni na 3 pozivnica varijante, **bez LS usage-limit/expiry** (validnost je naša). Nazovi ga `SVADBA10`. `PROMO_LS_CODE` + `PROMO_DISCOUNT_EUR` se **uvek menjaju zajedno** (mismatch se self-quarantine-uje ali blokira prodaju). `PROMO_DISCOUNT_RSD` menjaj slobodno. Da instant ugasiš kartične promo: spusti `PROMO_DISCOUNT_EUR`/rotiraj LS kod.
