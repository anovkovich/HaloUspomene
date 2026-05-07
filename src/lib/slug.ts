import { getWeddingData } from "./couples";
import { getBirthdayData } from "./birthday";

// Serbian Cyrillic → Latin transliteration. Uses the diacritic-free convention
// already applied to the Latin path (ž→z, č→c, š→s) so the whole pipeline
// produces ASCII-only slugs regardless of input script.
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e",
  ж: "z", з: "z", и: "i", ј: "j", к: "k", л: "l", љ: "lj",
  м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s",
  т: "t", ћ: "c", у: "u", ф: "f", х: "h", ц: "c", ч: "c",
  џ: "dz", ш: "s",
};

function transliterateCyrillic(s: string): string {
  let out = "";
  for (const ch of s) {
    out += CYRILLIC_MAP[ch] ?? ch;
  }
  return out;
}

function normalize(s: string): string {
  return transliterateCyrillic(s.trim().toLowerCase())
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics (č→c, ž→z, etc.)
    .replace(/đ/g, "dj") // Serbian đ has no NFD decomposition
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export class InvalidSlugInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSlugInputError";
  }
}

/** Slug is a clean `bride-groom` (optionally `-N`) form, ASCII lowercase. */
export const SLUG_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)+$/;

export async function generateUniqueSlug(
  bride: string,
  groom: string,
): Promise<string> {
  const b = normalize(bride);
  const g = normalize(groom);
  if (!b || !g) {
    throw new InvalidSlugInputError(
      "Imena mlade i mladoženje moraju sadržati slovne znake (latinica ili ćirilica).",
    );
  }
  const base = `${b}-${g}`;
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

/**
 * Birthday-side equivalent. Accepts 1–2 name parts (child name, or
 * honoree name + surname for punoletstvo) and checks the birthday_events
 * collection for collisions.
 */
export async function generateUniqueBirthdaySlug(
  first: string,
  second?: string,
): Promise<string> {
  const parts = [normalize(first), second ? normalize(second) : ""].filter(Boolean);
  if (parts.length === 0) {
    throw new InvalidSlugInputError(
      "Ime mora sadržati slovne znake (latinica ili ćirilica).",
    );
  }
  const base = parts.join("-");
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await getBirthdayData(slug);
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix++;
    if (suffix > 100) throw new Error("Too many slug collisions");
  }
}
