"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  addBirthdayRSVP,
  updateBirthdayRSVPGuestCount,
  deleteBirthdayRSVP,
} from "@/lib/birthday-rsvp";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

/**
 * Returns the slug the caller is authenticated for, or null. Portal is gated
 * per-birthday with auth_birthday_${slug} cookies (middleware + prijava).
 */
async function getAuthorizedSlug(expectedSlug: string): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(`auth_birthday_${expectedSlug}`)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const slug = (payload.slug as string) ?? null;
    return slug === expectedSlug ? slug : null;
  } catch {
    return null;
  }
}

export async function addBirthdayManualGuestAction(
  slug: string,
  name: string,
  guestCount: number,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const authSlug = await getAuthorizedSlug(slug);
  if (!authSlug) return { success: false, error: "Niste prijavljeni" };

  const cleanName = name.trim();
  const cleanCount = Math.max(1, Math.floor(guestCount || 1));
  if (!cleanName) return { success: false, error: "Unesite ime gosta" };

  try {
    const id = await addBirthdayRSVP(authSlug, {
      name: cleanName,
      attending: "Da",
      guestCount: cleanCount,
      message: "",
    });
    return { success: true, id };
  } catch {
    return { success: false, error: "Greška pri dodavanju gosta" };
  }
}

export async function updateBirthdayGuestCountAction(
  slug: string,
  id: string,
  guestCount: number,
): Promise<{ success: boolean; error?: string }> {
  const authSlug = await getAuthorizedSlug(slug);
  if (!authSlug) return { success: false, error: "Niste prijavljeni" };
  if (!id) return { success: false, error: "Nedostaje ID" };

  const cleanCount = Math.max(1, Math.floor(guestCount || 1));
  try {
    await updateBirthdayRSVPGuestCount(id, cleanCount);
    return { success: true };
  } catch {
    return { success: false, error: "Greška pri čuvanju" };
  }
}

export async function deleteBirthdayGuestAction(
  slug: string,
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const authSlug = await getAuthorizedSlug(slug);
  if (!authSlug) return { success: false, error: "Niste prijavljeni" };
  if (!id) return { success: false, error: "Nedostaje ID" };

  try {
    await deleteBirthdayRSVP(id);
    return { success: true };
  } catch {
    return { success: false, error: "Greška pri brisanju" };
  }
}
