// Re-export from the MongoDB-backed data layer.
// All functions are async — callers must await them.
export {
  getBirthdayData,
  getAllBirthdaySlugs,
  getAllBirthdays,
  upsertBirthday,
  deleteBirthday,
} from "@/lib/birthday";
