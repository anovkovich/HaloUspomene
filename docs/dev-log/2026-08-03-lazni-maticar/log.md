# Log — Lažni matičar (nova usluga + landing)

## 2026-08-03 — Istraživanje, stranica, blog post

- **Šta je urađeno:**
  - SEO istraživanje tržišta (novi partner: laznimaticarbeograd.com). Nalazi:
    ceo prostor ima **dve** srpske komercijalne stranice; **niko ne objavljuje
    cene**; **niko nema FAQ ni schema markup**; hrvatski sajtovi rangiraju u
    srpskom SERP-u jer Google nema domaći sadržaj; ponuda pretežno živi na
    Instagramu i TikToku. Tražnja je dokazana medijskim talasom 2023–2026.
  - Nova stranica `/lazni-maticar` (~1.900 reči): definicija u prva dva pasusa
    (snippet bait), tok ceremonije u 4 koraka, emotivna vs šaljiva varijanta,
    5 scenarija upotrebe, cena, **eksplicitna pravna sekcija**, gradovi,
    14 FAQ pitanja, forma. Schema: `Service` + `Offer`, `FAQPage`,
    `BreadcrumbList`. Plus OG slika sa fotografijom rekvizita.
  - Blog post `lazni-maticar-kako-izgleda` (~2.250 reči, komičan ton, kategorija
    Saveti), sa proverenim izvorima i tačnim pravnim statusom.
  - Nav: peta stavka u padajućoj listi IZNAJMLJIVANJE. Ime liste je zadržano po
    odluci korisnika, iako ovo nije najam nego usluga.
  - Footer, sitemap, `llms.txt`, cache header, ukrštanje sa blogom.
  - **Refaktor:** `src/lib/oldtajmeri-partneri.ts` → `src/lib/partneri.ts` —
    registar sada pokriva sve posredovane usluge, sa `products` po partneru i
    jednim `resolvePartnerRouting(product, selection)`. `/api/contact` više ne
    zna za konkretne proizvode.
  - **Refaktor:** `VehicleRentalLeadForm` → `ServiceLeadForm` — polja su sada
    generička (`primary`/`secondary`, sa labelom, ikonicom i ključem za mejl
    kroz props), pa ista forma opslužuje i uslugu koja nije najam vozila.
    Na ovoj stranici polja su "Ton ceremonije" i "Povod".
- **Odluke korisnika:** white-label (partner se ne imenuje i ne linkuje);
  lažni matičar ostaje u listi IZNAJMLJIVANJE; cena orijentaciono "od 100 €"
  dok ne stigne pun cenovnik.
- **Posledice:** Cena i paketi su izdvojeni u `src/data/lazni-maticar.ts` sa
  `pricingApproximate` prekidačem — kad stigne pun cenovnik, popuni se
  `packages`, prekidač ide na false, i formulacije o orijentacionoj ceni
  nestaju same. Stranica tada prikazuje tabelu paketa.
- **Verifikacija:** `tsc` + `eslint` čisti; `next build` prolazi (388 stranica,
  `/lazni-maticar` i OG statički prerenderovani); sve rute 200; title, H1 i
  schema provereni u HTML-u; **0 pojavljivanja partnera** u HTML-u stranice i u
  `.next/static` bundle-ovima.
- **Status:** code-complete
- **Blokade / sledeći korak:**
  1. **Telefon i ime osobe kod partnera** — u `src/lib/partneri.ts` za sada
     stoji samo Instagram handle, pa mejl sa upitom nosi samo taj kanal.
  2. Pun cenovnik (v. gore) — trenutna cifra je orijentaciona.
  3. Galerija i video sa nastupa — partner ih ima; video bi doneo `VideoObject`
     schema i verovatno jedini video rich snippet u ovom SERP-u.
  4. Deploy, pa Search Console: `/lazni-maticar/` i
     `/blog/lazni-maticar-kako-izgleda/` na indeksiranje.

## 2026-08-03 — Doterivanje posle pregleda

- **Šta je urađeno:**
  - Zamenjena hero fotografija (novi kadar, 1200×496, providna pozadina); OG
    PNG regenerisan iz iste slike. Obrisan `.next/cache/images` pre builda.
  - Senka ispod hero slike preko `drop-shadow` filtera, ne `box-shadow` —
    fotografija je bez pozadine, pa bi `box-shadow` pratio pravougaonik i visio
    u praznom prostoru oko objekta.
  - **Izbačena tvrdnja** da zvanični čin i lepa ceremonija "skoro nikada ne mogu
    na istom mestu" — bila je prejaka i nije tačna. Novi ugao: razlika nije u
    mestu nego u osećaju; mladenci su opušteniji jer nema obrasca ni pritiska, a
    za glumca znaju samo oni i kumovi, pa je reakcija gostiju iskrena.
  - Pravni status objašnjen na dva mesta i preciznije: ceremonija nema nijedan
    zakonski element i namenjena je parovima koji su brak **već sklopili** (u
    opštini ili inostranstvu), a piše se po želji mladenaca. Isto uneto i u
    skriveni SEO pasus.
  - Scenariji: izbačen "Svadba je uveče ili vikendom"; "Čist program i
    iznenađenje" zamenjen sa "Građansko venčanje ste obavili pre svadbe"
    (najčešći domaći slučaj). Sekcija sada ima 4 kartice u rasporedu 2×2.
  - Uvodni pasusi obostrano poravnati (`text-justify` + `hyphens-auto`, radi jer
    je `<html lang="sr">`).
- **Verifikacija:** `tsc` + `eslint` čisti, build prolazi, provereno u HTML-u da
  su stare formulacije nestale a nove prisutne.
- **Status:** code-complete

## 2026-08-05 — CTA raspored (konsultovan Fable 5) + tracking

- **Problem:** stranica je imala JEDAN CTA (hero) i formu na samom dnu, iza 16
  FAQ pitanja. Ko se predomisli u sredini stranice nema kuda.
- **Odluka (Fable 5):** ne pomerati formu i ne menjati redosled sekcija — padajuci
  izbor tona u formi pretpostavlja da je covek procitao stranicu, a pravna sekcija
  mora da se procita pre upita. Umesto toga tri nova izlaza:
  - `cena` — dugme UNUTAR crne kartice, odmah ispod recenice „Javite datum i
    lokaciju i dobijate tacnu ponudu". Ta recenica je poziv na akciju bez akcije;
    ispod dve krem kartice bi izgubila vezu sa cifrom.
  - `scenariji` — posle mrezice scenarija, gde se posetilac tek prepoznao.
  - `gradovi` — posle mrezice gradova, poslednji izlaz pre FAQ zida.
- **Tracking:** sekundarno hero dugme (`#kako-izgleda`) nije imalo `data-track`;
  dodato. `/lazni-maticar` sada ima 5 pracenih CTA-ova.
- **Usput:** `/telefon-uspomena` nije imala NIJEDAN `data-track` — 3 CTA-a
  (hero rezervacija, hero paketi, dugme u kartici paketa) sada su pracena.
- **Verifikacija:** `tsc` cist, `next build` prolazi, u serverskom HTML-u
  `/lazni-maticar` = 5 i `/telefon-uspomena` = 3 `data-track="cta_click"`;
  kartica sa cenom snimljena na 1440 i 420 px.
- **Status:** code-complete

## 2026-08-10 — Pravna revizija po primedbama partnera + cena u dinarima

- **Šta je urađeno:**
  - Cena spuštena sa 150 € na **15.000 din** i prebačena u dinare
    (`src/data/lazni-maticar.ts`: `priceFrom`, novo `priceCurrency`). Prikaz ide
    kroz `formatPrice()` kao i sve ostale cene na sajtu. Formulacija promenjena
    iz „fiksno" u „orijentaciono za Beograd, ostalo na upit" — vlasnik je
    potvrdio da je to orijentaciona suma i da se sve van Beograda dogovara.
  - Prošli smo kroz partnerovu prepisku (analizu radio Fable 5). Njegovo pravilo:
    nigde „matičar" bez „simbolični", državni simboli uvek označeni kao bez
    pravne vrednosti, i ne pozicionirati se kao zamena za zvanični čin.
    Primenjeno na **opisne rečenice**, ne na naziv usluge.
  - „glumac" → „profesionalni voditelj" u `title`, OG, Twitter, JSON-LD i hero;
    ostavljen jednom u FAQ jer naglašava da je reč o nastupu.
  - Lenta i knjiga svuda označene kao simbolične i bez pravne vrednosti; korak
    „Ulazak i **zvanični** deo" → „svečani deo"; „Matičar staje pred goste" →
    „Voditelj ceremonije".
  - Izbačena rečenica „gosti veruju da gledaju zvaničnu ceremoniju". Zamenjena
    formulacijom koju je vlasnik tražio, a Fable presekao: „Mladenci i kumovi
    znaju da je ceremonija simbolična; gosti ne moraju da znaju — i u tome je
    čar. Ono što gosti vide je svečan čin, a ono što osete je stvarno."
  - Obrisano poređenje sa cenom izlaska pravog matičara (18.212 din) sa **oba**
    mesta na stranici (tekst + FAQ koji ide u FAQPage schemu) i iz blog teksta.
  - Blog `lazni-maticar-kako-izgleda`: uklonjena protivrečnost sa landingom oko
    knjige venčanih, tri rečenice o tome da gosti misle da gledaju pravo
    venčanje, i naslov koji je tvrdio da vas glumac venčava.
  - Interni cenovnik partnera sada ide u mejl uz upit (`interno_cenovnik`),
    istim server-only kanalom kao kontakt partnera (`internalPriceNote()` u
    `partneri.ts` → `/api/contact` → `ServiceLeadForm`).
  - Registar partnera: dodat **Dimitrije Šajković** (066 919 9332,
    `@lazni_maticar_beograd`, Beograd i bliža okolina). Prvom saradniku je bio
    upisan pogrešan Instagram — nalozi se razlikuju samo po tačkama i donjim
    crtama; ispravljen na `@lazni.maticar.beograd`. Dodato polje `coverage`.
  - **Partner potvrdio da lenta NEMA grb Republike Srbije.**
- **Commit / PR:** `ee02474`, `c40421c` (oba na `deploy`).
- **Na šta utiče dalje:** `llms.txt` ažuriran (cena i „voditelj"); AI modeli ga
  keširaju nedeljama pa se stara cena može pojavljivati još neko vreme. Ako se
  ikad doda treći saradnik, `coverage` polje treba popuniti jer se po njemu u
  mejlu vidi koga zvati prvog.
- **Posledice:** cena je sada u dinarima i u schema.org Offer-u (`priceCurrency:
  "RSD"`, `price: 15000`) — stari EUR iznos više ne postoji nigde. Interni
  cenovnik i kontakti partnera **prolaze kroz browser klijenta** (server → browser
  → Web3Forms), jer Cloudflare blokira poziv ka Web3Forms sa servera; vidljivi su
  u DevTools-u onome ko prođe reCAPTCHA i SMS verifikaciju. Vlasnik je to prihvatio
  za sada; alternativa je slanje mejla sa servera preko Resend/SMTP, što menja sve
  forme. Vraćanje: `git revert ee02474 c40421c`.
- **Šta je rešeno:** partnerove primedbe u celosti; protivrečnost između bloga i
  landinga oko knjige venčanih; upiti za lažnog matičara više ne ostaju bez
  telefona (imamo Šajkovića).
- **Šta je odblokirano:** pošto lenta nema grb, sme se pisati „**bez državnih
  obeležja**" u opisu rekvizita — do sada nismo smeli jer je upotreba grba
  posebno regulisana, a to je po analizi bila **jedina tačka sa realnom pravnom
  izloženošću**, i to ona koju partner sam nije pomenuo. Formulacija još nije
  ubačena u tekst; trenutno stoji samo „simbolična, bez pravne vrednosti".
- **Status:** code-complete (nepromenjen)
- **Blokade / sledeći korak:** (1) da li su lenta i knjiga **fizički označene**
  kao neslužbene — čeka se fotografija; dok ne stigne, ne pišemo da jesu, jer bi
  netačna tvrdnja na našem sajtu bila gora od sadašnjeg stanja. (2) Telefon
  prvog saradnika (ime možda Milena — nepotvrđeno, zato nije upisano).
  (3) Odluka da li ubaciti „bez državnih obeležja" u tekst sada kad je grb
  raščišćen.
