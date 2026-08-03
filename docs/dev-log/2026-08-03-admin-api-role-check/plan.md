# Admin API: provera `role` claim-a na svim rutama

- **ID:** 2026-08-03-admin-api-role-check
- **Status:** deployed
- **Kreiran:** 2026-08-03
- **Vlasnik:** Aleksa

> Nastavak [[2026-08-03-server-action-auth]] — ista klasa propusta, šira
> površina. Tamo su bile server akcije, ovde ceo admin API.

## Zašto

Svaka ruta pod `src/app/api/admin/**` proveravala je **samo potpis**
`admin_token` kolačića (`jwtVerify(cookie.value, secret)`), bez gledanja u
sadržaj tokena.

To nije dovoljno jer **sve što aplikacija potpisuje deli isti `JWT_SECRET`**:
sesije parova `{ slug }`, portal/raspored/rođendan/punoletstvo `{ slug, scope }`,
bypass linkovi, i trust token iz javnog SMS toka koji dobija **bilo ko** ko na
`/napravi-pozivnicu` potvrdi broj telefona. Bilo koji od tih tokena, prekopiran
u kolačić po imenu `admin_token`, otvarao je ceo admin API.

Izmereno pre popravke: **48 od 57 provera prolazi** sa lažnim tokenom, uključujući
`DELETE /api/admin/couples/[slug]` (kaskadno briše para) i `PUT/PATCH` nad
parovima i vendorima.

## Odluke

1. **Jedan deljeni helper `src/lib/admin-auth.ts`**, ne 27 kopija. Dva izvoza jer
   postoje dva konteksta: `isAdminRequest(req)` za rute (imaju `NextRequest`) i
   `isAdminSession()` za server akcije (`next/headers`).
2. **Traži se `payload.role === "admin"`.** Taj claim kuje isključivo
   `/api/admin/auth`, iza `ADMIN_PASSWORD` — nijedan drugi token ga nema.
3. **Import pod aliasom** (`isAdminRequest as isAdmin`), pa **nijedno pozivno
   mesto nije dirano.** Uz ~52 čuvara u 31 fajlu, najveći rizik mehaničkog
   prolaza je promašeno ili pogrešno prekucano pozivno mesto; alias tu
   kategoriju greške briše u potpunosti. Diff po fajlu je „−10 linija, +1".
4. **Odbačen `withAdmin(handler)` omotač** — čist u teoriji, ali menja potpis
   ~57 izvezenih handlera u App Routeru gde su `(req, { params })` ugovor i
   generisanje tipova ruta noseći. Menjati 57 potpisa da bi se popravio jedan
   `if` je pogrešna razmena na produkciji.
5. **`src/lib/seating/action-auth.ts` nije diran** — tačan je i tiče se
   *event* sesija; ovo je druga briga i drugi kontekst.

## Uticaj

- `src/lib/admin-auth.ts` (novo).
- 28 ruta pod `/api/admin/**` — zamenjen lokalni `isAdmin`.
- 3 `phone-rentals` rute — nisu imale helper, nego inline `jwtVerify` unutar
  `try`; ubačen isti poziv, `try/catch` namerno ostavljen kakav je.
- `api/pozivnica/[slug]/audio` i `api/raspored-sedenja/[slug]/audio` — **samo
  GET** (lista tuđih audio poruka). POST je javni snimač gosta i ostaje otvoren.
- `moje-vencanje/actions.ts` → `setHighlightedVendorsAction`; `getAuthSlug` u
  istom fajlu i dalje koristi `jwtVerify` za slug sesije i nije diran.
- `/api/admin/auth` (login) namerno netaknut — to je način da se postane admin.

## Rizici

- **Zaključavanje vlasnika iz panela.** Ublaženo činjenicom da `admin_token`
  ima tačno jedno mesto kovanja i da oduvek potpisuje `{ role: "admin" }` — svaki
  već izdat kolačić zadovoljava novu proveru, nema prisilnog re-logina.
- **Mehanička greška u 31 fajlu** — ublaženo alias obrascem, `tsc`-om i
  brojanjem čuvara pre/posle (52 = 52).

## Koraci

- [x] Dokazati propust merenjem, pre izmene. (log: 2026-08-03)
- [x] `src/lib/admin-auth.ts` + zamena u 31 ruti + 3 površine van `/api/admin`.
      (log: 2026-08-03)
- [x] Dokazati da je zatvoreno i da admin i dalje radi. (log: 2026-08-03)
- [ ] `DELETE /api/admin/couples/[slug]` traži ponovni unos lozinke samo na
      klijentu (`DeleteModal.tsx`); server tu kontrolu nema.
- [ ] `phone-rentals` rute vraćaju 401 i kad padne baza (`try` obuhvata ceo
      handler) — zbunjujuće tokom incidenta.

## Verifikacija

`scripts`-stil skripta prolazi kroz svaku rutu sa četiri identiteta: bez
kolačića, tokenom sesije para, trust tokenom iz SMS toka, i pravim adminom.
Dinamički segmenti se popunjavaju sentinel slugom koji ne može da pogodi pravi
zapis, a pravi admin token se šalje **samo na GET**, da se ništa ne upiše.

Rezultat: **57/57 provera vraća 401 za sve lažne identitete** (pre: 48 propusnih).
Pravi admin: svih 12 GET ruta 200, svih 5 tabova panela učitano, **nula 401
odgovora** u celoj browser sesiji.

Statička invarijanta: `rg -l jwtVerify src/app/api/admin/` mora da bude prazno.
