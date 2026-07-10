# Plan B — Payment implementation (detailed engineering spec)

> Detaljna inženjerska specifikacija za self-serve plaćanje (kartica + IPS).
> Prati i nadograđuje strateški pregled u [`PLAN-B-sales-upgrades.md`](./PLAN-B-sales-upgrades.md) (B1/B2/B3).
> Autor spec-a: Fable 5 (grounded protiv stvarnog repo-a @ `deploy`, 2026-07-10).

## Kontekst & zaključane odluke

**Dva koloseka plaćanja, jedan rezultat (unlock):**
- **Kartica** → Lemon Squeezy (merchant of record), **EUR**, instant auto-unlock preko webhook-a.
- **IPS** → bankovni QR (RSD); kupac klikne **„Obavesti nas o uplati" → mejl adminu → ručna overa** (bez PDF-a).

**EUR cene (fiksna lista, tax-inclusive u LS):** Osnovni 45 € · Kompletan 85 € · Premium 120 € · rođendan/punoletstvo 35 € · standalone raspored 45 € (fiksno, bez promo) · QR galerija 30 €. RSD ostaje postojeći. Pravilo: **IPS (RSD) ≤ kartica (EUR-ekvivalent)**.

**Valuta po ekranu:** marketing = samo RSD; EUR se prvi put pojavljuje na dugmetu za karticu. Nikad se ne prikazuje konverzija.

**Arhitektura:** JEDNA familija ruta `/placanje/[kind]/[slug]`, JEDNA `<CheckoutPanel>` komponenta, JEDAN LS webhook `/api/placanje/webhook` (switch po `kind`), JEDAN IPS notify endpoint, JEDAN NBS-QR util (`src/lib/nbs-qr.tsx`), JEDNA `orders` kolekcija. **Iznosi se UVEK računaju server-side iz DB, nikad iz klijenta.**

**Ulazne tačke:** preview publish-gate („Plati odmah" → `/placanje/[kind]/[slug]`; „Plati nakon" → povratak preko draft preview trake + sačuvanog linka). **NE u `/moje-vencanje`.** B3 nenegocijabilno: server-side `draft → 403` na RSVP ide u ISTOM deploy-u kao watermarkovan preview.

**Microcopy (timing):** kartica ≈ do 30 s (instant); IPS ≈ par minuta, živa overa dok je admin online, inače isti radni dan.

## Status implementacije

- ✅ **Korak 1 (urađen, van zavisnosti od KYC-a):** `priceEur` polja u `pricing.json` (svih 6 proizvoda), `formatEur()` helper u `pricing.ts`, „Nije venčanje?" traka na `/cene` (rođendan + punoletstvo kartice).
- ⏳ **Ostalo:** čeka LS KYC (in review). Faze 0–2 se mogu graditi pre KYC-a; kartični kolosek (Faza 3) se pali `PAYMENTS_CARD_ENABLED=1` kad KYC prođe.

---

# SPEC: Self-serve payments — `/placanje` (card via Lemon Squeezy + IPS bank QR)

Status: ready to implement. Grounded against repo @ branch `deploy` (verified 2026-07-10). Product decisions per the locked list — not revisited here.

**Verified repo facts this spec builds on:**
- Paid flags on `couples` (`src/app/pozivnica/[slug]/types.ts:101-136`): `paid_for_raspored`, `paid_for_pdf`, `paid_for_audio`, `paid_for_images` (polaroid — NOT gallery), `paid_for_gallery` (QR gallery, comment says "Sellable standalone"), `paid_for_music`, `premium_paid`, `draft`, `receipt_valid`.
- Birthday + punoletstvo share the `birthday_events` collection (facade `src/lib/birthday.ts`), discriminated by an event-type field; has `draft` and `paid_for_raspored`.
- Standalone seating: `standalone_seatings` collection, unlock flag is `active: boolean`, flipped via `setStandaloneActive()` (`src/lib/standalone-seating.ts:256`).
- NBS QR machinery lives inline in `src/app/racun/page.tsx` (`NbsQrCode`, `toAscii`, `toLatin`, `BANK_ACCOUNTS`) and calls the `/api/qr` proxy → `https://nbs.rs/QRcode/api/qr/v1/generate/300`.
- `POST /api/pozivnica/[slug]/rsvp` checks **only the deadline + recaptcha — it does NOT check `draft`** (confirmed at `route.ts:12-25`). This is the B3 hole; closed in §6.
- `src/lib/recaptcha.ts` exists with typed actions; `src/data/pricing.ts` already has `formatEur()` + `priceEur` fields; Web3Forms key is `NEXT_PUBLIC_WEB3FORMS_KEY` (works server-side too — it's the same access_key POSTed to `api.web3forms.com/submit`).

---

## 1. Data model: `orders` collection

New collection `orders` in DB `halouspomene`. Facade: **`src/lib/orders.ts`** — the ONLY file that touches the collection (house rule).

```ts
export type PaymentKind = "pozivnica" | "rodjendan" | "punoletstvo" | "raspored" | "galerija";
export type OrderRail = "card" | "ips";
export type OrderStatus =
  | "pending"    // created, no money seen
  | "review"     // IPS: buyer clicked "Obavesti nas o uplati", awaiting admin
  | "paid"       // card: LS webhook verified, unlock in progress (transient)
  | "unlocked"   // flags flipped on the entity — terminal happy path
  | "expired"    // pending > 7 days, swept (soft — record kept)
  | "canceled"   // admin rejected an IPS review, or buyer restarted
  | "refunded"   // LS order_refunded received (full refund)
  | "revoked";   // flags reversed after refund/admin action — terminal

interface OrderDocument {
  _id: ObjectId;
  orderId: string;          // public id: "HU" + 12 decimal digits (crypto-random), e.g. "HU483920175046".
                            //   Digits double as the NBS RO / poziv-na-broj. Unique index.
  kind: PaymentKind;
  slug: string;             // entity slug in its home collection
  tier: string;             // pozivnica: "osnovni"|"kompletan"|"premium"; all other kinds: "default"
  rail: OrderRail | null;   // null until buyer picks a rail; set on card-checkout creation or IPS notify
  status: OrderStatus;

  // Money — FROZEN at order creation, server-computed (never recomputed later)
  amountRsd: number;        // IPS total in whole dinars
  amountEur: number;        // card total in whole euros (fixed list, NOT FX)
  lines: Array<{ l: string; rsd: number; eur: number }>; // display snapshot, receipt-items style

  // Card rail (Lemon Squeezy)
  ls?: {
    checkoutId?: string;    // from POST /v1/checkouts
    orderId?: number;       // LS numeric order id from webhook — UNIQUE partial index (replay guard)
    orderNumber?: number;
    variantId?: number;
    customerEmail?: string;
    receiptUrl?: string;
    totalCents?: number;    // attributes.total as delivered — audit
    currency?: string;      // must be "EUR"
    testMode?: boolean;
    refundedAt?: Date;
  };

  // IPS rail
  ipsRef: string;           // = digits of orderId; rendered in QR RO field and as text
  ipsAccountIdx: number;    // index into BANK_ACCOUNTS (0 = Erste default)
  notify?: { at: Date; payerName: string; note?: string; ip: string };

  webhookEvents: Array<{ eventName: string; lsEventId: string | null; at: Date }>; // audit trail of every delivery incl. replays
  approvedBy?: "webhook" | `admin`;   // who unlocked
  adminNote?: string;

  createdAt: Date; updatedAt: Date;
  paidAt?: Date; unlockedAt?: Date; revokedAt?: Date;
  meta?: { ip?: string; ua?: string };
}
```

**Indexes** (one-off script `scripts/create-orders-indexes.mjs`, `createIndex` is idempotent):

```js
db.orders.createIndex({ orderId: 1 }, { unique: true });
db.orders.createIndex({ "ls.orderId": 1 }, { unique: true, partialFilterExpression: { "ls.orderId": { $exists: true } } });
db.orders.createIndex({ kind: 1, slug: 1, status: 1 });       // tuple reuse + already-paid checks
db.orders.createIndex({ status: 1, createdAt: -1 });          // admin review queue
```

**Lifecycle (the only legal transitions — enforce with conditional updates, see below):**

```
card: pending ──(webhook order_created, verified)──► paid ──(unlock() ok)──► unlocked
                                                                unlocked ──(order_refunded)──► refunded ──(revoke() ok)──► revoked
ips:  pending ──(buyer notify)──► review ──(admin approve)──► unlocked
      review ──(admin reject)──► canceled
any:  pending ──(7d sweep / buyer restart)──► expired | canceled
```

Every transition goes through ONE facade function:

```ts
// src/lib/orders.ts — the state machine primitive. matchedCount === 0 ⇒ someone else
// already moved it (replay, double-click, concurrent admin) ⇒ caller treats as no-op success.
export async function transitionOrder(
  orderId: string, from: OrderStatus[], to: OrderStatus, set: Partial<OrderDocument> = {},
): Promise<boolean> {
  const r = await (await col()).updateOne(
    { orderId, status: { $in: from } },
    { $set: { ...set, status: to, updatedAt: new Date() } },
  );
  return r.matchedCount === 1;
}
```

**Relation to entities.** Orders are the money ledger; the entity flags remain the ONLY runtime access gate (nothing at request time ever reads `orders`). `unlock()` writes flags through the existing facades (`patchCouple`, `patchBirthday`, `setStandaloneActive`). Deleting an entity does NOT cascade-delete its orders (financial audit trail survives); `deleteCouple`/`deleteBirthday` untouched.

**Idempotency keys — three layers:**
1. **Order creation:** tuple reuse. `getOrCreatePendingOrder(kind, slug, tier)` returns an existing `pending` order for the same tuple younger than 24h instead of inserting. Page refreshes and back-buttons never spawn duplicates; a price change mid-flow creates a fresh order only after the old one is canceled/expired.
2. **LS webhook:** the unique partial index on `ls.orderId` + `transitionOrder(id, ["pending"], "paid")`. A replayed `order_created` either hits the duplicate key or matches 0 docs — both return 200 without re-unlocking. Every delivery is still appended to `webhookEvents` (plain `$push`, unconditional) for audit.
3. **`unlock()` itself is idempotent by construction:** it only `$set`s flags to fixed values. Running it twice is harmless. This is the backstop if the process dies between `status: "paid"` and `status: "unlocked"` — a retry (webhook redelivery or admin "re-run unlock" button) converges.

---

## 2. The `kind` registry

**`src/lib/payments/kinds.ts`** — server-only (`import "server-only"`). This is the single place a product plugs into payments.

```ts
export interface CheckoutLine { l: string; rsd: number; eur: number }

export interface KindEntitySummary {
  slug: string;
  displayName: string;        // "Ana & Dejan" / event name — for the panel + IPS S field
  eventDate?: string;
  premium: boolean;           // pozivnica only; false elsewhere
  unlockedTiers: string[];    // tiers whose flags are already fully set
}

export interface KindAdapter {
  /** Load + summarize. null ⇒ 404 the checkout page. */
  loadEntity(slug: string): Promise<KindEntitySummary | null>;
  /** Purchasable tiers for THIS entity (already filtered: premium couples see only "premium",
   *  classic see "osnovni"/"kompletan"; single-tier kinds return one "default" tier). */
  tiers(e: KindEntitySummary): Array<{ id: string; labelSr: string; rsd: number; eur: number; lsVariantEnv: string }>;
  /** Frozen money. THROWS PaymentError("ALREADY_UNLOCKED" | "INVALID_TIER"). Reads pricing.ts helpers — never client input. */
  computeOrder(e: KindEntitySummary, tierId: string): { lines: CheckoutLine[]; totalRsd: number; totalEur: number };
  /** Flip entity flags via lib facades. MUST be idempotent ($set only). */
  unlock(slug: string, order: OrderDocument): Promise<void>;
  /** Reverse exactly what unlock() set. Called on full refund / admin revoke. */
  revoke(slug: string, order: OrderDocument): Promise<void>;
}

export const KINDS: Record<PaymentKind, KindAdapter> = { pozivnica, rodjendan, punoletstvo, raspored, galerija };
```

**Per-kind plug-in table (exact flags flipped by `unlock`, reversed by `revoke`):**

| kind | tier | EUR | RSD source (pricing.ts) | `loadEntity` facade | `unlock()` sets |
|---|---|---|---|---|---|
| pozivnica | `osnovni` | 45 | `getTier("osnovno").price` = 5000 | `getWeddingData` | `draft: false` |
| pozivnica | `kompletan` | 85 | `getTier("kompletno").price` = 9900 | `getWeddingData` | `draft: false, paid_for_raspored: true, paid_for_audio: true, paid_for_gallery: true` |
| pozivnica | `premium` | 120 | `getTier("premium").price` = 13900 | `getWeddingData` (only offered when `premium: true`) | `draft: false, premium_paid: true, paid_for_raspored: true, paid_for_audio: true, paid_for_gallery: true` |
| rodjendan | `default` | 35 | `getRodjendanPozivnicaPrice(false)` = 4000 | `getBirthdayData` (reject punoletstvo-typed docs) | `draft: false` |
| punoletstvo | `default` | 35 | `getRodjendanPozivnicaPrice(true)` = 4000 | `getBirthdayData` (require punoletstvo type) | `draft: false` |
| raspored | `default` | **45 fixed, ignore promo** | `getStandaloneSeatingPrice()` (4000 while promo active — satisfies RSD ≤ EUR rule) | `getStandaloneSeating` | `setStandaloneActive(slug, true)` |
| galerija | `default` | 30 | `pricing.pozivnica.galerija.price` = 3500 | `getWeddingData` (gallery is a flag on `couples`, incl. gallery-only records) | `paid_for_gallery: true` (does NOT touch `draft`) |

Notes:
- `paid_for_images` (polaroid, 600 din) stays a manual admin add-on — NOT self-serve; verified it is distinct from `paid_for_gallery`. Do not conflate.
- `computeOrder` throws `ALREADY_UNLOCKED` when every flag the tier would set is already true (for `osnovni` that means `draft === false`). The checkout page catches it and renders "Već aktivirano ✓" with a link to the product — no dead checkout.
- Upgrade path (bought `osnovni`, wants `kompletan`): out of scope v1. `tiers()` hides fully-unlocked tiers; a published-osnovni couple sees no card path and the panel shows "Za dodatne opcije pišite nam" → existing manual flow. Ship the diff-pricing upgrade later.
- rodjendan/punoletstvo share one LS variant (both 35€) but stay separate kinds — different collections’ semantics and different success URLs.
- `revoke()` for pozivnica sets `draft: true` + clears the tier's flags. Destructive by design — it only ever runs on full refund or explicit admin action (§3, §7).

**Auth stance (deliberate):** the checkout page GET is public — the slug is the capability, amounts are server-computed, and the page shows nothing not already on the public invitation. Mutating endpoints are protected by recaptcha + rate limits (§6), not login, because the publish-gate buyer often has no portal session yet. Do NOT add `/placanje` to `middleware.ts`; DO add `Disallow: /placanje` to `robots.ts` and `robots: { index: false }` metadata.

---

## 3. Lemon Squeezy (card rail)

**Mode: API-created hosted checkout** (`POST https://api.lemonsqueezy.com/v1/checkouts`, then redirect to `data.attributes.url`). Not the overlay (external `lemon.js` script, popup issues on iOS Safari, CSP surface) and not static buy-links (can't bind `orderId` per purchase server-side — the binding is what makes the webhook trustworthy). One store, EUR, **store-level "prices include tax" ON** (LS is merchant of record; the EUR list prices are final consumer prices).

**Products/variants (create in LS dashboard, ids into env):** `HU-OSNOVNI` 45€, `HU-KOMPLETAN` 85€, `HU-PREMIUM` 120€, `HU-PROSLAVA` 35€ (rodjendan + punoletstvo), `HU-RASPORED` 45€, `HU-GALERIJA` 30€.

**Checkout creation** — server action `createCardCheckout(kind, slug, tier)` in `src/app/placanje/[kind]/[slug]/actions.ts`:

1. Registry: `loadEntity` → `computeOrder` (throws if unlocked) → `getOrCreatePendingOrder` → set `rail: "card"`.
2. `POST /v1/checkouts` with `Authorization: Bearer ${LEMONSQUEEZY_API_KEY}`:

```jsonc
{ "data": { "type": "checkouts",
  "attributes": {
    "checkout_data": {
      "custom": { "kind": "pozivnica", "slug": "ana-dejan", "tier": "kompletan", "order_id": "HU483920175046" } // ALL STRINGS — LS drops non-strings
    },
    "checkout_options": { "embed": false, "media": false, "logo": true },
    "product_options": {
      "redirect_url": "https://halouspomene.rs/placanje/pozivnica/ana-dejan/hvala/?order=HU483920175046",
      "receipt_button_text": "Nazad na pozivnicu",
      "receipt_link_url": "https://halouspomene.rs/pozivnica/ana-dejan/"
    },
    "expires_at": "<now + 24h ISO>"                    // checkout dies with the frozen price
  },
  "relationships": {
    "store":   { "data": { "type": "stores",   "id": "<LEMONSQUEEZY_STORE_ID>" } },
    "variant": { "data": { "type": "variants", "id": "<LS_VARIANT_KOMPLETAN>" } }
  } } }
```

3. Store `ls.checkoutId`, redirect the browser to `attributes.url` **with `?locale=hr` appended** (closest supported locale to Serbian; LS has no `sr`). Verify in test mode that the param sticks through the checkout — if LS ignores it, accept auto-detect; do not block on this.
4. Do NOT create the checkout on page load — only on the "Plati karticom (X €)" click. Checkouts are cheap but each click may create one; that's fine, the `orderId` binding is what matters, and `expires_at` garbage-collects.

**Webhook `POST /api/placanje/webhook`** — subscribe in LS to `order_created` and `order_refunded` only (no subscriptions in this product).

```ts
// MUST read raw body before parsing — signature is over the raw bytes.
const raw = await req.text();
const sig = Buffer.from(req.headers.get("x-signature") ?? "", "utf8");
const digest = Buffer.from(
  crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!).update(raw).digest("hex"), "utf8");
if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
  return new Response("bad signature", { status: 401 });
}
const evt = JSON.parse(raw);
```

`order_created` processing, in order — **every check failure short-circuits to a 200 + Sentry event + admin email; never unlock on partial validation:**

1. `meta.test_mode === true` and `PAYMENTS_ALLOW_TEST !== "1"` → log, 200, stop. (Prevents unlocking prod entities from test-mode purchases.)
2. `custom = meta.custom_data`; load order by `custom.order_id`. Missing/unknown → 200 + Sentry (someone bought via a stale/hand-built checkout — admin reconciles manually).
3. Cross-check `custom.kind/slug/tier` === order fields (they were bound server-side; mismatch = tampered checkout or bug → quarantine: `status: "review"` + admin email).
4. **Amount check (the money invariant):** `attributes.currency === "EUR"` AND `attributes.total === order.amountEur * 100` (LS totals are cents; tax-inclusive so total = list price). Mismatch → quarantine as above. Also require `attributes.status === "paid"`.
5. `transitionOrder(orderId, ["pending"], "paid", { "ls.orderId": ..., "ls.orderNumber", "ls.customerEmail", "ls.receiptUrl", "ls.totalCents", "ls.currency", "ls.testMode", paidAt })`. Returned `false` (replay/duplicate) → `$push` to `webhookEvents`, 200, stop. Duplicate-key on `ls.orderId` → same.
6. `await KINDS[order.kind].unlock(order.slug, order)` → `transitionOrder(orderId, ["paid"], "unlocked", { unlockedAt, approvedBy: "webhook" })`. If `unlock()` throws (Mongo hiccup): return **500** so LS retries (steps 1–5 are replay-safe; the retry lands in `status: "paid"` — handle `["pending","paid"]` in the step-5 filter to let the retry re-run unlock).
7. 200.

`order_refunded`: find by `ls.orderId`. If `attributes.refunded_amount < attributes.total` (partial) → do NOT touch flags; set `adminNote: "PARTIAL REFUND"` + admin email, 200. Full refund → `transitionOrder(["unlocked","paid"], "refunded", { "ls.refundedAt" })`, then `revoke()`, then → `"revoked"`. Email admin either way — a refund on a wedding product days before the event is a human conversation, the automation just closes the access hole.

Webhook route runtime: `nodejs` (needs `crypto.timingSafeEqual`), `export const dynamic = "force-dynamic"`. LS retries failed deliveries 3× — the conditional transitions make redelivery free.

---

## 4. IPS rail (bank transfer, RSD)

**Extraction — `src/lib/nbs-qr.tsx`** (new, shared): move `toLatin`, `toAscii`, `BANK_ACCOUNTS`, and the `NbsQrCode` client component out of `racun/page.tsx` verbatim; add pure `buildIpsPayload({ accountRaw, amountRsd, payerName, ref }): string` producing exactly the proven payload:

```
K:PR|V:01|C:1|R:<acct>|N:HALO USPOMENE\nNOVI SAD|I:RSD<amount>,00|SF:189|S:<payer≤35 ASCII>|RO:<ref>
```

`racun/page.tsx` becomes an importer (no behavior change — verify the rendered payload byte-for-byte against a current receipt before shipping). `NbsQrCode` keeps calling `/api/qr`; the proxy is untouched.

**`/placanje/[kind]/[slug]/page.tsx`** (server component):
1. Validate `kind` against the registry (unknown → 404). `loadEntity` (null → 404). `computeOrder` for the selected tier (`?tier=` param, default = first available; `ALREADY_UNLOCKED` → "Već aktivirano" state).
2. `getOrCreatePendingOrder(kind, slug, tier)` — the order exists before render because the QR needs its `ipsRef`. Tuple-reuse (§1) keeps crawler/refresh noise at ≤1 doc per tuple per 24h; the 7-day sweep marks strays `expired`. `robots: { index: false }` + robots.ts disallow.
3. Render `<CheckoutPanel>` (one shared client component, `src/components/payments/CheckoutPanel.tsx`):
   - Line items + total, **RSD prominent** (marketing surfaces stay RSD-only; here both rails are visible).
   - Card button: `"Plati karticom — {eur} €"` (EUR first on the button, per decision; **never render a conversion or an exchange rate anywhere**). Subtext: `"Aktivacija odmah — najkasnije za 30 sekundi."` Hidden entirely when `PAYMENTS_CARD_ENABLED !== "1"` (pre-KYC).
   - IPS block: `<NbsQrCode>` with `buildIpsPayload(BANK_ACCOUNTS[0] /* Erste */, order.amountRsd, displayName, order.ipsRef)` + textual account/poziv-na-broj fallback (reuse the existing error fallback). Subtext: `"Skenirajte m-banking aplikacijom. Aktivacija za nekoliko minuta dok smo online — najkasnije istog radnog dana."`
   - "Obavesti nas o uplati" → name field (prefilled `displayName`) → POST notify.
4. `/placanje/[kind]/[slug]/hvala/page.tsx`: reads `?order=`, server-renders order status. `unlocked` → success + deep link to the unlocked product (`/pozivnica/[slug]`, `/raspored-sedenja/[slug]`, …). `pending|paid` → "Potvrđujemo uplatu…" + `<meta http-equiv="refresh" content="5">` (3 cycles, then "javite nam se" fallback) — covers redirect-before-webhook. `review` → the IPS same-business-day copy.

**Notify endpoint `POST /api/placanje/notify`** — body `{ orderId, payerName, recaptcha_token }`:
1. `verifyRecaptcha(token, "payment_notify", { remoteIp })` (add the action to the union in `src/lib/recaptcha.ts`).
2. Load order; require status `pending`; `transitionOrder(["pending"], "review", { rail: "ips", notify: { at, payerName: trimmed ≤ 60 chars, ip } })` — replays/double-clicks no-op to 200.
3. Fire Web3Forms server-side (`POST https://api.web3forms.com/submit`, `access_key: process.env.WEB3FORMS_KEY ?? NEXT_PUBLIC_WEB3FORMS_KEY`): subject `"[UPLATA] {kind}/{slug} — {amountRsd} din — RO {ipsRef}"`, body with payer name, tier, amount, and the admin deep link `https://halouspomene.rs/admin/?tab=uplate`. **Email failure must NOT roll back the transition** — the order sits in the admin review queue regardless; email is a doorbell, the queue is the truth. Log failures to Sentry.
4. Rate limit: recaptcha + one transition per order (state machine enforces) + reject > 5 notifies/IP/hour (reuse the in-memory pattern from `premium-pozivnica/create`).

**Admin approval:**
- `GET /api/admin/orders?status=review` (admin JWT, checked in-route like the other `/api/admin/*`) feeding a new "Uplate" tab/section in `/admin/page.tsx`: table of review + recent orders — kind/slug, payer name, `amountRsd`, `ipsRef` (the founder matches this against poziv-na-broj on the bank statement), age.
- `POST /api/admin/orders/[orderId]/approve`: `transitionOrder(["review","pending"], "unlocked", { approvedBy: "admin", unlockedAt })` → `unlock()`. (`pending` included so the founder can approve a payment that arrived without the buyer ever clicking notify — real behavior of Serbian buyers.) If another `unlocked` order already exists for the tuple, the UI shows a "⚠ već plaćeno karticom — proveri duplu uplatu" warning before confirm (§7.1).
- `POST /api/admin/orders/[orderId]/reject`: `["review"] → "canceled"` + optional `adminNote`.
- Nothing here touches `receipt_valid` — the `/racun` invoice flow stays a parallel, untouched surface.

---

## 5. Files (create ➕ / modify ✏️)

| File | Purpose |
|---|---|
| ➕ `src/lib/orders.ts` | `orders` facade: create/getOrCreate tuple-reuse, `transitionOrder`, queries, webhookEvents push. Only file touching the collection. |
| ➕ `src/lib/payments/kinds.ts` | The kind registry (§2). `import "server-only"`. |
| ➕ `src/lib/payments/lemonsqueezy.ts` | LS API client: `createCheckout()`, `verifySignature(raw, sig)`, `parseWebhook()`, types. |
| ➕ `src/lib/nbs-qr.tsx` | Extracted `toLatin`/`toAscii`/`BANK_ACCOUNTS`/`buildIpsPayload`/`NbsQrCode`. |
| ✏️ `src/app/racun/page.tsx` | Delete inlined QR machinery; import from `nbs-qr.tsx`. Zero behavior change. |
| ➕ `src/app/placanje/[kind]/[slug]/page.tsx` | Server checkout page: registry lookup, order create, renders panel. `robots: noindex`. |
| ➕ `src/app/placanje/[kind]/[slug]/actions.ts` | `createCardCheckout` server action (LS checkout → redirect URL). |
| ➕ `src/app/placanje/[kind]/[slug]/hvala/page.tsx` | Post-payment status page with pending-state auto-refresh. |
| ➕ `src/components/payments/CheckoutPanel.tsx` | The ONE shared client panel: rails, microcopy, notify form. |
| ➕ `src/app/api/placanje/webhook/route.ts` | LS webhook: signature, validation ladder, unlock (§3). |
| ➕ `src/app/api/placanje/notify/route.ts` | IPS "Obavesti nas o uplati" (§4). |
| ➕ `src/app/api/admin/orders/route.ts` | Admin list (status filter). |
| ➕ `src/app/api/admin/orders/[orderId]/route.ts` | POST approve / reject (sub-action in body) + re-run-unlock. |
| ✏️ `src/app/admin/page.tsx` | "Uplate" section: review queue + badge count, approve/reject buttons. |
| ✏️ `src/app/api/pozivnica/[slug]/rsvp/route.ts` | **B3: `if (weddingData.draft) return 403`** after the existing not-found check. |
| ✏️ `src/app/api/pozivnica/[slug]/audio/route.ts` + gallery upload route | Same draft rejection on every guest-write endpoint. |
| ✏️ `src/app/pozivnica/[slug]/page.tsx` | Draft: watermarked preview instead of `notFound()`; publish CTA → `/placanje/pozivnica/[slug]`. Same-deploy as the RSVP guard. |
| ➕ `src/app/pozivnica/[slug]/components/PreviewWatermark.tsx` | Ribbon + diagonal overlay, `pointer-events-none`, "Plati odmah / Plati nakon" CTAs. |
| ✏️ `src/lib/recaptcha.ts` | Add `"payment_notify"` action. |
| ✏️ `src/app/robots.ts` | `Disallow: /placanje`. |
| ➕ `scripts/create-orders-indexes.mjs` | One-off index creation (run against Atlas before first deploy). |
| ✏️ `.env.local` / Vercel env | §8 vars. |

Not touched: `middleware.ts` (no auth gate on /placanje), `/api/qr`, `receipt-items.ts`, `pricing.json` prices (EUR values already present; only add `rodjendan.raspored`-style `priceEur` if missing for a sold kind — all five sold kinds verified present).

---

## 6. Security & money-path invariants

1. **Amounts are NEVER client-derived.** The client sends only `(kind, slug, tier)`; everything money flows from `computeOrder` reading pricing.ts + DB. The `/racun?d=` base64 pattern is explicitly NOT reused for self-serve (buyer-editable payload). The IPS QR amount comes from the frozen `order.amountRsd`; the card amount from the LS variant, cross-checked against frozen `order.amountEur` in the webhook.
2. **Unlock has exactly two doors:** the signature-verified, amount-verified LS webhook, and the admin-JWT approve endpoint. No client code path, server action, or redirect handler may flip a paid flag. The `/hvala` page READS status only.
3. **Replay/duplicate:** raw-body HMAC with `timingSafeEqual`; unique `ls.orderId` index; every status change is a compare-and-swap on the allowed prior status. A replayed webhook, double-clicked approve, or concurrent admin+webhook race all collapse to one unlock.
4. **Refund ⇒ revoke** (full refunds, automatic) with admin notification; partial refunds never auto-revoke (§3). Chargebacks arrive as LS refund/dispute events — same path; LS as MoR eats the dispute process.
5. **Never client-trusted:** amounts, currency, tier contents, `custom_data` (verified against the server-side order record), order status, unlock state, the notify payer name (display-only, length-clamped, transliterated by `toAscii` before hitting the NBS payload — pipe chars stripped by existing `buildIpsPayload` sanitation, which prevents IPS field injection via `|`).
6. **Rate limiting:** notify = recaptcha + 5/IP/h + state machine; card checkout creation = 10/IP/h (in-memory, same pattern as premium create); order creation capped by tuple reuse. Webhook needs none (signature is the gate).
7. **Draft-RSVP-lock coupling (B3, non-negotiable):** the watermarked draft preview and the server-side `draft → 403` on RSVP/audio/gallery guest-writes ship in the SAME deploy — verified above that today the RSVP route would happily accept RSVPs for a draft if the page 404 were relaxed. Client-side form disabling is decoration, not a gate. Grep before ship: every `POST` under `/api/pozivnica/[slug]/` and gallery upload must load the entity and reject `draft`.
8. **Secrets server-side only:** `LEMONSQUEEZY_*` never NEXT_PUBLIC. Webhook route logs event ids, never full payloads with PII to console (Sentry breadcrumbs OK, scrub email).
9. **Test-mode fence:** `meta.test_mode` events are dropped in prod unless `PAYMENTS_ALLOW_TEST=1` (set only during the verification checklist, then removed).

---

## 7. Edge cases & failure modes

1. **Double payment, both rails** (card unlocks while an IPS transfer is in flight): second rail's money arrives against an already-`unlocked` tuple. Webhook side: order already unlocked → its own order record still transitions normally (it's a different order doc only if the buyer re-opened checkout; same doc can't double-transition). Admin side: approve UI shows the "već plaćeno" warning; founder refunds the bank transfer manually (bank rails have no API here). The system's job is to *surface* it, not auto-refund.
2. **Webhook before redirect:** fine — `/hvala` reads `unlocked` immediately.
3. **Redirect before webhook:** `/hvala` shows "Potvrđujemo… (do 30 sekundi)" + refresh loop. If the webhook never lands (LS outage, mis-configured secret): order stuck `pending` with `ls.checkoutId` set → admin "Uplate" view flags card-pending > 10 min; founder opens LS dashboard, confirms the order, and uses **approve** (which works from `pending`) — flags flip, `approvedBy: "admin"`. Reconciliation is manual-first by design; add LS `GET /v1/orders?filter[store_id]` sync later only if this actually happens.
4. **Refund/chargeback after the wedding:** `revoke()` on pozivnica sets `draft: true` on a possibly-past event — acceptable (event over, page dark anyway; EventPassedGuard already handles post-event UX). Admin email always sent so the founder can decide to re-unlock as goodwill.
5. **Currency mismatch:** webhook rejects `currency !== "EUR"` into quarantine (`review` + email). LS store is EUR-only, so this only fires on misconfiguration — which is exactly when you want a human.
6. **LS downtime:** `createCardCheckout` failure → toast "Kartično plaćanje trenutno nije dostupno" and the IPS QR is *already on the page* — graceful degradation is structural, not coded.
7. **Wrong/partial IPS amount:** founder sees actual inflow vs `amountRsd` on the statement (matched by `ipsRef`). Underpaid → reject with `adminNote`, contact buyer (phone is on the entity), or approve anyway (founder's call — the endpoint doesn't verify bank amounts because it can't). Overpaid → approve + refund difference manually. Buyer edits amount in their m-banking app: possible, uncatchable at QR level, caught at the statement — which is why IPS unlock is human-gated, period.
8. **Re-purchase of already-unlocked:** `computeOrder` throws `ALREADY_UNLOCKED` → friendly page state; webhook for a stale checkout on an unlocked entity: `unlock()` idempotent, order records normally, no harm.
9. **KYC-not-yet-approved:** `PAYMENTS_CARD_ENABLED=0` → CheckoutPanel renders IPS-only (no dead button, no "coming soon"). Flipping the env var is the card-rail launch — zero deploy.
10. **Entity deleted with pending order:** webhook `unlock()` targets a missing slug → `patchCouple` matches 0 docs; treat matched-0 in unlock as quarantine (`review` + email), money exists but product doesn't — human refunds via LS.
11. **Price change while checkout open:** frozen `amountEur` vs new variant price mismatch in webhook → quarantine. Ops rule: after editing LS variant prices, cancel open orders (`pending` sweep) — document in §10 runbook.
12. **Punoletstvo bought via rodjendan URL (or vice versa):** `loadEntity` type-check rejects → 404. Same variant/price, but success URLs and copy differ — keep kinds strict.

---

## 8. Env vars (add to Vercel + `.env.local`)

```bash
# Lemon Squeezy (server-only)
LEMONSQUEEZY_API_KEY=            # test key first; swap to live post-KYC
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=     # set when creating the webhook in LS dashboard
LS_VARIANT_OSNOVNI=              # numeric variant ids, one per §3 product
LS_VARIANT_KOMPLETAN=
LS_VARIANT_PREMIUM=
LS_VARIANT_PROSLAVA=             # shared: rodjendan + punoletstvo
LS_VARIANT_RASPORED=
LS_VARIANT_GALERIJA=

# Rollout switches
PAYMENTS_CARD_ENABLED=0          # 0 pre-KYC (IPS-only) → 1 at card launch
PAYMENTS_ALLOW_TEST=0            # 1 ONLY during prod verification, then back to 0

WEB3FORMS_KEY=                   # server alias of NEXT_PUBLIC_WEB3FORMS_KEY (same value)
```

Existing (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`, recaptcha) unchanged.

---

## 9. Build & rollout sequence

**Phase 0 — foundation (no user-visible change):** `orders.ts` + indexes script (run on Atlas) · `kinds.ts` registry + unit-testable `computeOrder` per kind · `nbs-qr.tsx` extraction + `/racun` refactor. Deploy; diff a live receipt QR payload before/after — must be identical.

**Phase 1 — IPS rail live (pre-KYC, immediately monetizable):** `/placanje/[kind]/[slug]` + `CheckoutPanel` (card hidden via env) · notify endpoint + Web3Forms email · admin "Uplate" queue + approve/reject · robots. Entry points NOT yet wired — test via direct URLs.

**Phase 2 — B3 freemium gate (one atomic deploy):** RSVP/audio/gallery `draft → 403` guards + watermarked preview + `PreviewWatermark` publish CTAs ("Plati odmah" → `/placanje/pozivnica/[slug]`, "Plati nakon" → dismissible, link persists in preview ribbon). Per decision: no entry point in `/moje-vencanje`.

**Phase 3 — card rail (LS account exists in test mode from day 1; KYC runs in parallel with Phases 0–2):** LS store + 6 variants + tax-inclusive setting + webhook (test) · `lemonsqueezy.ts`, checkout action, webhook route, `/hvala` · full test-mode verification (below) with `PAYMENTS_ALLOW_TEST=1` on a throwaway prod entity · KYC approved → live API key + live webhook secret → `PAYMENTS_CARD_ENABLED=1`, `PAYMENTS_ALLOW_TEST=0`.

**Manual prod verification checklist (run in order, on production):**

1. `/racun` regression: open a previously-issued receipt link → identical items, total, scannable QR (scan with a real m-banking app, verify prefilled account/amount/RO).
2. Create draft couple via builder → invitation shows watermark, not 404 → **`curl -X POST https://halouspomene.rs/api/pozivnica/<slug>/rsvp/ -d '{"name":"test"...}'` → must be 403** → same for audio + gallery upload endpoints → non-draft couple RSVP still 200.
3. `/placanje/pozivnica/<draft-slug>` → correct RSD tier prices, QR renders, scan shows exact amount + RO; refresh page ×3 → `db.orders` has exactly ONE pending doc for the tuple.
4. "Obavesti nas o uplati" → email arrives at halouspomene@gmail.com with RO + amount → admin Uplate queue shows it → Odobri → couple's `draft` flips false + tier flags set → invitation live, watermark gone → click Odobri again → no error, no state corruption.
5. Reject path: second draft → notify → Odbij → flags untouched, order `canceled`.
6. Card (test mode, `PAYMENTS_ALLOW_TEST=1`): "Plati karticom" → LS checkout shows 85 € tax-inclusive, hr-ish locale → test card `4242…` → redirected to `/hvala` → status flips to unlocked within 30 s → flags verified in `/admin` → LS dashboard "resend webhook" → no double effects, `webhookEvents` has 2 entries.
7. Refund test: refund the test order in LS → order → `revoked`, `draft` back to true, admin email received.
8. Tamper test: replay a captured webhook body with one byte changed → 401; POST garbage to webhook → 401; notify with bogus `orderId` → 4xx, no email.
9. `raspored` kind end-to-end: create standalone seating (starts `active:false`) → pay/approve → `active:true` → PIN login works.
10. Flip `PAYMENTS_ALLOW_TEST=0`, go live, make ONE real 30 € `galerija` card purchase yourself, refund it in LS, confirm the full live round-trip incl. payout dashboard.

---

## 10. Admin ops (founder runbook)

**Card rail:** normally zero-touch — email/Sentry only on quarantined orders (amount/currency mismatch, unknown order, unlock-on-missing-entity) and refunds. LS dashboard is the source for payouts, VAT/MoR paperwork, disputes. Refund = click in LS; the webhook auto-revokes and emails you. Stuck card order (>10 min pending, visible in Uplate) → confirm in LS dashboard → Odobri.

**IPS rail, daily:** email arrives ("[UPLATA] pozivnica/ana-dejan — 9.900 din — RO 483920175046") → open m-banking → match poziv-na-broj + amount → `/admin` Uplate → Odobri (or approve straight from `pending` when someone pays without clicking notify — match by amount + payer name). Reject with a note when amount is short; buyer phone is on the entity. Same business day promise; the buyer-facing copy already sets that expectation.

**Price changes:** edit `pricing.json` (RSD) and/or LS variants (EUR) → cancel/expire open `pending` orders (frozen amounts would otherwise quarantine in the webhook) → deploy. EUR list and RSD list move independently; keep RSD ≤ EUR-equivalent by policy, never by code.

**Escape hatches that must keep working:** admin manual flag toggles in `/admin` (they bypass orders entirely — fine, orders are a ledger not a lock), the `/racun` invoice flow, and `custom_discount` — all untouched by this spec.

---

*Deliberately out of scope v1: tier upgrades (osnovni→kompletan diff pricing), automated bank reconciliation, promo codes on /placanje (B1 stays on the manual `custom_discount` path), LS subscriptions, refund self-service.*
