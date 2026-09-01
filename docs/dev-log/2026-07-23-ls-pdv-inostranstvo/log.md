# Log — LS PDV na uplate iz inostranstva

## 2026-07-23 — dijagnoza + ispravka webhook money-invarijante

- **Šta je urađeno:**
  - Dijagnoza preko MongoDB (`orders`) i LS order API-ja: order #4282572 /
    LS 9032300 karantiniran u `review`. LS breakdown: subtotal 499.990 para
    (5.000), discount_total 100.019 (RASPORED1000, −1.000), **tax 79.974 (VAT
    20%)**, total 479.945 (4.799,45). `tax_inclusive: false`, `tax_rate: 20.00`,
    kupac cvitaapple@gmail.com. Dokaz side-by-side: domaći test-order #4282571
    (Aleka Novkovic) 100 → 100,32 (samo FX drift, bez PDV-a) — prošao auto.
  - `src/lib/payments/lemonsqueezy.ts`: `LsWebhook.attributes` proširen sa
    `tax`, `subtotal`, `discount_total`, `tax_inclusive`; ispravljen netačan
    komentar `currency "EUR"` → RSD.
  - `src/app/api/placanje/webhook/route.ts`: money invariant sada računa
    `tax = a.tax ?? 0`, `net = total − tax`, i poredi `net` (ne `total`) sa
    `expectedTotal` u istom FX bendu. Log + admin-note prikazuju neto i PDV.
  - `src/components/payments/CheckoutPanel.tsx`: sivi notice pod kartičnim
    dugmetom — „Za kartice iz inostranstva procesor plaćanja može dodati PDV
    vaše zemlje na prikazanu cenu."
  - `tsc --noEmit` prolazi (exit 0).
- **Commit / PR:** — (još nije commitovano/pushovano)
- **Na šta utiče dalje:** buduće strane kartične uplate se sada auto-odobravaju
  (unlock + entity flag), nema ručnog otključavanja u adminu. Ne dira IPS rail.
  Memory `project_lemonsqueezy_setup` (invarijante) treba dopuniti napomenom o
  tax-exclusive + net-provera kad se deploy-uje.
- **Posledice:** ponašanje za domaće kupce identično (tax=0 → net=total).
  Za strane: `total` sada legitimno > zamrznute svote za iznos PDV-a. Revert =
  vraćanje 3 fajla (izolovan diff). Bez migracija.
- **Šta je rešeno:** strane uplate više ne padaju lažno u `review` zbog PDV-a;
  root-cause (LS `tax_inclusive: false`) razumljen i svesno zadržan.
- **Šta je odblokirano:** samostalni raspored (i svi ostali kind-ovi) prodaju se
  karticom kupcima iz inostranstva bez ručne intervencije.
- **Status:** planned → in-progress (kod napisan, čeka test + deploy).
- **Blokade / sledeći korak:** testirati kroz `next build && next start` +
  LS test-mode strani order, pa push na `deploy`. Danijelov order ostaje ručno
  rešen. Razmotriti delimičan refund ~800 din kao gest (opciono).
