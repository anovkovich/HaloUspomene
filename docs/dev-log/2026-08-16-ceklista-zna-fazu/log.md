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

## 2026-08-16 — Implementirano i pushovano

- **Šta je urađeno:** `phase.ts` (nov), `ChecklistCard` (faza, propušteno,
  prebacivanje, automatsko štikliranje), `defaults.ts` (`AUTO_KEY_BY_TEXT`),
  `types.ts` (`autoKey`, `autoDismissed`, `movedFrom`), `actions.ts`
  (`loadPortalDataAction` vraća `autoDone`), `nav-items.tsx` (budžet van
  sidebara), `MojeVencanjeClient` (prosleđivanje + povratak na pregled),
  `BudgetCard` (greška u toast).
- **Commit / PR:** `89ccd19`, plus `4eb4d3b` za zatečeni lint.
- **Na šta utiče dalje:** „pomoćnik" link se planira zasebno. Meriti 4–6 nedelja
  posle deploya: `lastSeenAt` naspram `updatedAt`, osnovica 53% / 20% / 20%.
- **Posledice:** dva opciona polja na stavci čekliste, bez migracije. Budžet je
  i dalje dostupan preko Pregleda i `?tab=budget`. Povratak: `git revert`.
- **Status:** planned → done

### Izmena obima otkrivena tek na produkcionim podacima

Pre commita sam ispisao šta bi svaki od 15 stvarnih parova video. **Četiri para
bi dočekalo od 24 do 42 „propuštenih stavki"** — svi sa venčanjem za dve nedelje
i netaknutom čeklistom (`milica-veljko` 42, `milenija-milan` 33, `ivana-dusan`
32, `tamara-zdravko` 24).

To je bilo pogrešno po sadržaju, ne samo po tonu: par koji se ženi za dve
nedelje **jeste** rezervisao salu i naručio tortu — samo to nije zabeležio kod
nas. Nazvati to propuštenim znači optužiti ga za posao koji je obavio.

Zato je dodata kapija: **propušteno se pali tek kad par štiklira bar jednu
stavku.** Posle nje crveno vide samo parovi koji listu stvarno koriste, i to u
razumnim brojkama (8, 7, 4, 3, 3, 2). Otvaranje na tekućoj fazi ostalo je
bezuslovno — to pomaže i onima koji listu ne koriste.

Pouka: ovo se ne bi videlo ni na jednom test zapisu. Videlo se samo zato što je
pravilo pušteno preko stvarnih podataka pre nego što je kod otišao.

### Provere

| Provera | Ishod |
|---|---|
| Granice faza | 21 slučaj, uključujući prazan i neispravan datum → svi tačni |
| `custom` nikad nije prošla faza | potvrđeno |
| Nepoznat datum ne boji ništa crveno | potvrđeno (`phase === null`) |
| Parovi 12+ meseci pre | 0 propušteno, kako je i namera |
| tsc / eslint / build | čisto |
| Rute | `/moje-vencanje/` i `?tab=` varijante 200, bez greške u logu |
