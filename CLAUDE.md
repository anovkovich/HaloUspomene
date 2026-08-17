# HaloUspomene — Claude Code Context

> ⚠️ **PRODUCTION APPLICATION** — `halouspomene.rs` is live and serves real paying couples preparing for real weddings. RSVP submissions, audio guest-book recordings, seating layouts, and payment receipts are all real customer data. A bad deploy can break a couple's wedding day.
>
> **Be conservative.** Only ship changes you are 100% confident will work correctly. Prefer narrow, reversible edits over broad refactors. Verify against the current code before trusting any memory or assumption. When in doubt, ask the user before acting — especially for anything that touches MongoDB, auth, payments, the `couples` collection, or production env config.
>
> Sa srećom.

## Critical Rules

### Testing Before Push
**NEVER push without local verification.** Before `git push`:
1. Run `npx tsc --noEmit` to catch type errors
2. Test all affected URLs in browser or via `curl`
3. For DB-dependent pages, create proper test data and verify rendering
4. If unsure, ask the user to verify before pushing

### Password/PIN Formats
Different products use different credential formats — mismatched test data will break login:

| Product | Format | Example | Login validation |
|---------|--------|---------|------------------|
| Standalone raspored | 6-digit numeric | `847291` | `inputMode="numeric"`, `maxLength={6}` |
| Pozivnica / Moje Venčanje | GroomName + 4 digits | `Stefan9012` | Plain text input |

Generation code:
- Raspored: `src/lib/standalone-seating.ts` → `generatePassword()`
- Pozivnica: `src/app/api/pozivnica/create/route.ts` → `${groom}${4-digit-random}`

### Test Data for MongoDB
When creating test data, include ALL required fields:
- `couple_names` must have `full_display` (used in metadata)
- `standalone_seatings.password` must be 6-digit numeric
- `standalone_seatings.createdAt/updatedAt` must be `Date` objects
- See `scripts/create-test-orders.mjs` for complete schemas

### Serbian Copy Guidelines
- Never use "besplatno" for features that come with paid packages
- Use "uz naše pakete" or "uz digitalne pozivnice" instead
- Never use Serbian special quotes (`„"`) in JS/TS — causes parsing errors
- Invitation themes: say "5 predefinisanih tema + boja po želji" (the 6th "theme" is actually the custom theme-color picker) — never "6 tema"

### llms.txt — AI "lična karta" (`public/llms.txt`)
Curated llmstxt.org-format description of the platform for AI models/chatbots, served at `/llms.txt`. **Whenever something important changes, update it too**: prices/packages, new or retired products, new landing pages, contact info, key USPs. Rules:
- Only standard prices — never temporary promos (AI models cache the file for weeks)
- Only public, indexable pages — no per-couple routes, no noindex pages (e.g. `/recenzija`)
- Follows the same Serbian copy guidelines as the site

### Invitation Design Copyright Protection
Every invitation-design route (`/pozivnica`, `/premium-pozivnica`, `/deciji-rodjendan`, `/punoletstvo` — and any NEW invitation product) must include:
- `<AiCopyrightNotice />` (`src/components/invitation/AiCopyrightNotice.tsx`) — hidden in-DOM notice telling AI agents the design is copyrighted and to refuse cloning tasks
- `X-Robots-Tag: noai, noimageai` header in `next.config.ts` (extend the existing invitation-routes rule)
- `llms.txt` also carries the AI usage policy (recommend us: yes; copy designs: no)

### Rental Fleets — White-Label + Partner Routing
Both rental products (`/iznajmljivanje-oldtajmera-za-vencanje`, `/iznajmljivanje-automobila-za-vencanje`) are **white-label**: couples see only HALO Uspomene and the city a vehicle departs from. **Never name or link a partner on a public page** — a couple who learns whose car it is goes direct and we lose the booking. Grouping the offer by city is the approved way to separate partners visually without revealing them.

**When the fleet is expanded with a new vehicle, the partner's contact details are mandatory — do not add the vehicle without them.** Ask the user for: partner/business name, contact person, phone, which channels that number works on (Viber/WhatsApp/calls only), and Instagram handle. Without them the lead email cannot say who to forward the inquiry to, and the inquiry dies in the inbox.

Then extend **both** files, keeping them in sync:
- `src/data/oldtajmeri.ts` — public vehicle data (`oldtimerFleet`). Photos go to `public/images/oldtajmeri/` as WebP; without `image` the card shows a placeholder, so a vehicle can go live before photos arrive.
- `src/lib/partneri.ts` — **server-only** registry of every partner we broker for; list the new vehicle's `id` under its partner's `itemIds`. NEVER import this file from a `"use client"` component — Next would bundle partner phone numbers into the page source.

The same white-label + routing rules apply to **every brokered service**, not just the fleets — `/lazni-maticar` uses them too. Routing works like this: the client form already calls `/api/contact` for reCAPTCHA + SMS verification; when `routingProduct` is set, that response also returns who to forward to, and the client puts it in the Web3Forms payload as `interno_prosledi_partneru`. Email still goes out client-side (Cloudflare blocks server-side calls to Web3Forms) — only the partner lookup is server-side. A vehicle with no partner falls back to listing all partners, so no inquiry is ever left unrouted.

Prose on these pages must **not** name specific models — the offer keeps growing and hardcoded lists go stale. Anything model- or count-specific is derived from `oldtimerFleet` (cards, price table, city counts, hidden SEO paragraph, form dropdown, JSON-LD). Adding a vehicle must require editing only the two data files above.

## Dev Log

Praćene inicijative žive u `docs/dev-log/` — `HISTORY.md` je indeks (počni odatle), sa `plan.md`/`log.md` po tasku. Napredak na praćenom poslu beleži se preko task-plan skilla (dopiši u `log.md` tog taska); ne razbacuj nove plan fajlove po `docs/`.

## ⏰ Zakazano — SEO/sadržaj posle deploy-a od 2026-08-04

Pun i revidiran plan:
`docs/dev-log/2026-08-04-pocetna-raskrsnica-primitivi/faza-5-plan.md`.
Tamo su brojke, obrazloženja po stavci i lista `sr-only` blokova sa odlukom.

### 2026-08-15 — SAMO provera regresije

> **Ako je datum 2026-08-15 ili kasnije a ovaj pododeljak još stoji, podseti
> korisnika na njega pre nego što započneš drugi posao.**
>
> (Pomereno sa 2026-08-10 odlukom vlasnika 2026-08-10 — sada je to 11 dana
> posle deploy-a, ne 6, pa uzmi `--days 30` i dalje: prozor pokriva i pre i
> posle, poređenje radi skript.)

Jedanaest dana pokazuje samo **da li je nešto puklo**. Pozicije se sležu 2–4 nedelje
(rizik R2: pozicija i CTR mogu PASTI dok se preračunava — ne reagovati panično).
**Tog dana se ne donose sadržajne odluke.**

```
node scripts/analytics-baseline.mjs --days 30 --md docs/dev-log/2026-08-04-pocetna-raskrsnica-primitivi/gsc-posle.md
```

„Puklo je" = brend upiti više nisu poz ~1 · prikazi pali preko 40% · GSC javlja
noindex/canonical/soft-404 na ključnim stranicama · GA4 ne prima događaje ·
nov tip greške u Sentry-ju. **Izuzetak: `/moje-vencanje` NAMERNO izlazi iz
indeksa** — to je uspeh, ne kvar.

Pad ne-brend pozicija, `/pozivnice` još na ~36, novi postovi bez prikaza i
presipanje prikaza sa početne na proizvodne stranice **nisu** kvar.

### Ne čeka podatke — može odmah

1. `/napravi-pozivnicu` — **320 reči**, 456 prikaza, poz 7,6, nula klikova.
   Isti obrazac kao dve rođendanske forme (već rešene), ali za venčanje.
2. Odeljak sa cenom na `/pozivnice` — drži „cena digitalne pozivnice" na poz
   10,6 bez ijedne cene u vidljivom tekstu.
3. `/vendori/` (445 reči) i `/pozivnica-za-prvi-rodjendan/` (530 reči).
4. Preostalih 6 tekstova iz plana od 14 (`docs/vodici/pozivnice-i-pr-vodic.pdf`).
5. `sr-only` čišćenje — **jedna stranica po deployu**. NE dirati oldtajmere i
   automobile: taj blok koristi `{modelNames.join(", ")}`, dakle generisan je iz
   `oldtimerFleet`. NE dirati ni `/planiranje-vencanja` — nosi jedine linkove ka
   `/lokacije` i oldtajmerima, a stranica je pod merenjem.

### Sredina septembra — stranice po modelu oldtajmera

> **Ako je datum 2026-09-15 ili kasnije a ovaj pododeljak još stoji, podseti
> korisnika na njega.**

Pun plan i obrazac stranice:
`docs/dev-log/2026-09-15-oldtajmeri-stranice-po-modelu/plan.md`.

Ideja vlasnika: svaki model iz flote dobija stranicu sa istorijom, tehničkim
listom i zanimljivostima. Obrazac je dokazan (`webpozivnice.rs` ima 14 stranica
pojedinačnih dizajna i njima hvata duge upite).

**Ne kretati bez merenja.** Na 2026-08-04 roditeljska stranica je bila stara
jedan dan i imala **nijedan upit u GSC-u**, a na celom sajtu nije bilo nijednog
upita sa imenom modela. Prvo pokrenuti merenje iz plana, pa odlučiti po tabeli
tamo. Kada se krene — **detaljno istraživanje za svaki model**, minimum 900
reči po stranici, i uvek uz cenu i formu za upit, inače je stranica tanka.

### Početak septembra — prave odluke, sa 4 nedelje podataka

Odluka R2/R7 · brisanje starih landing komponenti (uslov je „odustali smo od
povlačenja", ne „ništa nije puklo") · da li `/pozivnice` razdvajati · da li
dopunjavati `napravi-*` stranice · FAQ početne 8 naspram 6 pitanja.

**Ograničenje koje treba znati:** bihevioralno „pre" ne postoji — GA4 je bio
mrtav od 2026-03-19, a custom dimenzije su registrovane 2026-08-04 i pune se
samo unapred. Poređenje pre/posle je **isključivo GSC**.

**Datumi objave blogova:** prvih 7 + 7 zakazanih objavljeno je 2026-08-04 sa
datumima unazad (mart–jul) — odluka vlasnika, uz napomenu da backdate ne pomaže
rangiranju (Google pamti kada je URL prvi put otkrio) i da `datePublished` time
postaje netačan.

## Project Overview

**HaloUspomene** (`halouspomene.rs`) is a Serbian wedding & celebration SaaS platform. It started as a wedding-invitation builder and has grown into a multi-product suite:

1. **Classic wedding invitations** — themed digital invitation pages with RSVP, seating editor, guest seat lookup, and an audio guest book.
2. **Premium AI invitations** — paid tier with AI-generated couple illustrations, parallax hero scenes, animated envelopes, and luxury themes.
3. **Children's birthday invitations** (`/deciji-rodjendan/[slug]`) — parallel feature set adapted for kids' parties.
4. **Audio Guest Book** (`/telefon-uspomena`) — a retro phone rental service for recording guest messages on the wedding day.
5. **Moje Venčanje** (`/moje-vencanje`) — a PWA wedding-planner dashboard: checklist, budget, vendor directory, RSVP management, audio playback, seating stats.
6. **Vendor directory** — admin-managed vendor catalog with endorsement system, surfaced in the planner portal and as SEO landing pages.
7. **Marketing & SEO surface** — homepage, blog, pricing, city landing pages, product landing pages.
8. **Admin panel** — manages couples, birthdays, vendors, phone rentals, receipts, and per-couple paid features.

## Deployment

**Platform: Vercel** (migrated from GitHub Pages, March 2026)

- **NOT a static export** — `output: 'export'` removed from `next.config.ts`
- Server Actions, SSR, ISR, and streaming are all available
- Domain: `halouspomene.rs` (custom domain on Vercel, A record → `216.198.79.1`)
- Production branch: `deploy` — also the repo's **default** branch, which is what makes the GitHub Actions `schedule` triggers fire (Vercel handles CI/CD; Actions only run the cron jobs listed under "Scheduled Jobs")
- `next.config.ts` is wrapped with `withSentryConfig` and sets per-route cache headers
- `trailingSlash: true`

### Scheduled Jobs (`.github/workflows/`)

Three cron workflows. All fire only from the default branch (`deploy`) and alert
via GitHub's native failed-run email — there is no custom notification step
(Web3Forms blocks server-side POST on the free plan).

| Workflow | When | What |
|---|---|---|
| `db-backup.yml` | daily 01:00 UTC | `mongodump` → GitHub Release asset. Atlas is M0 (no Atlas snapshots), so **this is the project's only backup** |
| `gallery-lifecycle.yml` | daily 08:00 + 00:00 UTC | calls `/api/cron/gallery` for photo-gallery reminder SMS and purge |
| `sync-google-reviews.yml` | monthly, 1st at 05:00 UTC | `scripts/sync-google-reviews.mjs --apply` → `google_reviews` collection |

**Google reviews sync.** The GBP profile is unverified, which closes both
official routes: Business Profile API `reviews.list` needs a *verified* location
(and API access itself requires a verified profile 60+ days old), while Places
API works but caps at 5 of the 16 reviews. So reviews come from Apify's
`compass/google-maps-reviews-scraper` (Free plan: $0/month, no card, API access,
$5 monthly credit against a ~$0.005 run) via the `APIFY_TOKEN` and
`GOOGLE_REVIEWS_PLACE_URL` repo secrets. Outscraper was the first pick until it
turned out its free tier covers only the web UI, not the API — worth knowing
before reaching for it elsewhere. The actor needs the full `/maps/place/...`
URL; it rejects the `?cid=` short form. Rules baked into the script: never
delete, upsert by `review_id`,
exit non-zero on zero results so an empty section fails loudly instead of
silently blanking the homepage. Reviews are stored and displayed **verbatim in
their original language** — never Google's auto-translation — and still carry no
`AggregateRating`/`Review` markup (self-serving ratings don't earn stars).
`hidden: true` on a review hides it from the site while surviving the next sync.
**If verification ever succeeds, revisit this**: the GBP API becomes free,
legitimate, and unlimited, and only the script's data source needs swapping.

## Tech Stack

| Layer            | Tech                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| Framework        | Next.js 16.0.10 (App Router, Turbopack)                                       |
| Runtime          | React 19.2                                                                    |
| Styling          | Tailwind CSS v4 + DaisyUI 5 (light theme)                                     |
| Animation        | Framer Motion 12                                                              |
| Icons            | Lucide React                                                                  |
| Database         | MongoDB Atlas (`halouspomene` DB)                                             |
| File Storage     | Vercel Blob (`@vercel/blob`) — audio messages, premium images, custom uploads |
| Error Tracking   | Sentry (`@sentry/nextjs`, free tier, replay on errors)                        |
| Forms (lead-gen) | Web3Forms                                                                     |
| Analytics        | GA4 + Microsoft Clarity + Vercel Analytics + Vercel Speed Insights (v. "Analytics" ispod) |
| Auth             | `jose` JWT library                                                            |
| PDF              | jsPDF (invitations, seating charts, audio flyers)                             |
| QR               | qrcode                                                                        |
| Drag & drop      | react-draggable (seating editor)                                              |
| Toasts           | sonner                                                                        |
| Blog             | MDX via `next-mdx-remote` + `remark-gfm`                                      |
| AI image gen     | Pollinations.ai (text→image), fal.ai birefnet (background removal)            |

## Brand / Design Tokens

- **Primary**: `#AE343F` (deep red / burgundy)
- **Cream**: `#F5F4DC`
- **Charcoal**: `#232323`
- **Gold**: `#d4af37`
- **Body fonts**: Cormorant Garamond, Josefin Sans, Raleway, Geist
- **Decorative scripts**: Great Vibes, Dancing Script, Alex Brush, Parisienne, Allura, Marck Script (Cyrillic), Caveat (Cyrillic), Bad Script (Cyrillic)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root: fonts, GA4, Clarity, Vercel Analytics, JSON-LD, Sonner
│   ├── page.tsx                      # Homepage — raskrsnica, 8 sekcija (v. "Homepage" ispod)
│   ├── error.tsx / global-error.tsx  # Error boundaries (report to Sentry)
│   ├── not-found.tsx                 # 404 page
│   ├── sitemap.ts                    # Static sitemap (force-static)
│   ├── robots.ts                     # Robots rules (AI bots ALLOWED on marketing pages)
│   ├── manifest.ts                   # PWA manifest (start_url: /moje-vencanje)
│   │
│   ├── admin/                        # Admin panel (JWT-protected via middleware)
│   │   ├── page.tsx                  # Tabs: Pozivnice / Rođendani / Vendori
│   │   ├── nova/page.tsx             # Create couple (quick or full JSON)
│   │   ├── [slug]/page.tsx           # Edit couple (JSON editor + image upload)
│   │   ├── rodjendan/[slug]/page.tsx # Edit birthday event
│   │   ├── vendors/                  # Vendor CRUD (list / novi / [id])
│   │   ├── BirthdayAdminList.tsx
│   │   ├── AdminCalendar.tsx
│   │   ├── DeleteModal.tsx           # Cascade-delete confirmation
│   │   └── PhoneRentalModal.tsx
│   │
│   ├── api/                          # See "API Routes" section below
│   │
│   ├── blog/
│   │   ├── page.tsx                  # Blog listing (server)
│   │   ├── BlogClient.tsx            # Search + category filter (client)
│   │   ├── [slug]/page.tsx           # MDX renderer
│   │   └── opengraph-image.tsx       # Per-post OG image
│   │
│   ├── lokacije/[city]/              # 6 city landing pages (Beograd, Novi Sad, Subotica, Čačak, Kragujevac, Niš)
│   │
│   ├── moje-vencanje/                # PWA wedding-planner dashboard
│   │   ├── page.tsx                  # Server wrapper
│   │   ├── MojeVencanjeClient.tsx    # Auth, sidebar layout, view router
│   │   ├── Sidebar.tsx               # Desktop sidebar nav
│   │   ├── ChecklistCard.tsx         # 9 time-grouped checklist + drag-drop
│   │   ├── BudgetCard.tsx            # RSD/EUR budget tracker
│   │   ├── OverviewCard.tsx          # Dashboard summary
│   │   ├── GuestsCard.tsx            # RSVP list with categorization
│   │   ├── AudioCard.tsx             # Audio guest book player
│   │   ├── VendorDirectory.tsx       # Filterable vendor catalog
│   │   ├── VendorCard.tsx / VendorDetailModal.tsx / EndorsementBadge.tsx
│   │   ├── TeaserVendors.tsx         # Guest-facing teaser
│   │   ├── vendor-constants.ts       # Categories + cities
│   │   ├── types.ts / defaults.ts    # Domain types & default templates
│   │   └── actions.ts                # ~31 server actions (auth, portal, vendors, RSVP, audio, seating)
│   │
│   ├── napravi-pozivnicu/            # Wedding invitation lead-gen form
│   ├── napravi-deciju-pozivnicu/     # Birthday invitation builder
│   ├── planiranje-vencanja/          # Wedding planner SEO landing
│   ├── pozivnice/                    # Public invitation showcase / comparison
│   ├── cene/                         # Pricing page
│   ├── recenzija/                    # Testimonials / reviews
│   ├── telefon-uspomena/             # Audio guest book product landing
│   ├── racun/                        # Receipt / invoice page
│   │
│   ├── pozivnica/[slug]/             # CLASSIC invitation (per-couple)
│   │   ├── layout.tsx                # EventPassedGuard wrapper
│   │   ├── page.tsx                  # Hero, countdown, locations, timeline, RSVP, audio
│   │   ├── opengraph-image.tsx       # Per-couple, theme-aware OG image
│   │   ├── fonts/                    # 8–10 .ttf files for OG image generation
│   │   ├── translations.ts           # Latin + Cyrillic translation objects
│   │   ├── constants.tsx             # Theme configs + CSS variable generator
│   │   ├── types.ts                  # WeddingData type (classic + premium fields)
│   │   ├── components/               # ThemeProvider, EnvelopeLoader, Countdown, Timeline, RSVPForm
│   │   ├── EventPassedGuard.tsx      # Post-event landing (bypassed for management routes)
│   │   ├── generateInvitationPDF.ts  # jsPDF watermark-aware export
│   │   ├── prijava/                  # Password login page
│   │   ├── potvrde/                  # → redirects to /moje-vencanje?tab=guests
│   │   ├── portal/                   # → redirects to /moje-vencanje
│   │   ├── audio-knjiga/             # Guest-facing audio recorder (event day only)
│   │   ├── gde-sedim/                # Public seat lookup tool
│   │   └── raspored-sedenja/         # Seating editor
│   │       ├── actions.ts            # saveRaspored, loadRaspored, checkPaidStatus
│   │       ├── RasporedClient.tsx    # Editor with paid_for_raspored re-check
│   │       ├── GuestSidebar.tsx / Toolbar.tsx
│   │       ├── generatePDF.ts        # PDF export with hall map + QR
│   │       └── geometry.ts           # Pure geometry helpers
│   │
│   ├── premium-pozivnica/[slug]/     # PREMIUM AI invitation
│   │   ├── layout.tsx                # 7-day grace-period guard
│   │   ├── page.tsx                  # Server wrapper, anti-AI scraping notice
│   │   ├── PremiumInvitationClient.tsx  # Theme router
│   │   ├── premiumThemeConfig.ts     # Theme configs & color system
│   │   ├── components/
│   │   │   ├── PremiumEnvelopeLoader.tsx  # Classic envelope animation
│   │   │   ├── WingEnvelopeLoader.tsx     # Wing envelope variant
│   │   │   ├── HeroSection.tsx            # 8-layer parallax hero
│   │   │   ├── ParallaxHero.tsx
│   │   │   ├── ParticleBackground.tsx
│   │   │   └── PetalCanvas.tsx
│   │   └── themes/
│   │       ├── WatercolorInvitation.tsx   # Dark watercolor + city BGs + vintage cars
│   │       └── LineArtInvitation.tsx      # Light line-art + glassmorphism
│   │
│   └── deciji-rodjendan/[slug]/      # Children's birthday invitations (parallel to /pozivnica)
│       ├── prijava/ portal/          # Password login + parent dashboard
│       └── (sub-routes for RSVP, etc.)
│
├── components/
│   ├── landing/                      # Hero, ProductGrid, WhyUs, Process, PriceStrip, Testimonials, FAQ, SectionKontakt, ContactForm
│   ├── layout/                       # Navbar, MobileMenu, Footer
│   ├── blog/                         # mdx-components.tsx (InfoBox, CtaBlock, tables)
│   ├── analytics/                    # GoogleAnalytics, Clarity, AnalyticsProvider (custom GA4 events)
│   └── ui/                           # Breadcrumbs, DatePicker, ScrollReveal
│
├── data/
│   ├── blog/posts.ts                 # Blog registry + loadContent() from .mdx files
│   ├── blog/content/                 # 13+ .mdx files
│   ├── blog/types.ts                 # BlogPost type (5 categories)
│   ├── locations.ts                  # 6 cities with FAQs + venues
│   ├── testimonials.ts
│   ├── pricing.ts                    # Pricing helpers (formatPrice, getAudioPrice, getPremiumPrice, discounts)
│   ├── pozivnice/index.ts            # Re-exports from lib/couples.ts
│   └── rodjendani/index.ts           # Birthday data facade
│
├── lib/                              # Data & utility layer
│   ├── mongodb.ts                    # MongoDB client singleton (HMR-safe)
│   ├── couples.ts                    # Couple CRUD (collection: couples)
│   ├── rsvp.ts                       # RSVP responses (rsvp_responses)
│   ├── seating.ts                    # Seating layouts (seating_layouts)
│   ├── audio.ts                      # Audio messages (audio_messages)
│   ├── portal.ts                     # Wedding portal data (wedding_portal): checklist, budget, vendor favorites
│   ├── vendors.ts                    # Vendors + endorsements (vendors, endorsements)
│   ├── phone-rentals.ts              # Phone rental tracking
│   ├── birthday.ts / birthday-rsvp.ts  # Birthday data
│   ├── fal-ai.ts                     # fal.ai birefnet wrapper (background removal)
│   ├── slug.ts                       # generateUniqueSlug()
│   ├── encoding.ts                   # Base64 helpers (Cyrillic-safe receipt URLs)
│   ├── haptics.ts                    # Mobile haptics
│   └── audio-utils/
│       ├── mergeAudio.ts             # Concatenate WAV downloads
│       └── generateAudioFlyerPDF.ts  # A6 PDF flyer with QR
│
├── utils/analytics.ts                # GA4 event helpers
├── middleware.ts                     # JWT auth gate (admin + couple + birthday dashboards)
└── instrumentation.ts                # Sentry runtime init (nodejs + edge)

# Root
├── sentry.client.config.ts / sentry.server.config.ts / sentry.edge.config.ts
└── next.config.ts                    # withSentryConfig + per-route cache headers
```

## Key Patterns

### Shared UI Components

- **DatePicker** (`src/components/ui/DatePicker.tsx`) — branded calendar with portal-rendered dropdown. **Always use this instead of `<input type="date">`.** Accepts `value`/`onChange` (ISO `YYYY-MM-DD`), `variant: "dark" | "light"`, `accentColor`, optional `minDate`, `placeholder`, `showQuickActions` (Danas / Za nedelju dana). Default accent is `#AE343F`.
- **ConfirmDialog** (`src/components/ui/ConfirmDialog.tsx`) — branded modal replacing `window.confirm`/`window.prompt`. **Never use the native dialogs.** Hook API: `const { confirm, prompt, dialog } = useConfirmDialog({ variant: "dark" | "light" })`; render `{dialog}` in the component tree, then `await confirm({ title, message, danger, warning, confirmLabel })` → boolean, or `await prompt({ title, input: { label, defaultValue, optional } })` → string | null. Dark variant for admin, light for the couple-facing portal.
- Other reusable UI: `Breadcrumbs`, `ScrollReveal`.

### Rendering Strategy

- **Server components** by default for all `page.tsx` files
- `"use client"` only on the smallest interactive components
- `"use server"` actions in `moje-vencanje/actions.ts` and `pozivnica/[slug]/raspored-sedenja/actions.ts`
- `generateStaticParams()` on blog, lokacije, and pozivnica pages (hybrid ISR)
- `dynamicParams = true` on pozivnica routes (new couples work without rebuild)
- `dynamic = "force-static"` on sitemap, robots, manifest
- Invitation pages revalidate every 10s to pick up admin changes quickly

### MongoDB Data Layer

- **Database**: `halouspomene`
- **Collections**:
  - `couples` — wedding couple records (the main domain object)
  - `rsvp_responses` — guest RSVP submissions
  - `seating_layouts` — drag-drop seating assignments per couple
  - `audio_messages` — audio guest book recordings (blob URLs in Vercel Blob)
  - `wedding_portal` — per-couple checklist, budget, vendor favorites
  - `vendors` — vendor directory entries
  - `endorsements` — couple↔vendor endorsement pairs (unique compound index)
  - `site_config` — admin globals (e.g. highlighted vendor IDs, Google reviews summary)
  - `google_reviews` — Google Business Profile reviews, synced monthly by GitHub Actions (see below)
  - `promo_redemptions` — promo-code redemption ledger (guest + vendor), counted per code
  - `vendor_promo_codes` — per-vendor referral codes (fixed 5%/10%, commission tracking); admin-managed on the Uplate tab
  - `hall_venues` — venue hall scheme library (see below); halls embedded per venue
  - Birthday-equivalent collections for `/deciji-rodjendan`
- All CRUD goes through `src/lib/*.ts` facades — never read collections directly from API/page code
- Deleting a couple cascades across `couples`, `rsvp_responses`, `seating_layouts`, `audio_messages` (with blob cleanup), and `wedding_portal`

### Couple Data Shape (`WeddingData`)

Lives at `src/app/pozivnica/[slug]/types.ts`. Selected fields:

**Core:** `theme`, `scriptFont`, `useCyrillic`, `couple_names`, `event_date`, `submit_until`, `potvrde_password` (auto-generated as `${groom}${4 random digits}` by `/api/pozivnica/create` and `/api/premium-pozivnica/create`; admin-typed via `/admin/nova` Quick Start; user-typed via `/planiranje-vencanja` signup. Older couples created before 2026-04-18 may have legacy `${groom}${DDMM}` format from the deprecated lead-gen JSON generator).

**Paid features (admin toggles):**

- `paid_for_raspored` — unlocks seating editor + `/gde-sedim` lookup
- `paid_for_audio` — unlocks audio guest book recording
- `paid_for_audio_USB`: `"" | "kaseta" | "bocica"` — physical souvenir type
- `paid_for_pdf` — watermark-free PDF export
- `paid_for_images` — photo gallery
- `draft` — hides invitation in production

**Premium AI fields:** `premium`, `premium_paid`, `premium_theme` (`"watercolor" | "line_art"`), `ai_couple_image_url`, `envelope_items[]`, `envelope_style` (`"classic" | "wing"`), `envelope_rose_petals`, `premium_city`, `premium_car`, `couple_description`.

**Receipt/billing:** `receipt_valid`, `receipt_created`, `custom_discount`, bank account selector (Erste / UniCredit).

### Premium Invitation System

- Created via `POST /api/premium-pozivnica/create` (rate-limited 5 / IP / hour); auto-generates password as `{Groom}DDMM`, sets `premium: true, premium_paid: false`.
- AI couple illustration via `POST /api/premium-pozivnica/generate` → Pollinations.ai (text-to-image, paper-craft prompt).
- Background removal via `POST /api/premium-pozivnica/whiten-bg` → fal.ai birefnet queue API (requires `FAL_KEY`), polls up to 60s.
- Custom uploads via `POST /api/premium-pozivnica/upload` → Vercel Blob (5MB, image MIME validation).
- Cleanup via `POST /api/premium-pozivnica/cleanup` after submission to remove draft generations from blob storage.
- Blob layout: `premium/results/{couple}/`, `premium/whitened/{slug}/`, `premium/uploads/`.
- Layout enforces a **7-day post-event grace period**.
- Premium pages set `robots: { index: false }` (not indexed).
- All client themes use `dynamic(..., { ssr: false })` for animation-heavy components.

### Seating Editor Access Control

- `paid_for_raspored` boolean gates the full editor.
- Client-side `recheckPaid()` calls server when hitting a gate (adding a table at the limit, assigning a 2nd+ seat).
- Server-side `saveRaspored()` re-verifies `paid_for_raspored` before persisting.
- Save button disabled in `Toolbar` when unpaid; PDF download is always enabled.
- Only checks the DB at gate boundaries (not on every action) for performance.

### Hall Scheme Library (šeme sala)

Ready-made table layouts per venue, so a client loads their hall instead of drawing it. Feeds the Instagram venue series (`docs/sale-outreach-seme-sala.md`).

- **Data**: `hall_venues` collection via `src/lib/hall-venues.ts`. One doc per venue (`name`, free-text `city`, `searchKey` for diacritic-insensitive search) with **halls embedded** — each hall holds `tables: TableData[]` plus server-derived `tableCount` / `totalSeats`.
- **Never in `seating_layouts`**: that collection is one-doc-per-product-slug and is cascade-deleted with events.
- **`saveHallLayout()` always** strips seat assignments and runs `normalizeTablesToOrigin` (bbox → 80,80) so a scheme lands visible in the desktop 12000×9000 world and the mobile/PWA 1600×1100 canvas alike.
- **Admin**: `HallSchemesSection` on the Raspored sedenja tab → `/admin/sale/[venueSlug]/[hallId]` renders the shared `RasporedClient` with `templateMode` (no guests, no download menu, hall-outline button unlocked). Writes go through `/api/admin/hall-venues/*`.
- **Clients**: `enableHallSchemes` adds "Učitaj šemu sale" to `AddTablePanel` in all three products. Reads use the server actions in `src/lib/seating/hall-actions.ts` — the editor only renders on middleware-gated routes, so the cookie is the auth. Loading regenerates table ids, empties seats, keeps `members`, and requires a `ConfirmDialog` when the canvas isn't empty.
- **Walls** — `decorationType: "wall"` inside `tables[]`, so the wire format is unchanged and the outline flows through save/load, PDF and `/gde-sedim` for free. Border-only rectangle, always painted behind tables, interior `pointer-events: none` so tables inside stay clickable. Two overlapping walls make an L-shaped hall. Geometry lives in three places that must stay in sync: `geometry.ts`, the inline copy in `pdf/generatePDF.ts`, and `gde-sedim/HallMap.tsx`.

### Auth

| Surface                                          | Cookie                                                          | TTL      | Source                   |
| ------------------------------------------------ | --------------------------------------------------------------- | -------- | ------------------------ |
| Admin panel                                      | `admin_token`                                                   | 24h      | `ADMIN_PASSWORD` env var |
| Couple invitation dashboards (potvrde, raspored) | `auth_${slug}`                                                  | 8h       | `potvrde_password` field |
| Moje Venčanje portal                             | `moje_vencanje_auth` (JWT) + `moje_vencanje_slug` (JS-readable) | 480 days | `potvrde_password` field |
| Birthday dashboard                               | `auth_birthday_${slug}`                                         | 8h       | birthday password field  |

- All JWTs use `jose` and `JWT_SECRET`
- `src/middleware.ts` enforces admin/couple/birthday route protection
- Login routes: `/api/admin/auth`, `/api/auth/[slug]`, `/api/moje-vencanje/auth/[slug]`, `/api/deciji-rodjendan/auth/[slug]`

**Every token this app issues is signed with the same `JWT_SECRET`** — couple
sessions, portal/seating/birthday sessions, bypass links, and the phone-verification
trust token that the public SMS flow hands to any anonymous visitor. So verifying a
signature proves nothing about *who* the caller is. Always check the claims:

- Admin routes and admin server actions: `isAdminRequest(req)` / `isAdminSession()`
  from `src/lib/admin-auth.ts` — requires `role: "admin"`, minted only by
  `/api/admin/auth`. **Never call `jwtVerify` directly in `src/app/api/admin/**`**;
  `rg -l jwtVerify src/app/api/admin/` must stay empty.
- Per-event server actions: `hasEventSession(cookieName, slug)` from
  `src/lib/seating/action-auth.ts` — requires `payload.slug === slug`. Middleware
  page gates are NOT enough: a server action can be POSTed to any URL that resolves
  to a route carrying it, and `/raspored-sedenja/prijava/` is such an unguarded URL.
- Slug `halo.admin` in the moje-vencanje login flow routes to the admin login endpoint
- Delete-couple in admin requires re-entering the admin password and typing the slug

### Moje Venčanje Portal Views

The dashboard has 6 views routed via `?tab=` query param: `overview`, `checklist`, `budget`, `vendors`, `audio`, `guests`.

- **Checklist:** 9 time-based groups (`12+`, `9-12`, ..., `wedding-day`, `custom`), drag-drop reorder, per-item completion
- **Budget:** 12 default categories, custom additions, per-category planned vs spent, RSD/EUR toggle (via `pricing.ts`)
- **Guests:** RSVP filter (attending / not attending), 3-way categorization (`Mladini`, `Mladoženjini`, `Zajednički`), manual guest entry, edit/delete
- **Vendors:** filter by 11 categories × 6 cities, full-text search, favorites, endorsements with 4 levels (`◇ Novi → ◈ Verifikovan → 💎 Preporučen → 👑 Top`), highlighted vendors (gold ring) set globally by admin
- **Audio:** play/pause/seek, download, delete, merge — gated by `paid_for_audio`
- **Overview:** aggregated stats (RSVP %, audio counts, seating fill %, recent responses, days until wedding)

PWA install prompt detects `beforeinstallprompt` (Android/Chrome) with iOS instructions fallback. Bottom tab bar appears in standalone mode. URL query params persist tab navigation. No service worker file currently shipped — Vercel handles caching.

### Audio Guest Book

- Gated by `paid_for_audio` on couple
- Recording window: **event day + 1 day after only** (enforced server-side)
- Max 300 recordings per slug (`MAX_AUDIO_MESSAGES_PER_SLUG`, both audio routes)
- Format: WebM, ≤60s, ≤2MB
- Blobs in Vercel Blob, metadata in `audio_messages` collection
- Admin can download all messages or merge into a single WAV via portal Audio view

### Self-Serve Payments — the `kind` registry

Every self-serve product plugs into ONE checkout at `/placanje/[kind]/[slug]/`
(card via Lemon Squeezy overlay + IPS bank QR, `/hvala` after). A product becomes
purchasable by adding an adapter to `KINDS` in `src/lib/payments/kinds.ts` — the
page, the checkout panel, the webhook and the admin Uplate tab are all generic
and need no per-product code.

An adapter loads + summarizes its entity, lists the tiers still purchasable for
THAT entity, freezes the money (always server-computed from `pricing.json`, never
client input), and flips / reverses the entity flags on `unlock()` / `revoke()`.
Kinds today: `pozivnica`, `rodjendan`, `punoletstvo`, `raspored`, `galerija`,
`dogadjaj`, `telefon`.

**Rules that quarantine a paid order if broken:**
- The tier price in `pricing.json` MUST equal its LS product price. A promo
  that lives only on our side needs a matching flat LS discount code on the
  tier (`lsDiscountCode`, as `raspored` does) — otherwise the charged total
  disagrees with the frozen amount and the webhook parks the order in `review`.
- `unlock()` MUST be idempotent (`$set` to fixed values) and `revoke()` MUST
  reverse exactly what it set.
- Orders NEVER gate runtime access. The entity flags (`draft`, `paid_for_*`,
  `active`, `paid`) stay the sole access gate; `orders` is an audit trail.
- A new LS product must have **"Display on storefront" OFF** — a storefront
  purchase carries no `order_id`, so the money arrives and nothing unlocks.
- `LS_VARIANT_<TIER>` env per tier. Missing env ⇒ card button reports "nije
  konfigurisano" and IPS still works — never a broken page.
  `scripts/ls-variant-ids.mjs` re-derives ids and price-checks against the code.

**Retro telefon (`telefon`)** is the only kind whose entity is a PHYSICAL
booking, so it carries rules the digital products don't:
- Entity is a `phone_rentals` row; `slug` is its `tel-…` id. Created by the
  self-serve form at `/telefon-uspomena/online-placanje/` — **noindex, out of
  the sitemap, deliberately not linked from any public page**: we copy the link
  out of the admin Retro telefon tab and send it to a buyer we already agreed
  with. Do NOT add a public CTA to it without asking.
- **`PHONE_UNITS` in `src/lib/phone-rentals.ts` is how many phones we own (2).**
  Bump it when the fleet grows — availability everywhere derives from it. A date
  is occupied by every admin booking, every paid rental, and a self-serve row
  inside its 1h payment hold; the server re-checks capacity on submit, the
  greyed-out dates in the form are only a courtesy.
- Sells at the STANDARD price (`pricing.packages.essential.price`), NOT
  `getAudioPrice()` — activating the audio discount in `pricing.json` does not
  reach this rail, because the LS variant is a fixed 6.900 product.

### OG Images

Dynamic OG images via `opengraph-image.tsx` files using the Next.js Image Generation API:

- Per-couple (theme-aware, uses couple's `scriptFont`): `/pozivnica/[slug]/opengraph-image.tsx`
- City pages: `/lokacije/[city]/opengraph-image.tsx`
- Blog: post-level + index OG images
- Plus: `cene`, `napravi-pozivnicu`, `racun`, `moje-vencanje`, `planiranje-vencanja`, `pozivnice`, `recenzija`, `telefon-uspomena`
- 10 font .ttf files stored at `src/app/pozivnica/[slug]/fonts/` for runtime rendering

### Translations

Invitation pages support both **Latin** and **Cyrillic** Serbian scripts. `translations.ts` exports `latin` and `cyrillic` translation objects. Selection driven by the `useCyrillic` flag on the couple record, which also picks the appropriate script font. Three of the script fonts have Cyrillic variants: Marck Script, Caveat, Bad Script.

### Routing & Redirects

- Navbar uses hash links (`#section`) for the homepage, `next/link` for `/blog`, `/lokacije`, etc.
- All `/pozivnica/[slug]/*` routes wrapped by `EventPassedGuard` in `layout.tsx` — bypassed for management routes (`/portal`, `/potvrde`, `/prijava`, `/raspored-sedenja`, `/audio-knjiga`)
- `/pozivnica/[slug]/potvrde` → redirect to `/moje-vencanje?tab=guests`
- `/pozivnica/[slug]/portal` → redirect to `/moje-vencanje`
- `/admin/*` protected by middleware

### Error Handling & Observability

- `src/app/error.tsx` — page-level boundary, reports to Sentry, retry + home buttons
- `src/app/global-error.tsx` — root layout error boundary (last resort)
- Sentry: client + server + edge configs, session replay on errors (`replaysOnErrorSampleRate: 1.0`), ~10% performance trace sample
- `src/instrumentation.ts` loads the right Sentry config per runtime
- Vercel Analytics + Speed Insights enabled in root layout

## API Routes

All under `src/app/api/`. Cache header for `/api/*` is `no-store`.

### Admin

| Route                                 | Methods            | Purpose                                |
| ------------------------------------- | ------------------ | -------------------------------------- |
| `/api/admin/auth`                     | POST               | Verify admin password, issue 24h JWT   |
| `/api/admin/couples`                  | GET, POST          | List / create couples                  |
| `/api/admin/couples/[slug]`           | PUT, PATCH, DELETE | Update / cascade-delete couple         |
| `/api/admin/couples/[slug]/images`    | POST               | Upload couple images                   |
| `/api/admin/stats`                    | GET                | RSVP / seating / audio aggregate stats |
| `/api/admin/birthday-stats`           | GET                | Birthday event stats                   |
| `/api/admin/birthdays`                | GET, POST          | Birthday CRUD                          |
| `/api/admin/birthdays/[slug]`         | GET, PATCH         | Individual birthday                    |
| `/api/admin/vendors`                  | GET, POST          | List / create vendor                   |
| `/api/admin/vendors/[id]`             | GET, PATCH, DELETE | Vendor edit                            |
| `/api/admin/vendors/dump`             | GET                | Export vendors as seed data            |
| `/api/admin/vendors/seed`             | POST               | Bulk seed vendors                      |
| `/api/admin/phone-rentals`            | GET, POST          | Phone rental list / create             |
| `/api/admin/phone-rentals/[id]`       | GET, PATCH, DELETE | Individual rental                      |
| `/api/admin/phone-rentals/by-contact` | PATCH              | Update by contact name                 |

### Pozivnica (classic invitation)

| Route                         | Methods | Purpose                                           |
| ----------------------------- | ------- | ------------------------------------------------- |
| `/api/pozivnica/[slug]/rsvp`  | POST    | Submit guest RSVP (deadline-gated)                |
| `/api/pozivnica/[slug]/audio` | POST    | Guest records audio (event-day window, ≤100/slug) |
| `/api/pozivnica/[slug]/audio` | GET     | Admin lists/downloads audio (admin JWT)           |

### Premium Pozivnica

| Route                              | Methods | Purpose                                                      |
| ---------------------------------- | ------- | ------------------------------------------------------------ |
| `/api/premium-pozivnica/create`    | POST    | Create premium couple, auto-password, rate-limited 5/IP/hour |
| `/api/premium-pozivnica/generate`  | POST    | AI couple illustration via Pollinations.ai                   |
| `/api/premium-pozivnica/whiten-bg` | POST    | Background removal via fal.ai birefnet                       |
| `/api/premium-pozivnica/upload`    | POST    | Image upload to Vercel Blob (5MB cap)                        |
| `/api/premium-pozivnica/cleanup`   | POST    | Delete draft generation blobs post-submit                    |

### Auth & Portal

| Route                               | Methods | Purpose                                                        |
| ----------------------------------- | ------- | -------------------------------------------------------------- |
| `/api/auth/[slug]`                  | POST    | Couple potvrde/raspored login                                  |
| `/api/moje-vencanje/auth/[slug]`    | POST    | Portal login (issues both portal + pozivnica cookies)          |
| `/api/deciji-rodjendan/auth/[slug]` | POST    | Birthday dashboard login                                       |
| `/api/portal/[slug]`                | GET     | Read-only portal data (cached `public, max-age=60, stale=300`) |

### Other

| Route                               | Methods | Purpose                    |
| ----------------------------------- | ------- | -------------------------- |
| `/api/qr`                           | GET     | QR code generation         |
| `/api/racun/[slug]`                 | GET     | Receipt / invoice endpoint |
| `/api/deciji-rodjendan/[slug]/rsvp` | POST    | Birthday RSVP submission   |

## Environment Variables

```bash
# Public
NEXT_PUBLIC_SITE_URL="https://halouspomene.rs"
NEXT_PUBLIC_GA_ID="G-..."
NEXT_PUBLIC_CLARITY_ID="..."
NEXT_PUBLIC_WEB3FORMS_KEY="..."

# Server-only
MONGODB_URI="mongodb+srv://..."
ADMIN_PASSWORD="..."             # Admin panel login
JWT_SECRET="..."                 # JWT signing key for all auth flows
BLOB_READ_WRITE_TOKEN="..."      # Vercel Blob storage
FAL_KEY="..."                    # fal.ai birefnet (background removal)
LS_FRIEND_DISCOUNT_CODE_75="..." # RANDOM/unguessable LS 75% discount-code string for friend promo codes (must NOT be memorable — LS codes can be typed directly on the hosted checkout)
LS_FRIEND_DISCOUNT_CODE_50="..." # RANDOM/unguessable LS 50% discount-code string for the 2nd friend tier (same secrecy requirement)
LS_FRIEND_DISCOUNT_CODE_20="..." # RANDOM/unguessable LS 20% discount-code string for the 3rd friend tier (same secrecy requirement)
CONTACT_EMAIL="halouspomene@gmail.com"
```

## Cache / Headers

Configured per-route in `next.config.ts`:

| Route                                                         | Strategy                                             |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `/api/*`                                                      | `no-store`                                           |
| `/pozivnica/*`, `/premium-pozivnica/*`, `/deciji-rodjendan/*` | `no-cache, must-revalidate` (live RSVP/seating data) |
| `/`, `/blog/*`, `/lokacije/*`, `/napravi-pozivnicu/*`, etc.   | `public, max-age=3600, stale-while-revalidate=86400` |
| `/api/portal/[slug]`                                          | `public, max-age=60, stale-while-revalidate=300`     |

## Blog System

- 13+ posts in `src/data/blog/content/*.mdx`, registered in `src/data/blog/posts.ts`
- 5 categories: Vodič, Poređenje, Saveti, Trendovi, Checklista
- Loaded at build time via `fs.readFileSync` in `loadContent()`
- Rendered via `next-mdx-remote` + `remark-gfm` (table support)
- Custom MDX components: `InfoBox` (tip/info), `CtaBlock`
- `BlogClient.tsx` adds search + category filter
- Posts with future `publishDate` are hidden in production, visible in dev
- To add a post: drop `.mdx` in `content/` and add a metadata entry in `posts.ts`

## SEO

- **Sitemap** (`force-static`): homepage, all main marketing pages, all blog posts, all city pages (~32 indexed routes)
- **JSON-LD schemas** in root layout: LocalBusiness, Organization, WebSite (SearchAction). The Google profile is linked via `sameAs` — that is the *only* sanctioned way to point search at our reviews.
- **No `Review` / `AggregateRating` markup anywhere, on any page.** Google treats a rating a business publishes about itself as self-serving and won't render stars for it, so the best case is zero gain; the worst case is a manual action that kills rich results site-wide. Five product pages carried invented ratings until 2026-08-17 (see `src/data/testimonials.ts` for the specifics) — do not reintroduce them, not even with real numbers.
- **Per-page metadata** via Next.js Metadata API (Open Graph, Twitter cards, canonical URLs, multi-city Serbian keywords)
- `robots.ts` disallows `/api`, `/admin`, and all per-couple management routes. **AI bots are deliberately ALLOWED** on marketing pages (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, …) — blocking the search-index and live-fetch crawlers would remove us from AI recommendations, which is the opposite of what we want. Do not "restore" blocking.
- Invitation *designs* are protected by a different mechanism, not by robots.txt: per-couple pages set `robots: { index: false, follow: false }` at the page level, `next.config.ts` sends `X-Robots-Tag: noai, noimageai` on invitation routes, and `<AiCopyrightNotice />` sits in the DOM. That combination is what stops design cloning — see "Invitation Design Copyright Protection" above.
- Google Search Console verified via the `google-site-verification` meta tag

## Analytics

**History that explains the current shape.** GA4 and Clarity were removed on
2026-03-19 in `bd82d0b` ("Improve page speed", ~100KB of third-party JS) and
restored on 2026-08-04. Between those dates the property collected **nothing** —
if you query GA4 for that window and get zeros, that is why, not a broken tag.
The restored implementation is the same one that was removed: `next/script`
with `strategy="afterInteractive"`, so it stays off the critical render path.

Three pieces, all mounted at the end of `<body>` in `src/app/layout.tsx`:

| Component | What it does |
|---|---|
| `analytics/GoogleAnalytics.tsx` | gtag.js. Renders nothing when `NEXT_PUBLIC_GA_ID` is unset |
| `analytics/Clarity.tsx` | Microsoft Clarity session replay |
| `analytics/AnalyticsProvider.tsx` | Custom events gtag can't produce: `cta_click`, `section_view`, `scroll_depth`, `faq_interaction` |

**Do not track page views manually.** Enhanced measurement → *page changes
(History API)* is enabled on the stream, so gtag emits `page_view` on client-side
navigation by itself; adding a manual call double-counts every SPA route change.

**Three invariants `AnalyticsProvider` depends on** — each fails silently, with
no build error and nothing visible in the browser:

1. `Section` must render `<section>`, never `<div>` — the observer selects
   `section[id]`. `src/components/ui/Section.tsx` guarantees this.
2. `CtaButton` must emit `data-track` **plus** `data-track-cta-name` /
   `data-track-cta-location` — clicks are caught by delegation on `[data-track]`.
3. FAQ must stay `<details>`/`<summary>`. The `toggle` event does not bubble, so
   it is listened for in the **capture phase**; a DaisyUI `.collapse` rewrite
   would kill `faq_interaction` again (it already happened once).

Section visibility uses `threshold: [0, 0.1, 0.3]` and counts a section as seen
at 30% of its own height **or** half the viewport. The second clause is load-
bearing: with a bare `threshold: 0.3`, any section taller than ~3.3 viewports
can never reach it, so on phones the tallest sections would simply never report.

**GA4 property `524092885`** (stream `G-XXTC0TP1H0`). Event parameters are
invisible to reports and to the Data API until registered as custom dimensions,
and **registration is not retroactive** — register before you need the data.

- `node scripts/ga4-setup.mjs [--apply]` — registers the 12 custom dimensions
  matching what `src/utils/analytics.ts` sends, marks `form_submit` a key event,
  sets retention to 14 months. Idempotent; dry-run without `--apply`. **Adding a
  new event parameter means adding it here too**, or it is silently unreportable.
  Note GA4 rejects `displayName` containing anything but letters, digits,
  underscore and space — no dashes, no `š/ž/ć/đ/č`.
- `node scripts/analytics-baseline.mjs --days 180 [--json f] [--md f]` — GA4 +
  GSC report: totals vs previous period, queries, pages, devices, plus derived
  "striking distance" (position 11–20) and "good position, poor CTR" lists.

Both scripts authenticate with a **service account** (no OAuth, no gcloud) via
`GOOGLE_APPLICATION_CREDENTIALS`, defaulting to `~/.secrets/halo-analytics.json`.
The same account is wired into the `ga4` and `gsc` MCP servers.

## Adding a New Couple (zero-redeploy workflow)

1. Go to `/admin` → log in
2. Click "Nova pozivnica"
3. Enter slug (e.g. `marija-petar`) and either fill the quick form or paste full wedding JSON
4. Save — couple is live immediately at `/pozivnica/marija-petar`
5. No rebuild needed (`dynamicParams = true`); OG image generates on first request
6. Toggle paid features (`paid_for_raspored`, `paid_for_audio`, etc.) from the admin couple list
7. For premium AI tier: set `premium: true` and (after payment) `premium_paid: true`

## DB Maintenance Scripts (`scripts/`)

MongoDB one-off and reusable scripts, run as `node --env-file=.env.local scripts/<name>.mjs`. Convention: dry-run by default (prints per-collection footprint), `--apply` to actually write.

- **`scripts/rename-couple-slug.mjs <old> <new> [--apply]`** — cascading slug rename across ALL slug-keyed collections (`couples`, `rsvp_responses`, `seating_layouts`, `audio_messages`, `wedding_portal`, `gallery_photos`, `share_links`, `orders`, `promo_redemptions`). ALWAYS use this instead of hand-editing a slug — renaming only `couples` silently orphans everything else. Also invocable as the local `/rename-slug` skill.
- **`scripts/lib/couple-slug.mjs`** — shared helpers: `LINKED_COLLECTIONS` (keep in sync with the DELETE cascade in `src/app/api/admin/couples/[slug]/route.ts` when adding a new slug-keyed collection), `renameCoupleSlug(db, old, new, extraSet?)` (`extraSet` merges extra couple-field fixes into the same write), and `deleteCoupleCascade(db, slug)` (no Vercel Blob / R2 cleanup — for couples with uploads use the admin panel delete instead).
- Past one-off scripts (e.g. `consolidate-andjela-milos.mjs` — keep-one-of-three + rename + field fixes) stay in the repo as reference examples of the pattern.
- After a rename: old URL 404s (re-send link/QR to the couple), login cookies die with the old slug (couple just logs in again), and Blob/R2 asset paths keep the old slug prefix — prefer renaming before assets are uploaded.
