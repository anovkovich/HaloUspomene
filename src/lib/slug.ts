import { getWeddingData } from "./couples";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (č→c, ž→z, etc.)
    .replace(/đ/g, "dj") // Serbian đ
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  bride: string,
  groom: string,
): Promise<string> {
  const base = `${normalize(bride)}-${normalize(groom)}`;
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await getWeddingData(slug);
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix++;
    if (suffix > 100) throw new Error("Too many slug collisions");
  }
}
