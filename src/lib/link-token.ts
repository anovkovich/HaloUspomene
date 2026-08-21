import { randomBytes } from "crypto";

// No 0/O/o, 1/l/I to keep tokens legible if someone reads one over the phone.
const TOKEN_CHARS =
  "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOKEN_LEN = 10;

/** Random, unguessable token used as the sole credential of a public link
 *  (`/pristup/{token}/`, `/slike/{token}/`). ~58 bits of entropy. */
export function generateLinkToken(): string {
  const bytes = randomBytes(TOKEN_LEN);
  let out = "";
  for (let i = 0; i < TOKEN_LEN; i++) {
    out += TOKEN_CHARS[bytes[i] % TOKEN_CHARS.length];
  }
  return out;
}
