import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Admin API routes handle their own auth via cookies
    if (pathname.startsWith("/api/admin")) return NextResponse.next();

    const cookie = request.cookies.get("admin_token");
    if (cookie) {
      try {
        await jwtVerify(cookie.value, secret);
        return NextResponse.next();
      } catch {
        // Expired — fall through
      }
    }
    // No valid token — the page itself shows the login form (inline)
    return NextResponse.next();
  }

  // ── Couple auth (potvrde / raspored-sedenja) ──────────────────────────────
  const match = pathname.match(
    /^\/pozivnica\/([^/]+)\/(potvrde|raspored-sedenja)(\/|$)/
  );
  if (!match) return NextResponse.next();

  const slug = match[1];
  const cookie = request.cookies.get(`auth_${slug}`);

  if (cookie) {
    try {
      await jwtVerify(cookie.value, secret);
      return NextResponse.next();
    } catch {
      // Expired or invalid — fall through to redirect
    }
  }

  const next = encodeURIComponent(pathname);
  return NextResponse.redirect(
    new URL(`/pozivnica/${slug}/prijava?next=${next}`, request.url)
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/pozivnica/:slug/potvrde",
    "/pozivnica/:slug/potvrde/:path*",
    "/pozivnica/:slug/raspored-sedenja",
    "/pozivnica/:slug/raspored-sedenja/:path*",
  ],
};
