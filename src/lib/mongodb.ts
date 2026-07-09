import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let clientPromise: Promise<MongoClient>;

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
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
