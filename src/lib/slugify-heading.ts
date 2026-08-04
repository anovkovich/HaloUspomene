import { isValidElement, type ReactNode } from "react";

/**
 * Single source of truth for heading anchors on the blog.
 *
 * The same `slugifyHeading()` is used in two places that MUST stay in sync:
 *  1. `mdx-components.tsx` — assigns `id` to rendered <h2>/<h3> elements
 *  2. `extractTableOfContents()` — builds the TOC from the raw MDX source
 * If the two ever diverge, TOC links silently stop working.
 */

/** Serbian-Latin-aware slug: "Šta pozivnica mora da sadrži" -> "sta-pozivnica-mora-da-sadrzi" */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    // dj first: "đ" does not decompose via NFD
    .replace(/đ/g, "dj")
    // strip combining diacritics (covers š, č, ć, ž and friends)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Flattens React children (strings, numbers, nested elements) into plain text. */
export function flattenNodeToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenNodeToText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenNodeToText(node.props.children);
  }
  return "";
}

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

/** Strips inline markdown (links, bold, italic, inline code) from a heading line. */
function stripInlineMarkdown(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

/**
 * Extracts `##` and `###` headings from raw MDX source, skipping fenced code
 * blocks, and returns TOC items whose ids match the rendered heading ids.
 */
export function extractTableOfContents(mdxSource: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of mdxSource.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    items.push({
      depth: match[1].length as 2 | 3,
      text,
      id: slugifyHeading(text),
    });
  }

  // Dva naslova sa istim tekstom daju isti `id`. Posledica je tiha i vidi se
  // tek u pregledaču: u sadržaju se hajlajtuju DVE stavke odjednom, a skok na
  // drugu vodi na prvu. Pošto se `id` isto računa i pri renderovanju naslova
  // (`mdx-components.tsx`) i ovde, jedini pouzdan lek je da naslovi u jednom
  // tekstu budu jedinstveni — zato upozorenje, a ne tiho preimenovanje.
  if (process.env.NODE_ENV !== "production") {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) {
        console.warn(
          `[blog] Duplikat anchor id "${item.id}" (naslov: "${item.text}") — preimenuj jedan od naslova.`,
        );
      }
      seen.add(item.id);
    }
  }

  return items;
}
