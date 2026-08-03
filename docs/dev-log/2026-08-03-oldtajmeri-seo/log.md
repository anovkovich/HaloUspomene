# Log — Oldtajmer landing + razdvajanje od luksuzne ponude

## 2026-08-03 — Istraživanje, implementacija i verifikacija

- **Šta je urađeno:**
  - SEO istraživanje tržišta (13 pretraga + 8 analiza konkurentskih stranica) —
    nalazi i odluke u `plan.md`.
  - Nova landing stranica `/iznajmljivanje-oldtajmera-za-vencanje` (~2.500 reči):
    hero, 6 razloga za retro, flota, cenovnik + šta ulazi u cenu, tok svadbenog
    dana, kolona/barjaktar, foto-sesija, dekoracija, 4 gradske sekcije,
    uporedna tabela oldtajmer vs moderna limuzina, 14 FAQ pitanja, forma,
    skriveni SEO pasus. Schema: `Service` + `AggregateOffer` + `OfferCatalog`,
    `FAQPage` (14), `BreadcrumbList`. Plus `opengraph-image.tsx`.
  - `src/data/oldtajmeri.ts` — flota kao data (2× Fiat 1300 Beograd 250 €;
    Pontiac Phaeton 1928, Chevrolet International 1929, Citroën Traction Avant
    11B — Pančevo 350–400 €). Slike su opcione: bez `image` kartica prikazuje
    placeholder, pa stranica ide live pre nego što fotografije stignu.
  - Navbar: TELEFON → padajuća lista IZNAJMLJIVANJE sa 4 stavke; linkovi uvek
    u DOM-u (potvrđeno: postoje u statičkom HTML-u bez JS). Mobilni meni dobio
    ugnežđenu grupu i scroll (`max-h-[calc(100vh-5rem)]`).
  - Blog post `oldtajmer-za-vencanje-zasto-retro` (~2.500 reči, kategorija
    Trendovi) sa stranim izvorima uz ograde; CTA usklađen sa stvarnom flotom.
  - Ukrštanje: luksuzna stranica → retro box; `auto-za-vencanje-vodic.mdx` →
    nova sekcija; footer, sitemap, `llms.txt`, cache header u `next.config.ts`.
  - **Refaktor:** `CarRentalLeadForm` (koristila je samo jedna ruta) izdvojena u
    `src/components/forms/VehicleRentalLeadForm.tsx` sa props-ima; obe stranice
    je sada dele umesto duplirane 440-linijske kopije.
  - **Popravljen pre-postojeći bag:** root layout ima `title.template`
    `%s | HALO Uspomene`, a tri stranice su brend imale i u sopstvenom title-u →
    duplirano "| HALO Uspomene | HALO Uspomene". Pogođene: luksuzni automobili,
    oprema, recenzija. Sve tri ispravljene; ostatak sajta proveren (17 ruta) i
    čist.
- **Commit / PR:** — (nije commitovano; grana `deploy`)
- **Na šta utiče dalje:** Nova ruta ide u sitemap i `llms.txt`; nav dropdown
  menja globalni header (svaka stranica); `VehicleRentalLeadForm` je sada
  deljena — izmene utiču na obe rentalne stranice.
- **Posledice:** Luksuzna stranica gubi upite tipa "stari automobili za
  venčanje" u korist nove — namerno, da se ne kanibalizuju. Fotografije flote
  nedostaju, pa kartice do daljeg prikazuju placeholder.
- **Šta je rešeno:** Retro i luksuzna ponuda su jasno razdvojene i za korisnika
  (nav, labele) i za pretraživač (razdvojeni keyword klasteri + uzajamni linkovi).
- **Šta je odblokirano:** Ponuda se sada širi dodavanjem objekta u
  `src/data/oldtajmeri.ts` — bez diranja stranice.
- **Status:** planned → code-complete (nije deployano)
- **Verifikacija:** `npx tsc --noEmit` čist; `eslint` na izmenjenim fajlovima
  čist; `next build` prolazi (385 stranica, obe nove rute prerenderovane
  statički); `next start` + curl: sve rute 200, title-ovi tačni, H1 tačan,
  FAQPage/Service/BreadcrumbList u HTML-u, canonical tačan, sitemap sadrži obe
  nove stavke, nav linkovi u statičkom HTML-u.
- **Blokade / sledeći korak:**
  1. Potvrditi sa partnerima tačan tekst o transportu van grada i o rezervnom
     planu u slučaju kvara.
  2. Proveriti da li je beli Fiat zaista 1300 — na fotografiji ima četiri
     fara, što je odlika 1500 (1300 ima dva). Ako jeste 1500, ispraviti `name`
     u `src/data/oldtajmeri.ts`.
  3. Deploy, pa Search Console: submit sitemap + zatražiti indeksiranje.

## 2026-08-03 — Fotografije flote

- **Šta je urađeno:** Stigle studijske fotografije svih 5 vozila; konvertovane
  sharp-om u WebP (1200px, q82, 159–213 KB po slici) u
  `public/images/oldtajmeri/` i povezane preko `image` polja. Pontiac dodat i
  kao hero slika (`priority`). Chevroletu dopunjen `bodyType` (na fotografiji je
  zatvorena limuzina sa 4 vrata).
- **Posledice:** Nijedna kartica više ne prikazuje placeholder; placeholder
  grana ostaje za buduća vozila.
- **Verifikacija:** rebuild prošao; sve slike 200, 5 jedinstvenih slika na
  stranici, nula placeholdera.
- **Status:** code-complete (nije deployano)

## 2026-08-03 — Dizajn iteracija i grupisanje po gradu

- **Šta je urađeno:**
  - Slike su bez pozadine (providne), pa je crna podloga kartica zamenjena
    toplim radijalnim gradijentom, `object-cover` → `object-contain`, a tamni
    preliv preko slike uklonjen. Hero izgubio okvir i senku — ostao samo meki
    zlatni sjaj ispod vozila.
  - Sa kartica uklonjene specifikacije (boja/karoserija/mesta/grad) i cena —
    duplirale su cenovnik ispod; kartica sada vodi ka njemu linkom.
  - Forma: izbačeno "Predsvadbeno snimanje", "Samo ceremonija i fotografisanje"
    → "Samo fotografisanje".
  - **Ponuda grupisana po gradu polaska** (`getFleetByCity()`) i u floti i u
    cenovniku. Grupa nosi ime grada, broj vozila i napomenu o transportu, pa se
    napomena piše jednom umesto po vozilu; iz cenovnika izbačena kolona
    "Polazi iz" jer je postala zaglavlje grupe. Grupisanje po gradu je ujedno i
    grupisanje po partneru, ali se to nigde ne vidi — za mladence je to čista
    logistička informacija.
  - **Uklonjeni konkretni nazivi modela iz proze** jer se ponuda širi: hero,
    meta/OG opis, schema opis, FAQ o ceni i o dva vozila, box na luksuznoj
    stranici, CTA u blog postu, `llms.txt`, OG slika. Gde brojevi/nazivi imaju
    smisla, izvedeni su iz `oldtimerFleet` (broj vozila po gradu, spisak modela
    u skrivenom SEO pasusu, raspon cena) pa se sami ažuriraju.
  - Dodat `vehicleCountLabel()` zbog srpske množine (1 vozilo / 2 vozila).
- **Posledice:** Prose više ne zastareva dodavanjem vozila. Jedina mesta sa
  konkretnim modelima generišu se iz podataka.
- **Verifikacija:** `tsc` + `eslint` čisti, `next build` prolazi, provereno u
  renderovanom HTML-u: obe grupe gradova, tačni brojevi vozila, napomena
  jednom po gradu, nema specifikacija ni cene na karticama, nema
  "Predsvadbeno snimanje".
- **Status:** code-complete (nije deployano)

## 2026-08-03 — Interno rutiranje upita ka partnerima

- **Šta je urađeno:**
  - `src/lib/oldtajmeri-partneri.ts` — interni registar partnera (naziv, osoba,
    telefon, kanali, Instagram, `vehicleIds`). **Server-only**: fajl se sme
    uvoziti isključivo iz `/api/contact/route.ts`; uvoz iz `"use client"`
    komponente spakovao bi telefone partnera u izvorni kod stranice.
  - `/api/contact` prošireno opcionim `routingProduct` + `vehicle`. Rutiranje se
    vraća **tek posle** uspešne reCAPTCHA i SMS verifikacije, pa kontakti nisu
    dostupni prostim pozivom endpointa.
  - `VehicleRentalLeadForm` dobio opcioni `routingProduct`; kad je postavljen,
    vraćeni tekst ide u Web3Forms payload kao `interno_prosledi_partneru`. Mejl
    i dalje šalje klijent (Cloudflare blokira server-side pozive ka Web3Forms) —
    server radi samo pretragu partnera.
  - Labela vozila izvučena u `vehicleOptionLabel()` u `src/data/oldtajmeri.ts` i
    koristi se i u formi i pri server-side mapiranju. Ranije su postojale dve
    identične kopije te funkcije — izmena formata u jednoj bi tiho pokvarila
    rutiranje (svi upiti bi padali na fallback).
  - Vozilo bez partnera pada na fallback koji nabraja sve partnere, pa upit
    nikad ne ostane bez rute.
  - CLAUDE.md: novo pravilo "Rental Fleets — White-Label + Partner Routing" —
    pri širenju ponude kontakt podaci partnera su obavezni, i oba fajla
    (`data/oldtajmeri.ts` + `lib/oldtajmeri-partneri.ts`) se drže usklađena.
- **Posledice:** Mejl sada nosi kome proslediti upit. Registar partnera je u
  repou — privatan repo, ali voditi računa pri deljenju koda.
- **Verifikacija:** `tsc` + `eslint` čisti, build prolazi. Provereno: 0
  pojavljivanja imena, telefona i Instagram handle-ova partnera u HTML-u
  stranice i u `.next/static` bundle-ovima; `/api/contact` bez validne
  reCAPTCHA vraća grešku bez ikakvih podataka o partneru; svih 5 vozila iz
  flote ima tačno jednog partnera (nema nedodeljenih, nepostojećih ni
  dvostrukih id-jeva).
- **Status:** code-complete (nije deployano)
