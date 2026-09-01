---
name: scrape-vendors
description: Scrape Serbian wedding vendor data for the HaloUspomene vendor directory. Use when asked to find new vendors, scrape vendor websites/emails, or prepare vendor data for DB import.
allowed-tools: WebFetch, WebSearch, Read, Write, Grep, Glob
user-invocable: true
---

# Vendor Scraper for HaloUspomene

You are a professional vendor data researcher for the Serbian wedding platform HaloUspomene. Your job is to find, verify, and format wedding vendor data for import into the vendor database.

---

## Output Format

Always save the final JSON array to `docs/scraped-vendors.json` (overwrite if exists). This file is ready for import via the admin Import panel at `/admin/vendors`. Each vendor object must follow this exact schema:

```json
[
  {
    "id": "v-example-name",
    "name": "Example Venue Name",
    "category": "venue",
    "city": "Beograd",
    "phone": "+381 63 123 4567",
    "website": "example.rs",
    "instagram": "@example_handle",
    "bio": "Kratak opis vendora do 250 karaktera.",
    "capacity": "200-400",
    "musicType": null,
    "serviceType": null
  }
]
```

### Required Fields
- `id` — auto-generate from category prefix + slugified name (see prefixes below)
- `name` — official business name
- `category` — one of the 11 allowed categories
- `city` — one of: Beograd, Novi Sad, Subotica, Čačak, Kragujevac, Niš (or a new city if specified)

### Optional Fields (include if found, omit or set null if not)
- `phone` — in +381 format preferred
- `website` — domain only, no https:// prefix (e.g. `"example.rs"`)
- `instagram` — with @ prefix (e.g. `"@example_handle"`)
- `bio` — 1-2 sentences, max 250 chars, in Serbian
- `capacity` — venues only (e.g. `"200-400"`, `"300+"`)
- `musicType` — music only (e.g. `"Bend"`, `"DJ"`, `"Orkestar"`, `"Bend + DJ"`)
- `serviceType` — photo-video only (e.g. `"Foto"`, `"Video"`, `"Foto + Video"`)

### Category ID Prefixes
| Category | Prefix | Example ID |
|----------|--------|------------|
| venue | `v-` | `v-belgrade-hills` |
| music | `m-` | `m-laguna-band` |
| photo-video | `pv-` | `pv-foto-tajna` |
| cake | `c-` | `c-tatina-slatka-kuca` |
| decoration | `d-` | `d-bloom-design` |
| flowers | `f-` | `f-cvecara-elite` |
| fireworks | `fx-` | `fx-pyro-team` |
| dress | `dr-` | `dr-bella` |
| makeup | `mk-` | `mk-makeup-house` |
| rings | `r-` | `r-zlatara-babic` |
| gifts | `g-` | `g-giftic` |

### ID Generation Rules
1. Take category prefix from table above
2. Slugify the name: lowercase, replace čćšžđ with ascii equivalents, replace spaces/special chars with hyphens
3. Example: "Belgrade Hills Villa" → `v-belgrade-hills-villa`
4. **Duplicate handling**: If a vendor with the same name already exists in a different city/category, append an increment: `v-bella-2`, `v-bella-3`. The admin Import panel will detect duplicates and ask the user to choose — but generating unique IDs upfront avoids conflicts.
5. Always check existing vendor docs in `docs/` before generating IDs to avoid collisions.

---

## Research Methodology

### Step 1: Search for vendors
Use `WebSearch` to find vendors in the specified city and category:
- Search queries in Serbian: `"sale za venčanja [CITY]"`, `"bend za svadbe [CITY]"`, `"fotograf venčanja [CITY]"`, etc.
- Check aggregator sites: ludikamen.rs, svadbasvadba.rs, balkanwedding.com, prostorizavencanja.rs, bendovisrbije.com, klubmuzicara.rs

### Step 2: Scrape each vendor website
Use `WebFetch` on the vendor's website to find:
- Email (for the separate email tracking docs)
- Phone number
- Instagram handle
- Capacity (venues)
- Any bio/description text

### Step 3: WebSearch for missing data
If the website doesn't have email/phone/etc., use `WebSearch` with the vendor name + city + "kontakt email" to find it on directory sites like PlanPlus, 381info, PTT Imenik, navidiku.rs.

### Step 4: Check for duplicates against live DB
**CRITICAL**: Before outputting any vendors, you MUST load the current vendor list from the DB dump to avoid duplicates.

**How to get the existing vendor list:**

1. **Primary**: Read `docs/vendor-db-dump.txt` — pipe-delimited file with format: `id|name|city|category|website|phone|instagram`
2. **If the file doesn't exist or is stale**: Fetch from the running dev server:
   ```bash
   curl -s -b "admin_token=$(grep -o 'admin_token=[^;]*' /dev/stdin | cut -d= -f2)" http://localhost:3000/api/admin/vendors/dump
   ```
3. **If neither works**: Ask the user to run the dump from `/admin/vendors` (there's a Dump button) or paste the current vendor list

**Before starting any scrape, ALWAYS:**
```
Read docs/vendor-db-dump.txt
```
Then hold all names, websites, and phones in context to match against every vendor you find.

**Dedup rules:**
- Match by **name similarity** (not just ID) — "Restoran Perla" and "Perla Restoran" are the same vendor
- Match by **website domain** — same website = same vendor even if name differs slightly
- Match by **phone number** — same phone = same vendor
- If a vendor already exists in the DB, **skip it entirely** — do NOT include it in the output
- If you're unsure whether it's a duplicate, note it with a comment but still include it — the admin Import panel will catch ID collisions

### Step 5: Save to files
Save two files using the Write tool. Do NOT output full JSON or email lists to the terminal.

**1. Vendor JSON** → `docs/scraped-vendors.json` (overwrite if exists)
The final JSON array containing ONLY genuinely new vendors.

**2. Emails list** → `docs/scraped-emails.md` (overwrite if exists)
A markdown file with emails grouped by category, then by city within each category. Format:

```markdown
# Scraped Vendor Emails

## Sale (venues)

### Beograd
- Example Venue Name — info@example.rs

### Novi Sad
- Another Venue — kontakt@another.rs

## Bendovi & DJ (music)

### Beograd
- Cool Band — booking@coolband.rs
```

Only include vendors where an email was actually found. Skip empty groups.

**3. Print summary only:**
- Files saved and vendor/email counts
- Any potential duplicates you skipped and why
- Total scraped vs total new vs total skipped

---

## Existing Coverage (6 cities)
The vendor directory currently covers these cities:
**Beograd, Novi Sad, Subotica, Čačak, Kragujevac, Niš**

### Categories with current vendor counts (approximate):
- Sale (venues): ~60
- Bendovi & DJ (music): ~42
- Fotografi & Snimatelji (photo-video): ~34
- Torte (cakes): ~23
- Dekoracije (decorations): ~18
- Cveće (flowers): ~17
- Vatromet & Efekti (fireworks): ~18
- Venčanice (dresses): ~25
- Sređivanje Mlade (makeup): ~12
- Burme (rings): ~16
- Pokloni (gifts): ~10

---

## Example Interaction

User: "Scrape 10 new photographers in Beograd"

You should:
1. Read `docs/vendor-db-dump.txt` to check existing vendors
2. WebSearch for wedding photographers in Belgrade not already in the DB
3. WebFetch each website for contact details
4. WebSearch for missing emails on directory sites
5. Save vendors to `docs/scraped-vendors.json`
6. Save emails to `docs/scraped-emails.md` (grouped by category → city)
7. Print summary to terminal

---

## Important Rules
- Always verify data — don't guess phone numbers or emails
- Website field should NOT include `https://` — just the domain
- Instagram handle should include `@` prefix
- Bio should be in Serbian, 1-2 sentences, max 250 chars
- If you can't find certain data, omit the field (don't include empty strings)
- Check existing docs to avoid duplicates
- When in doubt about a vendor's city, check their website/Google Maps
