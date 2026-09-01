/**
 * Serbian Latin ↔ Cyrillic transliteration, exact in both directions.
 *
 * A lossy variant already exists in @/lib/seating/lookup.ts, but that one folds
 * names for SEARCH (ћ and ч both become "c"). These two have to be exact: one
 * output gets printed on a B1 board in a wedding foyer, the other is a real
 * person's review shown under their name.
 *
 * `latinToCyrillic` — QR pano dobrodošlice, when a couple keeps their invitation
 * in Latin but wants the printed sign in Cyrillic (`pano_cyrillic`).
 * `cyrillicToLatin` — Google reviews, so a Cyrillic one does not sit alone among
 * Latin cards on an otherwise Latin site.
 */

/**
 * Two-character sequences, checked before single letters.
 *
 * `dj` is included because Serbian names are routinely typed without diacritics
 * — Djordje, Andjela — and on a sign "Дјордје" would simply be wrong. The cost
 * is that a genuine d+j boundary inside one word would be mis-joined; that is
 * vanishingly rare in given names, and `pano_names` exists to override it.
 *
 * `dz` is deliberately NOT here: it is ambiguous (podzemni), and Џ-names are
 * rare enough to be worth an explicit override rather than a wrong guess.
 */
const DIGRAPHS: Record<string, string> = {
  "dž": "џ", "Dž": "Џ", "DŽ": "Џ",
  "lj": "љ", "Lj": "Љ", "LJ": "Љ",
  "nj": "њ", "Nj": "Њ", "NJ": "Њ",
  dj: "ђ", Dj: "Ђ", DJ: "Ђ",
};

const LETTERS: Record<string, string> = {
  a: "а", b: "б", c: "ц", č: "ч", ć: "ћ", d: "д", đ: "ђ", e: "е", f: "ф",
  g: "г", h: "х", i: "и", j: "ј", k: "к", l: "л", m: "м", n: "н", o: "о",
  p: "п", r: "р", s: "с", š: "ш", t: "т", u: "у", v: "в", z: "з", ž: "ж",
  A: "А", B: "Б", C: "Ц", Č: "Ч", Ć: "Ћ", D: "Д", Đ: "Ђ", E: "Е", F: "Ф",
  G: "Г", H: "Х", I: "И", J: "Ј", K: "К", L: "Л", M: "М", N: "Н", O: "О",
  P: "П", R: "Р", S: "С", Š: "Ш", T: "Т", U: "У", V: "В", Z: "З", Ž: "Ж",
};

/**
 * Anything with no Serbian equivalent — q, w, x, y, digits, punctuation, and
 * text that is already Cyrillic — passes through untouched, so running this on
 * a Cyrillic string is a no-op.
 */
export function latinToCyrillic(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; ) {
    const pair = text.slice(i, i + 2);
    if (pair.length === 2 && DIGRAPHS[pair] !== undefined) {
      out += DIGRAPHS[pair];
      i += 2;
      continue;
    }
    out += LETTERS[text[i]] ?? text[i];
    i += 1;
  }
  return out;
}

/**
 * Cyrillic → Latin.
 *
 * This direction is the easy one: every Cyrillic letter has exactly one Latin
 * counterpart, so unlike the reverse there is nothing to guess and nothing is
 * lost. Text that is already Latin passes through untouched.
 */
const FROM_CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "đ", е: "e", ж: "ž", з: "z",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o",
  п: "p", р: "r", с: "s", т: "t", ћ: "ć", у: "u", ф: "f", х: "h", ц: "c",
  ч: "č", џ: "dž", ш: "š",
};

/** Џ/Љ/Њ have no single-letter Latin form, so their case depends on context. */
const CYRILLIC_DIGRAPH_CAPS: Record<string, [string, string]> = {
  Љ: ["Lj", "LJ"],
  Њ: ["Nj", "NJ"],
  Џ: ["Dž", "DŽ"],
};

function isUpperCyrillic(ch: string | undefined): boolean {
  return ch !== undefined && ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

export function cyrillicToLatin(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    const caps = CYRILLIC_DIGRAPH_CAPS[ch];
    if (caps) {
      // „ЉУБАВ" mora dati „LJUBAV", a „Љубав" → „Ljubav".
      out += isUpperCyrillic(text[i + 1]) ? caps[1] : caps[0];
      continue;
    }

    const lower = FROM_CYRILLIC[ch];
    if (lower !== undefined) {
      out += lower;
      continue;
    }

    const upper = FROM_CYRILLIC[ch.toLowerCase()];
    if (upper !== undefined) {
      out += upper.charAt(0).toUpperCase() + upper.slice(1);
      continue;
    }

    out += ch;
  }
  return out;
}
