// One-off: create the indexes for the `orders` collection (self-serve payments).
// `createIndex` is idempotent, so this is safe to re-run.
// Run: node scripts/create-orders-indexes.mjs
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const m = env.match(/MONGODB_URI\s*=\s*"?([^"\r\n]+)"?/);
if (!m) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = m[1];

const client = new MongoClient(uri);
try {
  await client.connect();
  const orders = client.db("halouspomene").collection("orders");

  const r1 = await orders.createIndex({ orderId: 1 }, { unique: true });
  // Unique only where an LS order id exists — the webhook replay guard.
  const r2 = await orders.createIndex(
    { "ls.orderId": 1 },
    { unique: true, partialFilterExpression: { "ls.orderId": { $exists: true } } },
  );
  // Tuple reuse + already-paid checks.
  const r3 = await orders.createIndex({ kind: 1, slug: 1, status: 1 });
  // Admin review queue.
  const r4 = await orders.createIndex({ status: 1, createdAt: -1 });

  console.log("orders indexes created:", { r1, r2, r3, r4 });
} finally {
  await client.close();
}
