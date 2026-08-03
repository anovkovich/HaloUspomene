/**
 * Serbian-correct count labels for the seating surfaces.
 *
 * "1 stolova" reads as broken Serbian, and these counts show up on the admin
 * hall list, the editor toolbar and the client-facing scheme picker — three
 * places that would otherwise each roll their own.
 */

/** 1 → one · 2–4 → few · 5+ → many. 11–14 take the `many` form. */
function pluralForm(n: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = Math.abs(n) % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** "1 sto" · "3 stola" · "12 stolova" */
export function tablesLabel(n: number): string {
  return `${n} ${pluralForm(n, "sto", "stola", "stolova")}`;
}

/** "1 mesto" · "3 mesta" · "12 mesta" */
export function seatsLabel(n: number): string {
  return `${n} ${pluralForm(n, "mesto", "mesta", "mesta")}`;
}

/** "1 sala" · "3 sale" · "12 sala" */
export function hallsLabel(n: number): string {
  return `${n} ${pluralForm(n, "sala", "sale", "sala")}`;
}

/** "1 objekat" · "3 objekta" · "12 objekata" */
export function venuesLabel(n: number): string {
  return `${n} ${pluralForm(n, "objekat", "objekta", "objekata")}`;
}
