// Prints the numeric Lemon Squeezy variant id for every product in the store and
// maps each to the LS_VARIANT_* env var our checkout expects (src/lib/payments/
// kinds.ts). The UUID in a /checkout/buy/<uuid> share link is NOT this id — the
// API needs the numeric one, which only this endpoint returns.
//
// Needs LEMONSQUEEZY_API_KEY in .env.local (Settings -> API -> create key).
// Run: node scripts/ls-variant-ids.mjs
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const pick = (k) => env.match(new RegExp(`${k}\\s*=\\s*"?([^"\\r\\n]+)"?`))?.[1];

const apiKey = pick("LEMONSQUEEZY_API_KEY");
if (!apiKey) {
  console.error(
    "LEMONSQUEEZY_API_KEY nije u .env.local\n" +
      "Uzmi ga na: app.lemonsqueezy.com -> Settings -> API -> +",
  );
  process.exit(1);
}

// Name fragment -> env var. Matched case-insensitively against the product name.
const MAP = [
  [/osnovni/i, "LS_VARIANT_OSNOVNI", 5000],
  [/kompletan/i, "LS_VARIANT_KOMPLETAN", 9900],
  [/premium/i, "LS_VARIANT_PREMIUM", 13900],
  [/proslav/i, "LS_VARIANT_PROSLAVA", 4500],
  // Mora PRE generickog /raspored/i, inace bi prvi match pojeo ovaj proizvod:
  // rodjendanski raspored je 2.500, samostalni je 5.000.
  [/rodjendan\s*raspored/i, "LS_VARIANT_RODJENDAN_RASPORED", 2500],
  [/raspored/i, "LS_VARIANT_RASPORED", 5000],
  // QR galerija se DELI sa rodjendanima (ista cena) — jedan proizvod, dva kind-a.
  [/galerij/i, "LS_VARIANT_GALERIJA", 3500],
  [/slike/i, "LS_VARIANT_SLIKE", 600],
  [/korporativ/i, "LS_VARIANT_DOGADJAJ", 12000],
  [/telefon/i, "LS_VARIANT_TELEFON", 6900],
];

async function ls(path) {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

const json = await ls("/products?include=variants&page[size]=100");
const variants = (json.included || []).filter((i) => i.type === "variants");

const rows = [];
for (const p of json.data || []) {
  const name = p.attributes?.name ?? "(bez imena)";
  const mine = variants.filter(
    (v) => String(v.attributes?.product_id) === String(p.id),
  );
  for (const v of mine) {
    rows.push({
      product: name,
      variantId: v.id, // numeric — this is what our API call needs
      priceRsd: (v.attributes?.price ?? 0) / 100,
      status: p.attributes?.status,
    });
  }
}

if (!rows.length) {
  console.log("Nijedan proizvod nije pronadjen. Jesu li objavljeni (published)?");
  process.exit(0);
}

console.log("\n=== Proizvodi u store-u ===\n");
for (const r of rows) {
  console.log(
    `${r.product.padEnd(36)} variant ${String(r.variantId).padEnd(9)} ${String(r.priceRsd).padStart(7)} din   [${r.status}]`,
  );
}

console.log("\n=== Za Vercel env (copy-paste) ===\n");
const used = new Set();
for (const [re, envVar, expectedRsd] of MAP) {
  const hit = rows.find((r) => re.test(r.product) && !used.has(r.variantId));
  if (!hit) {
    console.log(`# ${envVar}=???   <- nema proizvoda koji odgovara ${re}`);
    continue;
  }
  used.add(hit.variantId);
  const warn =
    hit.priceRsd !== expectedRsd
      ? `   # !! cena je ${hit.priceRsd}, kod ocekuje ${expectedRsd}`
      : "";
  console.log(`${envVar}=${hit.variantId}${warn}`);
}

const orphans = rows.filter((r) => !used.has(r.variantId));
if (orphans.length) {
  console.log("\n# Nemapirani proizvodi (proveri ime):");
  for (const o of orphans) console.log(`#   ${o.product} -> ${o.variantId}`);
}
console.log("");
