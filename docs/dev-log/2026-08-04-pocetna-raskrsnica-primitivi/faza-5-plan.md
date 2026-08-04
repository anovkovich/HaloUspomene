# Faza 5 + tanke stranice — plan izvršenja

**Zakazano za 2026-08-10** (5–6 dana posle deploy-a Faza 1–3, da GSC stigne da
ponovo obiđe sajt i da imamo prve podatke o efektu).

Merenja u ovom dokumentu su sa produkcije 2026-08-04.

---

## Deo 1 — Tanke stranice (NOVO, veći prioritet od originalne Faze 5)

Merenje dubine sadržaja naspram pozicije objašnjava skoro sve slabe rezultate:

| Stranica | Reči | Od toga `sr-only` | Prikaza 180d | Klikova | CTR |
|---|---|---|---|---|---|
| `/napravi-deciju-pozivnicu/` | **165** | 0 | 952 | 22 | 2,31% |
| `/napravi-punoletstvo/` | **200** | 0 | 901 | 14 | 1,55% |
| `/cene/` | 339 | **332** | — | — | — |
| `/vendori/` | 445 | 0 | — | — | — |
| `/pozivnica-za-prvi-rodjendan/` | 530 | 70 | 32 | 0 | 0% |

Za poređenje, stranice koje rangiraju dobro imaju 1.200–2.250 reči.

### 1a. `/napravi-punoletstvo/` — najveći pojedinačni dobitak na sajtu

Stoji na **poz 8,7 za „pozivnice za 18 rodjendan" sa 444 prikaza**, i na 12,1 za
„pozivnica za 18 rođendan" (53 prikaza), 17,1 za „elektronske pozivnice za 18
rodjendan" (20). Ukupno 901 prikaz, 14 klikova.

Sa 200 reči to je forma bez sadržaja. Dodati (cilj ~1.100 reči):
- „Šta sadrži pozivnica za punoletstvo" — potvrde dolaska, odbrojavanje, mapa, PDF
- „Kada slati pozivnice za 18. rođendan"
- „Tekst za pozivnicu za punoletstvo" — 6–8 gotovih primera (format „primeri" je
  dokazano najjači po analizi konkurencije)
- FAQ sa `FAQPage` schemom (stranica je trenutno nema)
- Link ka `/blog/pozivnica-za-punoletstvo-18-rodjendan` i nazad

### 1b. `/napravi-deciju-pozivnicu/` — isti obrazac

Poz 6,8 za „napravi mi pozivnicu za rodjendan" (182 prikaza), 8,7 za „pozivnice
za rodjendan napravi sam" (148), 11,3 za „pozivnice za deciji rodjendan" (81),
10,4 za „pozivnica za deciji rodjendan" (64). Ukupno 952 prikaza, 22 klika.

Isti recept, prilagođen: šta sadrži, kada slati, primeri teksta, teme po
uzrastu, FAQ + schema.

### 1c. `/cene/` — 332 od 339 reči je skriveno

Cenovnik je tabela, pa vidljivog teksta praktično nema. `sr-only` blok nosi ceo
tekst — što je tačno ono što Faza 5 nalaže da se **promoviše u vidljivo**.
Rangira za „cena digitalne pozivnice" (poz 10,6) i „cena pozivnica" upite.

Dodati vidljivo, ispod tabele: šta ulazi u koju cenu, zašto je fiksna, šta se
plaća jednom a šta nikad, i kratak FAQ o plaćanju. Obrisati `sr-only` blok kad
njegov sadržaj postane vidljiv.

### 1d. `/vendori/` — 445 reči, samo 8 internih linkova

Najslabije linkovana stranica. Dodati opis kako biramo saradnike i po čemu se
kategorije razlikuju; povezati iz `/planiranje-vencanja` i iz blogova.

---

## Deo 2 — `sr-only` blokovi (originalna Faza 5)

Ukupno **1.759 reči** skrivenog teksta na 12 stranica:

| Stranica | `sr-only` reči | Šta uraditi |
|---|---|---|
| `/cene/` | 332 | **Promovisati u vidljivo** (v. 1c) — nosi ceo tekst stranice |
| `/telefon-uspomena/` | 195 | Proveriti duplikat; verovatno obrisati |
| `/lazni-maticar/` | 163 | Obrisati — stranica ima 1.926 vidljivih reči |
| `/pozivnice/` | 156 | Obrisati |
| `/iznajmljivanje-opreme-za-vencanje/` | 156 | Promovisati spisak opreme ako je jedinstven |
| `/qr-galerija-slika-sa-vencanja/` | 143 | Obrisati |
| `/iznajmljivanje-oldtajmera-za-vencanje/` | 128 | **Ne dirati bez provere** — može nositi spisak modela |
| `/qr-pano-dobrodoslice/` | 125 | Obrisati |
| `/iznajmljivanje-automobila-za-vencanje/` | 109 | Proveriti |
| `/planiranje-vencanja/` | 93 | Sad ga duplira nova vidljiva sekcija, ALI nosi jedine linkove ka `/lokacije` i oldtajmerima — prvo preseliti linkove |
| `/izrada-pozivnica-online/` | 89 | Obrisati |
| `/pozivnica-za-prvi-rodjendan/` | 70 | Obrisati |

**Pravilo:** obrisati gde je duplikat vidljivog teksta; promovisati u vidljivu
sekciju gde nosi jedinstven podatak (imena sala, kapaciteti, spisak modela
vozila) ili jedini link ka nekoj stranici. **Jedna stranica po deployu.**

---

## Deo 3 — Duge stranice: skratiti opaženu dužinu, ne tekst

- `/iznajmljivanje-oldtajmera-za-vencanje/` — **2.255 reči**
- `/lazni-maticar/` — **1.926 reči**

Medijana ostalih je ~1.100. Tekst OSTAJE (rangira), smanjuje se skrol:
- sadržaj sa sidrima na vrhu (mehanizam već postoji na blogu)
- akordeoni za sekundarne sekcije
- flota u karusel umesto vertikalne liste

---

## Deo 4 — Sadržajni klaster (iz postojeće analize)

`docs/vodici/pozivnice-i-pr-vodic.pdf` već nosi plan od **14 tekstova** sa
redosledom: 5 brzih pobeda → glavni stub → dugoročni saobraćaj. **Ne praviti nov
plan — izvršavati taj.** Prvih pet:

1. Spisak gostiju za svadbu (već rangiramo poz 11,1 sa 43 prikaza — potvrđeno tražen)
2. Save the date
3. Satnica venčanja
4. 7 grešaka sa pozivnicama
5. Kako izabrati temu i dizajn pozivnice

Ključni nalaz te analize koji vredi ponoviti: konkurent `pozivamote.rs` ne
pobeđuje tekstovima o pozivnicama nego **širokim svadbenim temama** (koliko se
daje na svadbi, obaveze kuma, satnica), koje grade autoritet domena — pa tek
onda njihova početna rangira za komercijalne upite.

### O datumima objave — odluka vlasnika 2026-08-04

Prvih 7 tekstova dobija **datume u prošlosti** (april–jul 2026), raspoređene
kroz vreme umesto svih na isti dan. **To je odluka vlasnika, doneta uz izričitu
napomenu o sledećem:**

- Backdate **ne donosi prednost u rangiranju** — Google beleži kada je URL prvi
  put otkrio, ne šta piše u tekstu. Dobitak dolazi od obima i kvaliteta.
- `datePublished` u strukturiranim podacima postaje netačan, i čitalac vidi
  datum koji nije stvaran.

Konkurent koji postoji mesec dana a ima 55 tekstova nije dobio prednost
datumima nego obimom — pa dalje objavljivati normalno, po 2–3 teksta nedeljno.

---

## Redosled izvršenja 2026-08-10

1. `/napravi-punoletstvo/` sadržaj (najveći dobitak)
2. `/napravi-deciju-pozivnicu/` sadržaj
3. `/cene/` — promovisati `sr-only` u vidljivo
4. `sr-only` čišćenje, jedna stranica po deployu
5. Duge stranice — sidra i akordeoni
6. Blog klaster — 5 brzih pobeda

Pre početka **obavezno ponovo izmeriti**, jer se stanje menja posle deploy-a:

```
node scripts/analytics-baseline.mjs --days 30 --md docs/dev-log/2026-08-04-pocetna-raskrsnica-primitivi/gsc-posle.md
```

Poređenje sa `gsc-izvestaj.md` (180 dana, pre) i `baseline.json`.
