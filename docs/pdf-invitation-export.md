# Feature Plan: PDF/Print Invitation Export

## Overview

Generate a printable PDF version of any couple's digital invitation. One-click download from the invitation page. Couples can print copies for elderly relatives or use as a physical keepsake.

## Business Model

- **Free**: Download PDF with "halouspomene.rs" watermark at bottom
- **Paid** (`paid_for_pdf?: boolean`): Clean PDF without watermark

Low effort, good upsell. Watermarked version acts as free marketing when printed copies circulate.

---

## PDF Design (A5 Portrait, 148×210mm)

Compact card-like format — feels like a real physical invitation, not a document.
Everything fits on one page; timeline goes on page 2 if it exists.

### Page 1: Main Invitation

```
┌───────────────────────┐
│  [decorative line]    │
│                       │
│    halouspomene.rs    │  ← tiny wordmark (very muted)
│                       │
│       ♥               │  ← theme primary color
│                       │
│   Ana & Dejan         │  ← couple's script font
│                       │
│       ♥               │
│                       │
│  10. maj 2026.        │  ← Cormorant Garamond
│                       │
│  "Započnimo naše      │  ← tagline (italic)
│   zajedničko..."      │
│                       │
│  ──────────────       │  ← theme accent line
│                       │
│  📍 Restoran Balkan   │  ← venue + address + time
│  Terazije 26, Beograd │
│  19:00h               │
│                       │
│  ──────────────       │
│                       │
│  Potvrdite dolazak do │  ← RSVP deadline
│  01. aprila 2026.     │
│                       │
│  [QR CODE]            │  ← links to /pozivnica/[slug]
│  Skenirajte za potvrdu│
│                       │
│  [decorative line]    │
│  halouspomene.rs      │  ← watermark (free) or blank (paid)
└───────────────────────┘
```

### Page 2: Timeline (optional, only if timeline has items)

```
┌───────────────────────┐
│                       │
│    Protokol           │  ← heading (script font)
│  Plan našeg dana      │  ← subtitle
│                       │
│  16:00  Crkva         │  ← compact timeline items
│         Hram Sv. Save │
│                       │
│  17:30  Koktel        │
│         Dobrodošlica  │
│                       │
│  19:00  Svečana večera│
│         Restoran      │
│                       │
│  21:00  Muzika i ples │
│         Zabava uz bend│
│                       │
│  23:00  Torta         │
│         Sečenje torte │
│                       │
│  ──────────────       │
│  halouspomene.rs      │  ← watermark (free) or blank (paid)
└───────────────────────┘
```

---

## Technical Implementation

### Dependencies
- `jsPDF` — already installed (v4.2.0)
- `qrcode` — already installed (v1.5.4)
- Font `.ttf` files — already in `src/app/pozivnica/[slug]/fonts/` (10 fonts)

**No new dependencies needed.**

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/pozivnica/[slug]/generateInvitationPDF.ts` | PDF generation logic (~200 lines) |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/pozivnica/[slug]/types.ts` | Add `paid_for_pdf?: boolean` to WeddingData |
| `src/app/pozivnica/[slug]/InvitationClient.tsx` | Add "Download PDF" button in footer section |
| `src/app/admin/nova/page.tsx` | Add `paid_for_pdf` to template JSON |

### Implementation Steps

#### 1. Create `generateInvitationPDF.ts`

Client-side function (runs in browser, uses jsPDF):

```typescript
// A5 format: 148mm × 210mm
const doc = new jsPDF({ format: "a5", orientation: "portrait", unit: "mm" });

export async function generateInvitationPDF(
  data: WeddingData,
  slug: string,
  isPaid: boolean,
  useCyrillic: boolean,
): Promise<void>
```

**Font embedding:**
- Load the couple's chosen script font from `/fonts/` directory via fetch
- Load Cormorant Garamond and Josefin Sans
- Register with `doc.addFont()` (jsPDF supports TTF via `jspdf.plugin.standard_fonts_metrics`)
- Alternatively: use the font `.ttf` files already bundled, convert to base64 at build time

**QR Code:**
- Generate QR for `https://halouspomene.rs/pozivnica/${slug}`
- Use `qrcode.toDataURL()` (already used in seating PDF)
- Embed as image in PDF

**Color extraction:**
- Import `THEME_CONFIGS` from `constants.tsx`
- Parse hex colors to RGB for `doc.setTextColor(r, g, b)`

**Watermark (free version):**
- Small "halouspomene.rs" text at bottom of each page
- Slightly larger, with subtle branding
- Removed when `paid_for_pdf` is true

#### 2. Add Download Button (barely visible)

In `InvitationClient.tsx` footer section, add an ultra-subtle download link.
It should be nearly invisible — only discoverable by couples who know it's there or scroll to the very bottom.

```tsx
<button
  onClick={() => generateInvitationPDF(data, slug, data.paid_for_pdf ?? false, useCyrillic)}
  className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] transition-opacity hover:opacity-40"
  style={{ color: "var(--theme-text-light)", opacity: 0.2 }}
>
  <Download size={10} />
  {t.downloadPDF}
</button>
```

Position: below the "Made with ♥ | Halo Pozivnice" line, at the very bottom of the page.
Opacity 0.2 by default, 0.4 on hover — guests won't notice it, couples will know to look for it.

#### 3. Add Translation Keys

Add to `translations.ts`:
- `downloadPDF: "Preuzmi pozivnicu"` (Latin)
- `downloadPDF: "Преузми позивницу"` (Cyrillic)

---

## Complexity & Effort

| Aspect | Estimate |
|--------|----------|
| New files | 1 |
| Modified files | 3-4 |
| Lines of code | ~250 |
| New dependencies | 0 |
| Effort | Low-Medium (1 session) |

## Risks

- **Font rendering in jsPDF**: Custom TTF embedding can be tricky with non-Latin characters (Cyrillic). Test with Marck Script and Bad Script fonts.
- **PDF file size**: Embedded fonts add ~200-400KB per font. Only embed the fonts actually used by the couple (1 script + 2 base = ~3 fonts max).

---

## Revenue Potential

- Low friction — every couple sees the button
- Watermarked free version drives brand awareness
- Paid version is a natural upsell during planning phase
- Pairs well with seating chart (couples who print invitations also print seating charts)
