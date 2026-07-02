# Implementation Plan: `/moje-vencanje` Sidebar Refactor + Vendor Directory

> Created: 2026-03-23
> Status: Planning

---

## Architecture Decision: Client-Side View Switching (Option B)

**Why not nested routes:** ChecklistCard and BudgetCard share parent state (`checklist`/`setChecklist`, `budget`/`setBudget`) with debounced server action saves. Splitting into routes would require a context provider + re-fetching on every navigation. The vendor directory is read-only static data — no shared state needed. Client-side switching gives us instant transitions, simpler migration, and zero risk of breaking existing PWA installs.

**Upgrade path:** Once the vendor directory grows (user reviews, booking flow, vendor dashboard), we can migrate to nested routes with a layout context provider.

---

## Sidebar Order (Desktop, Logged IN)

```
┌────────────┐
│ Ana &      │
│ Dejan      │
│ 18.06.     │
│ još 88d    │
│            │
│ ────────   │
│            │
│ ☑ Checkli. │ ← default on login
│            │
│ 💰 Budžet  │
│            │
│ ★ Vendori  │
│            │
│ ────────   │
│            │
│ 👥 Potvrde │ ← external links
│ 🪑 Raspored│
│ 🎙 Audio   │
│            │
│ ────────   │
│ [Odjavi →] │
└────────────┘
```

---

## Layout Scenarios

### Desktop Logged OUT
- Keep existing: hero + login form + install prompt + upsell
- ADD: "Vendori DEMO" card with horizontally scrollable vendor cards — placed ABOVE the existing Checklista DEMO + Budget DEMO grid
- Checklista DEMO + Budget DEMO stay side by side below

### Desktop Logged IN
- LEFT SIDEBAR with couple info + navigation (order above)
- MAIN CONTENT AREA: renders the active section full-width
- Checklista & Budget become SEPARATE full-width views (not side by side)

### Mobile Web Logged OUT
- Same as desktop logged out but single column
- Vendori DEMO horizontally scrollable

### Mobile Web Logged IN
- Couple header with: name, date, countdown
- [ORGANIZACIJA GOSTIJU] button (existing)
- [VENDORI] button (NEW, same style, below Organizacija)
- [Checklista | Budžet] tab switcher (existing behavior)
- Shows active tab content

### Mobile PWA Logged IN
- Bottom nav changes: Replace [Budžet] with [Vendori]
- New bottom nav: [Checklista] [Vendori] [Gosti] [Audio] [Raspored]
- Checklista/Budžet tab switching happens INSIDE the content area (top tabs when Checklista is active in bottom nav)

---

## Phase 1: Types + Vendor Data (Foundation)

**Files:**

| Action | File | Changes |
|--------|------|---------|
| Edit | `types.ts` | Add `VendorCategory`, `Vendor`, `VendorCategoryMeta` types |
| Create | `vendors.ts` | ~260 vendors from research doc + category metadata + filter helpers |

`vendors.ts` exports:
- `VENDOR_CATEGORIES: VendorCategoryMeta[]` — 11 categories with labels, icons, counts
- `VENDORS: Vendor[]` — all 260 vendors as typed objects
- `CITIES` — the 6 Serbian cities
- `getVendorsByCategory()`, `getVendorsByCategoryAndCity()` — filter helpers

**Risk:** Zero — purely additive, no UI changes.

---

## Phase 2: Guest View — Add Vendori DEMO

**Files:**

| Action | File | Changes |
|--------|------|---------|
| Create | `TeaserVendors.tsx` | Horizontal scroll of vendor category cards |
| Edit | `MojeVencanjeClient.tsx` | Insert `<TeaserVendors />` above existing demo grid |

Guest view becomes:
```
[Hero + login form]
[Upsell note]
[⊙ Vendori DEMO — horizontal scroll]     ← NEW
[Checklista DEMO  |  Budžet DEMO]         ← existing grid
```

Each TeaserVendors card shows: category icon, name, vendor count, city count. Horizontally scrollable with `overflow-x-auto flex gap-4 snap-x`. Upsell CTA at end: "Prijavite se za pun pristup."

**Risk:** Zero — additive only, guest view enhancement.

---

## Phase 3: New Components (Dead Code)

**Files:**

| Action | File | Changes |
|--------|------|---------|
| Create | `Sidebar.tsx` | Desktop sidebar with couple info + nav items |
| Create | `VendorDirectory.tsx` | Full vendor listing with category/city filters + search |

### Sidebar.tsx

Props:
```typescript
interface SidebarProps {
  activeView: "checklist" | "budget" | "vendors";
  onViewChange: (view: "checklist" | "budget" | "vendors") => void;
  coupleInfo: { slug: string; bride: string; groom: string; eventDate: string; scriptFont: string };
  checklistStats: { completed: number; total: number };
  budgetStats: { spent: number; planned: number };
  onLogout: () => void;
}
```

- Fixed `left-0 top-16 w-64 h-[calc(100vh-4rem)]` below navbar
- Active item: `bg-[#AE343F]/5 text-[#AE343F] border-l-2 border-[#AE343F]`
- External links (Potvrde, Raspored, Audio) use `<Link>` with external arrow icon
- Compact stats inline: "12/63 stavki" under Checklista, "760K / 1.5M" under Budžet

### VendorDirectory.tsx

Features:
- Category pill buttons (horizontal scroll)
- City dropdown filter
- Text search by name
- Vendor cards in responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Each card: name, city badge, type, phone (click-to-call), website link, IG link
- Lazy-loaded via `React.lazy()` — only loads when `activeView === "vendors"`

**Risk:** Zero — components created but not yet wired up.

---

## Phase 4: The Big Refactor (MojeVencanjeClient.tsx)

This is the only "breaking" change. Everything before this is additive.

### Step 4.1: Add `activeView` state

```typescript
type ActiveView = "checklist" | "budget" | "vendors";
const [activeView, setActiveView] = useState<ActiveView>("checklist");
```

Read from URL on mount: `?tab=vendors` → `setActiveView("vendors")`

### Step 4.2: Desktop auth layout — from 2-col grid to sidebar + main

**Before:**
```
<div className="max-w-5xl mx-auto">
  [Couple heading — centered]
  [Stats row — 2 cards]
  [Mobile tab switcher]
  <div className="grid md:grid-cols-2 gap-6">
    [ChecklistCard — half width]
    [BudgetCard — half width]
  </div>
</div>
```

**After:**
```
<div className="flex">
  <Sidebar className="hidden md:block" ... />
  <main className="flex-1 md:ml-64 max-w-4xl mx-auto">
    [Mobile header — couple name, buttons (md:hidden)]
    [Mobile tab switcher — (md:hidden)]

    {activeView === "checklist" && <ChecklistCard ... />}    ← FULL WIDTH
    {activeView === "budget" && <BudgetCard ... />}          ← FULL WIDTH
    {activeView === "vendors" && <VendorDirectory />}        ← FULL WIDTH
  </main>
</div>
```

### Step 4.3: Mobile web (browser) — logged in header

```
[Ana & Dejan]
[18. jun 2026 · još 88 dana]
[→ Odjavite se]

[ORGANIZACIJA GOSTIJU]    ← existing pill button
[VENDORI]                 ← NEW, same style, onClick → setActiveView("vendors")

[Checklista | Budžet]     ← existing tab switcher, visible when activeView != "vendors"
```

When `activeView === "vendors"`, hide the checklist/budget tab switcher and show VendorDirectory with a back arrow to return.

### Step 4.4: PWA bottom nav — replace Budžet with Vendori

```
BEFORE: [Checklista] [Budžet]  [Gosti] [Audio] [Raspored]
AFTER:  [Checklista] [Vendori] [Gosti] [Audio] [Raspored]
```

- `Vendori` uses `Star` icon, `onClick → setActiveView("vendors")`
- `Checklista` tab now does double duty: when active, content area shows `[Checklista | Budžet]` top tab switcher (inline, inside content)
- The `mobileTab` state continues to switch between checklist and budget within the Checklista bottom nav section

### Step 4.5: Remove stats row from main content

Stats move into sidebar (desktop) and compact header (mobile). Frees up vertical space in the main content area.

---

## Phase 5: Polish & Test

- Test sidebar + fixed navbar overlap (sidebar `top-16`, navbar `h-16`)
- Test PWA bottom nav safe area (`env(safe-area-inset-bottom)`)
- Test vendor data lazy loading
- Verify cookie auth flow unchanged
- Test all 3 view transitions on desktop, mobile browser, and PWA
- Responsive testing: sidebar hides at `<md`, shows at `md:+`
- Script font CSS variable in sidebar (uses `var(--font-${scriptFont})`)

---

## File Summary

| File | Action | Size Est. | Description |
|------|--------|-----------|-------------|
| `types.ts` | Edit | +30 lines | Add vendor types |
| `vendors.ts` | **Create** | ~15KB | Static vendor data + helpers |
| `TeaserVendors.tsx` | **Create** | ~3KB | Guest demo horizontal scroll |
| `Sidebar.tsx` | **Create** | ~4KB | Desktop sidebar navigation |
| `VendorDirectory.tsx` | **Create** | ~8KB | Full vendor listing + filters |
| `MojeVencanjeClient.tsx` | **Refactor** | Net ~+50 lines | Add activeView, wire sidebar, restructure layout |
| `ChecklistCard.tsx` | No change | — | Already works with props |
| `BudgetCard.tsx` | No change | — | Already works with props |
| `actions.ts` | No change | — | Server actions unchanged |
| `middleware.ts` | No change | — | Auth unchanged |

---

## Commit Strategy (Safe Rollback)

| # | Commit | Risk | Rollback |
|---|--------|------|----------|
| 1 | Add vendor types + data file | None | Delete files |
| 2 | Add TeaserVendors to guest view | Low | Revert one component |
| 3 | Add Sidebar + VendorDirectory (not wired) | None | Delete files |
| 4 | Refactor MojeVencanjeClient layout | **Medium** | Revert single file |
| 5 | Polish, responsive fixes, test | Low | Cherry-pick fixes |

Commit 4 is the only risky one. If something breaks, revert just `MojeVencanjeClient.tsx` — all other files are standalone.

---

## Component Hierarchy (Final)

```
page.tsx (server)
└── MojeVencanjeClient (client)
    ├── [loading] → Spinner
    ├── [guest]
    │   ├── Navbar
    │   ├── Hero + Login
    │   ├── TeaserVendors ────── NEW
    │   ├── TeaserChecklist
    │   ├── TeaserBudget
    │   └── Footer
    └── [auth]
        ├── Navbar
        ├── Sidebar (md:block) ─── NEW
        │   ├── CoupleInfo
        │   ├── Nav: Checklista → Budžet → Vendori
        │   ├── Links: Potvrde → Raspored → Audio
        │   └── Logout
        ├── Main Content (md:ml-64)
        │   ├── MobileHeader (md:hidden)
        │   ├── [checklist] → ChecklistCard (full width)
        │   ├── [budget] → BudgetCard (full width)
        │   └── [vendors] → VendorDirectory ── NEW (lazy-loaded)
        └── BottomNav (PWA only)
            └── [Checklista] [Vendori] [Gosti] [Audio] [Raspored]
```

---

## State Management (After Refactoring)

```
state: "loading" | "guest" | "auth"
activeView: "checklist" | "budget" | "vendors"  // NEW
mobileTab: "checklist" | "budget"                // KEPT for PWA sub-tab
slug, password, error, loginLoading              // UNCHANGED
installPrompt, isStandalone, isIOS, ...          // UNCHANGED
coupleInfo                                       // UNCHANGED
checklist, setChecklist                          // UNCHANGED
budget, setBudget                                // UNCHANGED
```

### activeView vs mobileTab interaction:
- **Desktop**: Only `activeView` matters. The sidebar controls it.
- **Mobile browser**: `activeView` gates which section is shown. Within checklist/budget, `mobileTab` switches between them.
- **PWA standalone**: Bottom nav sets `activeView`. When `activeView` is `"checklist"`, an inline tab switcher at top lets user toggle between checklist and budget via `mobileTab`.

No new context providers needed. No new server actions needed (vendors are static data).

---

## Potential Challenges

1. **Sidebar + fixed navbar overlap**: Navbar is `fixed top-0 z-50 h-14 md:h-16`. Sidebar needs `top-16 h-[calc(100vh-4rem)]` and `fixed left-0`. Main content needs `ml-64 pt-20`.
2. **PWA bottom nav safe area**: Existing `paddingBottom: "env(safe-area-inset-bottom)"` pattern must be preserved.
3. **Vendor data file size**: ~260 vendors at ~150 bytes each = ~39KB raw (~8-10KB gzipped). Use `React.lazy()` to only load when vendors view is active.
4. **PWA bookmark/cache**: Users with installed PWA may have cached old bottom nav. Service worker update handles this.
5. **Script font CSS variable**: Couple heading uses `var(--font-${scriptFont})`. Fonts defined in root layout — should work in sidebar without changes.
