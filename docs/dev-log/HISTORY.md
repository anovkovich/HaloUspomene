# Dev-Log — istorija taskova / inicijativa

Indeks svih praćenih inicijativa (najnovije prvo). Izvor istine za status je
`plan.md` svakog taska (ili navedeni fajl); ovaj fajl je izveden indeks.

## Aktivno / otvoreno
- [in-progress] 2026-07-23 **LS PDV na uplate iz inostranstva** — strana kartica dobija PDV zemlje kupca ODOZGO (LS `tax_inclusive:false`) → order lažno padao u `review`; webhook sada validira neto (`total − tax`), auto-odobrava bilo koju stopu; kod napisan (`tsc` ok), čeka test + deploy → `docs/dev-log/2026-07-23-ls-pdv-inostranstvo/`
- [planned] 2026-07-23 **Bypass telefona na svim formama** — bypass link (strani kupci, preskoči SMS) radi SAMO na `/napravi-pozivnicu`; deciji/punoletstvo/raspored/qr-galerija gase strane kupce na SMS koraku; plan za deljeni helper + ožičavanje 4 forme → `docs/dev-log/2026-07-23-bypass-telefon-forme/`
- [done] 2026-07-22 **Vendor + prijatelj promo kodovi** — vendor referral (5/10%, provizija) + prijatelj gift kodovi (50/75%, single-use, random PRIJATELJ####) na admin Uplate tabu; deployano + Vercel env postavljen (2026-07-23) → `docs/dev-log/2026-07-22-vendor-promo-kodovi/`
- [in-progress] 2026-07-20 **B2B outreach salama (QR pano dobrodošlice)** — 120 verifikovanih mejlova; runda 1 (60) POSLATA, runda 2 (60) čeka; sledi telefonski follow-up → `docs/sale-round-1of2.md` · `sale-round-2of2.md` · `sale-outreach-message.md`
- [in-progress] 2026-07-20 **HaloUspomene — opšti pregled (isporučeno + otvoreno)** — referentna slika: shipped feature-i + trajne invarijante + otvorene stavke; konsoliduje 8 gotovih planova → `docs/dev-log/2026-07-20-halouspomene-pregled/`
- [in-progress] **DB backup (nightly Mongo → GitHub Releases)** — workflow napisan ali NIKAD nije radio (bio na `main`, fale secrets + Atlas allowlist); sadrži restore runbook → `docs/DB_BACKUP_PLAN.md`
- [planned] **Svadbene uloge (kum/kuma/dever/barjaktar…)** — dizajn i data model gotovi, feature NIJE započet (~430 lin / 3-4h) → `docs/WEDDING_ROLES.md`
- [in-progress] **Instagram marketing playbook** — živi operativni plan (faceless, solo founder); nije kod → `docs/MARKETING-instagram-plan.md`

## Isporučeno (istorijski — detalji u pregledu/memoriji/kodu)
- [done] **Payment sistem** (Plan B + `/placanje` IPS + builder-checkout + promo + LemonSqueezy live 2026-07-15) — invarijante u pregledu; live stanje u memory `project_lemonsqueezy_setup`
- [done] **Photo QR galerija** (upload gostiju → R2 → par preuzima) — code-complete; v. memory `project_photo_qr_gallery`
- [done] **Moje Venčanje sidebar + vendor direktorijum** — v. memory `project_moje_vencanje_dashboard`
- [done] **Public `/vendori` direktorijum** (SEO + lead-gen gate)
- [done] **Infobip 2FA** (OTP telefona) — SMS primarni; **Viber failover NEURAĐEN** (jedini otvoreni TODO)

## Data / reference (ne-planovi)
- **Vendor dataset ~260 sala/vendora** (6 gradova × 11 kategorija, source za `vendor-constants.ts`) → `docs/vendor-directory-serbia.md`
- **Vendor outreach email data** (muzika/torte/cveće/foto/sale — konsolidovano) → `docs/vendor-outreach-data.md`
