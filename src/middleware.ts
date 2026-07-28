import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  isPathPreviewLocked,
  previewKey,
  PREVIEW_COOKIE,
} from "@/lib/preview-lock";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Partner preview lock ──────────────────────────────────────────────────
  // Pages awaiting partner approval 404 publicly while PARTNER_PREVIEW_KEY is
  // set; ?key=<PARTNER_PREVIEW_KEY> opens them and a cookie keeps follow-up
  // requests working. See src/lib/preview-lock.ts.
  if (isPathPreviewLocked(pathname)) {
    const key = previewKey()!;
    if (request.nextUrl.searchParams.get("key") === key) {
      const res = NextResponse.next();
      res.cookies.set(PREVIEW_COOKIE, key, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }
    if (request.cookies.get(PREVIEW_COOKIE)?.value === key) {
      return NextResponse.next();
    }
    // Rewrite to the 404 page without exposing that the URL is real. The
    // explicit status matters on Vercel: the prerendered /404 file would
    // otherwise be served with a soft-404 status 200.
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }

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
  // gated. Skip the slug names that aren't real seating records: the public
  // /prijava and /gde-sedim route segments and the Next.js metadata file
  // conventions (opengraph-image, twitter-image, icon, apple-icon, sitemap,
  // robots) which Next serves out of the parent route folder.
  const SEATING_RESERVED_SLUGS = new Set([
    "prijava",
    "gde-sedim",
    "opengraph-image",
    "twitter-image",
    "icon",
    "apple-icon",
    "sitemap",
    "robots",
  ]);
  const seatingMatch = pathname.match(
    /^\/raspored-sedenja\/([^/]+)(?:\/(gosti|portal)(?:\/|$)|$|\/$)/
  );
  if (seatingMatch) {
    const slug = seatingMatch[1];
    if (SEATING_RESERVED_SLUGS.has(slug)) {
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
    "/raspored-sedenja/:slug/portal",
    "/raspored-sedenja/:slug/portal/:path*",
    // Partner preview lock (PREVIEW_LOCKED_PATHS in src/lib/preview-lock.ts) is
    // currently empty — add a page's path here as a literal when locking one.
  ],
};
