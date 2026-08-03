/**
 * Serbian plural agreement.
 *
 * Serbian has three forms, not two: 1 → "sto", 2–4 → "stola", 5+ → "stolova",
 * and 11–14 take the 5+ form despite ending in 1–4. Counters written as
 * `{n} stolova` read as broken Serbian for exactly the values that show up
 * most in this product (one table, two guests, three replies).
 */

/** 1 → `one` · 2–4 → `few` · 5+ → `many`. 11–14 take `many`. */
export function pluralForm(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = Math.abs(n) % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** `{n} {form}` — the common case. */
export function pluralize(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  return `${n} ${pluralForm(n, one, few, many)}`;
}

/** "1 osoba" · "2 osobe" · "5 osoba" */
export const peopleLabel = (n: number) => pluralize(n, "osoba", "osobe", "osoba");

/** "1 otkazivanje" · "2 otkazivanja" · "5 otkazivanja" */
export const cancellationsLabel = (n: number) =>
  pluralize(n, "otkazivanje", "otkazivanja", "otkazivanja");

/** "1 stavka" · "2 stavke" · "5 stavki" */
export const itemsLabel = (n: number) =>
  pluralize(n, "stavka", "stavke", "stavki");

/** "1 gost" · "2 gosta" · "5 gostiju" */
export const guestsLabel = (n: number) =>
  pluralize(n, "gost", "gosta", "gostiju");
