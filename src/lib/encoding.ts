/**
 * Safe UTF-8 encoding/decoding for base64 URLs
 * Handles multi-byte characters (Cyrillic, etc.) correctly
 * Uses URL-safe base64 without padding to avoid %3D encoding issues
 */

/**
 * Encode a JSON object to a URL-safe base64 string
 * Properly handles UTF-8 multi-byte characters (Cyrillic, emoji, etc.)
 * Removes padding to avoid URL encoding issues with = characters
 */
export function encodeToBase64(data: Record<string, any>): string {
  const json = JSON.stringify(data);

  // Use TextEncoder to properly encode UTF-8
  const utf8Bytes = new TextEncoder().encode(json);

  // Convert Uint8Array to binary string that btoa can handle
  const binaryString = Array.from(utf8Bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");

  // Get standard base64
  let base64 = btoa(binaryString);

  // Make it URL-safe: replace + with -, / with _
  base64 = base64.replace(/\+/g, "-").replace(/\//g, "_");

  // Remove padding = characters
  base64 = base64.replace(/=+$/, "");

  return base64;
}

/**
 * Decode a URL-safe base64 string back to a JSON object
 * Properly handles UTF-8 multi-byte characters (Cyrillic, emoji, etc.)
 */
export function decodeFromBase64<T>(encoded: string): T {
  // Restore URL-safe characters to standard base64
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

  // Add back padding if needed
  const padding = 4 - (base64.length % 4);
  if (padding && padding !== 4) {
    base64 += "=".repeat(padding);
  }

  // Decode base64 to binary string
  const binaryString = atob(base64);

  // Convert binary string to Uint8Array
  const utf8Bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    utf8Bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode UTF-8 bytes to string
  const json = new TextDecoder().decode(utf8Bytes);

  return JSON.parse(json);
}
