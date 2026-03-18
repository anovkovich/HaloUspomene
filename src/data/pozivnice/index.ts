// Re-export from the MongoDB-backed data layer.
// All functions are now async — callers must await them.
export {
  getWeddingData,
  getAllWeddingSlugs,
  getAllCouples,
  upsertCouple,
  deleteCouple,
} from "@/lib/couples";
