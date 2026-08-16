# Log — Backfill telefona iz Web3Forms mejlova

## 2026-08-16 — Uzrok utvrđen, prvi par vraćen

- **Šta je urađeno:** utvrđeno zašto 17 pravih parova nema `contact_phone` i
  vraćen broj za `milenija-milan` iz Web3Forms mejla od 26.04.
  Upisano: `+381656563623,+381656287417`.
- **Commit / PR:** — (izmena podataka, ne koda)
- **Na šta utiče dalje:** par sada ulazi u SMS tokove. Provereno suvim prolazom:
  `findSeatingSmsCandidates()` ga vraća („za 13 dana, 138 ljudi,
  +381656563623"), pa ga sledeći dnevni prolaz šalje. Isti postupak čeka
  preostala 4 prioritetna para.
- **Posledice:** samo podatak; nijedna izmena koda. Drugi broj iz mejla je bio
  `656287417` **bez pozivnog** — normalizovan u E.164, jer `primaryPhone()`
  prihvata isključivo brojeve koji počinju sa `+` i u zatečenom obliku bi bio
  tiho nevidljiv.
- **Šta je rešeno:** par sa **138 gostiju i 13 dana do venčanja**, bez
  kupljenog rasporeda, koji nije mogao da dobije nijedno SMS obaveštenje.
- **Šta je odblokirano:** SMS ponuda alata za rasporede radi na stvarnom paru.
- **Status:** — → planned
- **Blokade / sledeći korak:** vlasnik pretražuje inboks za preostale.

### Kako je uzrok pronađen — i dve moje pogrešne tvrdnje usput

Prvo sam zaključio da forma **nije tražila** broj pre 28.04. **Netačno** —
`QuestionnaireForm.tsx` je imao polje „Vaš kontakt telefon" i pre toga.

Zatim sam tvrdio da je Web3Forms mejl išao **samo za premium** granu. Takođe
netačno; vlasnik je priložio mejl `Nova Pozivnica - Milenija & Milan` od 26.04.
sa brojem u telu.

Tačno je jedino ovo: **stara `/api/pozivnica/create` je primala `contact_phone`
u telu zahteva i nije ga upisivala u zapis** — ruta je čitala polje po polje
(`body.theme`, `body.tagline`, `body.locations`…) i telefon nije bio na spisku.
Broj je stizao na dva mesta: u inboks (preživeo) i na server (odbačen).

Vlasnikov instinkt „ne valjda da to nismo čuvali" bio je tačan sve vreme; moje
dve hipoteze nisu. Pouka za sledeći put: kad podatak nedostaje u bazi a korisnik
tvrdi da je unet, tražiti **gde je otišao**, a ne dokazivati da nije ni tražen.

### Merenje

- **12/12 najnovijih** parova ima telefon, **4/26 starijih** — granica se
  poklapa sa `7736fec` (28.04.2026, Infobip 2FA), koji je polje uveo u zapis.
- Bez broja: **21 zapis**, od toga **4 demo** (`example: true`) i **17 pravih**;
  od tih 17 samo **4** imaju venčanje koje tek predstoji.

## 2026-08-16 — Backfill iscrpljen; quick-register je vec pokriven

- **Sta je uradjeno:** provereno stanje sva cetiri "prioritetna" para i
  revidiran obim. Nista nije menjano u kodu.
- **Commit / PR:** —
- **Na sta utice dalje:** task je prakticno zatvoren; ostaje samo jedan draft
  bez broja, bez hitnosti.
- **Blokade / sledeci korak:** nema. Zatvoriti kad vlasnik potvrdi.

### Nalaz: prioritetna lista je bila pogresno postavljena

Filtrirao sam po "nema telefon", ne po "cemu bi mu telefon zapravo sluzio".
Stvarno stanje:

| Par | Stanje | Treba li broj |
|---|---|---|
| `tamara-aleksandar` | raspored VEC placen | ne — ponuda je bespredmetna |
| `anastasija-jovan` | raspored + audio placeni | ne |
| `jovana-aleksandar` | nista placeno | mejl nije pronadjen u inboksu |
| `aleksandra-miljan` | draft, nista placeno | ima samo Instagram `@aleksandra.vsc` |

Nijedan od njih nema galeriju, pa ne propustaju ni d4/d5 upozorenja. Backfill
je time bez stvarnog dobitka — ostaje kao urednost, ne kao potreba.

### Quick-register vec trazi i VERIFIKUJE telefon

Vlasnik je predlozio da se to isplanira kao posao. Provereno — postoji:

- `QuickStartForm.tsx:99,103` — forma odbija prazan broj i prazan trust token
- `planiranje-vencanja/actions.ts:59` — server odbija prazan broj
- `:64` — format srpskog mobilnog (`^0?6\d{7,8}$`)
- `:78` — **`ensurePhoneVerified(trustToken, phoneE164)`**, tj. Infobip
  potvrda vezana za bas taj broj; greska vraca "Verifikujte broj telefona pre
  kreiranja naloga."
- `:40` — reCAPTCHA `quickstart`

Provera je serverska, ne samo u pregledacu, pa se ne moze zaobici. Zapisi bez
broja poticu iskljucivo od pre uvodjenja te verifikacije (`aleksandra-miljan`,
26.04.). Nov posao nije potreban.
