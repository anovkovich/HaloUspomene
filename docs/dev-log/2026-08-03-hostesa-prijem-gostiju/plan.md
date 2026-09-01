# Plan — Prijem gostiju na vratima (hostesa)

- **ID:** 2026-08-03-hostesa-prijem-gostiju
- **Status:** in-progress (funkcionalnost postoji u kodu; UX se dorađuje)
- **Kreiran:** 2026-08-03
- **Vlasnik:** Aleksa

> **Napomena o poreklu:** feature je napravljen u ranijoj sesiji koja nije
> zavedena u dev-log. Ovaj `plan.md` je **rekonstrukcija zatečenog stanja iz
> koda** (2026-08-03), da bi dalje izmene imale gde da se beleže — nije plan
> pisan pre implementacije. Sve što piše ispod je pročitano iz koda, ne
> rekonstruisano po sećanju.

## Zašto

Na ulazu u salu neko mora da vodi računa ko je stigao. Do sada je to bio papir
u ruci kume. Pošto `/gde-sedim` već rešava „ko gde sedi", isti ekran je
najjeftinije mesto da se doda i „ko je stigao" — hostesa radi isto što i gost
(ukuca ime, vidi sto), samo dodatno štiklira dolazak.

## Zatečeno stanje (kako radi danas)

**Podaci** — `StandaloneGuest` u `src/lib/standalone-seating.ts` nosi
`arrived?: number` (koliko je od `guestCount` stvarno došlo; `undefined`/0 =
nije stigao) i `arrivedAt?: string` (ISO vreme **prve** prijave).
`setStandaloneGuestArrival` upisuje `arrived`, pa drugim upitom sa `$elemMatch`
stampa `arrivedAt` samo pri prvoj prijavi. `arrived <= 0` briše oba polja.

**Autorizacija** — poseban `checkin_token` na zapisu (`randomBytes(16)`, CSPRNG,
32 hex znaka), poređenje kroz `timingSafeEqual` (`checkinTokenMatches`).
Hostesa je često spoljno lice, pa dobija link koji joj daje **samo** ovu radnju
— ne portal, ne PIN, ne izmenu liste gostiju. Organizator poništava sve izdate
linkove regenerisanjem tokena.

**Tok:**
1. Vlasnik u portalu (`PortalClient.tsx`) generiše/kopira link
   `/raspored-sedenja/{slug}/prijem/?h={token}`.
2. `prijem/page.tsx` čita `?h` i poredi ga sa `checkin_token`; na nevalidan
   token preusmerava na `/gde-sedim/` — hostesa i dalje nađe mesto, a URL jasno
   kaže da prijem više ne radi.
3. `HostessCheckinClient` **ne duplira** pretragu — ponovo koristi
   `GdeSedimClient` i ubacuje svoj blok kroz `renderExtra`, pa `GdeSedimClient`
   ništa ne zna o prijemu. Iznad svega stoji stalni brojač `stiglo / očekivano`.
4. `checkinGuestAction` ponovo proverava token na **svakom** pozivu — render
   stranice nije kapija, jer se server akcija može pozvati direktno.

**Uparivanje imena** — lookup je ključan po imenu sa rasporeda, a prijem traži
zapis iz liste gostiju; oba se presavijaju kroz `normalizeName`, pa
„Ognjen Ikovic" pogađa „Огњен Иковић". Zvanica se štiklira pod nosiocem
(`partyName`), uz fallback na traženo ime.

## Ciljevi

- Hostesa na vratima za par sekundi nađe zvanicu i upiše koliko ih je stiglo.
- Nepotpuni dolasci (pozvano 4, došlo 2) se upisuju **iz prve**, bez naknadne
  korekcije.
- Greška se poništava jednim potezom.

## Van obima

- Prijem gostiju za pozivnice i rođendane (za sada samo standalone raspored).
- Istorija prijava (ko je kada štikliran) — čuva se samo `arrivedAt` prve
  prijave.
- Više hostesa sa odvojenim nalozima — jedan token po događaju.

## Uticaj

- `src/app/raspored-sedenja/[slug]/gde-sedim/` — `page.tsx` (grananje po tokenu),
  `HostessCheckinClient.tsx`, `actions.ts`.
- `src/lib/standalone-seating.ts` — `arrived`/`arrivedAt`, `checkin_token`,
  `setStandaloneGuestArrival`, `generateCheckinToken`, `checkinTokenMatches`.
- `src/app/api/admin/seatings/[slug]/route.ts` — kovanje/poništavanje tokena.
- `src/app/raspored-sedenja/[slug]/portal/PortalClient.tsx` — generisanje i
  kopiranje linka.
- `GdeSedimClient` (`src/app/pozivnica/[slug]/gde-sedim/`) — deljen sa gostima;
  `renderExtra` je jedina dodirna tačka.

## Rizici

- **Link se lako prosleđuje dalje.** Ublaženo obimom (samo prijem) i time što
  organizator može da regeneriše token. Nema rate-limita.
- **Deljeni `GdeSedimClient`** — svaka izmena tamo pogađa i goste i hostesu.
- Slabo osvetljen ulaz i žurba: svaki dodatni korak u UI-ju košta.

## Koraci

- [x] **Data sloj + autorizacija** — `arrived`/`arrivedAt`, `checkin_token`,
      `timingSafeEqual`. _Prihvatanje:_ token se proverava i pri renderu i u
      akciji. (zatečeno)
- [x] **Hostesa UI** — `HostessCheckinClient` preko `renderExtra`, stalni
      brojač. _Prihvatanje:_ pretraga i mapa se ne dupliraju. (zatečeno)
- [x] **Generisanje linka u portalu.** _Prihvatanje:_ vlasnik može da kopira i
      da poništi link. (zatečeno)
- [x] **UX: broj pre potvrde** — stepper se prikazuje pre klika, dugme
      pojednostavljeno na „Stigli". _Prihvatanje:_ zvanica od 4 koja dođe u 2
      upisuje se jednim klikom, bez naknadne korekcije. (log: 2026-08-03)
- [ ] **Test na terenu + deploy** — proba na telefonu pri stvarnom osvetljenju.

## Verifikacija

`tsc`/lint/build, pa ručno na telefonskom viewportu: zvanica od 4 (stepper +
potvrda + poništavanje), pojedinačni gost (bez steppera), ime van liste gostiju
(poruka umesto dugmeta), pogrešan/izostavljen `?h` (obična gost verzija).

## Otvorena pitanja

- Da li hostesi treba i spisak „ko još nije stigao" (sada mora da traži po
  imenu).
- Da li isto ponašanje prebaciti i na pozivnice/rođendane.
