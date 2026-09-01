/**
 * Display name for a couple, built from the two name fields.
 *
 * Never interpolate `` `${bride} & ${groom}` `` directly: a standalone QR-gallery
 * client is one person or a freely typed pair, so their whole name lives in
 * `bride` and `groom` is an empty string (see `buildStandaloneGalleryCoupleData`
 * in src/lib/standalone-gallery.ts). Blind interpolation rendered
 * "Tamara & Zdravko &" — a dangling ampersand — everywhere in the portal.
 *
 * Joins only the parts that are actually there, so a real couple still reads
 * "Ana & Dejan" and a gallery-only client reads "Tamara & Zdravko".
 */
export function coupleDisplayName(names: {
  bride?: string | null;
  groom?: string | null;
}): string {
  return [names.bride, names.groom]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" & ");
}
