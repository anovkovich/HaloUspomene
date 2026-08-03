# Log — Server akcije: provera sesije po claim-ovima

## 2026-08-03 — Rupa dokazana, zatvorena i verifikovana; deployovano

- **Šta je urađeno:**
  - Rupa **dokazana pre popravke**, na sopstvenom test zapisu: POST server
    akcije na `/raspored-sedenja/prijava/` sa `Next-Action` headerom i **bez
    ijednog kolačića** vratio je `{"success":true}` i stvarno prepisao
    `seating_layouts`. Ista adresa je vraćala i celu biblioteku šema sala.
  - `src/lib/seating/action-auth.ts` (novo): `claimsOf()` vraća payload;
    `hasEventSession(cookieName, slug)` traži `payload.slug === slug` ili admin
    `role`; `hasAnyEventSession()` traži neprazan `slug` claim ili admin rolu.
  - Gejtovane akcije: `saveRaspored`/`loadRaspored`/`checkPaidStatus`
    (pozivnica), iste tri za rođendan, `saveStandaloneRaspored`/
    `loadStandaloneRaspored`/`checkStandaloneActive`, `guard()` u
    `gosti/actions.ts` (dodavanje, izmena, brisanje i zamena cele liste
    gostiju), i `POST /api/raspored-sedenja/[slug]/import` (Excel uvoz — API
    ruta, middleware je nikad nije ni video).
  - `src/middleware.ts`: novi `hasSessionFor(cookieValue, slug)` zamenio četiri
    gola `jwtVerify` bloka (pozivnica, dečji rođendan, punoletstvo, standalone
    raspored); `/admin` gejt sada traži `payload.role === "admin"`.
  - Četiri nove `hall-venues` admin rute takođe traže `role === "admin"`.
  - Pre izmene provereno svih 7 mesta koja kuju kolačiće — sva potpisuju
    `{ slug }` jednak slugu kolačića, admin potpisuje `{ role: "admin" }` — pa
    zahtev za `slug` claim-om ne isključuje nijedan legitiman tok.

- **Commit / PR:** `8d87c4b` na grani `deploy`.

- **Na šta utiče dalje:**
  - **Invarijanta za ubuduće:** svaka nova server akcija koja dira podatke
    događaja mora da pozove `hasEventSession(cookie, slug)`. Middleware nije
    dovoljan i ne treba se na njega oslanjati.
  - Ostaje **27 admin API ruta** (`src/app/api/admin/**`) koje i dalje
    prihvataju bilo koji token potpisan sa `JWT_SECRET`, bez `role` provere;
    `grep -rn "payload.role" src/app/api/admin` nalazi samo nove hall-venues
    rute. Middleware ih ne pokriva jer `/api/*` nije u matcher-u. Ista klasa
    problema, šira površina — sledeći korak.
  - `PHONE_VERIFY_JWT_SECRET` treba postaviti u Vercel produkciji da trust
    tokeni sa SMS toka uopšte ne dele ključ sa sesijama.

- **Posledice:**
  - Ponašanje za legitimne korisnike **nepromenjeno** — svaki token koji su i
    dosad imali nosi `slug`.
  - Jedina namerna promena: validan ali ne-admin token više ne otvara `/admin`
    (ranije je propuštao).
  - Istekla sesija u editoru sada vraća „Sesija je istekla. Prijavite se
    ponovo." umesto tihe greške.
  - **Revert:** commit je samostalan; `git revert 8d87c4b` vraća staro
    ponašanje bez dodirivanja funkcionalnosti.

- **Šta je rešeno:** neautentifikovano prepisivanje tuđeg rasporeda sedenja i
  brisanje tuđe liste gostiju; otvaranje tuđeg portala tuđim tokenom;
  otvaranje admin panela bilo kojim potpisanim tokenom.

- **Šta je odblokirano:** deploy biblioteke šema sala
  ([[2026-08-02-seme-sala-biblioteka]]) — bez ovoga bi novi feature dodao još
  javno pozivih akcija na istu rupu.

- **Status:** — → deployed

- **Blokade / sledeći korak:** `PHONE_VERIFY_JWT_SECRET` u Vercel, pa `role`
  provera na preostalih 27 admin ruta.

### Verifikacija

12 provera sa tokenima kovanim pravim `JWT_SECRET`-om:

| # | Scenario | Pre | Posle |
|---|---|---|---|
| 1 | upis, bez kolačića | prošao | odbijen |
| 2 | upis, tokenom drugog događaja na tuđem slugu | prošao | odbijen |
| 3 | upis, tokenom sa javnog SMS toka | prošao | odbijen |
| 4 | upis, ispravnim tokenom vlasnika | prošao | **prošao** |
| 5–7 | pretraga biblioteke sala (bez / slug-less / ispravan) | sve prošlo | odbijen / odbijen / prošao |
| 8–11 | tuđi portal (bez / tuđi / SMS / ispravan token) | — | 307 / 307 / 307 / **200** |
| 12 | `/admin/nova` ne-admin tokenom | prošao | 307 |

Excel import ruta odvojeno: bez kolačića / tuđim / SMS tokenom → 401;
ispravnim → 400 (nema fajla, tj. auth prošao).

Regresija u pravom browseru, sve 200 i nula grešaka u konzoli: pozivnica
`raspored-sedenja` (24 stola učitana, snimanje prošlo), `pozivnica/potvrde` →
redirect na `/moje-vencanje?tab=guests`, standalone editor + portal + gosti
(dodavanje gosta prošlo), dečji rođendan portal + raspored, `/admin/nova`.
Odjavljen korisnik → 307 na sve četiri.
