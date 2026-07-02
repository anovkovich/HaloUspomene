# Public Vendor Directory — Plan

Status: planned for next phase (after deploy redizajn home/QR pano).

## Cilj

Otvoriti vendor browse javno (`/vendori`) za SEO i lead-gen, ali sve interaktivne radnje (kontakt, dodavanje u omiljene, endorsement-i) gate-ovati iza registracije na "besplatan planer" (`/moje-vencanje`).

## Public listing — pravila

- URL: `/vendori` (listing) + `/vendori/[kategorija]` (SEO landing po kategoriji)
- Filteri: kategorija × grad, search po imenu
- **NE prikazujemo**:
  - kratke opise vendora
  - pin na mapi
  - kontakt podatke
  - badge isticanja (premium / verifikovan / preporučen)
- **Svi vendori izgledaju isti** — bez razlike između tier-ova. U public listingu prikazuje se samo: ime, kategorija, grad
- Cilj: minimalno otkrivanje vrednosti za neprijavljene korisnike, maksimalan SEO surface

## Klik na vendora — gate modal

Klik na bilo koju vendor karticu → modal sa porukom:

> **Registrujte se na besplatan planer** i pristupite svim informacijama:
> - kontakt podaci vendora
> - dodavanje u omiljene
> - endorsement sistem (◇ → ◈ → 💎 → 👑)
> - kompletan opis i galerija
>
> [Registrujte se] [Već imam nalog]

CTA vodi na `/moje-vencanje` (registracija) ili login.

## Premium / verifikovani vendori — interno

Tier-ovi i isticanje (gold ring, endorsement badge) ostaju isključivo u `/moje-vencanje` portalu posle prijave. Public ne vidi.

## SEO

- Server-rendered listing stranice (ISR ili SSG sa revalidate)
- Sitemap: dodati `/vendori` + sve `/vendori/[kategorija]` rute
- Metadata po kategoriji (npr. "Fotografi za venčanje u Beogradu | HALO Uspomene")
- JSON-LD: `LocalBusiness` ili `ItemList` schema za listing
- Robots: dozvoliti

## Routing & DB

- Public route čita `vendors` collection sa minimalnim projection-om (samo `name`, `category`, `city`)
- Modal je client component, renders po klik-u
- Postojeća `/moje-vencanje/VendorDirectory.tsx` ostaje za authenticated full UI

## Home page integration (posle implementacije)

- SectionPlaner / Concept / SEO pomena vendora → menjaju link sa `/planiranje-vencanja` na `/vendori`
- Možda dodatna sekcija na home-u "Preko 90 proverenih vendora" sa CTA na public listing

## Zašto ovaj pristup

1. **SEO**: listing stranice se indeksiraju, donose organic saobraćaj za queries kao "fotograf za venčanje Beograd"
2. **Lead-gen**: gate modal converuje vizitore u registrovane planere
3. **Vrednost paketa zaštićena**: tier-ovi, kontakti, ostalo iza prijave
4. **Pravičnost prema vendorima**: u public delu svi su jednaki, isticanje je benefit za korisnika koji se registruje

## Out of scope za prvu iteraciju

- Pojedinačna `/vendori/[id]` stranica (preusmerava na modal/registraciju umesto da se renderuje)
- Reviews, prikupljanje recenzija od public-a
- Vendor self-onboarding flow

## Procena rada

~1-2 dana za listing + gate modal + SEO bazu. Vendor self-onboarding i pojedinačne stranice su sledeća iteracija.
