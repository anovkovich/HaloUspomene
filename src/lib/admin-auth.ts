import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Admin authorization for route handlers and server actions.
 *
 * Verifying the `admin_token` signature is NOT sufficient. Every token this app
 * issues is signed with the same `JWT_SECRET`: couple sessions (`{ slug }`),
 * portal / seating / birthday / punoletstvo sessions (`{ slug, scope }`), bypass
 * links, and the phone-verification trust token — which `phone-verification.ts`
 * hands to ANY anonymous visitor who completes the public SMS flow on
 * /napravi-pozivnicu. A bare `jwtVerify` therefore accepts a token that anyone
 * can obtain, simply renamed into a cookie called `admin_token`.
 *
 * `role: "admin"` is minted in exactly one place — `/api/admin/auth`, behind
 * ADMIN_PASSWORD — so requiring the claim is what actually gates the panel.
 *
 * New admin routes must import from here and must never call `jwtVerify`
 * directly; `rg -l jwtVerify src/app/api/admin/` returning nothing is the
 * invariant that keeps the next copy-paste from reintroducing the hole.
 */

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function hasAdminRole(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** For route handlers, which receive a `NextRequest`. */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return hasAdminRole(req.cookies.get("admin_token")?.value);
}

/** For server actions and RSC, which read cookies via `next/headers`. */
export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return hasAdminRole(jar.get("admin_token")?.value);
}
