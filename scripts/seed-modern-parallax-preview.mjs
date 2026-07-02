/**
 * Copies katarina-marko's whitened (transparent-background) AI couple
 * illustration to an admin-owned blob path so the Modern Parallax (line_art)
 * theme card on the Premium signup flow can display a representative couple
 * illustration without referencing customer data directly.
 *
 * The destination uses `addRandomSuffix: false` + `allowOverwrite: true` so
 * re-running the script keeps the same URL — safe to invoke repeatedly. After
 * the upload, the script patches THEMES (line_art `preview` field) in
 * src/app/napravi-pozivnicu/steps/PremiumStepAIPhoto.tsx in place, so a single
 * `node --env-file=.env.local scripts/seed-modern-parallax-preview.mjs` run
 * leaves the repo with a working preview — just `git add` and commit.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { put } from "@vercel/blob";

const SOURCE_SLUG = "katarina-marko";
const TARGET_PATH = "admin-data/theme-previews/modern-parallax-couple.png";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET_FILE = resolve(
  __dirname,
  "..",
  "src",
  "app",
  "napravi-pozivnicu",
  "steps",
  "PremiumStepAIPhoto.tsx",
);

const mongoUri = process.env.MONGODB_URI;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!mongoUri) {
  console.error("MONGODB_URI not set in environment");
  process.exit(1);
}
if (!blobToken) {
  console.error("BLOB_READ_WRITE_TOKEN not set in environment");
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const couples = client.db("halouspomene").collection("couples");
  const source = await couples.findOne(
    { slug: SOURCE_SLUG },
    { projection: { ai_couple_image_url: 1 } },
  );

  if (!source?.ai_couple_image_url) {
    console.error(`Couple '${SOURCE_SLUG}' has no ai_couple_image_url.`);
    process.exit(1);
  }
  if (!source.ai_couple_image_url.includes("/premium/whitened/")) {
    console.warn(
      `Warning: ${SOURCE_SLUG}.ai_couple_image_url is not on the /premium/whitened/ path — ` +
        "the copied image may still have a background. Continuing anyway.",
    );
  }

  console.log(`Source: ${source.ai_couple_image_url}`);

  const res = await fetch(source.ai_couple_image_url);
  if (!res.ok) {
    console.error(`Fetch failed: HTTP ${res.status}`);
    process.exit(1);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/png";

  const blob = await put(TARGET_PATH, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    token: blobToken,
  });

  console.log(
    `\n✓ Uploaded ${buffer.byteLength.toLocaleString()} bytes (${contentType})`,
  );
  console.log(`✓ Blob URL: ${blob.url}`);

  // Patch THEMES in PremiumStepAIPhoto.tsx so the new URL is wired up without
  // a manual copy-paste step. Match the line_art block's preview line; we
  // anchor on the `id: "line_art"` block to avoid touching other themes.
  const src = readFileSync(TARGET_FILE, "utf8");
  const lineArtBlockRegex =
    /(\{\s*id:\s*"line_art"[\s\S]*?preview:\s*)"[^"]*"/;
  if (!lineArtBlockRegex.test(src)) {
    console.error(
      `Could not find the line_art preview field in ${TARGET_FILE}. ` +
        "The blob is uploaded — paste the URL manually as the line_art `preview`.",
    );
    process.exit(1);
  }
  const patched = src.replace(lineArtBlockRegex, `$1"${blob.url}"`);
  writeFileSync(TARGET_FILE, patched);
  console.log(`✓ Patched line_art preview in PremiumStepAIPhoto.tsx`);
  console.log("\nDone. Commit the diff and you're set.");
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
