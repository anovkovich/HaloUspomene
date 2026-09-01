# Pregled za proslave: link, rok, QR za potvrde, print mreža

- **ID:** 2026-08-14-proslave-pregled-print
- **Status:** code-complete
- **Created:** 2026-08-14
- **Owner:** Aleksa

## Zašto

Portal za punoletstvo i dečiji rođendan je 2026-08-13 dobio deljenu ljušturu sa
tabovima (Pregled · Gosti · Slike · Galerija · Raspored · Meni) i tri kupljiva
dodatka. Ljuštura je isporučena, ali je **tab Pregled ostao najtanji deo**:
countdown, tri stat pločice i dva reda „Dodaci za proslavu".

Dve konkretne posledice:

1. **Klijent nema odakle da uzme link svoje pozivnice.** Rođendanska pozivnica
   se deli preko Vibera; danas vlasnik mora da lovi URL iz adresne trake ili iz
   `/pristup` poruke koju smo mu poslali. Venčani portal to rešava jednim
   dugmetom (`OverviewCard.tsx:187-194`).
2. **`submit_until` postoji na `BirthdayData` i već gejtuje RSVP formu, ali ga
   klijent nigde ne vidi.** Kad rok istekne, gosti tiho ne mogu da se prijave i
   niko ne zna zašto.

Uz to, redovi „Dodaci za proslavu" prodaju apstrakciju („Galerija 🔒 Saznajte
više"). Venčani portal ima jači obrazac: **print kartica pokazuje artefakt koji
klijent dobija** („Flajer za galeriju", „QR — Gde sedim") sa `lockLabel` koji
imenuje dodatak. To je bolja prodajna površina od onoga što je sada tamo.

## Ciljevi

- Klijent iz Pregleda kopira link pozivnice jednim klikom.
- Klijent vidi rok za potvrde i može da ga produži kad istekne.
- Klijent preuzima **QR za potvrde dolaska** (PNG + A6 PDF) za štampane
  pozivnice — posebno traženo kod dečijih rođendana, koji se često dele na
  papiru.
- Zaključani dodaci se prodaju kroz artefakt, ne kroz apstrakciju.

## Van obima

- **PDF pozivnice za rođendane** — venčanja imaju `generateInvitationPDF`,
  rođendani nemaju nikakav generator. To je zaseban posao, ne kopiranje.
- Checklista i budžet — vlasnik ih je već odbio (2026-08-13); venčana logika od
  9 vremenskih grupa je besmislena za proslavu za dva meseca.
- Flajer za audio knjigu — rođendani nemaju audio proizvod.
- Vendori — taksonomija je venčana (burme, venčanice).

## Odluke

**1. QR za potvrde koristi postojeću `/rsvp/[id]` rutu, ne `#rsvp` sidro.**
Provereno: `src/app/rsvp/[id]/page.tsx:15` već ima `rodjendan` i `punoletstvo`
u `TYPES`, a linije 134-166 granaju po tipu. Uživo potvrđeno —
`/rsvp/punoletstvo-sara-vucetic/` i `/rsvp/rodjendan-lenka/` vraćaju 200 sa
ispravnim imenom. Dakle **nula novog bekenda**; QR samo pokazuje na već živu,
kratku i za štampu pogodnu adresu. (Sidro `#rsvp` postoji na oba renderera, ali
vodi na celu pozivnicu — lošije za gosta koji samo potvrđuje.)

**2. Venčanja se NE diraju. Ispravka prvobitnog plana (2026-08-14).**
Prva verzija je tražila da se `PrintCard` i datumska logika **izvuku iz**
venčanih fajlova, čime bi ovaj task dirao živa venčanja. Vlasnik je s pravom
pitao zašto UI izmena za rođendane uopšte dira venčanja — i ukazao na presedan
samostalnog rasporeda i galerije, gde venčani kod nije refaktorisan nego je
učinjen **ubrizgljivim** (opcioni propovi), a nova ljuštura pisana zasebno.

Provereno: `PrintCard` (`OverviewCard.tsx:1206`) ima **nula** pominjanja
`coupleInfo` / `weddingData` / `paidFor` — čista prezentacija, samo propovi i
dve lucide ikone. Datumska logika je isto čista funkcija.

Zato:
- `src/components/portal/PrintCard.tsx` — **nov fajl**, koristi ga samo
  rođendanski Pregled. Venčani `OverviewCard` zadržava svoju lokalnu kopiju.
- `src/lib/rsvp-deadline.ts` — **nov fajl** sa čistom datumskom logikom;
  koristi ga samo rođendanska akcija. `extendRsvpDeadlineAction` ostaje
  netaknuta.

Cena je privremeno dupliranje ~60 linija prezentacije i ~25 linija datumske
matematike. To je **svesno plaćeno** da bi task imao nula rizika po venčanja i
da bi mogao da se deployuje sam. Migracija venčanja na deljene fajlove je
opciono, zasebno i zasebno proverljivo čišćenje — ne uslov za ovaj posao.

**3. Zašto duplirati sad, kad smo juče de-duplirali dva portala?**
Jer nije isti slučaj. Juče su dva **identična** portala živela paralelno i
razilazila se — dupliranje je bilo aktivna šteta. Ovde venčani `PrintCard`
radi, ne menja se, i dirati ga znači rizikovati živ ekran zbog estetike
arhitekture. Duplikat je ograničen, dokumentovan i lako spojiv kasnije.

**4. Print mreža ZAMENJUJE redove „Dodaci za proslavu", ne dodaje se pored njih.**
Dve liste istih dodataka na istom ekranu su šum. Kartica nosi i ime dodatka i
ono što se dobija, pa je nadskup postojećeg reda.

**5. Bez „produži rok" na dečijem rođendanu? Ne — ide na oba.**
Za razliku od rasporeda (koji se ne teasuje na dečijem jer igraonica nema
stolove), rok za potvrde je jednako relevantan na oba proizvoda.

## Uticaj

| Fajl | Šta |
|---|---|
| `src/components/portal/proslava/ProslavaPortalClient.tsx` | Pregled: dugme za link, blok roka, print mreža umesto „Dodaci" redova |
| `src/components/portal/PrintCard.tsx` | **nov** — prezentaciona kartica, samo za rođendane |
| `src/lib/rsvp-deadline.ts` | **nov** — `toISODate`, `computeExtendedDeadline` |
| `src/lib/proslava/portal-actions-core.ts` | `extendDeadlineCore` |
| `src/app/{punoletstvo,deciji-rodjendan}/[slug]/portal/actions.ts` | tanki binderi |
| `src/app/{punoletstvo,deciji-rodjendan}/[slug]/portal/page.tsx` | prosleđuje `submitUntil` |

**Nijedan venčani fajl se ne dira.** `OverviewCard.tsx` i
`moje-vencanje/actions.ts` ostaju netaknuti — v. Odluku 2.

**Ne dira se ni:** `generateQrFlyerPDF` (već generičan — prima `eventName`,
`url`, `title`, `lines`, `filename`), `/rsvp/[id]`, `gallery-qr.ts`, `kinds.ts`.

## Zavisnosti

- Nadovezuje se na deljenu ljušturu iz 2026-08-13 (isporučena, `0a84ab1`).
- Korak 5 (print mreža) zavisi od koraka 1 (nov `PrintCard`).
- Nema spoljnih preduslova — nijedan nov LS proizvod, env ni migracija.

## Rizici

| Rizik | Ublažavanje |
|---|---|
| ~~Izvlačenje menja živ venčani Pregled~~ | **Otklonjen odlukom 2** — venčani fajlovi se ne diraju |
| Duplirana datumska logika se raziđe sa venčanom | Obe kapiraju na dan događaja; ako se venčana ikad promeni, `rsvp-deadline.ts` je mesto gde se spajaju |
| Paralelna sesija drži fajlove | Sad nebitno za ovaj task — nijedan dodirnut fajl nije njihov |
| Rok bez kape ode iza datuma proslave | Kapa na `event_date` je već u logici koja se izvlači |
| QR odštampan pa rok istekne → gost skenira i ne može da potvrdi | Zato blok roka i postoji: klijent vidi da je istekao i produži ga |

## Koraci

- [x] **Novi primitivi (bez dodirivanja venčanja)** — `src/components/portal/PrintCard.tsx`
      i `src/lib/rsvp-deadline.ts`. _Acceptance:_ `git status` ne prikazuje
      nijedan fajl iz `moje-vencanje/`; `tsc` + lint čisti. (log: 2026-08-14)
- [x] **Kopiraj link pozivnice** — dugme u countdown heroju, URL po tipu
      (`punoletstvo` / `deciji-rodjendan`); **samo URL**, bez poruke za Viber.
      _Acceptance:_ klik kopira tačan živi URL, dugme potvrdi „Link je kopiran". (log: 2026-08-14)
- [x] **Rok za potvrde** — prikaz `submit_until` + produženje preko
      `extendDeadlineCore`. _Acceptance:_ istekao rok se vidi, produženje upiše
      novi datum i RSVP forma se odmah otvori (revalidacija obe rute). (log: 2026-08-14)
- [x] **QR za potvrde dolaska** — `PrintCard` + modal sa PNG i A6 PDF, cilj
      `/rsvp/{tip}-{slug}/`. _Acceptance:_ skeniran QR sa telefona otvara
      ispravnu stranicu za potvrdu. (log: 2026-08-14)
- [x] **Print mreža sa zaključanim karticama** — zamenjuje „Dodaci za proslavu";
      „QR — Gde sedim" (🔒 uz raspored), „Flajer za galeriju" (🔒 uz galeriju).
      Preuzimanje je dostupno čim je dodatak plaćen; kartica galerije nosi
      napomenu da je gostov link aktivan tek na dan proslave i sutradan.
      _Acceptance:_ zaključana kartica vodi na svoj teaser tab; otključana
      preuzima fajl i pre datuma proslave. (log: 2026-08-14)

## Verifikacija

```
npx tsc --noEmit
npx eslint <dodirnuti fajlovi>
rm -rf .next && npx next build && npx next start -p 3000
```

**Ne koristiti `next dev`** — 404 na non-GET dinamičke API rute
(trailingSlash + Node 24).

Ručno, na oba proizvoda i u sva četiri stanja dodataka:
- `/punoletstvo/sara-vucetic/portal` (`Sara6660`) — ništa plaćeno
- `/punoletstvo/dusan-ivkovic/portal` (`Dusan7994`) — raspored plaćen
- `/deciji-rodjendan/lenka/portal` (`Lenka5123`) — raspored plaćen
- **Regresija:** `/moje-vencanje` Pregled — mora biti **bit-identičan**, pošto
  nijedan venčani fajl nije menjan

QR se testira **skeniranjem sa telefona**, ne klikom — odštampan kod je poenta.

**Rollback:** sve je aditivno osim izvlačenja `PrintCard` i helpera; `git revert`
po koraku vraća staro stanje, nijedna migracija se ne radi.

## Odgovori vlasnika (2026-08-14)

**Kopiraj link = samo URL.** Bez gotove poruke za Viber. Poruka već postoji na
`/pristup` stranici; duplirati je u portalu znači dva mesta sa istim tekstom
koji se raziđu.

**Rođendani ne dobijaju `gallery_key`** — gostinski link radi isključivo na dan
proslave i sutradan. To je **već implementirano**: `guestGate(event_date, false)`
u `deciji-rodjendan/[slug]/galerija/page.tsx` i u hubu. Ništa se ne menja u
gejtu.

> ⚠️ **Razlika koju plan mora da poštuje:** „nuditi link samo na dan proslave"
> odnosi se na **gostov pristup**, ne na **vlasnikovo preuzimanje QR-a**.
> Odštampani kod se priprema unapred — zaključati dugme za preuzimanje do d0
> značilo bi da se QR fizički ne može odštampati na vreme.
>
> Zato:
> - **preuzimanje QR/flajera** — dostupno čim je galerija plaćena
> - **gostov link** — radi samo d0–d1 (nepromenjeno)
> - **na kartici stoji kad se otvara**, npr. „Aktivan na dan proslave i
>   sutradan" — da vlasnik ne pomisli da je kod pokvaren kad ga testira ranije

## Otvorena pitanja

- Nema. Oba pitanja zatvorena gore.
