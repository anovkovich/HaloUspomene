# Plan: /raspored-sedenja — Seating Chart Page

## Route
`/pozivnica/[slug]/raspored-sedenja`

---

## Layout (full screen, two-panel)

```
+────────────────+──────────────────────────────────────────+
│  250px sidebar │  Canvas (fills remaining screen)         │
│                │                                          │
│  [Svi gosti ▼] │  [+ Pravougaoni] [+ Okrugli]            │
│  ─────────     │                                          │
│  Marko P. (3)  │   ┌──────────────┐    ○ ○ ○             │
│  Ana M.  (1)   │   │  □  □  □  □  │  ○       ○           │
│  ...           │   │  □  □  □  □  │  ○       ○           │
│                │   └──────────────┘    ○ ○ ○             │
+────────────────+──────────────────────────────────────────+
```

---

## Library

**`react-draggable`** (~10KB) for table drag-and-drop on the canvas.
Everything else (seat clicks, rename, seat count, guest assignment) is pure React.

---

## Data Model

```typescript
type TableType = 'rectangular' | 'circle'

interface SeatAssignment {
  guestRowIndex: number  // RSVPEntry.rowIndex
  guestName: string
}

interface Table {
  id: string
  type: TableType
  seats: number         // rectangular: 4–N (step 2), circle: 8–12
  x: number             // canvas position
  y: number
  label: string         // "Sto 1", editable
  assignments: (SeatAssignment | null)[]  // length = seats
}
```

---

## Interaction Flow

1. **Add table** → new table appears in canvas center
2. **Click guest** in sidebar → guest becomes "selected" (highlighted), shows `(N remaining)`
3. **Click seat** on any table → assigns selected guest to that seat, decrements remaining; when all assigned, deselects
4. **Click assigned seat** → removes assignment (un-assign)
5. **Drag table** → reposition on canvas (via react-draggable)
6. **Table header** → click to rename inline
7. **Table controls** → change seat count (±2 for rect, dropdown for circle), delete table

---

## Component Structure

```
src/app/pozivnica/[slug]/raspored-sedenja/
├── page.tsx              — server component (fetches RSVP, password gate)
├── RasporedClient.tsx    — main client component, canvas + state
├── TableNode.tsx         — individual table (rect or circle) with seats
└── GuestSidebar.tsx      — left panel: filter + guest list
```

---

## Key Implementation Notes

- **Canvas**: `position: relative; overflow: auto` div — tables use react-draggable for free 2D positioning
- **Seat layout**: Rectangular → seats split evenly on top/bottom rows; Circle → seats via sin/cos radial positions
- **Persistence**: `localStorage` keyed by slug (no backend needed)
- **Password gate**: Reuse existing `PotvrdeGate` component
- **Navigation**: Add "Raspored sedenja" button to `/potvrde` page

---

## Implementation Steps

1. Install `react-draggable` + `@types/react-draggable`
2. Create `page.tsx` — reuse RSVP fetch + password gate
3. Create `TableNode.tsx` — rect and circle table rendering with seat click, rename, resize
4. Create `GuestSidebar.tsx` — filtered guest list with selection state
5. Create `RasporedClient.tsx` — wires everything, manages canvas state + localStorage
6. Add "Raspored sedenja" button to `PotvrdeClient.tsx`
