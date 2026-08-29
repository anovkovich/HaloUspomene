## 2026-08-29 — Task kreiran i isplaniran

- **Šta je urađeno:** Napisan `plan.md` za novu funkciju "Pokloni" (evidencija
  svadbenih poklona) na `/moje-vencanje` — dugme na Pregledu koje se
  pojavljuje na dan venčanja i ostaje trajno, nova MongoDB kolekcija
  `pokloni` (eksplicitan zahtev vlasnika, ne embedovanje u `wedding_portal`),
  pretraga/link ka postojećoj Listi zvanica, numerički (RSD/EUR) ili opisni
  unos, suma na dnu. Istraženi postojeći obrasci: `MeniCard.tsx` (forma+lista
  po uzoru), `GuestsCard.tsx` `InviteePickerModal` (fuzzy pretraga zvanica),
  `src/lib/portal.ts` (facade oblik), DELETE kaskada u
  `src/app/api/admin/couples/[slug]/route.ts`, `LINKED_COLLECTIONS` u
  `scripts/lib/couple-slug.mjs`. Nema pisanog koda — čisto planiranje.
- **Commit / PR:** —
- **Na šta utiče dalje:** Implementacija čeka odgovore na 4 otvorena pitanja
  (besplatno vs. plaćeno, trajna nav stavka da/ne, jedan-poklon-jedno-ime
  model, i OpenCode provider/API ključ) — v. `plan.md` Open questions.
- **Posledice:** Nema još — čist planning dokument, ništa u kodu nije
  dirnuto.
- **Šta je rešeno:** Definisan tačan data model, spisak fajlova koje treba
  dirati (uključujući lako-zaboravljena mesta: kaskadno brisanje, rename
  skript, `MojeVencanjeClient.tsx`-ova višestruka mesta za `?tab=`), i proces
  delegiranja implementacije OpenCode CLI-ju pod Claude orkestracijom.
- **Šta je odblokirano:** Ništa još — implementacija čeka vlasnikovu potvrdu
  otvorenih pitanja i prijavu OpenCode-a na pravog model provajdera
  (`opencode providers list` trenutno vraća 0 kredencijala).
- **Status:** — → planned
- **Blokade / sledeći korak:** (1) vlasnik odgovara na 4 pitanja iz
  `plan.md`; (2) vlasnik pokreće `opencode providers login` sa pravim
  provajderom; tek onda Claude počinje korak "Data layer" i deleguje
  implementaciju.

## 2026-08-29 — Odluke potvrđene, spreman za implementaciju

- **Šta je urađeno:** Vlasnik odgovorio na otvorena pitanja: (1) Pokloni je
  **besplatna** funkcija — bez `payments/kinds.ts`; (2) **BEZ trajne nav
  stavke** — dostupno isključivo preko dugmeta na Pregledu (smanjuje obim:
  `NAV_ITEMS` u `nav-items.tsx` i mobilni bottom-nav/sidebar overlay u
  `MojeVencanjeClient.tsx` se ne diraju; `ActiveView` union + jedan
  `LOCKED_FEATURE_INFO` unos i dalje neophodni zbog `Record<ActiveView,...>`
  tipa); (3) za OpenCode orkestraciju — **bez API ključa**, koriste se
  OpenCode Zen besplatni modeli (vlasnik pomenuo "0xAlpha" i "BigPickle";
  samo `opencode/big-pickle` potvrđen u `opencode models`). `plan.md`
  ažuriran: Decisions #2/#3 označene rešenim, Impact/Steps/Open questions
  usklađeni sa smanjenim obimom, Status → in-progress.
- **Commit / PR:** —
- **Na šta utiče dalje:** Implementacija (Steps iz `plan.md`) može da počne.
  Sledeći korak je "Data layer" (`src/lib/pokloni.ts` + tipovi), delegiran
  OpenCode-u pod uzanim promptovima po koraku.
- **Posledice:** Nema izmena u kodu još. Rizik zabeležen: besplatni Zen
  modeli su slabiji, pa svaka OpenCode izmena mora proći `tsc --noEmit` +
  ručnu proveru pre nego što se pređe na sledeći korak.
- **Šta je rešeno:** Sva tri glavna otvorena pitanja o obimu i alatu.
- **Šta je odblokirano:** Implementacija — nema više spoljnih blokada.
- **Status:** planned → in-progress
- **Blokade / sledeći korak:** Nema blokada. Sledeći korak: OpenCode piše
  `src/lib/pokloni.ts` + `GiftEntry`/`PokloniData` tipove u `types.ts`, Claude
  pregleda diff i pokreće `tsc --noEmit`.
