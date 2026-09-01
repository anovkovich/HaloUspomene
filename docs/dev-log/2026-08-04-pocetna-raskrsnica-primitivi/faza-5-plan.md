# Preostali SEO/sadržajni posao — revidirano 2026-08-04 posle deploy-a

> **Revizija.** Prva verzija ovog plana pisana je pre deploy-a i pretpostavljala
> je da danas ide samo nova početna (Faze 1–3). Otišlo je mnogo više — osam
> commit-ova, `c4e5352..9c90eaf` — pa je pola plana već izvršeno, a raspored
> više nije tačan. Ovo je revidirana verzija.

Merenja su sa produkcije 2026-08-04, pre deploy-a. Sirovi podaci:
`baseline.json`, nalazi: `seo-nalazi.md`, tok rada: `log.md` (deset unosa).

---

## Šta je od prvobitnog plana IZVRŠENO

| Stavka | Ishod |
|---|---|
| `/napravi-punoletstvo/` sadržaj | 200 → **777 reči**, H2 2→7, FAQ 0→7 sa schemom |
| `/napravi-deciju-pozivnicu/` sadržaj | 165 → **801 reč**, ista struktura |
| `/cene/` — promovisati `sr-only` u vidljivo | Urađeno, i dublje: stranica se **uopšte nije server-renderovala**. 339 → **1.047 vidljivih reči**, H1 0 → 1 |
| Blog klaster, „5 brzih pobeda" | **8 od 14 tekstova**, uključujući #6 GLAVNI STUB (2.405 reči). Blog 26 → **41 post** |
| `/planiranje-vencanja` sadržaj | 779 → **1.226 reči**, FAQ 8 → 10 |

Obe rođendanske stranice su **ispod prvobitnog cilja od ~1.100 reči** (777 i
801). Namerno se ne dopunjuju sada — v. septembar, tačka 4.

---

## Zašto se 10.08. NE donose odluke

Šest dana pokazuje **samo da li je nešto puklo**. Pozicije se sležu 2–4 nedelje,
i to je bio izričit rizik R2 originalnog plana: *pozicija i CTR mogu pasti 2–4
nedelje dok se preračunava — ne reagovati panično.* Pogotovo sada, kada je
početna namerno prestala da otima upite proizvodnim stranicama: deo saobraćaja
se **seli**, i to prvih nedelja izgleda kao pad.

Zato je posao podeljen na tri grupe.

---

## ODMAH — ne čeka podatke

Nijedno merenje ne može da opovrgne ove poteze.

1. **`/napravi-pozivnicu` — 320 reči, 456 prikaza, pozicija 7,6.**
   Isti slučaj kao dve rođendanske forme, samo što je ovo forma za **venčanje**.
   Rangira za „online pozivnica" (poz 8), „pozivnice za vencanje online"
   (poz 7,4) — svuda **nula klikova**, jer je na dnu prve strane bez sadržaja.
   Primeniti isti obrazac: formular ostaje u prvom ekranu, sadržaj ispod, FAQ
   sa `FAQPage` schemom. *(Ovo je nedostajalo i u prvoj verziji plana.)*
2. **Odeljak sa cenom na `/pozivnice`.** Stranica drži „cena digitalne
   pozivnice" na poz 10,6 **bez ijedne cene u vidljivom tekstu**. Jedini potez
   na toj stranici koji ne zamućuje R2 eksperiment.
3. **`/vendori/` (445 reči, 8 internih linkova)** i
   **`/pozivnica-za-prvi-rodjendan/` (530 reči).** Nijedna nije dirana danas,
   obe su ispod svakog praga, i ne učestvuju ni u jednom merenju koje čekamo.
4. **Preostalih 6 blog tekstova** iz plana od 14 (#4, #5, #10, #12, #13, #14),
   tempom 2–3 nedeljno. Obim je dokazana poluga — konkurent sa 58 tekstova ne
   pobeđuje kvalitetom pojedinačnog teksta nego pokrivenošću tema.
5. **GSC: ponovo poslati sitemap + „Request indexing"** za početnu, `/cene/`,
   stub i obe `napravi-*`. Danas je promenjeno ili dodato ~20 URL-ova; ovo
   ubrzava sve što merimo, a ne košta ništa.
6. **`sr-only` čišćenje — samo gde je čist duplikat vidljivog teksta.**
   Jedna stranica po deployu.

### `sr-only` — stanje i odluka po stranici

| Stranica | Reči | Odluka |
|---|---|---|
| `/telefon-uspomena` | ~162 | proveriti duplikat, verovatno obrisati |
| `/lazni-maticar` | ~121 | obrisati — stranica ima 1.926 vidljivih reči |
| `/pozivnice` | ~119 | obrisati |
| `/qr-galerija-slika-sa-vencanja` | ~113 | obrisati |
| `/qr-pano-dobrodoslice` | ~99 | obrisati |
| `/izrada-pozivnica-online` | ~67 | obrisati |
| `/pozivnica-za-prvi-rodjendan` | ~55 | obrisati uz dopunu sadržaja (tačka 3) |
| `/iznajmljivanje-opreme-za-vencanje` | ~118 | promovisati spisak opreme ako je jedinstven |
| **`/iznajmljivanje-oldtajmera-za-vencanje`** | ~85 | **NE DIRATI** |
| **`/iznajmljivanje-automobila-za-vencanje`** | ~80 | **NE DIRATI** |
| **`/planiranje-vencanja`** | ~73 | **NE sada** |

**Zašto se oldtajmeri i automobili ne diraju:** taj `sr-only` nije zaostavština
nego arhitektura — koristi `{modelNames.join(", ")}`, dakle **generisan je iz
`oldtimerFleet`**, tačno kako `CLAUDE.md` propisuje da sve što je vezano za
modele mora da se izvodi iz podataka. Ručno brisanje bi pokvarilo pravilo da
dodavanje vozila zahteva izmenu samo dva data fajla.

**Zašto `/planiranje-vencanja` ne sada:** njegov `sr-only` nosi **jedine linkove**
ka `/lokacije` i `/iznajmljivanje-automobila-za-vencanje`, a sama stranica je
pod merenjem (poz 18,4 za „planer za vencanje"). Prvo preseliti linkove u
vidljivo, i to tek u septembru da se ne zamuti merenje.

---

## 10.08. — SAMO provera regresije

Ništa se ne piše i ništa se ne vraća, osim ako donja lista kaže „puklo".

```
node scripts/analytics-baseline.mjs --days 30 --md docs/dev-log/2026-08-04-pocetna-raskrsnica-primitivi/gsc-posle.md
```

### Signali da je NEŠTO PUKLO — reaguje se

1. **Brend upiti** (`halo uspomene`, `halouspomene`) više nisu poz ~1 za
   početnu. Brend ne zavisi od sadržaja — pad znači tehnički problem.
2. **Ukupni prikazi padnu preko 40–50%** u odnosu na nedelju pre deploy-a. To
   nije preračunavanje nego deindeksacija.
3. **GSC URL inspection** za `/`, `/cene/`, `/pozivnice/`, obe `napravi-*` i
   stub: bilo koje „nije indeksirano — noindex / canonical na drugu stranicu /
   soft 404". Posebno proveriti da `/cene/` u renderovanom HTML-u **sada ima
   cene i pakete** (to je bila cela poenta popravke) i da nijedna stranica nije
   nasledila fantomski canonical na `/`.
4. **Coverage**: nagli skok „Excluded" ili 404 na URL-ovima koji su juče bili
   indeksirani. **Izuzetak: `/moje-vencanje` NAMERNO izlazi iz indeksa** — to
   je uspeh, ne kvar.
5. **GA4 realtime**: stižu li `page_view`, `cta_click`, `section_view`,
   `form_submit`. Ako ne stižu, deploy analitike je pukao.
6. **Sentry**: nov tip greške na `/`, `/cene` ili formama posle deploy-a.
7. **Ručno na telefonu**: `/#paketi` sa `/cene` i gradskih stranica stvarno
   skroluje na `PriceStrip`; sve tri forme daju validan rok za potvrde.

### Signali koji NISU „puklo" — ne dirati

- Pad pozicije bilo kog **ne-brend** upita, uključujući „pozivnice" sa 10,2.
  To je R2, dokumentovan unapred.
- `/pozivnice` i dalje na ~36 za upit „pozivnice" — stub je star šest dana,
  signal se nije ni preneo.
- Novi blog postovi bez prikaza — normalno za URL star nedelju dana.
- Fluktuacije CTR-a — šest dana je premalo uzorka, a ~1.700 prikaza šuma
  (engleski upiti, „halo") i dalje obara prosek.
- Prikazi se presipaju sa početne na proizvodne stranice — **to je željeni
  ishod refaktora**, ne gubitak.

---

## POČETAK SEPTEMBRA (~01–07.09.) — prave odluke

Četiri nedelje podataka. Porediti u **istim prozorima** (30 dana naspram istog
raspona iz `baseline.json`), ne naspram 180 dana.

1. **Odluka R2/R7.** Da li „pozivnice", „planer za vencanje", brend i
   retro-telefon upiti stoje na polazištu ili iznad?
2. **Brisanje starih landing komponenti** (`Concept`, `PainPointSolution`,
   `HowItWorks`, `CTABar`, `Packages`, `Section*` — potvrđeno 0 uvoza).
   Uslov nije „ništa nije puklo 10.08." nego **„odustali smo od povlačenja"**.
   Povlačenje ima smisla i kod pada pozicija u septembru — to je jedini
   scenario u kom bi se stara početna vraćala. Zato: brisati **istog dana kada
   padne odluka pod tačkom 1**, ne pre.
3. **`/pozivnice`**: ako je i dalje ~36 za glavni upit → razdvajanje po upitima
   (stranica pokušava da rangira za pet različitih). Ako se penje → ne dirati.
4. **Dopuna `napravi-*` stranica** do ~1.100 reči — **samo ako pozicije nisu
   krenule.** Ako `pozivnice za 18 rodjendan` sa 8,7 uđe u top 5, dopuna je
   nepotreban rizik.
5. **`/planiranje-vencanja` `sr-only`** — preseliti linkove ka `/lokacije` i
   oldtajmerima u vidljivo, pa obrisati blok.
6. **FAQ početne, 8 naspram 6 pitanja** — odluka 6 iz originalnog plana, koja
   je izričito zakazana za „posle 4 nedelje GSC podataka".
7. **Duge stranice** (`/oldtajmeri` 2.255 reči, `/lazni-maticar` 1.926):
   sidra i akordeoni da se smanji *opažena* dužina, tekst ostaje. Najmanji SEO
   ulog — tek posle svega gore.

---

## Merenje „posle" — jedno ograničenje koje treba znati

**Bihevioralno „pre" ne postoji.** GA4 je bio mrtav od 2026-03-19 do danas, a
custom dimenzije (`section_view`, `scroll_depth`, `cta_click` po `cta_location`)
registrovane su tek 2026-08-04 i pune se **samo unapred**.

Posledica: svako poređenje pre/posle refaktora je **isključivo GSC**. GA4 podaci
postaju **baseline nove početne** i biće upotrebljivi od septembra, za pitanja
tipa „koja kartica u mreži proizvoda se ne klikće".
