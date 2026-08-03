# Dev-Log — istorija taskova / inicijativa

Indeks svih praćenih inicijativa (najnovije prvo). Izvor istine za status je
`plan.md` svakog taska (ili navedeni fajl); ovaj fajl je izveden indeks.

## Aktivno / otvoreno
- [code-complete] 2026-08-02 **Biblioteka šema sala (`hall_venues`)** — admin crta i čuva raspored stolova po sali/gradu („Velika sala", „Mala sala 1"), klijent ga u svom editoru pretraži i učita umesto ručnog unosa; zid sale kao novi `decorationType: "wall"` unutar `tables[]` (bez promene formata čuvanja); podloga za Instagram serijal o salama; `tsc`/lint/build čisti, testirano u browseru + regresija na 3 prava rasporeda, čeka ručni test + commit + deploy → `docs/dev-log/2026-08-02-seme-sala-biblioteka/`
- [code-complete] 2026-08-03 **Oldtajmer landing + razdvajanje od luksuzne ponude** — nova monster-SEO stranica `/iznajmljivanje-oldtajmera-za-vencanje` (5 vozila, cene, 14 FAQ, Service/FAQPage/Breadcrumb schema), nav TELEFON → padajuća lista IZNAJMLJIVANJE, blog post `oldtajmer-za-vencanje-zasto-retro`, forma za najam izdvojena u deljenu komponentu; `tsc`/lint/build čisti, čeka fotografije flote + deploy → `docs/dev-log/2026-08-03-oldtajmeri-seo/`
- [in-progress] 2026-07-23 **LS PDV na uplate iz inostranstva** — strana kartica dobija PDV zemlje kupca ODOZGO (LS `tax_inclusive:false`) → order lažno padao u `review`; webhook sada validira neto (`total − tax`), auto-odobrava bilo koju stopu; kod napisan (`tsc` ok), čeka test + deploy → `docs/dev-log/2026-07-23-ls-pdv-inostranstvo/`
- [in-progress] 2026-07-23 **Bypass telefona na svim formama** — deljeni `resolvePhoneAuthorization` + `PhoneAuthField`; bypass sada radi na svih 5 formi (pozivnica/deciji/punoletstvo/raspored/qr-galerija), admin bira odredišni proizvod; `tsc`/lint čist, čeka e2e test + deploy → `docs/dev-log/2026-07-23-bypass-telefon-forme/`
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
- **Outreach salama — serijal „Rasporedi i kapaciteti sala"** (95 sala: 60 runda 2 + 35 dopuna BG/NS/ZR/KG; naslovi, jezgro poruke, A/B varijanta, telefonski otvarač) → `docs/sale-outreach-seme-sala.md`
