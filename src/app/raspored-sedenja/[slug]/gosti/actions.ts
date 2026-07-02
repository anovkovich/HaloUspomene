"use server";

import {
  addStandaloneGuest,
  updateStandaloneGuest,
  removeStandaloneGuest,
  setStandaloneGuests,
  isStandaloneActive,
  type StandaloneGuest,
} from "@/lib/standalone-seating";

interface ActionResult {
  success: boolean;
  error?: string;
}

async function guard(slug: string): Promise<ActionResult | null> {
  const active = await isStandaloneActive(slug);
  if (!active) {
    return {
      success: false,
      error: "Pristup nije aktivan. Kontaktirajte HALO Uspomene.",
    };
  }
  return null;
}

export async function addGuestAction(
  slug: string,
  name: string,
  guestCount: number,
  category?: string,
): Promise<ActionResult & { guest?: StandaloneGuest }> {
  const blocked = await guard(slug);
  if (blocked) return blocked;

  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Ime gosta je obavezno" };
  }
  const count = Math.max(1, Math.floor(guestCount) || 1);
  const guest = await addStandaloneGuest(slug, {
    name: trimmed,
    guestCount: count,
    category: category?.trim() || undefined,
  });
  return { success: true, guest };
}

export async function updateGuestAction(
  slug: string,
  guestId: string,
  changes: { name?: string; guestCount?: number; category?: string },
): Promise<ActionResult> {
  const blocked = await guard(slug);
  if (blocked) return blocked;

  const sanitized: Parameters<typeof updateStandaloneGuest>[2] = {};
  if (changes.name !== undefined) {
    const trimmed = changes.name.trim();
    if (!trimmed) return { success: false, error: "Ime gosta je obavezno" };
    sanitized.name = trimmed;
  }
  if (changes.guestCount !== undefined) {
    sanitized.guestCount = Math.max(1, Math.floor(changes.guestCount) || 1);
  }
  if (changes.category !== undefined) {
    sanitized.category = changes.category.trim() || undefined;
  }

  await updateStandaloneGuest(slug, guestId, sanitized);
  return { success: true };
}

export async function removeGuestAction(
  slug: string,
  guestId: string,
): Promise<ActionResult> {
  const blocked = await guard(slug);
  if (blocked) return blocked;
  await removeStandaloneGuest(slug, guestId);
  return { success: true };
}

/** Replaces the entire guest list. Used after Excel/CSV import is confirmed. */
export async function replaceAllGuestsAction(
  slug: string,
  parsed: Array<{ name: string; guestCount: number; category?: string }>,
): Promise<ActionResult & { count?: number }> {
  const blocked = await guard(slug);
  if (blocked) return blocked;

  const guests: StandaloneGuest[] = parsed.map((g, i) => ({
    id: `g-${Date.now()}-${i.toString(36)}`,
    name: g.name.trim(),
    guestCount: Math.max(1, Math.floor(g.guestCount) || 1),
    category: g.category?.trim() || undefined,
  }));

  await setStandaloneGuests(slug, guests);
  return { success: true, count: guests.length };
}
