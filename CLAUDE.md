# HaloUspomene — Claude Code Context

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
- Production branch: `deploy` (Vercel handles CI/CD; no GitHub Actions)
- `next.config.ts` is wrapped with `withSentryConfig` and sets per-route cache headers
- `trailingSlash: true`

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.0.10 (App Router, Turbopack) |
| Runtime | React 19.2 |
| Styling | Tailwind CSS v4 + DaisyUI 5 (light theme) |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Database | MongoDB Atlas (`halouspomene` DB) |
| File Storage | Vercel Blob (`@vercel/blob`) — audio messages, premium images, custom uploads |
| Error Tracking | Sentry (`@sentry/nextjs`, free tier, replay on errors) |
| Forms (lead-gen) | Web3Forms |
| Analytics | GA4 + Microsoft Clarity + Vercel Analytics + Vercel Speed Insights |
| Auth | `jose` JWT library |
| PDF | jsPDF (invitations, seating charts, audio flyers) |
| QR | qrcode |
| Drag & drop | react-draggable (seating editor) |
| Toasts | sonner |
| Blog | MDX via `next-mdx-remote` + `remark-gfm` |
| AI image gen | Pollinations.ai (text→image), fal.ai birefnet (background removal) |

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
│   ├── page.tsx                      # Homepage (Hero, Concept, Packages, etc.)
│   ├── error.tsx / global-error.tsx  # Error boundaries (report to Sentry)
│   ├── not-found.tsx                 # 404 page
│   ├── sitemap.ts                    # Static sitemap (force-static)
│   ├── robots.ts                     # Robots rules (GPTBot, ChatGPT-User, anthropic-ai disallow)
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
│   │   └── raspored-sedenja/         # Drag-and-drop seating editor
│   │       ├── actions.ts            # saveRaspored, loadRaspored, checkPaidStatus
│   │       ├── RasporedClient.tsx    # Editor with paid_for_raspored re-check
│   │       ├── GuestSidebar.tsx / Toolbar.tsx
│   │       ├── generatePDF.ts        # PDF export with hall map + QR
│   │       └── geometry.ts           # Pure geometry helpers
│   │
│   ├── premium-pozivnica/[slug]/     # PREMIUM AI invitation
│   │   ├── layout.tsx                # 7-day grace-period guard
│   │   ├── page.tsx                  # 2-minute preview lock logic
│   │   ├── PremiumInvitationClient.tsx  # Theme router
│   │   ├── PremiumLockedScreen.tsx   # Paywall after preview window
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
│   ├── landing/                      # Hero, Concept, HeroInfoBadge, HowItWorks, Packages, Testimonials, FAQ, ContactForm
│   ├── layout/                       # Navbar, MobileMenu, Footer
│   ├── blog/                         # mdx-components.tsx (InfoBox, CtaBlock, tables)
│   ├── analytics/                    # AnalyticsProvider (GA4 events)
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
  - `site_config` — admin globals (e.g. highlighted vendor IDs)
  - Birthday-equivalent collections for `/deciji-rodjendan`
- All CRUD goes through `src/lib/*.ts` facades — never read collections directly from API/page code
- Deleting a couple cascades across `couples`, `rsvp_responses`, `seating_layouts`, `audio_messages` (with blob cleanup), and `wedding_portal`

### Couple Data Shape (`WeddingData`)
Lives at `src/app/pozivnica/[slug]/types.ts`. Selected fields:

**Core:** `theme`, `scriptFont`, `useCyrillic`, `couple_names`, `event_date`, `submit_until`, `potvrde_password` (format: `GroomNameDDMM`).

**Paid features (admin toggles):**
- `paid_for_raspored` — unlocks seating editor + `/gde-sedim` lookup
- `paid_for_audio` — unlocks audio guest book recording
- `paid_for_audio_USB`: `"" | "kaseta" | "bocica"` — physical souvenir type
- `paid_for_pdf` — watermark-free PDF export
- `paid_for_images` — photo gallery
- `draft` — hides invitation in production

**Premium AI fields:** `premium`, `premium_paid`, `premium_theme` (`"watercolor" | "line_art"`), `premium_created_at` (ISO — drives 2-minute preview lock), `ai_couple_image_url`, `envelope_items[]`, `envelope_style` (`"classic" | "wing"`), `envelope_rose_petals`, `premium_city`, `premium_car`, `couple_description`.

**Receipt/billing:** `receipt_valid`, `receipt_created`, `custom_discount`, bank account selector (Erste / UniCredit).

### Premium Invitation System
- Created via `POST /api/premium-pozivnica/create` (rate-limited 5 / IP / hour); auto-generates password as `{Groom}DDMM`, sets `premium: true, premium_paid: false, premium_created_at`.
- AI couple illustration via `POST /api/premium-pozivnica/generate` → Pollinations.ai (text-to-image, paper-craft prompt).
- Background removal via `POST /api/premium-pozivnica/whiten-bg` → fal.ai birefnet queue API (requires `FAL_KEY`), polls up to 60s.
- Custom uploads via `POST /api/premium-pozivnica/upload` → Vercel Blob (5MB, image MIME validation).
- Cleanup via `POST /api/premium-pozivnica/cleanup` after submission to remove draft generations from blob storage.
- Blob layout: `premium/results/{couple}/`, `premium/whitened/{slug}/`, `premium/uploads/`.
- Page enforces a **2-minute preview window** from `premium_created_at`, then redirects to `PremiumLockedScreen` until `premium_paid` is true.
- Layout enforces a **7-day post-event grace period**.
- Premium pages set `robots: { index: false }` (not indexed).
- All client themes use `dynamic(..., { ssr: false })` for animation-heavy components.

### Seating Editor Access Control
- `paid_for_raspored` boolean gates the full editor.
- Client-side `recheckPaid()` calls server when hitting a gate (adding a table at the limit, assigning a 2nd+ seat).
- Server-side `saveRaspored()` re-verifies `paid_for_raspored` before persisting.
- Save button disabled in `Toolbar` when unpaid; PDF download is always enabled.
- Only checks the DB at gate boundaries (not on every action) for performance.

### Auth
| Surface | Cookie | TTL | Source |
|---------|--------|-----|--------|
| Admin panel | `admin_token` | 24h | `ADMIN_PASSWORD` env var |
| Couple invitation dashboards (potvrde, raspored) | `auth_${slug}` | 8h | `potvrde_password` field |
| Moje Venčanje portal | `moje_vencanje_auth` (JWT) + `moje_vencanje_slug` (JS-readable) | 480 days | `potvrde_password` field |
| Birthday dashboard | `auth_birthday_${slug}` | 8h | birthday password field |

- All JWTs use `jose` and `JWT_SECRET`
- `src/middleware.ts` enforces admin/couple/birthday route protection
- Login routes: `/api/admin/auth`, `/api/auth/[slug]`, `/api/moje-vencanje/auth/[slug]`, `/api/deciji-rodjendan/auth/[slug]`
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
- Max 100 recordings per slug
- Format: WebM, ≤60s, ≤2MB
- Blobs in Vercel Blob, metadata in `audio_messages` collection
- Admin can download all messages or merge into a single WAV via portal Audio view

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
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/auth` | POST | Verify admin password, issue 24h JWT |
| `/api/admin/couples` | GET, POST | List / create couples |
| `/api/admin/couples/[slug]` | PUT, PATCH, DELETE | Update / cascade-delete couple |
| `/api/admin/couples/[slug]/images` | POST | Upload couple images |
| `/api/admin/stats` | GET | RSVP / seating / audio aggregate stats |
| `/api/admin/birthday-stats` | GET | Birthday event stats |
| `/api/admin/birthdays` | GET, POST | Birthday CRUD |
| `/api/admin/birthdays/[slug]` | GET, PATCH | Individual birthday |
| `/api/admin/vendors` | GET, POST | List / create vendor |
| `/api/admin/vendors/[id]` | GET, PATCH, DELETE | Vendor edit |
| `/api/admin/vendors/dump` | GET | Export vendors as seed data |
| `/api/admin/vendors/seed` | POST | Bulk seed vendors |
| `/api/admin/phone-rentals` | GET, POST | Phone rental list / create |
| `/api/admin/phone-rentals/[id]` | GET, PATCH, DELETE | Individual rental |
| `/api/admin/phone-rentals/by-contact` | PATCH | Update by contact name |

### Pozivnica (classic invitation)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/pozivnica/[slug]/rsvp` | POST | Submit guest RSVP (deadline-gated) |
| `/api/pozivnica/[slug]/audio` | POST | Guest records audio (event-day window, ≤100/slug) |
| `/api/pozivnica/[slug]/audio` | GET | Admin lists/downloads audio (admin JWT) |

### Premium Pozivnica
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/premium-pozivnica/create` | POST | Create premium couple, auto-password, rate-limited 5/IP/hour |
| `/api/premium-pozivnica/generate` | POST | AI couple illustration via Pollinations.ai |
| `/api/premium-pozivnica/whiten-bg` | POST | Background removal via fal.ai birefnet |
| `/api/premium-pozivnica/upload` | POST | Image upload to Vercel Blob (5MB cap) |
| `/api/premium-pozivnica/cleanup` | POST | Delete draft generation blobs post-submit |

### Auth & Portal
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[slug]` | POST | Couple potvrde/raspored login |
| `/api/moje-vencanje/auth/[slug]` | POST | Portal login (issues both portal + pozivnica cookies) |
| `/api/deciji-rodjendan/auth/[slug]` | POST | Birthday dashboard login |
| `/api/portal/[slug]` | GET | Read-only portal data (cached `public, max-age=60, stale=300`) |

### Other
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/qr` | GET | QR code generation |
| `/api/racun/[slug]` | GET | Receipt / invoice endpoint |
| `/api/deciji-rodjendan/[slug]/rsvp` | POST | Birthday RSVP submission |

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
CONTACT_EMAIL="halouspomene@gmail.com"
```

## Cache / Headers

Configured per-route in `next.config.ts`:

| Route | Strategy |
|-------|----------|
| `/api/*` | `no-store` |
| `/pozivnica/*`, `/premium-pozivnica/*`, `/deciji-rodjendan/*` | `no-cache, must-revalidate` (live RSVP/seating data) |
| `/`, `/blog/*`, `/lokacije/*`, `/napravi-pozivnicu/*`, etc. | `public, max-age=3600, stale-while-revalidate=86400` |
| `/api/portal/[slug]` | `public, max-age=60, stale-while-revalidate=300` |

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
- **JSON-LD schemas** in root layout: LocalBusiness, Organization, WebSite (SearchAction), Review (from testimonials)
- **Per-page metadata** via Next.js Metadata API (Open Graph, Twitter cards, canonical URLs, multi-city Serbian keywords)
- `robots.ts` disallows `/api`, `/admin`, all per-couple management routes, and bot user-agents `GPTBot`, `ChatGPT-User`, `Google-Extended`, `anthropic-ai`
- Google Search Console verified via the `google-site-verification` meta tag

## Adding a New Couple (zero-redeploy workflow)

1. Go to `/admin` → log in
2. Click "Nova pozivnica"
3. Enter slug (e.g. `marija-petar`) and either fill the quick form or paste full wedding JSON
4. Save — couple is live immediately at `/pozivnica/marija-petar`
5. No rebuild needed (`dynamicParams = true`); OG image generates on first request
6. Toggle paid features (`paid_for_raspored`, `paid_for_audio`, etc.) from the admin couple list
7. For premium AI tier: set `premium: true` and (after payment) `premium_paid: true`
