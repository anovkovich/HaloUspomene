# HALO Uspomene — 90-Day Marketing Roadmap

## Week 1-2: Technical SEO Foundation

### GA4 Setup (manual steps)
1. analytics.google.com → Create property "HALO Uspomene" → Web stream → `halouspomene.rs`
2. Copy Measurement ID `G-XXXXXXXXXX` → paste into `.env.local` as `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
3. Also set it in GitHub Pages deployment environment (Settings → Secrets/Variables)
4. GA4 Admin → Events → mark `form_submit` and `contact_channel_click` as Key Events
5. GA4 Admin → Product Links → Link Search Console

### Google Search Console
1. Submit sitemap: `https://halouspomene.rs/sitemap.xml`
2. Request indexing for all 11 URLs individually via URL Inspection tool
3. Fix any crawl errors that appear

### Fix placeholder data in code
- Replace `+381601234567` with real phone in layout.tsx schema + ContactForm.tsx buttons
- Replace `info@halouspomene.rs` with real email in layout.tsx schema
- Audit `aggregateRating.reviewCount: "47"` — remove or set to real number

### Performance quick wins
- Convert Hero phone.png to WebP
- Add width/height to all `<img>` tags for CLS prevention

---

## Week 3-4: Content Velocity

### 4 new blog posts (2/week), priority order:
1. "Audio Guest Book Cena u Srbiji 2026: Koliko Košta?" — pricing query (high buyer intent)
2. "10 Originalnih Ideja za Venčanje u Srbiji 2026" — top-of-funnel traffic magnet
3. "Audio Guest Book Iskustva: Šta Kažu Parovi" — social proof
4. "Planiranje Venčanja 2026: Kompletna Checklista" — evergreen

### Then: 1 post/week through wedding season (May-Oct)

---

## Week 5-8: Local SEO Domination

### Google Business Profile (critical)
1. Create at business.google.com — category "Wedding Service"
2. Service area: all 6 cities
3. Upload 10+ photos (phone, booth, setups, couples)
4. Post weekly (blog shares, testimonials, BTS)

### Serbian wedding directories
- Svadbaland.com (#1 Serbian wedding portal — most important)
- Vencanica.rs, MojSvadba.rs, Organizuj.rs
- Pazar3.rs, KupujemProdajem.com (services category)
- Ensure NAP (Name/Address/Phone) is identical everywhere

### Review generation
- 3 days post-wedding: WhatsApp message with direct Google review link
- Target: 5 reviews month 1, then 2-3/month
- Respond to every review within 24h

---

## Week 9-12: Growth Channels

### Instagram (@halo_uspomene) — 5x/week:
- 2x emotional hooks (audio clips from real weddings — your killer content)
- 1x behind-the-scenes
- 1x educational tips
- 1x social proof
- 2x Reels/week with trending audio
- Daily Stories: polls, Q&A, countdowns

### Partnerships (highest ROI)
- 10-15 wedding photographers across 6 cities → 10% referral fee
- Wedding planners → get on their recommended vendor list
- Venue partnerships → brochures at reception

### Referral program
Past clients get bonus for each referral booking

### Wedding fairs
Belgrade Sajam Venčanja (March/April) — register for booth (200-500 EUR, direct access to 500+ brides)

---

## Ongoing: Analytics-Driven Optimization

### Weekly (15 min)
GA4 sessions, form_submit count, top CTAs

### Monthly (1 hour)
Full review of GA4 + GSC + GBP + Instagram metrics

### A/B tests (one at a time, 2 weeks each)
1. Hero headline variations
2. CTA text: "Zakažite konsultacije" vs "Proverite dostupnost za vaš datum"
3. Show price ranges on Packages vs. "contact for price"

### Quick CRO wins
- Floating WhatsApp button on mobile
- Urgency on contact form: "Slobodnih termina za Jun: još 2"
- Mini social proof under Hero CTA

---

## Event Taxonomy (implemented in code)

| Event | Params | Trigger |
|-------|--------|---------|
| `cta_click` | `cta_name`, `cta_location` | Any CTA button (via data-track) |
| `package_click` | `package_name` | Packages CTA (via data-track) |
| `form_submit` | `form_name` | ContactForm (already works via onClick) |
| `contact_channel_click` | `channel` | WhatsApp/Viber/Phone (already works via onClick) |
| `scroll_depth` | `depth_percent`, `page_path` | Auto: 25/50/75/100% |
| `section_view` | `section_id`, `page_path` | Auto: any `<section id>` hits 30% viewport |
| `faq_interaction` | `question` | Auto: FAQ checkbox toggled open |
| `social_click` | `platform`, `location` | Footer Instagram (via data-track) |
