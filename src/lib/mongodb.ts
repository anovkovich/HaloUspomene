import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let clientPromise: Promise<MongoClient>;

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
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
