# Log — HaloUspomene opšti pregled / konsolidacija docs-a

## 2026-07-20 — Konsolidacija `docs/` u dev-log summary

- **Šta je urađeno:** Iščešljano 17 planskih/data fajlova u `docs/`. Uvedena
  `docs/dev-log/` struktura (task-plan format): `HISTORY.md` indeks + ovaj
  „opšti pregled" (`plan.md`) sa trajnim invarijantama i otvorenim stavkama.
  Email data (music/torte-cveće/remaining/venue) spojena skriptom u
  `docs/vendor-outreach-data.md` (bez gubitka). Procena kategorija urađena
  unakrsno sa kodom (`src/`) i auto-memorijom.
- **Commit / PR:** — (dokumentacija; još nije commit-ovano).
- **Na šta utiče dalje:** Buduće sesije kreću od `HISTORY.md` umesto čitanja 17
  fajlova. Otvorene stavke (DB backup setup, svadbene uloge, Infobip Viber) su
  sada eksplicitno indeksirane.
- **Posledice:** čisto dokumentacija — bez promene ponašanja/šeme/API-ja. Svi
  obrisani fajlovi su git-tracked (reverzibilno `git checkout`). Obrisano: 8
  gotovih planova (plan-moje-vencanje-sidebar-refactor, INFOBIP_INTEGRATION_PLAN,
  PUBLIC_VENDOR_DIRECTORY, PHOTO_QR_GALLERY, PLAN-B-payment-implementation,
  PLAN-B-sales-upgrades, PLAN-promo-codes, PLAN-builder-checkout), 4 email fajla
  (spojena), i vendor-research-weddingwonderland (nisko-vredan; prednost sačuvana
  u pregledu).
- **Šta je rešeno:** Zatrpanost `docs/` i rizik da se čita zastareli plan
  (npr. PLAN-promo-codes je imao POGREŠNE konstante — €10 umesto 10%).
- **Šta je odblokirano:** Jasan pregled otvorenog posla (DB backup je hitno —
  jedini backup a nikad nije radio).
- **Status:** — (referentni doc; prati stanje koda/tiketa).
- **Blokade / sledeći korak:** Dodati DB backup secrets + odraditi prvi test run.
