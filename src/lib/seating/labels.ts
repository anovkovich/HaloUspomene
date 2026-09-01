/**
 * Serbian-correct count labels for the seating surfaces.
 *
 * "1 stolova" reads as broken Serbian, and these counts show up on the admin
 * hall list, the editor toolbar and the client-facing scheme picker — three
 * places that would otherwise each roll their own.
 */

import { pluralForm } from "../serbian-plural";

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
