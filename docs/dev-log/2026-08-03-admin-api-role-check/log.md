# Log — Admin API: provera `role` claim-a na svim rutama

## 2026-08-03 — Izmereno, zatvoreno, verifikovano

- **Šta je urađeno:**
  - **Prvo izmereno, pa menjano.** Napisana revizorska skripta koja prolazi kroz
    svaku rutu pod `src/app/api/admin/**` sa četiri identiteta. Pre izmene:
    **48 od 57 provera prolazi** sa tokenom koji nije admin. Najgori pojedinačni
    nalaz: `DELETE /api/admin/couples/[slug]` vraća 200 — kaskadno brisanje para
    (pozivnica, potvrde dolaska, raspored, audio, portal) bilo je dostupno
    svakome ko ima bilo koji naš potpisan token.
  - `src/lib/admin-auth.ts` (novo): `isAdminRequest(req)` za rute,
    `isAdminSession()` za server akcije; oba traže `payload.role === "admin"`.
  - 28 ruta pod `/api/admin/**`: obrisan lokalni `isAdmin` helper, `secret`
    konstanta i `jose` import; dodat import pod aliasom, pa je **svih 52 pozivnih
    mesta ostalo bajt-identično**. Prebrojano pre i posle: 52 = 52.
  - 3 `phone-rentals` rute nisu imale helper nego inline `jwtVerify` unutar
    `try` — zamenjeno istim pozivom; `try/catch` namerno ostavljen (menjanje
    semantike grešaka nije posao bezbednosne zakrpe). Usput očišćeno 5
    `catch (error)` bez upotrebe.
  - Tri admin površine van `/api/admin/`: GET na
    `api/pozivnica/[slug]/audio` i `api/raspored-sedenja/[slug]/audio`
    (listaju tuđe audio poruke), i `setHighlightedVendorsAction` u
    `moje-vencanje/actions.ts`. **POST na obe audio rute je javni snimač gosta i
    nije diran** — to je jedino mesto gde bi greška oborila živi tok.
  - `/api/admin/auth` netaknut: to je ruta kojom se postaje admin.

- **Commit / PR:** `bezbednost(admin): sve API rute traze role claim`.

- **Na šta utiče dalje:**
  - **Invarijanta:** `rg -l jwtVerify src/app/api/admin/` mora ostati prazno.
    Nova admin ruta uvozi `isAdminRequest` iz `@/lib/admin-auth` i nikad ne zove
    `jwtVerify` direktno. Zapisano i u `CLAUDE.md`.
  - Ostaje: `DELETE /api/admin/couples/[slug]` po `CLAUDE.md` traži ponovni unos
    admin lozinke, ali to postoji samo u `DeleteModal.tsx` na klijentu — server
    tu kontrolu nema. Posle ove izmene napadač mora imati admin token, pa nije
    kritično, ali dokumentovana kontrola ne postoji.
  - Ostaje: `phone-rentals` rute vraćaju 401 i kad padne Mongo, jer `try`
    obuhvata ceo handler. Zbunjujuće tokom incidenta.

- **Posledice:**
  - **Nijedan legitiman tok nije mogao da se pokvari**, i to se može tvrditi
    precizno: `admin_token` se kuje na tačno jednom mestu (`/api/admin/auth`) i
    oduvek nosi `{ role: "admin" }`, pa svaki već izdat kolačić zadovoljava novu
    proveru — nema prisilnog re-logina ni prelaznog perioda.
  - Jedina namerna promena ponašanja: token koji nije admin više ne prolazi.
  - **Revert:** `git revert` — jedan nov fajl, inače samo brisanja plus po jedna
    import linija; nema migracije, promene formata kolačića ni env varijable.

- **Šta je rešeno:** ceo admin API bio je otvoren svakome ko poseduje bilo koji
  token koji aplikacija izdaje — uključujući anonimnog posetioca koji je prošao
  javnu SMS verifikaciju.

- **Šta je odblokirano:** admin panel se sada može širiti bez nasleđivanja
  propusta kroz copy-paste `isAdmin` helpera.

- **Status:** — → deployed

- **Blokade / sledeći korak:** dve stavke iz „na šta utiče dalje".

### Verifikacija

| identitet | pre | posle |
|---|---|---|
| bez kolačića | 401 (57/57) | 401 (57/57) |
| token sesije para `{ slug, scope }` | **prolazi na 48/57** | 401 (57/57) |
| trust token iz javnog SMS toka `{ phone }` | **prolazi na 48/57** | 401 (57/57) |
| pravi admin `{ role: "admin" }` | prolazi | **i dalje prolazi** |

Pravi admin posle izmene: svih 12 GET ruta vraća 200; u browseru učitani svi
tabovi (Pozivnice, Rođendani, Vendori, Raspored sedenja, Uplate) uz **nula 401
odgovora** i nula grešaka u konzoli. `GET` audio rute 401 bez admina / 200 sa
adminom; javni `POST` snimač netaknut.

Dinamički segmenti u reviziji popunjeni sentinel slugom koji ne može da pogodi
pravi zapis, a pravi admin token slat je samo na GET — tako da nijedna provera
nije ništa upisala ni obrisala.
