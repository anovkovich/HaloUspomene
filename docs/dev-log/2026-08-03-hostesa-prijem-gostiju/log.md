# Log — Prijem gostiju na vratima (hostesa)

## 2026-08-03 — Broj gostiju se bira PRE potvrde; dugme pojednostavljeno

- **Šta je urađeno:**
  - Prijavljeno sa terena: tok je bio neintuitivan. Zvanica od 4 osobe imala je
    samo dugme „Označi dolazak (4)", a `− 2/4 +` stepper se pojavljivao **tek
    posle** klika. Hostesa je time prvo upisivala pogrešan broj (4), pa ga
    naknadno spuštala — dva koraka umesto jednog, na vratima, u žurbi.
  - `HostessCheckinClient.tsx`: dodato lokalno stanje `pending`
    (`Record<guestId, number>`) — koliko se osoba upravo prijavljuje, podrazumevano
    ceo `guestCount`. Kod zvanice sa više osoba stepper se sada prikazuje **pre**
    potvrde i menja samo lokalni broj (bez poziva servera po tapu); tek klik na
    dugme šalje `checkinGuestAction` sa izabranim brojem.
  - Dugme: „Označi dolazak (4)" → **„Stigli"**, bez broja u nazivu (broj je već
    vidljiv u stepperu levo od njega).
  - Potvrđeno stanje: natpis „Stigao" → **„Stigli"**. Usput rešava i to što je
    „Stigao" pogrešno za žensku zvanicu i za grupu.
  - „Poništi dolazak" sada briše `pending` za tu zvanicu, pa picker kreće
    ponovo od punog broja umesto da pamti prethodni izbor.
  - Pojedinačan gost (`guestCount === 1`) i dalje vidi samo dugme, bez steppera.
  - Sitno: `stepBtn` stil izdvojen, `isParty` umesto ponovljenog
    `guest.guestCount > 1`.

- **Commit / PR:** — (nije commit-ovano; ceo feature je još nekomitovan — `HostessCheckinClient.tsx` i `gde-sedim/actions.ts` su untracked, a `?h=` vezivanje živi u nekomitovanim izmenama `gde-sedim/page.tsx`, pa UX popravka ne može sama u produkciju)

- **Na šta utiče dalje:** ako se prijem gostiju ikad prenese na pozivnice ili
  rođendane, ovaj obrazac (broj pre potvrde) treba preneti sa njim. Ako se
  jednom doda spisak „ko još nije stigao", isto dugme treba da radi i iz liste,
  ne samo iz kartice pretrage.

- **Posledice:**
  - Isključivo UI izmena u jednoj klijentskoj komponenti. Data model, server
    akcija, autorizacija i format zapisa netaknuti — `checkinGuestAction` prima
    isti argument kao pre, samo sa vrednošću koju je hostesa izabrala.
  - Manje poziva serveru: ranije je korekcija sa 4 na 2 slala tri zahteva
    (prijava + dva koraka naniže), sada jedan.
  - **Revert:** izmena je u jednom fajlu
    (`src/app/raspored-sedenja/[slug]/gde-sedim/HostessCheckinClient.tsx`) —
    vraćanje na prethodnu verziju tog fajla je dovoljno.

- **Šta je rešeno:** nepotpuni dolazak (pozvano 4, došlo 2) se upisuje iz prve.
  Uklonjen i pogrešan rod u natpisu „Stigao".

- **Šta je odblokirano:** proba na terenu — tok je sada dovoljno kratak da se
  testira na stvarnom prijemu.

- **Status:** — → in-progress (feature prvi put zaveden u dev-log)

- **Blokade / sledeći korak:** proba na telefonu pri stvarnom osvetljenju, pa
  commit i deploy. Otvoreno: da li hostesi treba i spisak „ko još nije stigao".

### Verifikacija

`tsc --noEmit`, `eslint`, `next build` — čisto. Testirano u headless Chromium-u
na telefonskom viewportu (420×900), na privremenom događaju sa zvanicom od 4
(„Огњен Иковић") i pojedinačnim gostom („Milica Jovanović"):

- stepper vidljiv **pre** potvrde (`4/4`), dugme piše „Stigli", stari natpis
  „Označi dolazak" nigde;
- spuštanje na `2/4` pa potvrda → upisano `2/4`, ukupan brojač `2/5`;
- „Poništi dolazak" → picker se vratio na `4/4`;
- pojedinačan gost → bez steppera, samo dugme; prijava prošla;
- nula grešaka u konzoli.

Test događaj (`qa-prijem-gostiju-ggns`) obrisan iz baze zajedno sa rasporedom.
