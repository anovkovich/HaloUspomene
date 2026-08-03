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
