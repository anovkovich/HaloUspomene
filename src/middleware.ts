import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // API routes handle their own auth
    if (pathname.startsWith("/api/admin")) return NextResponse.next();

    const cookie = request.cookies.get("admin_token");
    if (cookie) {
      try {
        await jwtVerify(cookie.value, secret);
        return NextResponse.next();
      } catch {
        // Expired — fall through to redirect
      }
    }

    // No valid token — /admin shows the inline login form, sub-routes redirect there
    if (pathname !== "/admin" && pathname !== "/admin/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── Couple auth (potvrde / raspored-sedenja) ──────────────────────────────
  const match = pathname.match(
    /^\/pozivnica\/([^/]+)\/(potvrde|raspored-sedenja)(\/|$)/
  );
  if (match) {
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

  // ── Birthday auth (portal + raspored-sedenja) ─────────────────────────
  const birthdayMatch = pathname.match(
    /^\/deciji-rodjendan\/([^/]+)\/(portal|raspored-sedenja)(\/|$)/
  );
  if (birthdayMatch) {
    const slug = birthdayMatch[1];
    const cookie = request.cookies.get(`auth_birthday_${slug}`);

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
      new URL(`/deciji-rodjendan/${slug}/prijava?next=${next}`, request.url)
    );
  }

  // ── Punoletstvo auth (portal) ─────────────────────────────────────────
  // Mirrors the deciji-rodjendan gate but on its own cookie name so the
  // two flows have independent sessions.
  const punoletstvoMatch = pathname.match(
    /^\/punoletstvo\/([^/]+)\/portal(\/|$)/
  );
  if (punoletstvoMatch) {
    const slug = punoletstvoMatch[1];
    const cookie = request.cookies.get(`auth_punoletstvo_${slug}`);

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
      new URL(`/punoletstvo/${slug}/prijava?next=${next}`, request.url)
    );
  }

  // ── Standalone seating auth (editor + gosti) ──────────────────────────
  // /raspored-sedenja/{slug} (editor) and /raspored-sedenja/{slug}/gosti are
  // gated. /prijava and /gde-sedim are explicitly excluded so the login form
  // and the public guest lookup remain accessible.
  const seatingMatch = pathname.match(
    /^\/raspored-sedenja\/([^/]+)(?:\/(gosti)(?:\/|$)|$|\/$)/
  );
  if (seatingMatch) {
    const slug = seatingMatch[1];
    if (slug === "prijava" || slug === "gde-sedim") {
      // Defensive — these aren't valid slug values, but keep middleware permissive.
      return NextResponse.next();
    }
    const cookie = request.cookies.get(`auth_seating_${slug}`);

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
      new URL(`/raspored-sedenja/${slug}/prijava?next=${next}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/pozivnica/:slug/potvrde",
    "/pozivnica/:slug/raspored-sedenja",
    "/pozivnica/:slug/raspored-sedenja/:path*",
    "/deciji-rodjendan/:slug/portal",
    "/deciji-rodjendan/:slug/portal/:path*",
    "/deciji-rodjendan/:slug/raspored-sedenja",
    "/deciji-rodjendan/:slug/raspored-sedenja/:path*",
    "/punoletstvo/:slug/portal",
    "/punoletstvo/:slug/portal/:path*",
    "/raspored-sedenja/:slug",
    "/raspored-sedenja/:slug/gosti",
    "/raspored-sedenja/:slug/gosti/:path*",
  ],
};
