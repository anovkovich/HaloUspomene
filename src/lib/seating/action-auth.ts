import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

/**
 * Session checks for the seating server actions.
 *
 * `src/middleware.ts` gating the editor PAGE is not enough on its own. A server
 * action is invoked by POSTing its id to any URL that resolves to a route whose
 * module graph contains it — and `/raspored-sedenja/prijava/` resolves to the
 * `[slug]` editor route (the `prijava` segment only exists *under* `[slug]`),
 * which the middleware deliberately waves through via `SEATING_RESERVED_SLUGS`.
 * That leaves every action on that route reachable with no cookie at all.
 *
 * So each action re-checks the session itself, and it checks the *claims*, not
 * just the signature. Everything we issue is signed with the same `JWT_SECRET`
 * — including the trust token the public SMS flow hands out (see
 * `phone-verification.ts`, whose `PHONE_VERIFY_JWT_SECRET` falls back to it).
 * A bare `jwtVerify` would therefore accept a token anyone can obtain, and
 * accept one couple's token for another couple's slug. Event tokens all carry
 * `{ slug }`; the admin token carries `{ role: "admin" }`. Nothing else passes.
 */

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function claimsOf(value: string | undefined): Promise<JWTPayload | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, secret);
    return payload;
  } catch {
    return null;
  }
}

function isAdmin(payload: JWTPayload | null): boolean {
  return payload?.role === "admin";
}

/**
 * True when the caller holds a valid session **for this specific event**.
 *
 * `cookieName` is the per-product cookie minted at login:
 * `auth_${slug}` (pozivnica) · `auth_birthday_${slug}` (dečji rođendan) ·
 * `auth_seating_${slug}` (standalone raspored). A valid admin token also
 * passes, so support can open a couple's editor without their PIN.
 */
export async function hasEventSession(
  cookieName: string,
  slug: string,
): Promise<boolean> {
  const jar = await cookies();
  const payload = await claimsOf(jar.get(cookieName)?.value);
  // The slug claim is what stops a customer from renaming their own cookie to
  // someone else's slug and writing to that couple's layout.
  if (payload?.slug === slug) return true;
  return isAdmin(await claimsOf(jar.get("admin_token")?.value));
}

/**
 * True when the caller is logged into *some* event of ours.
 *
 * Used by the hall-scheme library, which is shared across all events and takes
 * no slug — the requirement is only that the visitor is a customer. The `slug`
 * claim is still mandatory: it is what separates a real event session from a
 * phone-verification trust token, which carries only `{ phone, scope }`.
 */
export async function hasAnyEventSession(): Promise<boolean> {
  const jar = await cookies();
  for (const c of jar.getAll()) {
    const isSessionCookie =
      c.name.startsWith("auth_") || c.name === "moje_vencanje_auth";
    if (!isSessionCookie) continue;
    const payload = await claimsOf(c.value);
    if (typeof payload?.slug === "string" && payload.slug) return true;
  }
  return isAdmin(await claimsOf(jar.get("admin_token")?.value));
}
