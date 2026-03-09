import { WeddingData } from "@/app/pozivnica/[slug]/types";

// Import all wedding data files
import emilijaAleksa from "./emilija-aleksa";
import anastasijaJovan from "./anastasija-jovan";
import saraNikola from "./sara-nikola";
import jelenaMarko from "./jelena-marko";
import marinaAleksandar from "./marina-aleksandar";

// Map slugs to their wedding data
const weddingDataMap: Record<string, WeddingData> = {
  "emilija-aleksa": emilijaAleksa,
  "anastasija-jovan": anastasijaJovan,
  "sara-nikola": saraNikola,
  "jelena-marko": jelenaMarko,
  "marina-aleksandar": marinaAleksandar,
  // Add more weddings here as needed:
  // "marko-ana": markoAna,
};

export function getWeddingData(slug: string): WeddingData | null {
  console.log("Fetching wedding data for slug:", slug);
  console.log("Available slugs:", Object.keys(weddingDataMap));
  return weddingDataMap[slug] || null;
}

export function getAllWeddingSlugs(): string[] {
  return Object.keys(weddingDataMap);
}
