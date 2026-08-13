/**
 * Podešava GA4 property tako da događaji koje sajt šalje budu upotrebljivi.
 *
 *   node scripts/ga4-setup.mjs           # suvi hod — samo ispisuje šta bi uradio
 *   node scripts/ga4-setup.mjs --apply   # stvarno upisuje
 *
 * Zahteva service account sa ULOGOM EDITOR na property-ju (Viewer nije dovoljan),
 * na putanji iz `GOOGLE_APPLICATION_CREDENTIALS` ili `~/.secrets/halo-analytics.json`.
 *
 * ZAŠTO POSTOJI: GA4 ne izlaže parametre događaja izveštajima ni Data API-ju
 * dok se ne registruju kao custom dimenzije — i registracija VAŽI SAMO UNAPRED,
 * istorija se ne popunjava unazad. Bez ovoga `section_view.section_id` i
 * `scroll_depth.depth_percent` se prikupljaju ali su nevidljivi.
 *
 * Skripta je idempotentna: postojeće dimenzije/key event-e preskače.
 */
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PROPERTY = "524092885";
const APPLY = process.argv.includes("--apply");

const credPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(homedir(), ".secrets", "halo-analytics.json");
const key = JSON.parse(readFileSync(credPath, "utf8"));

const b64 = (o) =>
  Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

let cached;
async function token() {
  if (cached) return cached;
  const iat = Math.floor(Date.now() / 1000);
  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/analytics.edit",
      aud: "https://oauth2.googleapis.com/token",
      exp: iat + 3600,
      iat,
    });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const r = await (
    await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${sig}`,
      }),
    })
  ).json();
  if (!r.access_token) throw new Error(JSON.stringify(r));
  return (cached = r.access_token);
}

async function call(method, urlPath, body) {
  const res = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error(`${res.status} (odgovor nije JSON)`);
  }
  if (!res.ok) throw new Error(`${res.status} ${j.error?.message || text.slice(0, 160)}`);
  return j;
}

/**
 * Parametri koje sajt STVARNO šalje — izvedeno iz `src/utils/analytics.ts` i
 * `data-track-*` atributa. Ako se doda nov parametar, dodaj ga i ovde, inače
 * je nevidljiv u izveštajima.
 *
 * `page_path` i `page_title` namerno NISU ovde — GA4 ih već ima kao ugrađene
 * dimenzije `pagePath` / `pageTitle`, pa bi duplikat trošio slot bez koristi.
 */
// PAŽNJA: GA4 za `displayName` prima ISKLJUČIVO slova engleske abecede, cifre,
// donju crtu i razmak. Crtica, procenat, kosa crta i naša slova (š, ž, ć, đ, č)
// vraćaju HTTP 400. Zato su nazivi bez dijakritike; pun opis ide u `description`,
// koje je tolerantnije.
const DIMENSIONS = [
  ["cta_name", "CTA naziv", "Koje dugme je kliknuto (cta_click)"],
  ["cta_location", "CTA mesto", "Sekcija iz koje je dugme kliknuto (cta_click)"],
  ["section_id", "Sekcija", "id sekcije koju je posetilac video (section_view)"],
  ["depth_percent", "Dubina skrola procenat", "25 / 50 / 75 / 100 (scroll_depth)"],
  ["question", "FAQ pitanje", "Pitanje koje je otvoreno (faq_interaction)"],
  ["form_name", "Naziv forme", "Koja forma je poslata (form_submit)"],
  ["package_name", "Paket", "Koji paket je kliknut (package_click)"],
  ["platform", "Drustvena mreza", "email / whatsapp / instagram (social_click)"],
  ["link_name", "Navigacija link", "Kliknuta stavka navigacije (nav_click)"],
  ["nav_location", "Navigacija mesto", "Zaglavlje ili podnozje (nav_click)"],
  ["city_name", "Grad", "Gradska stranica (location_view)"],
  ["blog_slug", "Blog slug", "Procitan clanak (blog_read)"],
  ["nudge_state", "Ponuda rasporeda stanje", "unpaid ili paid_empty (seating_nudge_*)"],
  ["nudge_stage", "Ponuda rasporeda okidac", "soft ili strong (seating_nudge_*)"],
];

/** Radnje koje se broje kao konverzija. `form_submit` je naš jedini pravi lead. */
const KEY_EVENTS = ["form_submit"];

const tag = APPLY ? "" : "  [suvi hod] ";
console.log(
  APPLY
    ? "\n>>> UPISUJEM u GA4 property " + PROPERTY + "\n"
    : "\n>>> SUVI HOD — ništa se ne menja. Pokreni sa --apply da upišeš.\n",
);

// ── 1. Zadržavanje podataka ───────────────────────────────────────────────────
const ret = await call("GET", `properties/${PROPERTY}/dataRetentionSettings`);
console.log("── Zadržavanje podataka ──");
if (ret.eventDataRetention === "FOURTEEN_MONTHS") {
  console.log("  već FOURTEEN_MONTHS — preskačem");
} else {
  console.log(`${tag}  ${ret.eventDataRetention} → FOURTEEN_MONTHS (najduže na besplatnom GA4)`);
  if (APPLY) {
    await call(
      "PATCH",
      `properties/${PROPERTY}/dataRetentionSettings?updateMask=eventDataRetention`,
      { eventDataRetention: "FOURTEEN_MONTHS" },
    );
    console.log("  ✓ postavljeno");
  }
}

// ── 2. Custom dimenzije ───────────────────────────────────────────────────────
console.log("\n── Custom dimenzije ──");
const existing = new Set(
  (
    (await call("GET", `properties/${PROPERTY}/customDimensions`)).customDimensions || []
  ).map((d) => d.parameterName),
);

for (const [param, label, desc] of DIMENSIONS) {
  if (existing.has(param)) {
    console.log(`  već postoji: ${param}`);
    continue;
  }
  console.log(`${tag}  + ${param.padEnd(15)} "${label}"`);
  if (APPLY) {
    await call("POST", `properties/${PROPERTY}/customDimensions`, {
      parameterName: param,
      displayName: label,
      description: desc,
      scope: "EVENT",
    });
  }
}

// ── 3. Key events (konverzije) ────────────────────────────────────────────────
console.log("\n── Key events ──");
const keys = new Set(
  ((await call("GET", `properties/${PROPERTY}/keyEvents`)).keyEvents || []).map(
    (e) => e.eventName,
  ),
);
for (const ev of KEY_EVENTS) {
  if (keys.has(ev)) {
    console.log(`  već postoji: ${ev}`);
    continue;
  }
  console.log(`${tag}  + ${ev}`);
  if (APPLY) {
    await call("POST", `properties/${PROPERTY}/keyEvents`, {
      eventName: ev,
      countingMethod: "ONCE_PER_SESSION",
    });
  }
}
console.log(
  `  (zatečeni: ${[...keys].join(", ") || "—"} — GA4 podrazumevani, sajt ih ne šalje; ostavljeni)`,
);

console.log(
  APPLY
    ? "\n>>> Gotovo. Podaci za nove dimenzije počinju da se skupljaju OD SADA — GA4 ne popunjava unazad.\n"
    : "\n>>> Suvi hod završen. Pokreni sa --apply.\n",
);
