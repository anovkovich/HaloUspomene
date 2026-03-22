# Deciji Rodjendan — Full Implementation Plan

## Overview

Add children's birthday party invitation support to HaloUspomene as a fully parallel feature.
Zero changes to wedding code. Replicates all existing SEO, security, caching, and auth patterns exactly.

**Route:** `/deciji-rodjendan/[slug]/`
**Lead gen page:** `/napravi-deciju-pozivnicu/`
**Admin:** Tabbed into existing `/admin` page
**MongoDB:** `birthday_events` + `birthday_rsvp` collections (same `halouspomene` DB)

---

## Phase 1: Data Layer

### 1.1 — Types (`src/app/deciji-rodjendan/[slug]/types.ts`)

```typescript
export type BirthdayGender = "boy" | "girl" | "neutral";

export type BirthdayThemeType =
  | "boy_adventure"     // sky blue + orange, rockets/mountains
  | "boy_animals"       // forest green + brown, safari animals
  | "boy_space"         // deep blue + purple, stars/planets
  | "girl_fairy"        // pink + lavender, butterflies/flowers
  | "girl_princess"     // blush + gold, crowns/sparkles
  | "girl_rainbow"      // pastel pink + blue, pastel rainbow
  | "neutral_safari"    // sand + green, animals
  | "neutral_circus"    // red + yellow, stars/stripes
  | "neutral_rainbow";  // bright red + teal, rainbow confetti

export type BirthdayFontType =
  | "fredoka"           // Rounded, modern
  | "bubblegum-sans"    // Bubbly, fun
  | "baloo-2"           // Friendly, rounded (supports Cyrillic)
  | "patrick-hand"      // Handwritten kids style
  | "chewy";            // Chunky, playful

export interface BirthdayData {
  theme: BirthdayThemeType;
  gender: BirthdayGender;
  displayFont?: BirthdayFontType;
  child_name: string;
  parent_names: string;           // "Mama Ana i tata Petar"
  age: number;                    // 1-5
  event_date: string;             // ISO datetime
  submit_until: string;           // ISO date
  tagline?: string;               // "Naša mala zvezda slavi prvi rođendan!"
  location: {
    name: string;
    address: string;
    map_url?: string;
  };
  countdown_enabled: boolean;
  map_enabled: boolean;
  admin_password?: string;        // Password for RSVP management
  draft?: boolean;
}

export interface BirthdayThemeConfig {
  name: string;
  gender: BirthdayGender;
  colors: {
    primary: string;
    primaryLight: string;
    primaryMuted: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    textLight: string;
    border: string;
    confetti: string[];           // 4-5 confetti colors for animations
  };
  illustration: string;           // SVG illustration set key
}
```

### 1.2 — MongoDB Data Access (`src/lib/birthday.ts`)

Mirrors `src/lib/couples.ts` pattern exactly:

```
col() → clientPromise → db("halouspomene").collection("birthday_events")

getBirthdayData(slug): Promise<BirthdayData | null>
getAllBirthdaySlugs(): Promise<string[]>
getAllBirthdays(): Promise<BirthdayDocument[]>
upsertBirthday(slug, data): Promise<void>
deleteBirthday(slug): Promise<void>  // cascades: birthday_events + birthday_rsvp
patchBirthday(slug, updates): Promise<void>
```

### 1.3 — Birthday RSVP Data Access (`src/lib/birthday-rsvp.ts`)

Mirrors `src/lib/rsvp.ts` — simpler schema:

```
Collection: "birthday_rsvp"
Fields: slug, timestamp, name, attending ("Da"/"Ne"), guestCount, message?

getBirthdayRSVP(slug): Promise<BirthdayRSVPEntry[]>
addBirthdayRSVP(slug, data): Promise<void>
deleteBirthdayRSVPs(slug): Promise<void>
```

### 1.4 — Data Facade (`src/data/rodjendani/index.ts`)

Re-exports from `src/lib/birthday.ts` (mirrors `src/data/pozivnice/index.ts`).

---

## Phase 2: Theme System

### 2.1 — Birthday Theme Configs (`src/app/deciji-rodjendan/[slug]/constants.tsx`)

9 themes with 2-accent color system + confetti array:

**Boy themes:**
| Theme | Primary | Secondary | Illustrations |
|-------|---------|-----------|---------------|
| `boy_adventure` | `#4ECDC4` sky blue | `#FF6B35` orange | Rockets, mountains |
| `boy_animals` | `#2D6A4F` forest green | `#8B5E3C` brown | Safari animals |
| `boy_space` | `#1B2838` deep blue | `#7B68EE` purple | Stars, planets |

**Girl themes:**
| Theme | Primary | Secondary | Illustrations |
|-------|---------|-----------|---------------|
| `girl_fairy` | `#FF6B9D` pink | `#C084FC` lavender | Butterflies, flowers |
| `girl_princess` | `#FFB6C1` blush | `#FFD700` gold | Crowns, sparkles |
| `girl_rainbow` | `#FFB3BA` pastel pink | `#BAE1FF` pastel blue | Pastel rainbow |

**Neutral themes:**
| Theme | Primary | Secondary | Illustrations |
|-------|---------|-----------|---------------|
| `neutral_safari` | `#DDA15E` sand | `#606C38` green | Animals |
| `neutral_circus` | `#E63946` red | `#FFD60A` yellow | Stars, stripes |
| `neutral_rainbow` | `#FF6B6B` bright red | `#4ECDC4` teal | Rainbow confetti |

Each theme exports:
- `getThemeCSSVariables()` → CSS custom properties (`--birthday-primary`, `--birthday-secondary`, `--birthday-radius: 1.25rem`)
- `getThemeConfig()` → full config object
- `BIRTHDAY_THEME_CONFIGS` map
- `BIRTHDAY_FONT_CONFIGS` map

### 2.2 — Birthday Fonts (in `src/app/deciji-rodjendan/layout.tsx`)

Load via `next/font/google` in birthday-specific layout (NOT root layout):
- Fredoka — `display: "swap"`, `subsets: ["latin", "latin-ext"]`
- Bubblegum Sans — same
- Baloo 2 — `subsets: ["latin", "cyrillic"]`
- Patrick Hand — `subsets: ["latin", "latin-ext"]`
- Chewy — same

Applied as CSS variables on birthday layout wrapper div.

### 2.3 — Birthday ThemeProvider (`src/app/deciji-rodjendan/[slug]/components/ThemeProvider.tsx`)

Same pattern as wedding ThemeProvider but with birthday types and CSS variables.

---

## Phase 3: Route Structure & Pages

### 3.1 — Birthday Layout (`src/app/deciji-rodjendan/layout.tsx`)

- Imports 5 birthday fonts
- Wraps children in div with font CSS variables
- No navbar/footer (standalone invitation pages)

### 3.2 — Slug Layout (`src/app/deciji-rodjendan/[slug]/layout.tsx`)

Mirrors `pozivnica/[slug]/layout.tsx` exactly:
- Fetch `getBirthdayData(slug)`
- Draft check → `notFound()` in production
- Wrap in `BirthdayPassedGuard`

### 3.3 — Main Invitation Page (`src/app/deciji-rodjendan/[slug]/page.tsx`)

```typescript
export const dynamicParams = true;  // New events work without rebuild

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  // ...
  return {
    title: `${data.child_name} slavi ${data.age}. rođendan!`,
    description: `Pozivnica za ${data.age}. rođendan - ${data.child_name}`,
    robots: { index: false, follow: false },  // CRITICAL: Private, don't index
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

### 3.4 — BirthdayClient.tsx (`src/app/deciji-rodjendan/[slug]/BirthdayClient.tsx`)

Sections:
1. **Hero** — Child name in large playful font, age badge (big colorful circle/star), themed SVG illustrations, parent names subtitle
2. **Countdown** — Rounded colorful time boxes with playful typography
3. **Details Card** — Date, time, location in one fun card
4. **Map** — iframe if `map_enabled`
5. **RSVP Form** — Simplified: name, Da/Ne with fun icons, guest count +/-, optional message, confetti on submit
6. **Footer** — Child name + HaloUspomene branding

Animated entrance: confetti burst or balloon float-up via Framer Motion (no envelope loader).

### 3.5 — SVG Illustrations (`src/app/deciji-rodjendan/[slug]/components/Illustrations.tsx`)

Pure inline SVGs colored via CSS variables. Components:
- `Balloons`, `Confetti`, `Stars`, `Animals`, `Cake`, `Crown`, `Rocket`, `Butterfly`, `Rainbow`
- CSS `@keyframes` animations (floating, bouncing, rotating)
- Used as decorative overlays in Hero, section dividers, backgrounds

### 3.6 — Countdown (`src/app/deciji-rodjendan/[slug]/components/Countdown.tsx`)

Same logic as wedding countdown, styled with rounded colorful boxes and playful font.

### 3.7 — RSVP Form (`src/app/deciji-rodjendan/[slug]/components/BirthdayRSVPForm.tsx`)

- Fields: name (required), attending (Da/Ne with fun icons), guest count (+/- buttons), optional message
- Posts to `/api/deciji-rodjendan/[slug]/rsvp`
- Confetti animation on successful submit

### 3.8 — BirthdayPassedGuard (`src/app/deciji-rodjendan/[slug]/EventPassedGuard.tsx`)

Simpler than wedding version. "Proslava je završena!" with fun illustration and HaloUspomene CTA.

---

## Phase 4: API Endpoints

### 4.1 — Birthday RSVP (`src/app/api/deciji-rodjendan/[slug]/rsvp/route.ts`)

POST handler — mirrors `/api/pozivnica/[slug]/rsvp/route.ts`:
- Validate slug exists via `getBirthdayData()`
- Check deadline (`submit_until`)
- Validate body
- Call `addBirthdayRSVP()`
- No auth required (public)

### 4.2 — Birthday Auth (`src/app/api/deciji-rodjendan/auth/[slug]/route.ts`)

POST handler — mirrors `/api/auth/[slug]/route.ts`:
- Check `admin_password` on birthday event
- Issue JWT cookie: `auth_birthday_${slug}`, 8h expiry, path `/`, HttpOnly
- Uses `jose` library, same `JWT_SECRET`

### 4.3 — Admin Birthday CRUD (`src/app/api/admin/birthdays/route.ts`)

- GET: all birthdays (admin auth required via `isAdmin()` pattern)
- POST: create new birthday event

### 4.4 — Admin Birthday Single (`src/app/api/admin/birthdays/[slug]/route.ts`)

- PUT: replace
- PATCH: partial update
- DELETE: cascade delete from `birthday_events` + `birthday_rsvp`

### 4.5 — Admin Birthday Stats (`src/app/api/admin/birthday-stats/route.ts`)

- GET: RSVP stats per event (attending, declined, total guests)

---

## Phase 5: RSVP Management Dashboard (Portal)

### 5.1 — Portal Page (`src/app/deciji-rodjendan/[slug]/portal/page.tsx`)

Server component, fetches RSVP data, renders `BirthdayPortalClient`.

### 5.2 — Portal Client (`src/app/deciji-rodjendan/[slug]/portal/BirthdayPortalClient.tsx`)

Simpler than wedding potvrde (no guest categories):
- Guest list: name, attending status, guest count, message, timestamp
- Summary stats: total attending, total guests, total declined
- Birthday-themed styling

### 5.3 — Login Page (`src/app/deciji-rodjendan/[slug]/prijava/page.tsx` + `PrijavaClient.tsx`)

Mirrors wedding prijava exactly:
- Server component fetches data, generates theme CSS vars
- `searchParams.next` for redirect after login (default: `/deciji-rodjendan/${slug}/portal`)
- Birthday-themed styling (party icon instead of lock)

---

## Phase 6: Lead Gen Questionnaire (`/napravi-deciju-pozivnicu`)

### 6.1 — Page (`src/app/napravi-deciju-pozivnicu/page.tsx`)

Server component with full SEO metadata:

```typescript
export const metadata: Metadata = {
  title: "Napravi Pozivnicu za Dečiji Rođendan | Digitalna Pozivnica za Proslavu",
  description: "Napravite šarenu digitalnu pozivnicu za dečiji rođendan. Izaberite temu za dečaka ili devojčicu, dodajte RSVP formu i podelite sa gostima.",
  keywords: [
    "pozivnica za dečiji rođendan",
    "digitalna pozivnica rođendan",
    "online pozivnica za prvi rođendan",
    "pozivnica za dečiji rođendan online",
    "pozivnica za rođendan deteta",
    ...
  ],
  openGraph: { ... },
  alternates: { canonical: "/napravi-deciju-pozivnicu" },
};
```

Layout: `Header` + main content + `Footer` (same as `/napravi-pozivnicu`).

Hidden SEO content block (same `sr-only` pattern as wedding page).

### 6.2 — Questionnaire Form (`src/app/napravi-deciju-pozivnicu/BirthdayQuestionnaireForm.tsx`)

4 steps (simpler than wedding's 6):

**Step 1 — Informacije o detetu:**
- Child name (text input)
- Parent names (text input, placeholder: "Mama Ana i tata Petar")
- Age selector (1-5, default 1)
- Boy / Girl / Neutral selector (3 buttons with fun icons)
- Pricing info box (birthday pricing)

**Step 2 — Datum i lokacija:**
- Party date (DatePicker)
- Party time (TimePicker)
- RSVP deadline (DatePicker)
- Location name (text input, placeholder: "Igraonica Jungle")
- Location address (text input)
- Contact phone (+381 prefix)

**Step 3 — Dizajn:**
- Gender-filtered theme picker (show only themes matching selected gender, + neutral always visible)
- Font picker (dropdown, 5 birthday fonts)
- Live preview: child name in playful font + age badge + colorful background (no hearts, no bride/groom)

**Step 4 — Poslednji korak:**
- Tagline (textarea, placeholder: "Naša mala zvezda slavi prvi rođendan!")
- Countdown toggle
- Map toggle
- Notes textarea
- Submit button

**Reusable from wedding form (import or duplicate):**
- `Field`, `TextInput`, `Toggle`, `StepHeading` UI helpers
- `DatePicker` component (already in `@/components/ui/`)
- `TimePicker` component (copy from wedding form, ~40 lines)
- Progress bar + step navigation + AnimatePresence animation
- Web3Forms submission flow

**Birthday-specific preview component:**
- Colorful background from selected theme
- Child name in selected birthday font
- Age number in a big colorful circle/star
- "Preview" badge (same pattern as wedding)
- Decorative elements (simple SVG balloons/confetti colored by theme)
- No hearts, no bride/groom pattern

**Submission payload:**
```typescript
{
  access_key: WEB3FORMS_ACCESS_KEY,
  subject: `Novi Rođendan - ${childName} (${age}. rođendan)`,
  from_name: "Halo Rođendani",
  "Ime deteta": childName,
  "Roditelji": parentNames,
  "Uzrast": `${age}. rođendan`,
  "Pol": gender,
  "Datum proslave": formattedDate,
  "Lokacija": `${locationName}, ${locationAddress}`,
  "Rok za prijavu": deadline,
  "Kontakt telefon": phone,
  "📋 JSON": generateBirthdayJson(formData),
}
```

**Success screen:**
Fun birthday-themed success (cake/balloons instead of checkmark):
- "Hvala! Pozivnica za [child_name] će biti gotova uskoro!"
- Party date display

---

## Phase 7: Admin Panel Extension

### 7.1 — Tab Switcher in Admin Page

Modify `src/app/admin/page.tsx` (shared infrastructure, not wedding code):
- Add tab state: `"pozivnice" | "rodjendani"`
- Tab bar at top with two buttons
- Conditionally render existing couple list OR `<BirthdayAdminList />`
- Existing JSX stays identical, just conditionally rendered

### 7.2 — Birthday Admin List (`src/app/admin/BirthdayAdminList.tsx`)

- Fetch from `/api/admin/birthdays` + `/api/admin/birthday-stats`
- List: child name, parent names, event date, theme, gender badge, days until
- Actions: view, edit, delete
- "Novi rođendan" button → `/admin/novi-rodjendan`

### 7.3 — Create Birthday (`src/app/admin/novi-rodjendan/page.tsx`)

Same JSON editor pattern as `/admin/nova/page.tsx`.
Birthday-specific JSON template. URL shows `/deciji-rodjendan/`.

### 7.4 — Edit Birthday (`src/app/admin/rodjendan/[slug]/page.tsx`)

Same pattern as `/admin/[slug]/page.tsx`. Delete modal with cascade.

---

## Phase 8: Middleware & Auth (modify `src/middleware.ts`)

Add birthday route protection alongside existing wedding patterns:

```typescript
// New regex match (alongside existing pozivnica match):
const birthdayMatch = pathname.match(
  /^\/deciji-rodjendan\/([^/]+)\/(portal)(\/|$)/
);

if (birthdayMatch) {
  const slug = birthdayMatch[1];
  const cookie = request.cookies.get(`auth_birthday_${slug}`);
  // ... same JWT verify pattern ...
  // Redirect to: /deciji-rodjendan/${slug}/prijava?next=${next}
}
```

Add to `config.matcher`:
```typescript
"/deciji-rodjendan/:slug/portal",
"/deciji-rodjendan/:slug/portal/:path*",
```

---

## Phase 9: OG Image (`src/app/deciji-rodjendan/[slug]/opengraph-image.tsx`)

Same `ImageResponse` API pattern:

```typescript
export const alt = "Rođendanska pozivnica - HaloUspomene";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}
```

Design:
- Bright background from theme colors
- Child name in playful font (large)
- Age number in colorful circle/badge
- Simple SVG balloons/confetti (inline, themed colors)
- Parent names below
- Date at bottom
- `halouspomene.rs` wordmark

Font files: store `Fredoka-Regular.ttf` in `src/app/deciji-rodjendan/[slug]/fonts/`.

Fallback image for missing slugs.

---

## Phase 10: SEO, Robots, Sitemap, Cache, Security

### 10.1 — Robots (`src/app/robots.ts`)

Add to ALL user-agent disallow list:
```
"/deciji-rodjendan/*/portal"
"/deciji-rodjendan/*/portal/*"
"/deciji-rodjendan/*/prijava"
"/api/deciji-rodjendan/"
```

Add to AI bot (GPTBot, etc.) allow list:
```
"/napravi-deciju-pozivnicu"
```

Keep `/deciji-rodjendan/[slug]/` crawlable for OG preview (same as recent `pozivnica/[slug]` decision).

### 10.2 — Sitemap (`src/app/sitemap.ts`)

Add entry for the lead gen page:
```typescript
{
  url: `${siteUrl}/napravi-deciju-pozivnicu`,
  lastModified,
  changeFrequency: "monthly",
  priority: 0.8,
}
```

Do NOT add individual `/deciji-rodjendan/[slug]` entries (private events, same as pozivnica).

### 10.3 — Cache Headers (`next.config.ts`)

Add two rules:
```typescript
{
  source: "/deciji-rodjendan/(.*)",
  headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
},
{
  source: "/napravi-deciju-pozivnicu/(.*)",
  headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
},
```

### 10.4 — Root Layout Keywords (`src/app/layout.tsx`)

Add birthday-related keywords to existing `metadata.keywords` array:
```
"pozivnica za dečiji rođendan", "digitalna pozivnica rođendan",
"online pozivnica za prvi rođendan", "pozivnica za rođendan deteta",
"pozivnica za prvi rođendan", "dečiji rođendan pozivnica online"
```

### 10.5 — Security Checklist

- [ ] JWT cookie for birthday portal: `auth_birthday_${slug}`, HttpOnly, 8h, path `/`
- [ ] Admin endpoints: require `isAdmin()` check (same JWT pattern)
- [ ] RSVP endpoint: validate slug exists, check deadline, sanitize input
- [ ] Delete cascade: remove from both `birthday_events` AND `birthday_rsvp`
- [ ] Draft mode: `notFound()` in production
- [ ] `robots: { index: false, follow: false }` on all `/deciji-rodjendan/[slug]` pages
- [ ] No sensitive data in OG images or metadata

---

## Complete File List

### New Files (~30 files)

```
src/app/deciji-rodjendan/
├── layout.tsx                              # Birthday fonts layout
└── [slug]/
    ├── types.ts                            # BirthdayData, theme types
    ├── constants.tsx                       # 9 themes, font configs, CSS vars
    ├── layout.tsx                          # Fetch data, draft check, guard
    ├── page.tsx                            # Server entry (generateStaticParams, generateMetadata)
    ├── BirthdayClient.tsx                  # Main invitation client component
    ├── EventPassedGuard.tsx                # Party-over screen
    ├── opengraph-image.tsx                 # Dynamic OG image
    ├── fonts/
    │   └── Fredoka-Regular.ttf             # For OG image generation
    ├── components/
    │   ├── ThemeProvider.tsx                # Birthday theme context
    │   ├── Illustrations.tsx               # SVG decorations (balloons, animals, etc.)
    │   ├── Countdown.tsx                   # Playful countdown
    │   ├── BirthdayRSVPForm.tsx            # Simplified RSVP form
    │   └── ConfettiAnimation.tsx           # CSS confetti burst on submit
    ├── portal/
    │   ├── page.tsx                         # RSVP management server component
    │   └── BirthdayPortalClient.tsx         # RSVP list client component
    └── prijava/
        ├── page.tsx                         # Login server component
        └── PrijavaClient.tsx                # Login form client component

src/app/napravi-deciju-pozivnicu/
├── page.tsx                                # Lead gen page with SEO metadata
└── BirthdayQuestionnaireForm.tsx            # 4-step questionnaire form

src/app/api/
├── deciji-rodjendan/
│   ├── auth/[slug]/route.ts                # Birthday auth (JWT cookie)
│   └── [slug]/rsvp/route.ts                # Birthday RSVP POST
└── admin/
    ├── birthdays/
    │   ├── route.ts                         # GET all / POST new
    │   └── [slug]/route.ts                  # PUT / PATCH / DELETE
    └── birthday-stats/route.ts              # RSVP stats

src/app/admin/
├── BirthdayAdminList.tsx                    # Birthday list for admin
├── novi-rodjendan/page.tsx                  # Create birthday event
└── rodjendan/[slug]/page.tsx                # Edit birthday event

src/data/rodjendani/index.ts                 # Data facade
src/lib/birthday.ts                          # Birthday CRUD (MongoDB)
src/lib/birthday-rsvp.ts                     # Birthday RSVP (MongoDB)
```

### Modified Files (6 infrastructure files)

| File | Change | Risk |
|------|--------|------|
| `src/middleware.ts` | Add birthday route matchers + auth check | Low — additive only |
| `src/app/admin/page.tsx` | Add tab switcher (existing JSX untouched) | Low — wraps existing |
| `src/app/robots.ts` | Add disallow rules for birthday protected routes | None |
| `src/app/sitemap.ts` | Add `/napravi-deciju-pozivnicu` entry | None |
| `next.config.ts` | Add cache header rules for birthday routes | None |
| `src/app/layout.tsx` | Add ~6 birthday keywords to metadata array | None |

---

## Build Order

| Order | Phase | Depends On | Parallel? |
|-------|-------|------------|-----------|
| 1 | Phase 1: Data Layer | — | — |
| 2 | Phase 2: Theme System | — | Yes, with Phase 1 |
| 3 | Phase 4: API Endpoints | Phase 1 | — |
| 4 | Phase 3: Pages & Components | Phase 1, 2 | — |
| 5 | Phase 8: Middleware | — | Yes, with Phase 3 |
| 6 | Phase 5: Portal (RSVP mgmt) | Phase 3, 4, 8 | — |
| 7 | Phase 6: Questionnaire Page | Phase 2 (themes) | Yes, with Phase 5 |
| 8 | Phase 7: Admin Extension | Phase 4 (API) | Yes, with Phase 6 |
| 9 | Phase 9: OG Image | Phase 1, 2 | — |
| 10 | Phase 10: SEO/Robots/Cache | All above | Last |

---

## Design Principles

- **Playful, not elegant** — rounded corners (1.25rem+), bouncing animations, confetti
- **Colorful, not subtle** — 2-accent color system, bright backgrounds, confetti arrays
- **Simple, not complex** — fewer steps, fewer fields, less ceremony than weddings
- **Boy/Girl/Neutral differentiation** — theme filtering, gendered illustrations, but always neutral options
- **Mobile-first** — birthday invites are shared via WhatsApp/Viber, always viewed on phones
