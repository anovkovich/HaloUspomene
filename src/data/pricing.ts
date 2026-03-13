import data from "./pricing.json";

export const pricing = data;

/** Formats a number as Serbian price string, e.g. 9000 → "9.000 din" */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " din";
}
