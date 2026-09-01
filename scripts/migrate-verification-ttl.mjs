/**
 * Migration: drops and recreates the TTL index on verification_sessions
 * with the new SESSION_TTL_SECONDS value (5 minutes, matching Infobip's
 * pinTimeToLive).
 *
 * MongoDB does not allow `createIndex` to silently update `expireAfterSeconds`
 * on an existing index — it must be dropped and recreated, OR mutated via
 * collMod. We use drop+create for clarity.
 *
 * Idempotent: safe to re-run.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-verification-ttl.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const NEW_TTL_SECONDS = 5 * 60;
const DB = "halouspomene";
const COLLECTION = "verification_sessions";

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(DB);
  const col = db.collection(COLLECTION);

  const indexes = await col.indexes();
  const existing = indexes.find(
    (i) =>
      i.key &&
      Object.keys(i.key).length === 1 &&
      i.key.createdAt === 1 &&
      typeof i.expireAfterSeconds === "number",
  );

  if (existing) {
    console.log(
      `Existing TTL index found: name=${existing.name}, expireAfterSeconds=${existing.expireAfterSeconds}`,
    );
    if (existing.expireAfterSeconds === NEW_TTL_SECONDS) {
      console.log("✓ Already at target TTL — nothing to do.");
      process.exit(0);
    }
    console.log(`Dropping ${existing.name}...`);
    await col.dropIndex(existing.name);
  } else {
    console.log("No existing TTL index on createdAt — will create fresh.");
  }

  console.log(`Creating new TTL index with expireAfterSeconds=${NEW_TTL_SECONDS}...`);
  const name = await col.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: NEW_TTL_SECONDS },
  );
  console.log(`✓ Created index ${name}`);
} finally {
  await client.close();
}
