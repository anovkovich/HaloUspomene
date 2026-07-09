# Plan B — Remaining Sales Upgrades (promo code · instant IPS QR · freemium)

> Deferred from the /cene overhaul (Plan A). Build order: **B1 → B2 → B3**.
> Dependency: **B3's "publish" checkout IS the B2 instant-IPS-QR screen**, so B2 must land before B3. B1 is independent and highest-value-now (peak season: every wedding exposes the CTA to 50–300 guests).
>
> Coexistence (all three): the admin/payment flow stays 100% manual and authoritative — no webhooks, no optimistic unlocks. Only additive bookkeeping fields.

---

## B1 — Trackable promo code on the guest CTA — Effort: S–M

**MVP:** attribution + a code the admin honors manually via the existing `custom_discount`. No promo-code engine, no validation endpoint, no redemption table.

1. `src/components/marketing/InvitationOfferCTA.tsx` — change href to carry params: `/izrada-pozivnica-online?ref=gost&code=GOST500`. Add optional `slug?: string` prop; the ~8 call sites (classic `RSVPFrom.tsx`, premium themes, `rsvp/[id]` forms, birthday form) pass the wedding's slug → `&od=<slug>`. Stays a server component. Gives you **which wedding sourced the lead** — the most valuable attribution you don't currently have.
2. Landing persistence: on `/izrada-pozivnica-online`, read `code`/`od` params in a tiny client effect → `localStorage` (survives hop to `/napravi-pozivnicu`); the builder reads them and posts with the body; `/api/pozivnica/create` persists `promo_code` + `referred_by_slug` on `WeddingData` (two optional fields in `types.ts` — additive, no migration).
3. Fire a GA4 event on CTA click (if analytics ever re-enabled) — optional; `ref=gost` shows in landing reports for free.
4. **Redemption = existing manual flow:** admin sees `promo_code: "GOST500"` on the couple in `/admin`, sets `custom_discount: 500` — `buildReceiptUrl` already carries it (`d` field) and `/racun` already subtracts it. Zero payment-logic change. Surface it: small badge in the admin couple row when `promo_code` set (~10 lines).

**Founder decisions:** code value (rec 500 din flat); referring couple reward (rec: none in MVP); code string (baked in component).
**Risk:** near-zero (additive fields, one link change).

---

## B2 — Instant IPS QR at the moment of intent — Effort: M

Today the NBS IPS QR exists only behind `receipt_valid`, which only admin flips. Goal: buyer scans a pay-QR the moment they decide; admin confirmation of the bank inflow stays 100% manual.

**MVP:** a self-serve payment page, **server-rendered**, that reuses the NBS QR machinery and prices **from the DB server-side** — NOT the `/racun?d=` base64 (client-trusted amounts must never become self-serve; a buyer could edit the payload).

1. New route `src/app/placanje/[slug]/page.tsx` (server component): loads couple via `src/lib/couples.ts`, computes amount **server-side** from the couple's actual DB fields + `pricing.ts` (tier/premium detection, add-ons, `custom_discount`, honoring the Plan A snapshot/pricing). Renders name, itemized list, total, and the IPS QR by extracting `NbsQrCode` + `toAscii` from `racun/page.tsx` into `src/lib/nbs-qr.tsx` (shared util). Payload identical: `K:PR|V:01|C:1|R:<acct>|N:HALO USPOMENE\nNOVI SAD|I:RSD<amount>,00|SF:189|S:<payer>|RO:<ref>` via existing `/api/qr` proxy. Erste default account.
2. **Bank-statement matching:** set `RO`/poziv-na-broj to a deterministic slug-derived reference; keep `payment_ref` on the couple → morning bank check matches inflow → couple in seconds.
3. **Intent record:** on open (or explicit "Plaćam"), write `payment_intent_at` + snapshot amount onto the couple via a NARROW server action in `placanje/actions.ts` (only these two fields — do NOT reuse admin-JWT-gated PATCH). Admin list shows "Čeka uplatu — X din" badge.
4. Copy sets expectations: "Uplata se obično proknjiži isti radni dan. Potvrdićemo aktivaciju porukom." No optimistic unlock.
5. Access: gate behind portal auth (verify `moje_vencanje_auth` JWT server-side) — buyer at moment-of-intent is already logged in.

**Founder decisions:** entry points (rec: `/moje-vencanje` overview banner + post-create success screen + B3 publish gate); price lock at intent vs recompute (rec: recompute at load); bank account (keep Erste default).
**Coexistence:** admin `/racun?d=` receipt flow untouched (formal invoice); `/placanje` is a parallel DB-priced pay surface. `receipt_valid` semantics unchanged.

---

## B3 — Freemium: build free → pay to publish — Effort: L (depends on B2)

**MVP:** convert the prod draft-404 into a watermarked, RSVP-locked live preview, with a publish gate routing into B2, and one-click admin un-draft. Nothing optimistic — `draft` flips only by admin after the bank shows money.

**Build steps in order of what must never ship separately:**

1. **Server-side RSVP lock FIRST (same commit as the preview — NON-NEGOTIABLE).** `POST /api/pozivnica/[slug]/rsvp` currently checks only the deadline. Add: load couple, `if (couple.draft) return 403`. Verify audio/gallery endpoints also reject drafts.
2. **Preview rendering.** `pozivnica/[slug]/page.tsx:56` — replace `notFound()` with `<InvitationClient data={weddingData} slug={slug} preview />`. In preview: (a) fixed watermark ribbon "PREGLED — pozivnica još nije objavljena · HaloUspomene" + subtle diagonal overlay (new `PreviewWatermark.tsx`, pointer-events-none; the RSVP lock is the real gate, watermark is honesty); (b) RSVP form disabled: "Potvrde dolaska se otključavaju objavljivanjem" + publish CTA; (c) `robots: { index: false }` when draft (same as premium pages).
3. **Publish gate → B2.** Preview ribbon "Objavi pozivnicu" + `/moje-vencanje` overview card → `/placanje/[slug]`. After intent, ribbon copy → "Čekamo potvrdu uplate." Still `draft: true`.
4. **Admin one-click publish.** Add "Objavi" button on the admin couple row → `PATCH { draft: false }` via existing `/api/admin/couples/[slug]` (same pattern as `receipt_valid` toggles). Daily-driver — must be one click.
5. **Funnel entry.** `/api/pozivnica/create` already produces the right object (draft:true, paid_for_*:false, auto-password, returns { slug }) and is protected by reCAPTCHA + SMS verification + 5/IP/hour rate limit — abuse surface handled. Builder success screen links to the preview URL + portal login (how the couple learns the auto-password: MVP keeps manual, or show once on success screen — founder decision).

**Founder decisions:** draft retention (rec: keep indefinitely MVP; SMS-gated creation self-limits volume); watermark aggressiveness (rec: ribbon + hero overlay); locked teasers for raspored/audio/galerija in preview (rec: yes — upsell surface); auto-password reveal.

**🔴 Single biggest risk (B3 step 1):** the draft-404 is currently the ONLY wall — RSVP endpoint checks only the deadline, web has no watermark. If the preview ships without the server-side `draft` RSVP rejection, every free signup gets a complete working invitation (guests RSVP, couple tracks in portal) → zero reason to pay. Client-side disabling is NOT a gate. The API guard + preview render must be ONE atomic deploy, manually prod-tested (create draft → try POST RSVP directly) before announcing.

---

## Sequence summary

| Order | Item | Effort | Depends on |
|---|---|---|---|
| 1 | B1 promo code + attribution | S–M | nothing |
| 2 | B2 `/placanje/[slug]` IPS QR | M | Plan A pricing (soft) |
| 3 | B3 freemium preview + publish gate | L | **B2 (hard)**, B1 (soft) |
