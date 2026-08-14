# Portal za proslave postaje prodajna površina

- **ID:** 2026-08-13-proslave-portal-upsell
- **Status:** deployed
- **Created:** 2026-08-13
- **Owner:** Aleksa

> Zaveden retroaktivno 2026-08-14. Rad je isporučen i deployovan istog dana kad
> je i urađen; ovaj folder postoji da odluke i zamke ne ostanu samo u kodu.

## Zašto

Povod je bio konkretan kupac: **Sara Vučetić** (`/punoletstvo/sara-vucetic`,
kartica 4.500 din, order `HU249786626008`, webhook otključao 10.08. u 22:41).
Platila je i **nije dobila ništa čime bi pristupila svom portalu**. Vlasnik je
dan i po kasnije ručno napravio `/pristup` link.

Provera je pokazala tri nezavisna razloga:

1. `/hvala` je PIN prikazivala samo za `raspored | dogadjaj | pozivnica |
   galerija`; `punoletstvo`, `rodjendan` i `telefon` su propadali kroz granu i
   blok se nije renderovao.
2. `/pristup/[token]` se **nikad nije kreirao automatski** — jedini pozivalac
   `createOrGetShareLink` bio je admin dugme.
3. Mejla kupcu nema uopšte (Web3Forms ide iz browsera i uvek adminu).

Lozinka je bila prikazana tačno jednom, na success ekranu čarobnjaka **pre**
plaćanja. Ko zatvori taj tab — nema izlaz.

Uz to, drugi problem: portali za punoletstvo i dečiji rođendan bili su
**byte-identični duplikati** (545 linija klijenta + ~185 servera; jedina razlika
prop `displayName` vs `childName`, koji se destrukturira i nikad ne koristi).
Prikazivali su tri stat pločice i listu prijava — **nijednu površinu za upsell**,
pa kupac pozivnice nikad ne sazna da galerija i raspored postoje.

## Ciljevi

- Kupac posle uplate dobija PIN i link ka svom pristupu, na obe šine.
- Jedan portal umesto dva duplikata.
- Raspored, galerija i slike postaju kupljivi iz portala.
- QR galerija radi i za rođendane.

## Van obima

- PDF pozivnice za rođendane (nema generatora — venčanja imaju svoj).
- Checklista i budžet (odluka vlasnika: venčana logika od 9 vremenskih grupa je
  besmislena za proslavu za dva meseca).
- Migracija dve **žive** kopije galerijskih ruta na nov deljeni handler.

## Odluke

**1. Share link se mintuje u `/hvala`, NE u webhook-u.**
Webhook je najosetljivija tačka: izuzetak vraća 500, LS ponavlja isporuku, i
order koji je već otključan može da zaglavi. `createOrGetShareLink` je
idempotentan i stabilan po `(proizvod, slug)`, pa ga stranica potvrde sme da
zove sama, iza iste kapije koja već štiti PIN.

**2. Meni nije samostalan — dolazi uz galeriju ili raspored.**
Odluka vlasnika, i tačna: meni bez QR koda je stranica koju niko ne može da
otvori. Provereno da nijedan renderer pozivnice nema link ka hubu. Tab je
**zaključan sa teaserom, ne sakriven** — teaser JE prodajna poruka, jer traži da
se kupi baš ono što meni čini dostavljivim.

**3. Galerija se ne prodaje bez `contact_phone`.**
Prozor galerije se zatvara par dana posle proslave i **jedina najava je SMS**.
Prodaja bez broja = brisanje klijentovih fotografija bez upozorenja. Zatvoreno
`blockGallery` flagom u `kinds.ts` i brendiranim dijalogom u adminu.

**4. Galerijski QR vodi na hub, ne na zasebnu stranicu.**
Bezbedno jer **nijedan rođendanski zapis nikad nije imao `paid_for_gallery`** —
dakle nijedan takav QR nije odštampan. Stara `/galerija` ruta ostaje živa kao
osiguranje. **Venčani QR nije diran** — odštampane zahvalnice se ne mogu
promeniti.

**5. Zajedničko telo galerijskih ruta izvučeno, ali stare kopije nisu dirane.**
Plan je tražio migraciju sve tri; odbijeno jer dve služe **žive galerije sa
pravim fotografijama**. Nov kod je DRY, stare galerije nose nula rizika.

**6. IPS ispred kartice.** LS je merchant of record; provizija je ~15% na
dodatku od 600 din. IPS je prvi i otvoren (QR bez ijednog klika), kartica druga
i **neprigušena** — strani kupci nemaju alternativu. Odbijeno „domaće bez
provizije": nijedan kupac ne plaća proviziju ni na jednoj šini (LS naknada je
naša), a ono što se stranoj kartici dodaje je **PDV, ne provizija**.

**7. Auto-odobravanje malih IPS uplata — odbijeno.** Klik na „Zatraži obradu" je
tvrdnja kupca, ne dokaz uplate. Auto-approve bi značio da svako ko klikne dobija
proizvod besplatno.

## Uticaj

**Novo:** `src/components/portal/proslava/*` (ljuštura, `GuestListTab`,
`LockedTab`, `SlikeTab`, `config`), `src/lib/proslava/portal-actions-core.ts`,
`src/lib/gallery/{handlers,birthday-resolver}.ts`, `/api/deciji-rodjendan/[slug]/galerija/*`
(5 ruta), `/deciji-rodjendan/[slug]/galerija/`.

**Model:** `BirthdayData` + `paid_for_gallery`, `contact_phone`, `meni`.

**Obrisano:** `PunoletstvoPortalClient.tsx`, `BirthdayPortalClient.tsx`.

**Deljena površina (dira venčanja):** `MeniCard` (opcioni `description`;
podrazumevano isti tekst), `GalleryCard`, `CheckoutPanel`.

## Zavisnosti

- Nadovezuje se na `2026-08-11-punoletstvo-prilagodjavanje`.
- Blokira `2026-08-14-proslave-pregled-print`.

## Rizici

| Rizik | Stanje |
|---|---|
| Preusmeravanje galerijskog QR-a lomi odštampane kodove | **Otklonjen merenjem** — nula zapisa sa `paid_for_gallery`, nijedan QR odštampan |
| Deljene kartice diraju živa venčanja | `description` je opcioni; venčani tekst nepromenjen |
| Cena tiera ≠ LS cena → uplata u `review` | `ls-variant-ids.mjs` dopunjen; sve tri cene provereno poklapaju |
| Paralelna sesija na istim fajlovima | Materijalizovao se: IPS reorder utopljen u tuđi commit `55aa799` |

## Koraci

- [x] **Isporuka pristupa** — PIN za rođendanske kind-ove + auto `/pristup` na
      obe šine. _Acceptance:_ `/hvala` daje PIN i link. (log: 2026-08-13)
- [x] **Deljena ljuštura** — dva duplikata → jedna komponenta sa tabovima.
      _Acceptance:_ obe rute rade, akcije prolaze auth. (log: 2026-08-13)
- [x] **Tierovi** — raspored 2.500, galerija 3.500, slike 600; jedna fabrika
      umesto dva adaptera. _Acceptance:_ cene se poklapaju sa LS. (log: 2026-08-13)
- [x] **QR galerija + gostinski hub** — treće stablo ruta preko deljenog
      handlera; `gde-sedim` postaje hub. _Acceptance:_ 404 bez plaćanja, 403 van
      prozora, 401 tuđom sesijom. (log: 2026-08-13)
- [x] **Meni i slike** — meni uz plaćeni dodatak, klijentski upload slika.
      _Acceptance:_ meni vidljiv gostu u hubu. (log: 2026-08-13)
- [x] **IPS ispred kartice + SMS zvono.** _Acceptance:_ IPS prvi i otvoren; SMS
      stiže na vlasnikov broj. (log: 2026-08-14)

## Verifikacija

Urađeno: `tsc`, `eslint` na svim dodirnutim fajlovima, `next build`, e2e kroz
`curl` na živim podacima (uključujući `Next-Action` protokol za server akcije),
negativni testovi autorizacije, smoke na 11 ruta lokalno i 7 na produkciji.

**Nije potvrđeno klikom:** upload slike iz pregledača (multipart kroz server
akciju nije prošao kroz `curl`; kapije i autorizacija jesu provereni),
kartično plaćanje na novim tierovima, „Display on storefront OFF" (LS API to ne
izlaže).

## Otvorena pitanja

- Zatečena `raspored-sedenja` download ruta koristi golu `jwtVerify` bez provere
  `slug` claim-a — bilo koji naš potpisan token otvara tuđe fotografije. Van
  obima ovog taska, vredi kao zaseban.
- Migracija dve žive kopije galerijskih ruta na `src/lib/gallery/handlers.ts`.
