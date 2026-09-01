# Stranice po modelu oldtajmera — istorija, blueprint, zanimljivosti

- **ID:** 2026-09-15-oldtajmeri-stranice-po-modelu
- **Status:** planned
- **Created:** 2026-08-04
- **Pokrenuti:** sredina septembra 2026, i to TEK posle merenja (v. „Uslov")
- **Owner:** Aleksa

## Why

Ideja vlasnika: svaki model iz flote dobija svoju stranicu sa istorijom —
blueprint fabrike, godine proizvodnje, ko ga je kupovao, čemu je služio, i
zanimljivosti. Niko na tržištu to ne radi, a mi imamo najširu ponudu jer
posredujemo za više kolekcionara.

Obrazac je dokazan u našoj sopstvenoj analizi konkurencije
(`docs/vodici/pozivnice-i-pr-vodic.pdf`, odeljak A1): **`webpozivnice.rs` ima
samo 3 blog teksta, ali 14 stranica pojedinačnih dizajna** koje hvataju duge
upite tipa „burgundy rose pozivnica". Isto to, primenjeno na vozila.

## Uslov — bez ovoga se ne kreće

Na dan 2026-08-04 stanje je bilo:

- `/iznajmljivanje-oldtajmera-za-vencanje` napravljena **2026-08-03**, dakle
  jedan dan pre merenja — **nijedan upit u GSC-u**, uz 2.255 reči (najduža
  stranica na sajtu)
- na celom sajtu, za 180 dana, **nula upita** sa rečju oldtajmer, retro auto ili
  bilo kojim imenom modela
- uporediva `/iznajmljivanje-automobila-za-vencanje` (starija 5 nedelja) stoji
  na poziciji **16,2** sa 74 prikaza i 6 klikova

**Zato se prvo meri:**

```
node scripts/analytics-baseline.mjs --days 30
node <scratchpad>/gsc-page-queries.mjs "https://halouspomene.rs/iznajmljivanje-oldtajmera-za-vencanje/"
```

| Nalaz | Odluka |
|---|---|
| Roditeljska stranica ušla u prvih 20 i ima upite | **Kreni** — deca imaju od čega da naslede |
| I dalje bez ijednog upita | **Ne kreći.** Problem nije nedostatak dece nego što roditelj nije otkriven. Prvo interni linkovi i vreme |
| Ima upite ali samo generičke (bez imena modela) | Kreni **sa dva modela** kao proba, ne sa svima |

## Non-Goals

- Ne praviti stranicu za vozilo koje nema fotografije
- Ne imenovati partnera ni kolekcionara — v. „Rental Fleets — White-Label" u
  `CLAUDE.md`. Ni istorijat ne sme da oda čije je vozilo
- Ne pisati stranicu koja je samo zanimljivosti: bez namere zakupa to je tanka
  stranica

## Obrazac stranice — svaki model mora da popuni sve

Ruta: `/oldtajmeri/[slug]`, izvedena iz `oldtimerFleet` (nikad ručna lista).

| Odeljak | Sadržaj | Zašto |
|---|---|---|
| H1 | „{Model} ({godina}) za venčanje" | Cilja upit sa imenom modela |
| Hero | Fotografija vozila + grad polaska + cena iz podataka | Namera zakupa odmah, ne posle istorije |
| Kratko o vozilu | 2–3 rečenice: tip karoserije, broj mesta, boja | Ono što mladence stvarno zanima |
| **Istorija modela** | Kada je proizvođen, u kojoj fabrici, koliko primeraka | Srž ideje |
| **Kome je bio namenjen** | Klasa kupaca, tržište, cena tada u odnosu na prosečnu platu | Najzanimljiviji deo — ovo niko ne piše |
| **Tehnički list** | Motor, zapremina, snaga, menjač, dužina, masa — tabela | Format koji Google rado uzima za snippet |
| **Zanimljivosti** | 3–5 činjenica: film, poznati vlasnik, detalj dizajna | Deo zbog kog se tekst deli |
| **Zašto baš on za venčanje** | Broj mesta, prtljag, kabriolet ili ne, kako izgleda na fotografijama | Vraća na nameru |
| Galerija | Fotografije vozila | — |
| **Cena i dostupnost** | Iz `oldtimerFleet`, nikad kao string | Obavezno, inače je stranica tanka |
| Forma za upit | Postojeći `ServiceLeadForm` sa `routingProduct` | Bez ovoga stranica ne prodaje |
| FAQ + `FAQPage` schema | 4–5 pitanja specifičnih za model | Snippet |
| Nazad na flotu | Link ka roditeljskoj stranici i ka drugim modelima | Klaster |

Cilj: **900–1.300 reči po stranici.** Ispod 700 se ne objavljuje.

## Izvori podataka — proveriti pre pisanja

Za svaki model treba naći: godine proizvodnje, fabriku, broj primeraka,
motor i osnovne mere, cenu u tom periodu, i bar tri proverljive zanimljivosti.

Modeli u floti na 2026-08-04 (5 vozila, 4 različita modela — Fiat 1300 se
pojavljuje dvaput):

- Fiat 1300 (kod nas poznat kao „tristać")
- Pontiac Series 6-28 Phaeton
- Chevrolet International
- Citroën Traction Avant 11B

**Ako podaci za neki model nisu pouzdani, taj model NE dobija stranicu.**
Izmišljena istorija je gore od nepostojeće stranice.

## Blueprint

Vlasnik traži i „blueprint fabrike". Provera pre nego što se obeća:
tehnički crteži starih vozila često nisu u javnom vlasništvu. Opcije:
1. Crteži čija su prava istekla (predratni modeli su najverovatniji kandidati)
2. Naša ilustracija po uzoru — silueta vozila iz profila, ne kopija crteža
3. Bez crteža, samo tehnička tabela

Opcija 2 je najsigurnija i uklapa se u brend.

## Rizici

| Rizik | Ublažavanje |
|---|---|
| 4 tanke stranice oko roditelja koji ne rangira | Uslov merenja gore; minimum 900 reči |
| Nema pretrage za imena modela | Zato je ovo dugoročan potez, ne brza pobeda. Ako posle 6 nedelja nijedna model-stranica nema prikaze, ne širiti dalje |
| Autorska prava na crteže | Sopstvena ilustracija |
| Odavanje partnera kroz istorijat | Istorija govori o modelu, nikad o vlasniku primerka |
| Flota se menja pa stranice zastare | Ruta se izvodi iz `oldtimerFleet`; vozilo koje izađe iz flote → stranica se gasi ili prebacuje u „ranije u ponudi" |

## Steps

- [ ] **Merenje i odluka** — pokrenuti komande iz „Uslov" i odlučiti po tabeli
- [ ] **Istraživanje po modelu** — za svaki naći podatke i bar tri proverljive
      zanimljivosti; zabeležiti izvore
- [ ] **Ruta i obrazac** — `/oldtajmeri/[slug]` iz `oldtimerFleet`, sa
      `generateStaticParams`, metapodacima i `FAQPage` schemom
- [ ] **Dva modela kao proba**, ne svi odjednom
- [ ] **Povezivanje** — kartice na roditeljskoj stranici vode na model-stranice,
      svaka model-stranica vraća na flotu i pominje ostale
- [ ] **Merenje posle 6 nedelja** — ako nema prikaza, ne širiti

## Vezano

Odbačeno u korist ovoga (za sada): stranice po gradu. Vlasnik je odlučio da
gradovi ostanu **na postojećoj stranici**, ali su 2026-08-04 podignuti u `h2`
sa tekstom „Oldtajmeri za venčanje iz {grada}" umesto golog naziva grada —
jer „Beograd" sam po sebi ne cilja nijedan upit.

Ako se flota proširi na Pomoravlje (partner iz Paraćina koji pokriva Ćupriju i
Jagodinu), preispitati i gradske stranice — obrazac grad+usluga u srpskoj
pretrazi ima potražnju, dok imena modela na 2026-08-04 nemaju nijedan upit.
