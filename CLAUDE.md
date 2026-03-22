# HaloUspomene — Claude Code Context

## Project Overview

**HaloUspomene** (`halouspomene.rs`) is a Serbian wedding invitation SaaS platform. Couples get a personalized digital invitation website, RSVP management, guest seating arrangement tool, and audio guest book service.

## Deployment

**Platform: Vercel** (migrated from GitHub Pages, March 2026)

- **NOT a static export** — `output: 'export'` has been removed from `next.config.ts`
- Server Actions, SSR, and streaming are all available
- Domain: `halouspomene.rs` (custom domain on Vercel, A record → `216.198.79.1`)
- Branch: `deploy` is the production branch
- Vercel handles CI/CD (no GitHub Actions)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.0.10 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + DaisyUI 5 (light theme) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | MongoDB Atlas (couples, RSVP responses, seating layouts) |
| Error Tracking | Sentry (free tier) |
| Forms | Web3Forms (contact form only) |
| Analytics | GA4 + Microsoft Clarity |
| Auth | `jose` JWT library |
| PDF | jsPDF |
| QR | qrcode |
| Blog | MDX via `next-mdx-remote` + `remark-gfm` |

## Brand / Design Tokens

- **Primary**: `#AE343F` (deep red)
- **Cream**: `#F5F4DC`
- **Charcoal**: `#232323`
- **Gold**: `#d4af37`
- **Fonts**: Cormorant Garamond (headings), Josefin Sans (body), plus decorative script fonts (Great Vibes, Dancing Script, Alex Brush, Parisienne, Allura, Marck Script, Caveat, Bad Script)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout: fonts, GA4, Clarity, JSON-LD
│   ├── page.tsx                 # Homepage (Hero, Concept, Packages, etc.)
│   ├── error.tsx                # Global error boundary (reports to Sentry)
│   ├── global-error.tsx         # Root layout error boundary
│   ├── sitemap.ts               # Dynamic sitemap
│   ├── robots.ts                # Robots rules + GPTBot disallow
│   ├── manifest.ts              # PWA manifest
│   ├── admin/                   # Admin panel (JWT-protected)
│   │   ├── page.tsx             # Couple list, stats, paid_for_raspored toggle
│   │   ├── nova/page.tsx        # Create new couple (JSON editor)
│   │   └── [slug]/page.tsx      # Edit couple, danger delete modal
│   ├── api/
│   │   ├── admin/auth/          # Admin login (JWT cookie)
│   │   ├── admin/couples/       # CRUD + PATCH for couple data
│   │   ├── admin/stats/         # RSVP + seating stats per couple
│   │   ├── auth/[slug]/         # Couple potvrde/raspored password auth
│   │   └── pozivnica/[slug]/rsvp/ # RSVP form submission endpoint
│   ├── blog/
│   │   ├── page.tsx             # Blog listing (server component)
│   │   ├── BlogClient.tsx       # Search + category filter (client component)
│   │   └── [slug]/page.tsx      # Blog post (MDX renderer)
│   ├── lokacije/[city]/         # 5 city landing pages (SEO)
│   ├── napravi-pozivnicu/       # Lead generation questionnaire (Web3Forms)
│   └── pozivnica/[slug]/        # Invitation pages (per-couple)
│       ├── layout.tsx           # EventPassedGuard wrapper
│       ├── page.tsx             # Main invitation page
│       ├── opengraph-image.tsx  # Dynamic OG image (per-couple, theme-aware)
│       ├── fonts/               # 10 .ttf files for OG image generation
│       ├── InvitationClient.tsx # Hero, countdown, RSVP form, seating link
│       ├── EventPassedGuard.tsx # Post-wedding promotional screen
│       ├── translations.ts      # Latin + Cyrillic translation objects
│       ├── constants.tsx        # Theme configs + CSS variable generator
│       ├── types.ts             # WeddingData type
│       ├── components/          # ThemeProvider, EnvelopeLoader, Countdown, Timeline, RSVPForm
│       ├── prijava/             # Password login page for potvrde/raspored
│       ├── gde-sedim/           # Guest seating lookup (public, per-couple)
│       ├── potvrde/             # RSVP management dashboard (password-protected)
│       │   ├── actions.ts       # Server actions: refreshResponses, updateGuestCategory, addManualGuest
│       │   └── PotvrdeClient.tsx # Interactive RSVP list with categories
│       └── raspored-sedenja/    # Drag-and-drop seating editor (password-protected)
│           ├── actions.ts       # Server actions: save (with paid check), load, checkPaidStatus
│           ├── RasporedClient.tsx # Main editor with dynamic paid_for_raspored recheck
│           ├── GuestSidebar.tsx # Guest list with assignment counts
│           ├── Toolbar.tsx      # Save (disabled if unpaid) + PDF download
│           ├── generatePDF.ts   # jsPDF export with hall map + QR code
│           └── geometry.ts      # Pure geometry helpers
├── components/
│   ├── landing/                 # Hero, Concept, HowItWorks, Packages, Gallery, FAQ, ContactForm
│   ├── layout/                  # Navbar, MobileMenu, Footer
│   ├── blog/                    # mdx-components.tsx (InfoBox, CtaBlock, tables)
│   ├── analytics/               # AnalyticsProvider (GA4 events)
│   └── ui/                      # Breadcrumbs, DatePicker, ScrollReveal
├── data/
│   ├── blog/posts.ts            # Blog registry + loadContent() from .mdx files
│   ├── blog/content/            # MDX files (12 posts)
│   ├── blog/types.ts            # BlogPost type (5 categories)
│   ├── pozivnice/index.ts       # Re-exports from lib/couples.ts (MongoDB facade)
│   ├── locations.ts             # 5 cities
│   ├── testimonials.ts
│   └── pricing.ts
├── lib/
│   ├── mongodb.ts               # MongoDB client singleton (HMR-safe)
│   ├── couples.ts               # Couple data CRUD (MongoDB: couples collection)
│   ├── rsvp.ts                  # RSVP data access (MongoDB: rsvp_responses collection)
│   └── seating.ts               # Seating layout access (MongoDB: seating_layouts collection)
└── utils/
    └── analytics.ts             # GA4 event helpers

# Root config files
├── sentry.client.config.ts      # Sentry client init (replay on errors)
├── sentry.server.config.ts      # Sentry server init
├── sentry.edge.config.ts        # Sentry edge init
├── src/instrumentation.ts       # Next.js instrumentation (loads Sentry configs)
├── src/middleware.ts             # JWT auth for admin + couple dashboards
└── next.config.ts               # Wrapped with withSentryConfig
```

## Key Patterns

### Rendering Strategy
- **Server components** by default for all `page.tsx` files
- **`use client`** only on smallest interactive components (not whole pages)
- **`use server`** actions in `potvrde/actions.ts` and `raspored-sedenja/actions.ts`
- `generateStaticParams()` used on blog, lokacije, and pozivnica pages (hybrid ISR)
- `dynamicParams = true` on pozivnica routes (new couples work without rebuild)
- `dynamic = "force-static"` on sitemap, robots, manifest

### Data Flow (MongoDB Atlas)
- **Database**: `halouspomene`
- **Collections**: `couples`, `rsvp_responses`, `seating_layouts`
- All couple data stored in `couples` collection (managed via admin panel)
- RSVP form POSTs to `/api/pozivnica/[slug]/rsvp` → inserts into `rsvp_responses`
- `guestCount` field = total people coming per invitation (not "plus ones")
- Seating assignments use `guestId` (MongoDB ObjectId string) to link to RSVP entries
- Admin panel at `/admin` manages couples via API routes (JWT auth, 24h expiry)
- Deleting a couple cascades: removes from `couples`, `rsvp_responses`, and `seating_layouts`

### Seating Editor Access Control
- `paid_for_raspored` boolean on couple data gates full seating editor
- Client-side: `recheckPaid()` calls server on gated actions (add table at limit, assign 2nd+ seat)
- Server-side: `saveRaspored()` verifies `paid_for_raspored` before saving
- Save button disabled in Toolbar when unpaid; PDF download always enabled
- Only checks DB when hitting a gate (not on every action) for performance

### Auth
- **Admin panel**: `ADMIN_PASSWORD` env var → JWT cookie (`admin_token`, 24h, path `/`)
- **Couple dashboards** (potvrde/raspored): `potvrde_password` per couple → JWT cookie (8h)
- Delete action requires re-entering admin password + typing slug to confirm

### OG Images
- Dynamic per-couple OG image via `opengraph-image.tsx` (Next.js Image Generation API)
- Uses couple's chosen `scriptFont` for names, Josefin Sans for wordmark, Cormorant Garamond for date
- Theme-aware: heart icon and accent line use couple's theme primary color
- 10 font files stored locally in `src/app/pozivnica/[slug]/fonts/`
- Auto-applies to all sub-routes (potvrde, gde-sedim, raspored-sedenja)

### Translations
- Invitation pages support both Latin and Cyrillic Serbian scripts
- `translations.ts` exports `Translations` interface + `latin` and `cyrillic` objects
- Script selection stored in a cookie; `useCyrillic` field on couple data

### Routing
- Navbar uses hash links (`#section`) for homepage, `next/link` for /blog, /lokacije
- Invitation sub-routes: `/pozivnica/[slug]/`, `/pozivnica/[slug]/gde-sedim/`, `/pozivnica/[slug]/potvrde/`, `/pozivnica/[slug]/raspored-sedenja/`
- All `/pozivnica/[slug]/*` routes are wrapped in `EventPassedGuard` via `layout.tsx`
- `/admin` routes protected by JWT middleware

### Error Handling
- `src/app/error.tsx` — page-level error boundary, reports to Sentry, shows retry + home buttons
- `src/app/global-error.tsx` — root layout error boundary (last resort)
- Sentry captures client + server errors with email alerts
- Session replay enabled on errors (replaysOnErrorSampleRate: 1.0)
- Performance tracing at 10% sample rate

## Environment Variables

```bash
# Public
NEXT_PUBLIC_SITE_URL="https://halouspomene.rs"
NEXT_PUBLIC_GA_ID="G-..."
NEXT_PUBLIC_CLARITY_ID="..."
NEXT_PUBLIC_WEB3FORMS_KEY="..."

# Server-only
MONGODB_URI="mongodb+srv://..."
ADMIN_PASSWORD="..."           # Admin panel login
JWT_SECRET="..."               # JWT signing key for admin auth
CONTACT_EMAIL="halouspomene@gmail.com"
```

## Cache / Headers

Configured per-route in `next.config.ts`:

| Route | Strategy |
|-------|----------|
| `/api/*` | `no-store` |
| `/pozivnica/*` | `no-cache, must-revalidate` (RSVP/seating data changes live) |
| `/`, `/blog/*`, `/lokacije/*`, `/napravi-pozivnicu/*` | `public, max-age=3600, stale-while-revalidate=86400` |

## Blog System

- Posts defined in `src/data/blog/posts.ts` with metadata (5 categories: Vodič, Poređenje, Saveti, Trendovi, Checklista)
- Content loaded from `src/data/blog/content/[slug].mdx` at build time via `fs.readFileSync`
- MDX rendered via `next-mdx-remote` with `remark-gfm` (table support)
- Custom components: `InfoBox` (tip/info variants), `CtaBlock` (call-to-action)
- Client-side search + category filtering via `BlogClient.tsx`
- Posts with `publishDate` in the future are hidden in production, visible in dev
- To add a post: create `.mdx` file + add entry to `posts.ts`

## SEO

- **Sitemap**: dynamic, covers homepage, blog posts, location pages, napravi-pozivnicu
- **JSON-LD schemas**: LocalBusiness, Organization, WebSite (SearchAction), Review[], Article, HowTo, Service, FAQPage, BreadcrumbList
- **Keywords**: 193 Serbian wedding-related keywords in root metadata
- `pozivnica/` and `admin/` routes are **disallowed** in robots.txt
- Google Search Console verified via CNAME DNS record (`ppaudg3xydx5`)

## Adding a New Couple (zero-redeploy workflow)

1. Go to `/admin` → login
2. Click "Nova pozivnica"
3. Enter slug (e.g. `marija-petar`) and paste wedding JSON
4. Save — couple is live immediately at `/pozivnica/marija-petar`
5. No rebuild needed (`dynamicParams = true`)
6. OG image generates on first request
