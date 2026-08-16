/**
 * Srpski datum u genitivu — "1. februara 2027."
 *
 * `toLocaleDateString("sr-Latn-RS", { month: "long" })` vraća NOMINATIV i sam
 * dodaje tačku iza godine ("1. februar 2027."), pa se u rečenici tipa
 * "važi do ..." dobija i pogrešan padež i dupla tačka. Srpski CLDR nema
 * genitivne oblike meseci, tako da lokalizacija ovo ne može da reši.
 *
 * Tačka iza godine je NAMERNO deo povratne vrednosti (redni broj godine je
 * traži). Zato datum uvek stavljaj na KRAJ rečenice — nikad ne dodaj svoju
 * tačku iza njega.
 *
 * Klijentski bezbedno (nema node uvoza) — koristi se i u pozivnicama.
 */
const MESECI_GENITIV = [
  "januara",
  "februara",
  "marta",
  "aprila",
  "maja",
  "juna",
  "jula",
  "avgusta",
  "septembra",
  "oktobra",
  "novembra",
  "decembra",
];

export function formatDatumGenitiv(
  iso: string | Date | undefined | null,
): string | null {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()}. ${MESECI_GENITIV[d.getMonth()]} ${d.getFullYear()}.`;
}
