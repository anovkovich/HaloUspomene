# LS PDV na uplate iz inostranstva — webhook prihvata tax

- **ID:** 2026-07-23-ls-pdv-inostranstvo
- **Status:** in-progress
- **Created:** 2026-07-23
- **Owner:** Aleksa

## Why
Prva kartična uplata iz inostranstva (Danijel Cvijetic, samostalni raspored,
order #4282572 / LS 9032300) naplaćena je **4.799,45 RSD** umesto očekivanih
**4.000** (promo cena 5.000→4.000). Order NIJE auto-odobren — pao je u `review`
(quarantine) sa `Neslaganje iznosa (LS 479945 RSD, očekivano 400000 RSD)`, pa je
pristup morao ručno da se otključa.

Uzrok (potvrđeno iz LS order API-ja): osnovna cena (5.000) i promo popust
`RASPORED1000` (−1.000) su radili tačno — neto = 4.000. Cela razlika je **20% PDV
(799,74 RSD)** koji LS kao merchant of record dodaje **ODOZGO**, jer je proizvod
podešen `tax_inclusive: false`. Domaći kupci ne dobijaju PDV (samo ~0,3% FX
drift), pa su dosadašnje uplate prolazile — ovo je prvi strani kupac, otud prvi
nesklad.

Poslovna odluka: **ostajemo na tax-exclusive** (kupac iz inostranstva plaća PDV
svoje zemlje na vrh; mi zadržavamo pun neto). Zato webhook mora da prihvati taj
legitimni PDV umesto da karantinira.

## Goals
- Webhook auto-odobrava strane uplate bez obzira na PDV stopu zemlje kupca.
- Money-invariant i dalje čvrsto hvata pogrešne/kratke uplate.
- Kupac na checkout-u unapred obavešten da strane kartice mogu dobiti PDV.

## Non-Goals
- Prelazak na tax-inclusive pricing u LS (odbačeno — apsorbovali bismo PDV, neto
  bi pao sa ~4.000 na ~3.333 po stranoj uplati).
- Retroaktivna izmena Danijelovog ordera (već ručno rešen).

## Decisions
- **Validacija NETO (`total − tax`), ne sirovog `total`.** VAT stopa varira po
  zemlji (EU 17–27%, 0% za B2B reverse-charge), pa fiksni „+20% band" ne bi
  radio (npr. Mađarska 27%, Hrvatska 25% bi i dalje pali) i previše bi olabavio
  proveru. `total − tax` se poklapa sa zamrznutom (bez-PDV) svotom za SVAKU
  stopu; domaći kupac ima `tax=0` → `net=total`, isto ponašanje kao pre.
- Bezbednost: PDV računa LS, payload je HMAC-potpisan → `tax` se ne može lažirati
  naniže da bi se provukla kratka uplata.
- Notice namerno bez fiksnog „20%" (varira po zemlji).

## Impact
- `src/lib/payments/lemonsqueezy.ts` — `LsWebhook.attributes` proširen: `tax`,
  `subtotal`, `discount_total`, `tax_inclusive`; ispravljen stari komentar
  `currency "EUR"` → RSD.
- `src/app/api/placanje/webhook/route.ts` — money invariant koristi
  `net = total − tax`; admin-note i log poruka prikazuju neto i PDV.
- `src/components/payments/CheckoutPanel.tsx` — sivi notice pod kartičnim
  dugmetom o mogućem PDV-u za strane kartice.
- Ponašanje za domaće kupce nepromenjeno.

## Dependencies
- Nema koda-zavisnosti. Zahteva deploy na `deploy` granu da bi bilo aktivno.

## Risks
- Ako LS webhook payload ikad izostavi `tax` → `tax=0` → strani order bi opet
  pao u `review` (safe-fail, nikad ne otključa naniže greškom).
- Ako se u LS ikad uključi tax-inclusive, `tax` bi bio 0 a cena već sadrži PDV —
  net bi se i dalje poklapao (ok), ali bi tada trebalo preispitati EUR prikaz.

## Steps
- [x] **Tip payload-a čita tax** — `LsWebhook.attributes` + tax/subtotal/discount.
      _Acceptance:_ `tsc --noEmit` prolazi; polja dostupna u webhook-u. (log: 2026-07-23)
- [x] **Money invariant na neto** — `net = total − tax`, poređenje sa zamrznutom.
      _Acceptance:_ domaći (tax=0) prolazi kao pre; strani sa bilo kojom stopom
      auto-odobrava; pogrešna svota i dalje karantin. (log: 2026-07-23)
- [x] **Checkout notice** — obaveštenje o PDV-u za strane kartice. (log: 2026-07-23)
- [ ] **Test + deploy** — `next build && next start`, LS test-mode strani order;
      potvrditi da domaći test-order i dalje prolazi. _Acceptance:_ oba slučaja
      prolaze lokalno, pa push na `deploy`.

## Verification
Lokalno kroz `next build && next start` (dev server 404-uje non-GET dinamičke
API rute — v. memory `project_dev_server_gotcha`). Idealno realan LS test-mode
order sa stranom adresom (PDV > 0) → očekuje se auto-unlock; domaći test-order
(PDV = 0) → i dalje prolazi. Rollback: revert 3 fajla (čist, izolovan diff).

## Open questions
- Da li većina „inostranstvo" kupaca dobija baš 20% (RS/EU-20 zemlje) ili šarowe
  stope — nebitno za ispravnost (net-provera radi za sve), samo za copy notice-a.
