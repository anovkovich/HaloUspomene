import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { upsertCouple } from "@/lib/couples";
import type { WeddingData } from "@/app/pozivnica/[slug]/types";

// One couple-registration mechanism (QuickRegister). Persists a new draft
// couple AND logs them into the Moje Venčanje portal (sets the same auth
// cookies as the planner signup). Shared by the planner QuickStart signup and
// the standalone gallery self-serve create, so every self-serve entry produces
// an identical, portal-ready record — never a bare/minimal one.
//
// Must be called from a Server Action (cookie mutation).

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const MAX_AGE = 480 * 24 * 60 * 60; // 480 days

export async function quickRegisterCouple(
  slug: string,
  coupleData: WeddingData,
): Promise<void> {
  await upsertCouple(slug, coupleData);

  const prod = process.env.NODE_ENV === "production";

  // Portal auth (Moje Venčanje) — JWT + JS-readable slug.
  const token = await new SignJWT({ slug, scope: "portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("480d")
    .sign(secret);

  const jar = await cookies();

  jar.set("moje_vencanje_auth", token, {
    httpOnly: true,
    secure: prod,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  jar.set("moje_vencanje_slug", slug, {
    httpOnly: false,
    secure: prod,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  // Pozivnica auth cookie — required by middleware for /pozivnica/[slug]/*
  // management routes (raspored-sedenja etc.), so a draft couple who paid
  // doesn't have to log in twice.
  const pozivnicaToken = await new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("480d")
    .sign(secret);

  jar.set(`auth_${slug}`, pozivnicaToken, {
    httpOnly: true,
    secure: prod,
    sameSite: "lax",
    path: `/pozivnica/${slug}`,
    maxAge: MAX_AGE,
  });
}
