# Log — Čeklista koja zna fazu

## 2026-08-16 — Task otvoren i isplaniran

- **Šta je urađeno:** plan napisan posle čitanja `ChecklistCard.tsx`,
  `defaults.ts`, `nav-items.tsx`, `MojeVencanjeClient.tsx`, `OverviewCard.tsx`,
  `actions.ts` i samostalnog `PortalClient.tsx`. Nijedna izmena koda.
- **Commit / PR:** —
- **Na šta utiče dalje:** „pomoćnik" link za listu zvanica se planira zasebno,
  po odluci vlasnika, tek kad ovaj task bude gotov.
- **Blokade / sledeći korak:** čeka se odobrenje pre implementacije.

### Činjenice koje su oblikovale plan

- **Čeklista je najkorišćeniji deo planera** — 8/15 predstojećih (53%), naspram
  budžeta 3/15 i liste zvanica 3/15. Zato se ne skraćuje i ne sklanja dublje;
  popravlja se.
- `ChecklistCard.tsx` **nigde ne prima `event_date`** — provereno, nula pogodaka.
  To je koren problema „otvara se na pogrešnoj fazi".
- `coupleInfo.eventDate` **već postoji** u `MojeVencanjeClient.tsx`, pa je
  prosleđivanje trivijalno.
- `loadOverviewAction` **već vraća** sve signale za automatsko štikliranje
  (`inviteeCount`, potvrde, `paidForAudio`, `paidForRaspored`). Nema novog upita.
- Podrazumevani id-ovi su `default-N` iz brojača koji se resetuje, a u bazi
  postoje čekliste od **26 do 65 stavki** (63 kod 26 parova, 38 kod 6). Isti
  `id` kod dva para nije ista stavka — zato `autoKey`, nikad `id`.
- `ChecklistCard.tsx:36` zove `onSave(updated)` bez `await` i ne čita `{ error }`
  koji akcija vraća. Isto u `BudgetCard`. Bag, ne odluka.
- Samostalni portal uvozi iste kartice sa svojim `onSave` — zato su svi novi
  propovi opcioni.

### Odluka o obimu koju vredi zapamtiti

Automatsko štikliranje je **isključivo prikaz**. Upis u `checklist` bi značio da
par koji odveže listu zvanica „gubi" štikliranu stavku, a mi bismo prepisali
njegov ručni unos. Prikazni sloj je i trivijalno povratan.
