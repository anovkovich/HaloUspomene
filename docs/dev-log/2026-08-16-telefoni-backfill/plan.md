# Backfill telefona iz Web3Forms mejlova

- **ID:** 2026-08-16-telefoni-backfill
- **Status:** done
- **Created:** 2026-08-16
- **Owner:** Aleksa

## Zašto

**17 pravih parova nema `contact_phone`** (plus 4 demo zapisa, koji ne igraju).
Zbog toga ih ne dohvata nijedna automatika koja ide preko SMS-a:

- ponuda alata za raspored (7–14 dana pred venčanje)
- d4/d5 upozorenja pred **brisanje galerije** — jedina najava koju par dobija
- svako buduće SMS obaveštenje

Uzrok je zatvoren, ali je ostavio rupu iza sebe: forma je **oduvek** tražila
„Vaš kontakt telefon" i slala ga u telu zahteva, ali stara
`/api/pozivnica/create` **nije prepisivala to polje u zapis** — čitala je
`body.theme`, `body.tagline`, `body.locations`… i `contact_phone` prosto nije
bio na spisku. Popravljeno **28.04.2026** commit-om `7736fec` (Infobip 2FA), i
to usput, ne zato što je neko primetio gubitak.

**Broj nije izgubljen** — Web3Forms je isti podatak slao i na
`halouspomene@gmail.com`. Dokazano na Mileniji & Milanu: mejl od 26.04. nosi
`Kontakt telefon: +381656563623,656287417`. Dakle inboks je jedini preživeli
izvor.

## Ciljevi

- Vratiti brojeve iz mejlova za parove kojima venčanje **tek predstoji**.
- Isti postupak, po potrebi, i za prošle parove (niži prioritet).

## Van obima

- Izmena create ruta — rupa je zatvorena u aprilu, svi noviji parovi imaju broj
  (provereno: **12/12 najnovijih** ga ima, samo **4/26 starijih**).
- Demo zapisi (`example: true`): `ana-dejan`, `milica-nikola`, `ana-marko`,
  `teodora-bojan` — nemaju stvarnog vlasnika.

## Ishod (2026-08-16)

`milenija-milan` vraćen iz mejla i odmah ušao u SMS tok. Preostala četiri
„prioritetna" para ispala su iz obima kad se pogledalo **čemu bi im broj
služio**, a ne samo da li ga imaju:

| Slug | Stanje | Treba li broj |
|---|---|---|
| `tamara-aleksandar` | raspored **već plaćen** | ne — ponuda je bespredmetna |
| `anastasija-jovan` | raspored + audio plaćeni | ne |
| `jovana-aleksandar` | ništa plaćeno | mejl nije pronađen u inboksu |
| `aleksandra-miljan` | draft, ima samo `@aleksandra.vsc` | bez hitnosti |

Nijedan nema galeriju, pa ne propuštaju ni d4/d5 upozorenja. Ostalih 13 su
prošla venčanja. **Backfill je time iscrpljen** — ostatak je urednost, ne
potreba.

## Kako pronaći broj

U `halouspomene@gmail.com` traži naslov **`Nova Pozivnica - <Imena>`**,
pošiljalac `notify@web3forms.com`, datum ≈ `created_at` para. Polje se u telu
mejla zove **`Kontakt telefon`**.

## Odluke

**Format je E.164, zarezom razdvojen, bez razmaka** — `+381656563623,+381656287417`.
Tako čuvaju i ostali zapisi (`branislava-nikola`, `merima-meadaris`).

**Brojevi bez pozivnog se normalizuju pre upisa.** Mejl Milenije & Milana je
nosio `656287417` (bez `+381`). `primaryPhone()` prihvata **samo** brojeve koji
počinju sa `+`, pa bi u zatečenom obliku bio nevidljiv za svaku automatiku —
tiho, bez ijedne greške.

**Prvi broj u listi je onaj na koji ide SMS.** `primaryPhone()` uzima samo
prvi; ostali stoje kao ručna rezerva. Kad par ima dva broja, prvi treba da bude
onaj koji češće javlja.

## Uticaj

Samo podaci — polje `contact_phone` na `couples`. Nijedna izmena koda.
Efekat je da par ulazi u SMS tokove; ako mu je venčanje u prozoru 7–14 dana,
**sledeći dnevni prolaz cron-a ga hvata** (`gallery-lifecycle.yml`, 08:00 UTC).

## Rizici

| Rizik | Ublažavanje |
|---|---|
| Pogrešno prepisan broj → SMS nepoznatoj osobi | Suvi prolaz pre upisa; proveriti da broj ima 12 cifara posle `+381` |
| Broj bez pozivnog ostane takav | Normalizacija je deo koraka, ne naknadna misao |
| Par dobije SMS koji ne očekuje | Oznaka `seating_sms_offer_sent` drži na jednoj poruci; ko je ponudu zatvorio u portalu je i dalje isključen |

## Koraci

- [x] **Uzrok utvrđen** — stara create ruta je primala `contact_phone` i nije
      ga upisivala. (log: 2026-08-16)
- [x] **`milenija-milan` vraćen** iz Web3Forms mejla, drugi broj normalizovan u
      E.164. _Acceptance:_ `findSeatingSmsCandidates()` ga vraća. (log: 2026-08-16)
- [x] **Obim revidiran** — preostali parovi ili već imaju plaćen alat, ili nemaju
      mejl, ili su draft bez hitnosti. (log: 2026-08-16)
- [ ] **Ostalih 13 (prošla venčanja)** — po prilici, radi urednosti. Bez roka.

## Verifikacija

```
node --env-file=.env.local scripts/<skripta>.mjs        # suvi prolaz
```
Pa provera da automatika vidi par — isti suvi prolaz koji je potvrdio Meleniju:
`findSeatingSmsCandidates()` mora da ga vrati sa ispravnim brojem.

## Otvoreno

- Da li dodati **tihu oznaku u adminu** na parovima bez broja? Danas nigde ne
  piše da automatika ne može da ih dosegne, pa izgleda kao da sistem ćuti bez
  razloga.
