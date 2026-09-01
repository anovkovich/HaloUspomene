# SMS podsetnik za neaktivne planer naloge (+ merenje poslednje posete)

- **ID:** 2026-08-16-planer-podsetnik-sms
- **Status:** done
- **Created:** 2026-08-16
- **Owner:** Aleksa

## Zašto

Quick-register sa `/planiranje-vencanja` pravi par sa `draft: true` — nalog koji
ima portal, ali nije platio nijedan proizvod. Takav par nema **nijedan** dodir sa
nama posle registracije: ne dobija račun, ne dobija isporuku, ne ulazi ni u jedan
postojeći SMS tok. Ako zaboravi da portal postoji, tiho otpada.

Merenje 16.08.2026, svih 15 predstojećih venčanja:

| Slug | draft | dana ćuti | čeklista | budžet | zvanica |
|---|---|---|---|---|---|
| `aleksandra-miljan` | da | 112 | 0/63 | 0 | 0 |
| `milica-uros` | da | 138 | 0/63 | 0 | 0 |
| `natasa-zlatko-2` | da | 132 | 0/63 | 0 | 0 |
| `ivana-dusan` | da | 100 | 0/63 | 0 | 0 |
| `tamara-zdravko` | da | 7 | 0/38 | 0 | 0 |
| `milica-veljko` | **ne** | 85 | 0/63 | 0 | 0 |
| `katarina-marko` | ne | 82 | **30/63** | 3 | 0 |

> ⚠️ **Tabela iznad je uzorak od 8 slugova odabranih po tome što izgledaju
> neaktivno, i iz nje je izveden pogrešan zaključak „planer koristi jedan par".
> Ispravno merenje na svim parovima: čeklistu koristi 8/15 predstojećih (53%),
> budžet 3/15, listu zvanica 3/15; plaćeni parovi 50%, draft nalozi 14%.
> Vidi unos u `log.md` od 2026-08-16 („ISPRAVKA").**

Ono što od prvobitnog nalaza ostaje tačno: **budžet je slab**, a **draft nalozi
zaista beže** — 14% naspram 50% kod plaćenih. To je grupa koju ovaj SMS gađa.

## Rupa u merenju koja je zatečena

Portal **ne beleži prijavu ni posetu**. `wedding_portal` ima samo:

- `createdAt` — prvo otvaranje portala (`loadPortalData` radi upsert). Kod
  quick-register parova poklapa se u minut sa `couples.created_at`, jer tok
  posle registracije odmah preusmerava na portal.
- `updatedAt` — **isključivo na snimanje** (čeklista, budžet, gost, omiljeni
  vendor, dismiss ponude za raspored).

Posledica: par koji se loguje svake nedelje i samo **gleda** izgleda identično
paru koji je nestao u aprilu. Zato se uz podsetnik uvodi i `lastSeenAt`.

## Ciljevi

- `lastSeenAt` se puni na svako autentikovano otvaranje planera, bez ijednog
  dodatnog upita u bazu.
- Jednokratan SMS podsetnik parovima sa `draft: true` koji ćute duže od 30 dana.
- Nula rizika za plaćene parove — oni ovaj tok ne vide.

## Van obima

- Ponavljajući podsetnici. Prvo da se vidi da li jedan uopšte nešto pomeri.
- Podsetnik za rođendane/punoletstva — oni nemaju planer.
- Mejl kanal — nemamo serversko slanje (Cloudflare blokira Web3Forms sa Vercela).

## Odluke

**Samo `draft: true`** (odluka vlasnika). Plaćeni par koji ne dira čeklistu je
dobio ono po šta je došao — pozivnicu; podsećati ga na planer je nametljivo.
Ovo pravilo usput rešava i koliziju: `milica-veljko` (venčanje za 14 dana,
planer netaknut 85 dana) **nije draft**, pa ispada sam od sebe i ne dobija
„ažurirajte čeklistu" dve nedelje pred venčanje.

**Prag od 60 dana do venčanja.** Ispod toga podsetnik na planiranje je zakasnio i
sudara se sa korisnijim porukama. `tamara-zdravko` je draft sa venčanjem za 14
dana — ovo pravilo je isključuje.

**Signal je `lastSeenAt ?? updatedAt`.** Radi odmah (oslonac na poslednji upis) i
postaje tačniji kako se `lastSeenAt` puni. Par koji otvori portal ispada iz
liste sam od sebe, bez ijedne dodatne provere.

**Jednokratno, oznaka `planner_reminder_sent`** — isti obrazac kao
`seating_sms_offer_sent`. Nikad se ne briše.

**`lastSeenAt` se NE upisuje u `loadPortalData` bezuslovno.** `/api/portal/[slug]`
je javna, nekeširana-po-korisniku GET ruta bez ijedne provere — svako, uključujući
kroler, može da je pozove i lažira aktivnost. Zato `loadPortalData(slug, { touch })`,
a `touch: true` prosleđuje **samo** `loadPortalDataAction()`, koja je iza JWT
`slug` claim-a.

**Poruka ne tvrdi „nije vas bilo".** To ne znamo pouzdano dok se `lastSeenAt` ne
napuni. Poruka poziva na nastavak, što je tačno u oba slučaja.

## Uticaj

| Fajl | Izmena |
|---|---|
| `src/lib/portal.ts` | `loadPortalData(slug, opts?)` + `lastSeenAt` u postojeći `findOneAndUpdate` |
| `src/app/moje-vencanje/actions.ts` | `loadPortalDataAction` prosleđuje `touch: true` |
| `src/app/moje-vencanje/types.ts` | `PortalData.lastSeenAt?` |
| `src/app/pozivnica/[slug]/types.ts` | `WeddingData.planner_reminder_sent?` |
| `src/lib/planer/reminder-sms.ts` | **nov** — pragovi, tekst, `findPlannerReminderCandidates()` |
| `src/app/api/cron/gallery/route.ts` | slanje u `remind` prolazu, uz seating SMS |

Bez migracije. Sva nova polja su opciona.

## Dependencies

Nastavlja se na `2026-08-16-telefoni-backfill` — par bez `contact_phone` je za
ovaj tok nevidljiv. `aleksandra-miljan` je upravo takav slučaj.

## Rizici

| Rizik | Ublažavanje |
|---|---|
| Par koji redovno gleda portal a ništa ne upisuje dobije podsetnik dok se `lastSeenAt` ne napuni | Poruka je jednokratna i poziva na nastavak, ne prigovara na odsustvo |
| Podsetnik zvuči kao prodaja parovima koji nisu platili | Tekst ostaje podsetnik na planer; nijedna cena, nijedan proizvod |
| UCS-2 utrostručuje cenu SMS-a | Bez dijakritika i bez crtice `—`; dužina se meri u testu, ne procenjuje |
| Javna `/api/portal/[slug]` lažira aktivnost | `touch` je opcion i prosleđuje ga samo autentikovana akcija |
| Cron pošalje duplikat pri ponovnom prolazu | `planner_reminder_sent` se upisuje odmah posle slanja |

## Steps

- [x] **`lastSeenAt` se meri** — `loadPortalData` prima `touch`, akcija planera ga
      prosleđuje. _Acceptance:_ otvaranje `/moje-vencanje` pomera `lastSeenAt`;
      GET na `/api/portal/<slug>` ga **ne** pomera. (log: 2026-08-16)
- [x] **Pravila i tekst** — `src/lib/planer/reminder-sms.ts` sa pragovima 30/60
      dana. _Acceptance:_ tekst je ≤160 znakova i čist GSM-7 (provereno skriptom). (log: 2026-08-16)
- [x] **Slanje** — u `remind` prolazu cron-a, uz `planner_reminder_sent`.
      _Acceptance:_ suvi prolaz vraća očekivane parove; plaćeni i demo nisu među njima. (log: 2026-08-16)
- [x] **Provera na produkcionim podacima** — suvi prolaz nabroji kandidate i
      potvrdi da su svi `draft: true` sa venčanjem preko 60 dana. (log: 2026-08-16)

## Verifikacija

```
npx tsc --noEmit
npx eslint <dodirnuti fajlovi>
node --env-file=.env.local scripts/planer-podsetnik-dry.mjs   # suvi prolaz
```

Izmereno 16.08.2026 — šalje se **dvoma**: `milica-uros` (ćuti 138d, venčanje za
377d) i `natasa-zlatko-2` (132d / 384d). Van liste ostaju:

| Slug | Zašto |
|---|---|
| `ivana-dusan` | venčanje za 35 dana — ispod praga od 60 |
| `tamara-zdravko` | venčanje za 14 dana |
| `nadja-strahinja`, `ivana-aleksandar` | venčanje prošlo (−22 i −14 dana) |
| `aleksandra-miljan` | nema `contact_phone` |
| `milica-veljko`, `katarina-marko` | nisu `draft` |

Prve verzije plana su `ivana-dusan` očekivale među primaocima — pogrešno, prag
od 60 dana je isključuje. Dva draft para sa **prošlim** venčanjem takođe ispadaju
sama od sebe, jer je negativan broj dana uvek ispod praga.

## Open questions

- Da li posle nekoliko meseci pustiti **drugi** podsetnik? Odluka tek kad se vidi
  da li prvi išta pomeri.
- Vredi li tiha oznaka u adminu „planer netaknut" — vezano za isto otvoreno
  pitanje iz `2026-08-16-telefoni-backfill`.
