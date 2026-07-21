# HaloUspomene — opšti pregled (isporučeno + otvoreno)

- **ID:** 2026-07-20-halouspomene-pregled
- **Status:** in-progress (većina feature-a isporučena; otvoreno: DB backup setup, svadbene uloge, Infobip Viber failover)
- **Created:** 2026-07-20
- **Owner:** Aleksa

> Ovo NIJE plan pojedinačnog taska — ovo je **referentna slika** projekta:
> šta je isporučeno, koje trajne invarijante MORAju da se poštuju pri budućim
> izmenama, i šta je još otvoreno. Nastalo konsolidacijom 8 „gotovih" planova iz
> `docs/` (originali obrisani; git ih čuva). Live detalji su u kodu + auto-memoriji
> (`.claude/.../memory/`), ne ponavljaju se ovde — ovde su samo trajne odluke i gotcha-e.

## Isporučeno (sa trajnim invarijantama)

- **Moje Venčanje portal (sidebar + vendor direktorijum).** Odluka: **Option B —
  client-side view switching** (jedan route, `?tab=`) umesto nested ruta, jer
  checklist/budget dele state; upgrade ka nested rutama ostaje moguć. Memory:
  `project_moje_vencanje_dashboard`.
- **Public `/vendori` direktorijum.** Politika: javni listing NAMERNO ne prikazuje
  kontakt/opis/tier badge (svi vendori izgledaju isto) — vrednost je iza
  registracije (`QuickRegisterModal`). Ne „popraviti" to greškom kasnije.
- **Payment sistem (Plan B + `/placanje` IPS + builder-checkout + promo).**
  Money-safety invarijante (v. dole). LemonSqueezy live od 2026-07-15; builder
  checkout iza `NEXT_PUBLIC_BUILDER_CHECKOUT=1` (2026-07-16). Memory:
  `project_lemonsqueezy_setup`, `project_promo_codes`, `project_instant_delivery`.
- **Promo kodovi.** Shipovano **10% / `PROMO10HU`** (NE fiksnih €10/`SVADBA10` iz
  starog plana), eligibility = pozivnica + rođendan + punoletstvo. Stateless HMAC +
  LS discount. Autoritativno: memory `project_promo_codes`.
- **Photo QR galerija.** Code-complete (Phase 1–4 + v1 hardening: HEIC konverzija,
  ZIP download, lifecycle cron, per-device identitet). R2 storage zbog $0 egress;
  presigned-URL upload. Autoritativno: memory `project_photo_qr_gallery`.
- **Infobip 2FA** (verifikacija telefona). OTP 4-cifre; **SMS primarni kanal,
  Viber failover NIJE implementiran** (kod: „can be added later"). Setup:
  `scripts/setup-infobip.mjs` → `INFOBIP_2FA_APP_ID` / `INFOBIP_2FA_MESSAGE_ID`.

## Trajne invarijante — money-safety (NE kršiti pri izmeni naplate/RSVP-a)
- **Quarantine na amount mismatch:** ako uplaćeni iznos ne odgovara očekivanom →
  zapis u quarantine, ne auto-unlock. `kind`/`slug`/`tier` u LS `custom_data` su
  pravi integrity check, ne dekoracija.
- **Ništa „flat" nije naplativo online** → unlock je čisto ADITIVAN, pa nema leak-a.
- **Z1 provera ide po FLAGOVIMA (`paid_for_*`), ne po `builder_extras`** — štiti i
  legacy draftove.
- **B3 draft-guard:** `if (couple.draft) return 403` na RSVP endpointu MORA da ide u
  ISTOM deploy-u kao preview render (`PreviewWatermark`). Draft-404 je ranije bio
  jedini zid; kad se pravi vidljiv preview, server-side gate je obavezan istovremeno.
- **USB suvenir = pouzeće** (van online payment sistema).

## Otvoreno / aktivno (živi zasebni fajlovi)
- **DB backup** (`docs/DB_BACKUP_PLAN.md`) — workflow postoji (`.github/workflows/db-backup.yml`)
  ali **nikad nije radio** (bio na `main`); fale GitHub secrets `MONGODB_URI` +
  `GMAIL_APP_PASSWORD`, Atlas `0.0.0.0/0` allowlist, workflow write-perm, prvi test.
  Restore: `gh release download` + `mongorestore --gzip --archive --drop`. Gap:
  Vercel Blob (audio/premium slike) NIJE u backup-u. Ovo je jedini backup — ne brisati.
- **Svadbene uloge** (`docs/WEDDING_ROLES.md`) — nezapočeto; data model
  `WeddingRoleSlot[]` u `wedding_portal`, 7 default slotova, sub-tab u `GuestsCard`.
- **Instagram marketing** (`docs/MARKETING-instagram-plan.md`) — živi playbook.
- **B2B outreach salama** — `docs/sale-round-{1of2,2of2}.md` + `sale-outreach-message.md`.

## Data assets
- `docs/vendor-directory-serbia.md` — ~260 vendora (source za `vendor-constants.ts`;
  drži pun set telefona/IG/kapaciteta, širi od koda).
- `docs/vendor-outreach-data.md` — konsolidovane email liste po kategoriji.
- Konkurent weddingwonderland.rs: naša prednost = realni kontakti + „pozivnice"
  kategorija koju oni nemaju (njihov vendor-listing je bio placeholder, odbačen).

## Konsolidacija (šta je urađeno ovom sesijom)
Obrisano 8 „gotovih" planova (sadržaj destilovan gore + u memoriji) i 4 email fajla
(spojena u `vendor-outreach-data.md`). Zadržani živi fajlovi: DB_BACKUP_PLAN,
WEDDING_ROLES, MARKETING-instagram-plan, vendor-directory-serbia. V. `log.md`.

## Open questions
- DB backup: kad će se dodati secrets + odraditi prvi test run? (blokira jedini backup)
- Infobip Viber failover: da li uopšte treba (SMS radi)?
