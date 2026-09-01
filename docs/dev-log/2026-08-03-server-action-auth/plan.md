# Server akcije: provera sesije po claim-ovima

- **ID:** 2026-08-03-server-action-auth
- **Status:** deployed
- **Kreiran:** 2026-08-03
- **Vlasnik:** Aleksa

> Nije planiran unapred. Otkriveno u pre-deploy reviewu biblioteke šema sala
> ([[2026-08-02-seme-sala-biblioteka]]) i popravljeno odmah, jer je rupa već
> bila živa na produkciji.

## Zašto

Dva odvojena propusta koja se množe jedan s drugim:

**1. Middleware ne štiti server akcije.** Server akcija se izvršava POST-om na
*bilo koji* URL koji se razrešava u rutu iz čijeg modula potiče. Segment
`prijava` postoji samo *ispod* `[slug]`, pa se `/raspored-sedenja/prijava/`
razrešava u `[slug]` editor rutu — koju `SEATING_RESERVED_SLUGS` u middleware-u
namerno propušta bez provere. Rezultat: POST akcije sa te adrese, **bez ijednog
kolačića**, izvršavao se normalno.

**2. Provera je bila samo potpis, ne i sadržaj.** Sve što potpisujemo koristi
isti `JWT_SECRET` — uključujući trust token koji javni SMS tok
(`phone-verification.ts`) daje svakome ko prođe verifikaciju broja, jer
`PHONE_VERIFY_JWT_SECRET` nije postavljen pa pada na `JWT_SECRET`. Gola
`jwtVerify` provera je zato prihvatala i tuđi token preimenovan na drugi slug.

Zajedno: ko zna slug bilo kog aktivnog klijenta mogao je da mu prepiše raspored
sedenja ili obriše listu gostiju uoči svadbe. Potvrđeno lokalno pre popravke —
akcija je vratila `{"success":true}` i stvarno prepisala zapis.

## Odluke

1. **Provera ide u samu akciju, ne samo u middleware.** Stranični gejt ostaje
   ono što preusmerava čoveka na `/prijava`; claim provera je ono što
   zaustavlja skrojen POST.
2. **Traži se `slug` claim, ne samo validan potpis.** Svaka login ruta potpisuje
   `{ slug }`, admin potpisuje `{ role: "admin" }` — provereno na svih 7 mesta
   koja kuju kolačiće. Trust token sa SMS toka nosi samo `{ phone, scope }`, pa
   sam taj zahtev odbija.
3. **Isti helper i u middleware-u**, da stranični pristup tuđem portalu padne
   iz istog razloga iz kog pada i upis.
4. **`SEATING_RESERVED_SLUGS` nije diran.** Uklanjanje bi polomilo `/prijava` i
   `/gde-sedim`; ispravno mesto za popravku je provera u akciji.

## Uticaj

- `src/lib/seating/action-auth.ts` (novo) — `hasEventSession(cookie, slug)` i
  `hasAnyEventSession()`.
- Save/load/checkPaid akcije sva tri proizvoda, lista gostiju
  (`gosti/actions.ts`), Excel import ruta.
- `src/middleware.ts` — četiri per-slug gejta + `role === "admin"` na `/admin`.
- Četiri nove `hall-venues` admin rute traže `role === "admin"`.

## Rizici

- **Zaključavanje legitimnih korisnika** ako neki token ne nosi `slug` —
  ublaženo proverom svih 7 mesta koja kuju kolačiće pre izmene, pa regresijom
  na svakom proizvodu.
- Preostaje **27 admin API ruta** koje i dalje prihvataju bilo koji potpisan
  token (v. otvorena pitanja).

## Koraci

- [x] **Dokazati rupu** pre popravke, na sopstvenim test podacima. (log: 2026-08-03)
- [x] **`action-auth.ts` + gejtovi** u akcijama i middleware-u. (log: 2026-08-03)
- [x] **Dokazati da je zatvorena** istim napadom + tokenom tuđe sesije i SMS
      tokenom; regresija na sva četiri proizvoda. (log: 2026-08-03)
- [ ] **Postaviti `PHONE_VERIFY_JWT_SECRET`** u Vercel produkciji (odvaja trust
      tokene od svih ostalih — odbrana u dubinu).
- [ ] **Proširiti `role === "admin"` na preostale admin API rute** (27 fajlova).

## Verifikacija

12 provera, svaka sa tokenom kovanim pravim `JWT_SECRET`-om: upis bez
kolačića / tokenom drugog događaja / SMS tokenom → odbijen; ispravnim tokenom →
prolazi. Isto za pretragu biblioteke, Excel import, tuđi portal i `/admin`.
Regresija: pozivnica (24 stola, snimanje), standalone editor/portal/gosti,
rođendan portal/raspored, `/admin/nova` — svi 200, nula grešaka u konzoli;
odjavljen korisnik → 307 na sve četiri.

## Otvorena pitanja

- 27 admin API ruta bez `role` provere — ista klasa, šira površina. Middleware
  ih ne pokriva (`/api/*` nije u matcher-u).
- `?h=` token hostese stoji u query stringu, pa može da procuri kroz Referer
  ili deljeni screenshot. CSPRNG je, poredi se constant-time i opoziv je, ali
  URL jeste kredencijal.
