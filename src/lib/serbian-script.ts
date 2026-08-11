/**
 * Serbian Latin → Cyrillic transliteration.
 *
 * The reverse direction already exists in @/lib/seating/lookup.ts, but that one
 * folds names for SEARCH — it is deliberately lossy (ћ and ч both become "c").
 * This one has to be exact, because what it produces gets printed on a B1 board
 * in a wedding foyer.
 *
 * Used by the QR pano dobrodošlice when a couple keeps their invitation in
 * Latin but wants the printed sign in Cyrillic (`pano_cyrillic`).
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
