import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let clientPromise: Promise<MongoClient>;

// `next build` fans static generation out to one worker process per core, and
// those workers rasterize OG images (satori/resvg) — CPU-bound work that stalls
// a worker's event loop for hundreds of ms at a time. Connection timeouts are
// wall-clock, so they are measured against a stalled loop: a connect that takes
// 0.8s idle measures ~5.7s under loop contention alone, and with every core
// saturated it sails past a 10s budget and fails with `secureConnect timed
// out`. The network is not the problem — 15 parallel connects from a single
// idle process all complete in under a second.
//
// So: a generous budget while building, a tight one at runtime, where a real
// Atlas outage should surface to the user quickly instead of hanging a request.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const options = {
  serverSelectionTimeoutMS: isBuild ? 60000 : 10000,
  connectTimeoutMS: isBuild ? 60000 : 10000,
  // Cap connections per client. The driver defaults to 100; during `next build`
  // ~15 static-generation workers each open their own client, so the default
  // bursts up to ~1500 simultaneous connections and exhausts the shared Atlas
  // tier's limit (→ "server selection timed out"). 10 keeps the build well
  // under the cap and is also correct for serverless (small pool per lambda).
  maxPoolSize: 10,
};

if (process.env.NODE_ENV === "development") {
  // Reuse connection across HMR reloads in development
  // Clear cached promise on failure so next request retries
  const g = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!g._mongoClientPromise) {
    g._mongoClientPromise = new MongoClient(uri, options).connect().catch((e) => {
      delete g._mongoClientPromise;
      throw e;
    });
  }
  clientPromise = g._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export default clientPromise;
