/**
 * Faza 0 — merenje pre/posle refaktora + puni GSC izveštaj.
 *
 *   node scripts/analytics-baseline.mjs                     # 90 dana, ispis
 *   node scripts/analytics-baseline.mjs --days 180
 *   node scripts/analytics-baseline.mjs --json out.json --md out.md
 *
 * Autentifikacija: service account JSON na putanji iz
 * `GOOGLE_APPLICATION_CREDENTIALS` (podrazumevano `~/.secrets/halo-analytics.json`).
 * Nalog mora imati pristup GA4 property-ju i GSC property-ju.
 *
 * NAPOMENA o GA4: parametri događaja (`section_id`, `depth_percent`, `cta_name`…)
 * vidljivi su Data API-ju tek kada su registrovani kao custom dimenzije —
 * v. `scripts/ga4-setup.mjs`. Registracija VAŽI SAMO UNAPRED.
 */
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const GA4_PROPERTY = "524092885";
const GSC_SITE = "sc-domain:halouspomene.rs";
const ORIGIN = "https://halouspomene.rs";
const HOME_URL = `${ORIGIN}/`;

const args = process.argv.slice(2);
const argVal = (f, d) => (args.indexOf(f) === -1 ? d : args[args.indexOf(f) + 1]);
const DAYS = Number(argVal("--days", "90"));
const OUT_JSON = argVal("--json", null);
const OUT_MD = argVal("--md", null);

const key = JSON.parse(
  readFileSync(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(homedir(), ".secrets", "halo-analytics.json"),
    "utf8",
  ),
);

const b64 = (o) =>
  Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

const tokens = new Map();
async function token(scope) {
  if (tokens.has(scope)) return tokens.get(scope);
  const iat = Math.floor(Date.now() / 1000);
  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: key.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: iat + 3600,
      iat,
    });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const j = await (
    await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${sig}`,
      }),
    })
  ).json();
  if (!j.access_token) throw new Error("Token: " + JSON.stringify(j));
  tokens.set(scope, j.access_token);
  return j.access_token;
}

async function post(url, scope, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token(scope)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${j.error?.message || ""}`);
  return j;
}

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const iso = (d) => d.toISOString().slice(0, 10);
// GSC podaci kasne 2–3 dana; isti prozor za oba izvora radi uporedivosti.
const end = new Date(Date.now() - 3 * 864e5);
const start = new Date(end.getTime() - DAYS * 864e5);
const prevEnd = new Date(start.getTime() - 864e5);
const prevStart = new Date(prevEnd.getTime() - DAYS * 864e5);

const ga = (body) =>
  post(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`,
    GA_SCOPE,
    { dateRanges: [{ startDate: iso(start), endDate: iso(end) }], ...body },
  );

const gsc = (body, from = start, to = end) =>
  post(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    GSC_SCOPE,
    { startDate: iso(from), endDate: iso(to), ...body },
  );

const rows = (r) => r.rows || [];
const pct = (n) => +(n * 100).toFixed(2);
const pos = (n) => +n.toFixed(1);
const out = {
  period: { from: iso(start), to: iso(end), days: DAYS },
  previous: { from: iso(prevStart), to: iso(prevEnd) },
};

// ═══ GA4 ══════════════════════════════════════════════════════════════════════
try {
  const ev = await ga({
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 30,
  });
  out.ga4_events = rows(ev).map((r) => ({
    event: r.dimensionValues[0].value,
    count: +r.metricValues[0].value,
    users: +r.metricValues[1].value,
  }));

  const pg = await ga({
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 20,
  });
  out.ga4_top_pages = rows(pg).map((r) => ({
    path: r.dimensionValues[0].value,
    views: +r.metricValues[0].value,
    users: +r.metricValues[1].value,
  }));
} catch (e) {
  out.ga4_error = String(e.message);
}

// ═══ GSC ══════════════════════════════════════════════════════════════════════
const totals = await gsc({ dimensions: [] });
const totalsPrev = await gsc({ dimensions: [] }, prevStart, prevEnd);
const t = rows(totals)[0] || {};
const tp = rows(totalsPrev)[0] || {};
out.gsc_totals = {
  clicks: t.clicks ?? 0,
  impressions: t.impressions ?? 0,
  ctr: pct(t.ctr ?? 0),
  position: pos(t.position ?? 0),
  prev_clicks: tp.clicks ?? 0,
  prev_impressions: tp.impressions ?? 0,
  prev_position: pos(tp.position ?? 0),
};

const allQ = await gsc({ dimensions: ["query"], rowLimit: 1000 });
out.gsc_queries = rows(allQ).map((r) => ({
  query: r.keys[0],
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: pct(r.ctr),
  position: pos(r.position),
}));

const allP = await gsc({ dimensions: ["page"], rowLimit: 200 });
out.gsc_pages = rows(allP).map((r) => ({
  page: r.keys[0].replace(ORIGIN, "") || "/",
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: pct(r.ctr),
  position: pos(r.position),
}));

const homeQ = await gsc({
  dimensions: ["query"],
  dimensionFilterGroups: [
    { filters: [{ dimension: "page", operator: "equals", expression: HOME_URL }] },
  ],
  rowLimit: 500,
});
out.gsc_home_queries = rows(homeQ).map((r) => ({
  query: r.keys[0],
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: pct(r.ctr),
  position: pos(r.position),
}));
out.gsc_home_top10 = out.gsc_home_queries.filter((q) => q.position <= 10);

const dev = await gsc({ dimensions: ["device"] });
out.gsc_devices = rows(dev).map((r) => ({
  device: r.keys[0],
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: pct(r.ctr),
  position: pos(r.position),
}));

const ctry = await gsc({ dimensions: ["country"], rowLimit: 10 });
out.gsc_countries = rows(ctry).map((r) => ({
  country: r.keys[0],
  clicks: r.clicks,
  impressions: r.impressions,
}));

// ── Izvedene prilike ──────────────────────────────────────────────────────────
/** Na drugoj strani rezultata: mali pomak nosi najviše klikova. */
out.striking_distance = out.gsc_queries
  .filter((q) => q.position > 10 && q.position <= 20 && q.impressions >= 20)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 30);

/** Visoko rangirano ali niko ne klikće — problem naslova/opisa, ne pozicije. */
out.low_ctr = out.gsc_queries
  .filter((q) => q.position <= 10 && q.impressions >= 30 && q.ctr < 2)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 30);

// ═══ Ispis ════════════════════════════════════════════════════════════════════
const L = [];
const say = (s = "") => {
  L.push(s);
  console.log(s);
};

say(`\nPeriod: ${out.period.from} → ${out.period.to} (${DAYS} dana)`);
say(`Poređenje sa: ${out.previous.from} → ${out.previous.to}\n`);

const g = out.gsc_totals;
const delta = (now, before) =>
  before ? `${now >= before ? "+" : ""}${(((now - before) / before) * 100).toFixed(0)}%` : "—";
say("══ GSC ukupno ══");
say(`  Klikovi        ${String(g.clicks).padStart(7)}   (${delta(g.clicks, g.prev_clicks)})`);
say(`  Prikazi        ${String(g.impressions).padStart(7)}   (${delta(g.impressions, g.prev_impressions)})`);
say(`  CTR            ${String(g.ctr).padStart(7)}%`);
say(`  Prosečna poz.  ${String(g.position).padStart(7)}   (ranije ${g.prev_position})`);

say("\n══ GSC uređaji ══");
for (const d of out.gsc_devices)
  say(`  ${d.device.padEnd(10)} ${String(d.clicks).padStart(5)} klik  ${String(d.impressions).padStart(7)} prikaza  CTR ${d.ctr}%  poz ${d.position}`);

say("\n══ GSC države (top 5) ══");
for (const c of out.gsc_countries.slice(0, 5))
  say(`  ${c.country.padEnd(6)} ${String(c.clicks).padStart(5)} klik  ${String(c.impressions).padStart(7)} prikaza`);

say("\n══ Najjače stranice (top 15) ══");
for (const p of out.gsc_pages.slice(0, 15))
  say(`  ${String(p.clicks).padStart(5)} klik  poz ${String(p.position).padStart(5)}  CTR ${String(p.ctr).padStart(5)}%  ${p.page}`);

say("\n══ Najjači upiti (top 20) ══");
for (const q of out.gsc_queries.slice(0, 20))
  say(`  ${String(q.clicks).padStart(5)} klik  poz ${String(q.position).padStart(5)}  ${String(q.impressions).padStart(6)} prikaza  ${q.query}`);

say(`\n══ POČETNA — ${out.gsc_home_queries.length} upita, ${out.gsc_home_top10.length} na poz ≤10 (R1 kapija) ══`);
for (const q of out.gsc_home_top10.slice(0, 25))
  say(`  poz ${String(q.position).padStart(5)}  ${String(q.clicks).padStart(4)} klik  ${String(q.impressions).padStart(6)} prikaza  ${q.query}`);

say(`\n══ PRILIKA: druga strana rezultata (poz 11–20, ≥20 prikaza) ══`);
if (!out.striking_distance.length) say("  (nema)");
for (const q of out.striking_distance)
  say(`  poz ${String(q.position).padStart(5)}  ${String(q.impressions).padStart(6)} prikaza  ${String(q.clicks).padStart(4)} klik  ${q.query}`);

say(`\n══ PRILIKA: dobra pozicija, slab CTR (poz ≤10, ≥30 prikaza, CTR <2%) ══`);
if (!out.low_ctr.length) say("  (nema)");
for (const q of out.low_ctr)
  say(`  poz ${String(q.position).padStart(5)}  ${String(q.impressions).padStart(6)} prikaza  CTR ${String(q.ctr).padStart(5)}%  ${q.query}`);

say("\n══ GA4 ══");
if (out.ga4_error) say(`  greška: ${out.ga4_error}`);
else if (!out.ga4_events?.length)
  say("  BEZ PODATAKA — nijedan događaj u periodu.");
else
  for (const e of out.ga4_events.slice(0, 15))
    say(`  ${e.event.padEnd(24)} ${String(e.count).padStart(7)} puta  ${String(e.users).padStart(6)} korisnika`);

if (OUT_JSON) {
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log(`\nJSON: ${OUT_JSON}`);
}
if (OUT_MD) {
  writeFileSync(OUT_MD, "```\n" + L.join("\n") + "\n```\n");
  console.log(`MD:   ${OUT_MD}`);
}
