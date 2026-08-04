# SEO stanje i brzi dobici — 2026-08-04

Izvor: GSC, 180 dana (2026-02-06 → 2026-08-01), `scripts/analytics-baseline.mjs`.
Sirovi podaci: `baseline.json`, ispis: `gsc-izvestaj.md`.

## Ukupno stanje

| | Sada | Prethodnih 180 dana |
|---|---|---|
| Klikovi | 1.049 | rast |
| Prikazi | 39.155 | rast |
| CTR | 2,68% | — |
| Prosečna pozicija | 18,4 | — |

CTR od 2,68% je nizak, ali prosečna pozicija 18,4 to objašnjava — najveći deo
prikaza dolazi sa druge i treće strane rezultata, gde niko ne klikće. To znači
da posao nije „popraviti naslove svuda" nego **pomeriti nekoliko konkretnih
stranica sa druge na prvu stranu.**

---

## 1. POPRAVLJENO ODMAH — dupli sufiks u naslovu svih vendor kategorija

Svih 11 stranica `/vendori/*` imalo je naslov oblika
`… | HALO Uspomene | HALO Uspomene` (do 78 znakova, seče se u rezultatima).

Uzrok: root layout ima `title.template = "%s | HALO Uspomene"`, a svaki
`metaTitle` u `src/data/vendori/categories.ts` je već sadržao isti sufiks.

Popravka: sufiks skinut iz podataka (šablon ga dodaje). OG i Twitter naslovi ne
prolaze kroz šablon, pa im se brend dodaje eksplicitno u
`src/app/vendori/[kategorija]/page.tsx`.

Najveći gubitnik: `/vendori/muzika/` — **236 prikaza, 0 klikova**.
Provereno da nijedna druga stranica na sajtu nema isti problem.

---

## 2. NAJVEĆI PROBLEM — blog kanibalizuje proizvodne stranice

Za novčano najvrednije upite **blog post rangira ispred stranice koja prodaje**:

| Upit | Blog | Proizvodna stranica |
|---|---|---|
| `planer za vencanje` | `/blog/moje-vencanje-planer/` — **poz 7,8**, 201 prikaz | `/planiranje-vencanja/` — **poz 18,4**, 80 prikaza |
| `planer vencanja` | `/blog/moje-vencanje-planer/` — **poz 6,8**, 124 prikaza | `/planiranje-vencanja/` — **poz 19,1**, 35 prikaza |
| `raspored sedenja` | `/blog/raspored-sedenja-za-svadbu-vodic/` — **poz 6,5**, 235 prikaza | `/raspored-sedenja/` — poz 8, 35 prikaza |
| `raspored sedenja na svadbi` | blog — **poz 6,2**, 172 prikaza | `/raspored-sedenja/` — poz 15,1, 7 prikaza |
| `pozivnice` | početna — poz 10,2, 117 prikaza | `/pozivnice/` — **poz 36,3**, 13 prikaza |

Posetilac koji traži „planer za venčanje" hoće alat, a dobija članak. Google je
u pravu po relevantnosti teksta — proizvodne stranice imaju manje sadržaja o
samoj temi od blogova koji je objašnjavaju.

**Šta uraditi (redosled po odnosu ulaganja i dobitka):**

1. Iz svakog blog posta staviti **istaknuti link na proizvodnu stranicu visoko u
   tekstu**, sa sidrenim tekstom koji je tačno ciljani upit („planer za
   venčanje", „raspored sedenja"). Blog zadržava poziciju i prosleđuje i
   posetioca i težinu.
2. Na `/planiranje-vencanja/` i `/raspored-sedenja/` **dodati sadržaj koji
   odgovara na isto pitanje** kao blog (šta planer sadrži, kako izgleda
   raspoređivanje) — trenutno su prodajne, a upit je informativan.
3. `/pozivnice/` na poziciji 36,3 za upit `pozivnice` dok početna drži 10,2 —
   ovo bi **refaktor početne trebalo da popravi sam od sebe**: početna je
   izgubila prodajni tekst o pozivnicama, pa prestaje da otima taj upit. Ovo je
   R2 iz plana, izmereno unapred.

---

## 3. DRUGA STRANA REZULTATA — mali pomak, najveći dobitak

Upiti na poziciji 10–20 sa ≥20 prikaza. Pomeranje na poz 5–8 ovde vredi više
nego bilo koji nov tekst:

| Upit | Poz | Prikaza | Stranica |
|---|---|---|---|
| `pozivnice` | 10,2 | 117 | `/` |
| `pozivnice za deciji rodjendan` | 11,3 | 81 | `/napravi-deciju-pozivnicu/` |
| `planer za vencanje` | 18,4 | 80 | `/planiranje-vencanja/` |
| `pozivnica za deciji rodjendan` | 10,4 | 64 | `/napravi-deciju-pozivnicu/` |
| `pozivnica za 18 rođendan` | 12,1 | 53 | `/napravi-punoletstvo/` |
| `spisak gostiju za svadbu` | 11,1 | 43 | `/raspored-sedenja/` |
| `cena digitalne pozivnice` | 10,6 | 38 | `/pozivnice/` |
| `pozivnice za prvi rodjendan` | 16,4 | 32 | `/pozivnica-za-prvi-rodjendan/` |
| `pozivnica za vencanje` | 14,5 | 31 | `/pozivnice/` |
| `elektronska pozivnica` | 10,8 | 25 | `/pozivnice/` |

Obrazac je jasan: **`/pozivnice/` je jedna stranica koja pokušava da rangira za
pet različitih upita i ni za jedan nije prva.** Vredi razmotriti razdvajanje —
`cena digitalne pozivnice` zaslužuje odeljak sa cenom vidljivom u tekstu, ne
samo u tabeli na `/cene`.

---

## 4. STRANICE SA NAJVIŠE PROPUŠTENOG

| Stranica | Prikaza | Klikova | CTR |
|---|---|---|---|
| `/` | 2.498 | 128 | 5,12% |
| `/pozivnice/` | 1.074 | 20 | **1,86%** |
| `/napravi-deciju-pozivnicu/` | 952 | 22 | 2,31% |
| `/napravi-punoletstvo/` | 901 | 14 | **1,55%** |
| `/blog/raspored-sedenja-za-svadbu-vodic/` | 874 | 33 | 3,78% |
| `/vendori/muzika/` | 236 | **0** | **0%** ← popravljeno (tačka 1) |

Naslovi i opisi ovih stranica su provereni na produkciji i **već su dobri**
(60–70 znakova, opisi do 155) — poslednja SEO revizija ih je sredila. Nizak CTR
na `/napravi-punoletstvo/` nije problem naslova nego pozicije: `pozivnice za 18
rodjendan` stoji na **8,7** sa 444 prikaza, a na dnu prve strane CTR prirodno
jeste 1–2%. Rešenje je pozicija, ne prepisivanje naslova.

---

## 5. ŠUM KOJI NE TREBA JURITI

- `wedding planning` — 993 prikaza, poz 9,1, **CTR 0%**. Engleski upit,
  međunarodni saobraćaj koji ne kupuje u Srbiji.
- `halo`, `halo halo`, `halo rs` — 612 prikaza, 0 klikova. Ljudi traže pozdrav
  ili drugi brend.
- `photo booth`, `foto kabina`, `dj booth`, `podni dim nis` — ne prodajemo to.

Zajedno je to preko 1.700 prikaza bez ijednog klika, što samo po sebi obara
prosečan CTR celog sajta. **Ne treba ih računati kao neuspeh.**

---

## 6. TEHNIČKI — provereno, nije problem

- **Canonical**: sve proverene stranice imaju kanonsku adresu SA kosom crtom,
  usklađeno sa `trailingSlash: true`. Ispravno.
- **Duplikati bez kose crte** u GSC-u (`/napravi-deciju-pozivnicu` uz
  `/napravi-deciju-pozivnicu/`, isto za `/vendori/pokloni`, `/raspored-sedenja`,
  `/blog/audio-guest-book-cena`) su **stare adrese iz indeksa**; danas vraćaju
  308 na verziju sa crtom. Same će ispasti, nije stavka za rad.
- Uređaji: saobraćaj je pretežno mobilni — svaka izmena se prvo proverava na
  telefonu.

---

## Redosled rada, po odnosu truda i dobitka

1. ~~Dupli sufiks u vendor naslovima~~ — **urađeno 2026-08-04**
2. Linkovi iz 2 blog posta ka `/planiranje-vencanja/` i `/raspored-sedenja/`
   sa sidrenim tekstom = ciljani upit (pola sata, najveći pojedinačni dobitak)
3. Sadržaj koji odgovara na informativni upit na te dve proizvodne stranice
4. Odeljak o ceni na `/pozivnice/` zbog `cena digitalne pozivnice`
5. Ponovo izmeriti posle 4 nedelje istom komandom

---

# Urađeno 2026-08-04 (isti dan) — kanibalizacija

Merenje koje objašnjava sve, dubina sadržaja naspram pozicije:

| Stranica | Reči | Pozicija |
|---|---|---|
| `/planiranje-vencanja/` | **779** | 18,4 |
| `/blog/moje-vencanje-planer/` | 1.407 | 7,8 |
| `/raspored-sedenja/` | 1.420 | 8,0 |
| `/blog/raspored-sedenja-za-svadbu-vodic/` | 1.557 | 6,5 |

Gde je sadržaj izjednačen (raspored sedenja), razlika u poziciji je mala. Gde je
proizvodna stranica upola kraća (planer), Google bira blog. Nije stvar u tome
što blog „krade" — nego što proizvodna stranica nije odgovarala na pitanje.

## 1. Interni linkovi sa ispravnim sidrom

- `/blog/moje-vencanje-planer/` **nije imao nijedan link ka `/planiranje-vencanja/`**
  osim `CtaBlock`-a na dnu, čiji je sidreni tekst bio „Saznaj više" — Google iz
  toga ne dobija nikakav signal o temi cilja. Dodata dva linka sa sidrom
  „planer za venčanje" (uvod i zaključak), a dugme prebačeno u
  „Otvorite planer za venčanje".
- `/blog/raspored-sedenja-za-svadbu-vodic/` dugme → „Otvorite alat za raspored sedenja".
- `/blog/qr-galerija-.../` dugme → „Otvorite QR galeriju slika".
- Provereni su `CtaBlock`-ovi u svih 33 posta; ostali već imaju smislena sidra.

Stanje pre: `/planiranje-vencanja` je imao 13 internih linkova (4 iz blogova) —
najslabije linkovana novčana stranica posle `/vendori`.

## 2. Sadržaj na `/planiranje-vencanja/` — 779 → 1.226 reči

Dodata vidljiva sekcija **„Šta je planer za venčanje?"** koja odgovara na sam
upit: šta planer jeste, šta sadrži (checklista, budžet, gosti, saradnici), kada
krenuti, i da je besplatan uz brzu registraciju. Sa linkovima ka
`/izrada-pozivnica-online` i nazad ka blog vodiču.

FAQ proširen sa 8 na 10 pitanja (FAQPage schema prati automatski):
- „Da li je planer za venčanje besplatan?" — zamenjuje raniji dvosmisleni
  odgovor „Da li je planer uključen u cenu?", koji je delovao kao da planer
  ide samo uz kupljenu uslugu. **Planer je besplatan uz brzu registraciju**,
  bez ikakve kupovine — to je i SEO i konverzijska stavka.
- „Mogu li da koristim planer ako još nemam datum venčanja?"
- „Po čemu je planer bolji od Excel tabele?"

Usput očišćena dva zatečena `eslint` upozorenja (neiskorišćeni `Calendar` i
`Shield` uvozi).

## 3. Nije dirano, svesno

- `sr-only` blok na dnu `/planiranje-vencanja/` — sada ga vidljiva sekcija
  uglavnom duplira, ali nosi i jedine linkove ka `/lokacije` i
  `/iznajmljivanje-automobila-za-vencanje`. Spada u Fazu 5 plana (tek 4 nedelje
  posle deploy-a, sa GSC podacima).
- `/pozivnice/` (poz 36,3 za „pozivnice", dok početna drži 10,2) — očekuje se
  da se popravi sam od sebe kad nova početna izađe, pošto ona više ne nosi
  prodajni tekst o pozivnicama. Meriti pre nego što se dira.

## Merenje efekta

Ponoviti za 3–4 nedelje:
`node scripts/analytics-baseline.mjs --days 30 --md docs/.../gsc-posle.md`
Ciljevi: `planer za vencanje` sa 18,4 na prvu stranu; `/planiranje-vencanja`
preuzima deo prikaza od blog posta; `/vendori/*` CTR iznad nule.
