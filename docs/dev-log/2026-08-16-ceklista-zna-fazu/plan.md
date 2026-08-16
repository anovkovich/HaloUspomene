# Čeklista koja zna fazu, sama se popunjava — i budžet iz sidebara

- **ID:** 2026-08-16-ceklista-zna-fazu
- **Status:** planned
- **Created:** 2026-08-16
- **Owner:** Aleksa

## Zašto

Čeklista je **najkorišćeniji deo planera**: 8/15 predstojećih venčanja ima bar
jednu završenu stavku (53%), naspram budžeta 3/15 i liste zvanica 3/15. Plaćeni
parovi diraju planer u 50% slučajeva, quick-register (`draft`) u 14%.

> Merenje i ispravka ranijeg pogrešnog nalaza: `2026-08-16-planer-podsetnik-sms`,
> unos „ISPRAVKA" u `log.md`. Prvi nalaz („planer koristi jedan par") izveden je
> sa pristrasnog uzorka i **ne sme se citirati**.

Dakle ovo nije oživljavanje mrtve funkcije, nego popravka one koja radi — i to
one koju najviše koristi grupa koja plaća.

Tri kvara, sva tri provereni u kodu:

1. **Čeklista ne zna datum venčanja.** `ChecklistCard.tsx` nigde ne prima
   `event_date` (provereno: nula pogodaka na `event_date|eventDate|weddingDate`).
   Par kome je venčanje za 3 meseca otvara ekran na grupi **„12+ meseci pre"** —
   stvari koje je odavno uradio ili ih više ne može uraditi. Nema pojma
   „propušteno". Stanje sklopljenih grupa je `useState`, resetuje se svaki put.
2. **Ništa ne stiže između poseta.** Potvrde i raspored se koriste jer primaju
   spolja (gost se prijavi, rok istekne, izađe PDF). Čeklista se menja isključivo
   kad par kuca. Nula povoda za povratak.
3. **Greška pri snimanju se guta.** `ChecklistCard.tsx:36` zove `onSave(updated)`
   bez `await` i bez čitanja rezultata, a `saveChecklistAction` vraća
   `{ error }`. Mrtva sesija tiho baci izmenu. Isto i u `BudgetCard`.

Budžet je jedini deo gde je „niko ga ne koristi" blizu istine: 20%, i to obično
par kategorija. Ne briše se — silazi iz sidebara.

## Ciljevi

- Prvi ekran čekliste pokazuje **tekuću fazu**, ne najstariju.
- Propuštene stavke iz ranijih faza su **vidljive i rešive u jednom potezu**.
- Nekoliko stavki je **već štiklirano** kad par prvi put otvori — bez kucanja.
- Budžet prestaje da zauzima mesto u sidebaru koje ne zaslužuje.
- Greška pri snimanju se **vidi**.

## Van obima

- Lista zvanica → budžet, „pomoćnik" link, satnica dana venčanja, SMS po fazama.
  Pomoćnik se planira zasebno po odluci vlasnika.
- Skraćivanje podrazumevane čekliste. Već je jednom skraćena (63 → 38) i to nije
  pomerilo upotrebu; duži spisak nije uzrok.
- Portal za rođendane/punoletstva — nema planer i ne dobija ga.

## Odluke

**Faza se računa iz `event_date`, isključivo za prikaz.** Nijedna stavka se ne
premešta u bazi zbog proteka vremena. Zapis para ostaje ono što je par uneo.

**Propušteno = stavka koja NIJE završena, u grupi koja je prošla.** Boja je
**crvenkasto-roze, prigušena** — znak, ne alarm. Predlog tokena: pozadina
`#AE343F` na ~6% (`rgba(174,52,63,0.06)`), ivica na ~18%, tekst ostaje
`#232323`. Nikad puna brend-crvena, koja se u portalu koristi za akciju.

**Dugme „Prebaci u trenutnu fazu".** Menja `group` stavke na tekuću fazu i
snima. Ovo je **jedina** izmena podataka koju faza pokreće, i uvek je posledica
klika, nikad automatike.
- Stoji na **nivou grupe** („Prebaci sve propušteno — 3") i na **stavci**.
- Prebačena stavka dobija `movedFrom` (izvorna grupa) da se u prikazu može
  označiti „iz: 6–9 meseci pre" i da je potez povratan.

**Automatski štiklirano je SAMO prikaz.** Stavka koju platforma može da potvrdi
crta se kao završena, sa oznakom „automatski". `checklist` u bazi se **ne
menja** — inače bi par koji odveže listu zvanica „izgubio" štikliranu stavku, a
mi bismo prepisali njegov unos.

### Odluke vlasnika iz upitnika (16.08.2026)

**Prošla faza sa propuštenim se otvara sama, ali prikazuje SAMO nezavršene
stavke.** Delimično otvoreno stanje — bolje od obe ponuđene mogućnosti:
propušteno se ne može prevideti, a ekran ne postaje spisak grehova. Završene
stavke u toj fazi ostaju skrivene iza „Prikaži sve (5)". Prošla faza **bez**
propuštenog ostaje sklopljena.

**Klik na automatski štikliranu stavku je odjavljuje i predaje paru.** Upisuje
se `completed: false` **i `autoDismissed: true`**; oznaka „automatski" nestaje i
sistem tu stavku **više nikad ne dira**, čak i dok signal traje. Bez trajne
oznake automatika bi je vratila na sledećem učitavanju i par ne bi mogao da je
ospori — a poslednja reč nad sopstvenom listom mora da ostane njegova.

**Sažetak propuštenog stoji iznad trake napretka**, jedan red: „3 propuštene
stavke iz ranijih faza" + dugme „Prebaci sve u trenutnu fazu". Vidi se pre nego
što se bilo šta skroluje.

**Budžet sa Pregleda vodi na zaseban ekran**, ne razvija se u mestu. Pločica
„Budžet →" prelazi na `?tab=budget`, gde stoji „← Nazad na pregled". Puna
stranica ostaje puna stranica; menja se samo odakle se do nje stiže.

**Grupno prebacivanje traži potvrdu** (`ConfirmDialog`) — odobreno; grupna
izmena podataka ne sme da se desi na jedan klik.

**Vezivanje ide preko novog `autoKey`, nikad preko `id`.** Podrazumevani id-ovi
su `default-1..N` iz brojača koji se resetuje, a u bazi postoje čekliste od 26
do 65 stavki (63 kod 26 parova, 38 kod 6, ostalo ručno menjano). Isti `id`
kod dva para **nije ista stavka**. `autoKey` se dodaje na podrazumevane stavke i
uparuje se sa starim zapisima **po tekstu stavke**, jednokratno u prikazu.

**Signali za automatsko štikliranje** — svi već postoje u `loadOverviewAction`:

| Stavka | Signal | Izvor |
|---|---|---|
| „Napraviti okvirnu listu gostiju" | `inviteeCount > 0` | `guestStats.inviteeCount` |
| „Pratiti potvrde dolaska" | `attending + notAttending > 0` | `guestStats` |
| „Rezervisati Audio Guest Book…" | `paidForAudio` | `audioStats.paidForAudio` |
| „Napraviti raspored sedenja" | `paidForRaspored` | `loadOverviewAction` |

Za raspored je `paidForRaspored` **proxy** — znači „kupio alat", ne „napravio
raspored". Prihvatljivo: par koji je platio alat jeste rešio tu stavku sa
liste. Ako se kasnije doda pravi signal (`seating_layouts` za slug), zamenjuje
se bez izmene ugovora.

**Budžet: skida se iz `NAV_ITEMS`, ne briše se.** Ostaje dostupan preko
Pregleda, tačno kako PWA režim već radi (`pwaSubView`). `ActiveView` zadržava
`"budget"`, `?tab=budget` i dalje radi — stari linkovi i bookmarkovi ne smeju
da puknu.

**Samostalni portal (`raspored-sedenja/[slug]/portal`) se ne dira.** On uvozi
iste kartice ali ima svoju navigaciju („planer"/„budzet") i svoj `onSave`. Novi
propovi su **opcioni**; bez njih se kartica ponaša tačno kao danas.

## Uticaj

| Fajl | Izmena |
|---|---|
| `src/app/moje-vencanje/phase.ts` | **nov** — čista funkcija `currentPhase(eventDate)`, `isPastPhase`, red faza. Bez React-a, bez DB-a |
| `defaults.ts` | `autoKey` na 4 stavke; `GROUP_ORDER`/`GROUP_LABELS` netaknuti |
| `types.ts` | `ChecklistItem.autoKey?`, `ChecklistItem.movedFrom?` |
| `ChecklistCard.tsx` | opcioni `eventDate` i `autoDone` propovi; faza, propušteno, prebacivanje, oznaka „automatski" |
| `MojeVencanjeClient.tsx` | prosleđuje `coupleInfo.eventDate`; `autoDone` iz Pregleda |
| `OverviewCard.tsx` | izvodi `autoDone` iz podataka koje već učitava; podiže ga naviše |
| `nav-items.tsx` | `budget` van `NAV_ITEMS`; `ActiveView` i `LOCKED_FEATURE_INFO` ostaju |
| `ChecklistCard.tsx`, `BudgetCard.tsx` | `onSave` se čeka i greška ide u `sonner` toast |

Bez migracije. `autoKey` i `movedFrom` su opciona polja; stari zapisi rade
neizmenjeni.

## Dependencies

Merenje iz `2026-08-16-planer-podsetnik-sms` je osnova za „pre". `lastSeenAt`
je uveden istog dana i tek se puni — poređenje poseta naspram upisa moguće je
tek 4+ nedelje posle deploya.

## Rizici

| Rizik | Ublažavanje |
|---|---|
| Par sa venčanjem za godinu dana vidi „propušteno" na stvarima koje nije ni trebalo da radi | Propušteno postoji samo za **prošle** faze; par 12+ meseci pre nema nijednu prošlu fazu |
| Prebacivanje stavke gubi istoriju | `movedFrom` čuva izvornu grupu; potez je povratan |
| Automatsko štikliranje pogrešno pogodi stavku kod starih zapisa | Uparivanje po tačnom tekstu; nepodudarno se prosto ne štiklira (tiho, bez štete) |
| Automatska oznaka izgleda kao da je par to uradio | Vidljiva oznaka „automatski" uz stavku |
| Skidanje budžeta iz sidebara deluje kao gubitak funkcije | Ostaje na Pregledu i preko `?tab=budget`; ništa se ne briše, povratak je jedan red |
| `event_date` prazan ili neispravan | `currentPhase` vraća `null` → kartica se ponaša tačno kao danas |
| Regresija na samostalnom portalu | Svi novi propovi opcioni; taj portal ih ne prosleđuje |

## Steps

- [ ] **Faza kao čista funkcija** — `phase.ts` sa `currentPhase(eventDate)` i
      redom faza; pokriva i prošlo venčanje i prazan datum. _Acceptance:_ tabela
      ulaz→faza prolazi za 12+, 9–12, 6–9, 3–6, 1–3, 2 nedelje, dan pre, dan
      venčanja, prošlo, prazno.
- [ ] **Čeklista otvara tekuću fazu** — `eventDate` prop; prošle faze sklopljene
      i prigušene, tekuća otvorena i istaknuta, napredak i za fazu i ukupno.
      _Acceptance:_ par sa venčanjem za 3 meseca otvara „1–3 meseca pre", ne „12+".
- [ ] **Propušteno + prebacivanje** — nezavršene stavke u prošlim fazama u
      prigušenoj crvenkasto-roze; dugme na grupi i na stavci; `movedFrom` upisan.
      _Acceptance:_ klik prebacuje stavku u tekuću fazu, snima, i posle osvežavanja
      stoji tamo sa oznakom porekla.
- [ ] **Automatsko štikliranje** — `autoKey` na 4 stavke, `autoDone` iz Pregleda,
      oznaka „automatski". _Acceptance:_ par sa unetim zvanicama vidi „Napraviti
      okvirnu listu gostiju" kao završeno, a `checklist` u bazi je nepromenjen.
- [ ] **Budžet iz sidebara + greške pri snimanju** — `budget` van `NAV_ITEMS`,
      ulaz preko Pregleda, `?tab=budget` i dalje radi; `onSave` se čeka i greška
      ide u toast. _Acceptance:_ sidebar ima 6 stavki, `?tab=budget` otvara
      budžet, prekinuta veza pri snimanju daje vidljivu poruku.

## Verifikacija

```
npx tsc --noEmit
npx eslint <dodirnuti fajlovi>
rm -rf .next && npx next build && npx next start -p 3000
```

Ne koristiti `next dev` — vraća 404 na non-GET dinamičke rute.

**Ručno**, prijavom na `/moje-vencanje` sa stvarnim parovima koji pokrivaju
raspon (bez izmene njihovih podataka):

| Par | Šta proverava |
|---|---|
| `teodora-uros` (13 dana, 40 stavki, 53 zvanice) | tekuća faza „2 nedelje pre"; propušteno iz ranijih; automatsko štikliranje zvanica i potvrda |
| `katarina-marko` (391 dan, 30 stavki) | nema nijednu prošlu fazu → **nijedno** „propušteno" |
| `emilija-aleksa` (13 dana, 160 zvanica, raspored plaćen) | automatsko štikliranje rasporeda |
| `milica-uros` (draft, 377 dana, 0 upisa) | prvi ekran quick-register korisnika — glavna meta |
| samostalni portal `raspored-sedenja/<slug>/portal` | čeklista i budžet rade **identično kao pre** |

**Povratak:** sve je aditivno i po koracima; `git revert` po commitu. Budžet se
vraća u sidebar dodavanjem jednog reda u `NAV_ITEMS`.

## Otvoreno

- Da li „Prebaci sve propušteno" na nivou grupe treba potvrdu (`ConfirmDialog`)
  kad je stavki više od ~5? Sklonost: da, jer je to grupna izmena podataka.
- Pravi signal za „raspored napravljen" umesto `paid_for_raspored` — traži novo
  čitanje `seating_layouts`; odložiti dok se ne pokaže da proxy smeta.
- Meriti uspeh 4–6 nedelja posle deploya: `lastSeenAt` naspram `updatedAt` na
  predstojećim venčanjima, uz osnovicu 53% / 20% / 20%.
