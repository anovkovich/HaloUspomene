# HaloUspomene — Claude Code Context

## Project Overview

**HaloUspomene** (`halouspomene.rs`) is a Serbian wedding invitation SaaS platform. Couples get a personalized digital invitation website, RSVP management, guest seating arrangement tool, and audio guest book service.

## Deployment

**Platform: Vercel** (migrated from GitHub Pages, March 2026)

- **NOT a static export** — `output: 'export'` has been removed from `next.config.ts`
- Server Actions, SSR, and streaming are all available
- Domain: `halouspomene.rs` (custom domain on Vercel, A record → `216.198.79.1`)
- Branch: `deploy` is the production branch
- GitHub Actions workflows (`nextjs.yml`, `weekly-rebuild.yml`) have been deleted — Vercel handles CI/CD

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.0.10 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + DaisyUI 5 (light theme) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | MongoDB Atlas (couples, RSVP, seating) |
| Forms | Web3Forms (contact form) |
| Analytics | GA4 + Microsoft Clarity |
| Auth | `jose` JWT library |
| PDF | jsPDF |
| QR | qrcode |

## Brand / Design Tokens

- **Primary**: `#AE343F` (deep red)
- **Cream**: `#F5F4DC`
- **Charcoal**: `#232323`
- **Gold**: `#d4af37`
- **Fonts**: Cormorant Garamond (headings), Josefin Sans (body), plus decorative script fonts (Great Vibes, Dancing Script, Alex Brush, Parisienne, etc.)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout: fonts, GA4, Clarity, JSON-LD
│   ├── page.tsx                 # Homepage (Hero, Concept, Packages, etc.)
│   ├── sitemap.ts               # Dynamic sitemap
│   ├── robots.ts                # Robots rules + GPTBot disallow
│   ├── manifest.ts              # PWA manifest
│   ├── blog/[slug]/             # Blog post pages (custom MD renderer)
│   ├── lokacije/[city]/         # 5 city landing pages (SEO)
│   ├── napravi-pozivnicu/       # Lead generation questionnaire (Web3Forms)
│   └── pozivnica/[slug]/        # Invitation pages (per-couple)
│       ├── layout.tsx           # EventPassedGuard wrapper for all sub-routes
│       ├── page.tsx             # Main invitation page
│       ├── InvitationClient.tsx # Hero, countdown, RSVP form, seating link
│       ├── EventPassedGuard.tsx # Post-wedding promotional screen
│       ├── translations.ts      # Latin + Cyrillic translation objects
│       ├── constants.ts         # getThemeCSSVariables()
│       ├── types.ts             # WeddingData type (submit_until is ISO YYYY-MM-DD)
│       ├── components/          # ThemeProvider, EnvelopeLoader, Countdown, Timeline
│       ├── gde-sedim/           # Guest seating lookup (public, per-couple)
│       ├── potvrde/             # RSVP management dashboard (password-protected)
│       │   └── actions.ts       # Server actions: refreshResponses, updateGuestCategory
│       └── raspored-sedenja/    # Drag-and-drop seating editor (password-protected)
│           ├── geometry.ts      # Pure geometry helpers (shared with HallMap SVG)
│           ├── generatePDF.ts   # jsPDF export with hall map + QR code
│           └── actions.ts       # Server actions: seating management
├── components/
│   ├── landing/                 # Hero, Concept, HowItWorks, Packages, Gallery, FAQ, ContactForm
│   ├── layout/                  # Navbar, MobileMenu, Footer
│   ├── analytics/               # AnalyticsProvider (GA4 events)
│   └── ui/                      # Breadcrumbs, DatePicker, ScrollReveal
├── data/
│   ├── blog/posts.ts            # Blog registry + loadContent() from .md files
│   ├── blog/content/            # Markdown files (one per post)
│   ├── pozivnice/               # Re-exports from lib/couples.ts (MongoDB facade)
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
```

## Key Patterns

### Rendering Strategy
- **Server components** by default for all `page.tsx` files
- **`use client`** on interactive components (invitation UI, forms, seating editor)
- **`use server`** actions in `potvrde/actions.ts` and `raspored-sedenja/actions.ts`
- `generateStaticParams()` used on blog, lokacije, and pozivnica pages (hybrid ISR)
- `dynamic = "force-static"` on sitemap, robots, manifest

### Data Flow
- All couple data stored in MongoDB Atlas (`halouspomene` database, `couples` collection)
- RSVP responses stored in MongoDB (`rsvp_responses` collection, keyed by slug)
- Seating layouts stored in MongoDB (`seating_layouts` collection, keyed by slug)
- RSVP form on invitation pages POSTs to `/api/pozivnica/[slug]/rsvp`
- Admin panel at `/admin` manages couples via API routes (JWT auth)

### Wedding Data Fields (types.ts)
- `submit_until` — ISO date `YYYY-MM-DD` (form closes end of that day)
- `paid_for_raspored` — boolean, gates seating chart UI and /gde-sedim link on invitation
- `potvrde_password` — optional, password-protects the /potvrde dashboard

### Translations
- Invitation pages support both Latin and Cyrillic Serbian scripts
- `translations.ts` exports `Translations` interface + `latin` and `cyrillic` objects
- Script selection stored in a cookie; `useCyrillic` hook reads it

### Routing
- Navbar uses hash links (`#section`) for homepage, `next/link` for /blog, /lokacije
- Invitation sub-routes: `/pozivnica/[slug]/`, `/pozivnica/[slug]/gde-sedim/`, `/pozivnica/[slug]/potvrde/`, `/pozivnica/[slug]/raspored-sedenja/`
- All `/pozivnica/[slug]/*` routes are wrapped in `EventPassedGuard` via `layout.tsx` — shows "event passed" screen from the day after the wedding

### OG Images
- All `/pozivnica/[slug]/*` pages (main + potvrde + raspored-sedenja + gde-sedim) have `generateMetadata` with the same OG image: `/images/gallery/website-pozivnica.png`

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

- Posts defined in `src/data/blog/posts.ts` with metadata
- Content loaded from `src/data/blog/content/[slug].md` at build time via `fs.readFileSync`
- Custom markdown renderer in `src/app/blog/[slug]/page.tsx` (not MDX)
- Posts with `publishDate` in the future are hidden in production, visible in dev
- To add a post: create `.md` file + add entry to `posts.ts`

## SEO

- **Sitemap**: dynamic, covers homepage, blog posts, location pages, napravi-pozivnicu
- **JSON-LD schemas**: LocalBusiness, Organization, WebSite (SearchAction), Review[], Article, HowTo, Service, FAQPage, BreadcrumbList
- **Keywords**: 193 Serbian wedding-related keywords in root metadata
- `pozivnica/` routes are **disallowed** in robots.txt (private couple data)
- Google Search Console verified via CNAME DNS record (`ppaudg3xydx5`)
