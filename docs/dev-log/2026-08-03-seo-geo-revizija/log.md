# Log — SEO / GEO revizija sajta

## 2026-08-03 — Dijagnostika i prva runda popravki

- **Šta je urađeno:** Dve nezavisne analize (Google vidljivost + AI/LLM vidljivost)
  plus lokalna provera koda. Nalazi i popravke:
  - **AI crawler-i NISU blokirani** — `robots.txt` daje `Allow: /` svim AI
    grupama. Dopunjeno aktuelnim imenima: `Claude-User`, `Claude-SearchBot`,
    `DuckAssistBot`, `MistralAI-User` (zastareli `anthropic-ai` i `Claude-Web`
    zadržani zbog starijih klijenata).
  - **Početna dobila FAQ sekciju** (`src/components/landing/FAQ.tsx`, 8 pitanja)
    sa `id="faq"` — footer je linkovao `/#faq`, a taj anchor nije postojao.
    Uz nju i `FAQPage` schema, izvedena iz istih pitanja; početna je bila jedina
    glavna stranica bez nje.
  - **Uklonjene izmišljene recenzije.** Tri utiska su stajala u `sr-only` bloku
    (vidljiva samo crawler-ima) i emitovala se kao `Review` + `AggregateRating`.
    Kombinacija izmišljenog sadržaja, strukturiranih podataka i teksta skrivenog
    od korisnika je prekršaj smernica. Sekcija sada vodi na Google Business
    Profile (5.0 / 16 pravih recenzija) i **vidljiva je svima**.
  - Google profil dodat u `sameAs` — pomaže razrešavanju entiteta kod Google-a
    i AI sistema. Isti blok, kompaktniji, dodat i na `/lokacije/[city]`, koje su
    bez uklonjenih utisaka ostale tanje.
  - Dugme "Ostavite svoju" **namerno uklonjeno** sa javne stranice — javni poziv
    bi pozvao i konkurenciju da obara ocenu. Link ide ciljano preko `/recenzija`.
  - Novi blog post `tekst-za-pozivnicu-za-vencanje` (2.986 reči, 25 gotovih
    tekstova) — gađa klaster od kog žive svi konkurenti, a sajt nije imao
    nijednu stranicu na tu temu.
  - `CLAUDE.md` ispravljen: tvrdio je da robots blokira AI botove. Dopisano i
    kako zaštita dizajna pozivnica stvarno radi (page-level `noindex` +
    `X-Robots-Tag: noai` + `AiCopyrightNotice`), da se blokiranje ne "vrati".
- **Otvoreno (nije kod):** GBP je neverifikovan — video poslat 2026-08-03,
  odgovor u roku od 5 dana, **proveriti od 07.08.** Naziv profila sadrži
  ključnu reč („& Pozivnice"), što je verovatan uzrok. Nula spoljnih pomena:
  nema listinga na svadbenim portalima, nema medijskog pomena, nema YouTube-a.
  Najtopliji trag je journal.rs (pisali o audio guest book trendu, preporučili
  konkurenta).
- **Otvoreno (kod):** predugački `<title>` na 4-5 stranica (do 90 karaktera) i
  trotačka na kraju naslova početne; `/pozivnice` nema **nijedan** demo link, a
  na `/izrada-pozivnica-online` karusel renderuje samo aktivnu temu pa je 4 od
  10 demo linkova u statičkom HTML-u; gradske stranice i dalje tanke (~450 reči)
  iako postoji `hall_venues` baza sa salama po gradovima.
- **Verifikacija:** `tsc` + `eslint` čisti, `next build` prolazi (389 stranica),
  provereno u renderovanom HTML-u: nema `Review`/`aggregateRating`, `id="faq"` i
  `FAQPage` prisutni, link ka Google profilu na početnoj i gradskim stranicama.
- **Status:** code-complete → deployed

## 2026-08-03 — Nezavisna provera i deploy

- **Šta je urađeno:** pre pusha nezavisno provereno sve što tvrdi prethodni
  unos, na lokalnom produkcionom buildu.
- **Potvrđeno:** `tsc`/`eslint`/`next build` čisti; u renderovanom HTML-u nula
  `"@type":"Review"` i nula `aggregateRating` (na početnoj i na gradskim
  stranicama); `id="faq"` + `FAQPage` prisutni; link ka Google profilu na obe;
  svih 7 AI botova u `robots.txt` sa `Allow: /`; novi post renderuje 3.073 reči
  u 9 sekcija, u sitemap-u je i na `/blog` listi; posle uklanjanja duplog H1
  svaki post i dalje prikazuje naslov i ima **tačno jedan** `<h1>`; svih 11
  pogođenih ruta vraća 200.
- **Nalaz koji ostaje otvoren:** na početnoj je ostao jedan `sr-only` blok —
  skriveni SEO pasus sa opisom platforme. To je druga kategorija od uklonjenih
  recenzija (nema izmišljenog sadržaja ni strukturiranih podataka), ali tekst
  namenjen isključivo crawler-ima i sam po sebi ide uz Google smernice o
  skrivenom sadržaju. Zatečeno, nije deo ove izmene.
- **Nalaz koji ostaje otvoren:** `llms.txt` ne pominje korporativni paket
  (12.000) ni pozivnicu za događaj (6.000). Namerno nije dodato — proizvod se
  prodaje ručno i nema javnu stranicu, a `llms.txt` po pravilu iz `CLAUDE.md`
  nosi samo javne, indeksabilne stranice. Odluka je na vlasniku. Cene
  rođendanskih pozivnica (4.500) su proverene i tačne.
- **Commit / PR:** `c903fc1` (recenzije), `494d11c` (FAQ), `e856bd3` (robots),
  `398e0fa` (blog), `5f062bd` (galerija tema).
- **Posledice:** uklanjanje `Review`/`AggregateRating` znači da rich-snippet
  zvezdice nestaju iz rezultata pretrage — to je namerno i ispravno, jer su
  počivale na izmišljenim utiscima. Prava ocena se sada gradi na Google
  Business Profile-u.
- **Blokade / sledeći korak:** GBP verifikacija (video poslat 2026-08-03,
  proveriti od 07.08.); predugački `<title>` na 4-5 stranica; gradske stranice
  i dalje tanke (~450 reči) iako `hall_venues` baza sada postoji.
