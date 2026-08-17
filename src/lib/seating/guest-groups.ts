import type { RSVPEntry } from "@/lib/rsvp";
import type { GuestList, Invitee } from "@/app/moje-vencanje/types";

/** A "celina" from the couple's Lista zvanica, offered as a seating filter. */
export interface GuestGroup {
  id: string;
  name: string;
}

export interface GuestGroupIndex {
  /** Only celine that actually hold at least one attending guest, in list order. */
  groups: GuestGroup[];
  /** rsvp id -> celina id. Guests outside every celina are simply absent. */
  groupByGuestId: Record<string, string>;
}

const EMPTY: GuestGroupIndex = { groups: [], groupByGuestId: {} };

// Same diacritic-free convention as `src/lib/slug.ts`, kept local so this
// module stays free of DB imports — it is type-imported by client components.
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e",
  ж: "z", з: "z", и: "i", ј: "j", к: "k", л: "l", љ: "lj",
  м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s",
  т: "t", ћ: "c", у: "u", ф: "f", х: "h", ц: "c", ч: "c",
  џ: "dz", ш: "s",
};

/** Script- and diacritic-insensitive key, so a zvanica typed in Cyrillic still
 *  meets the same guest's potvrda typed in Latin. */
function normalizeName(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) out += CYRILLIC_MAP[ch] ?? ch;
  return out
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Maps the potvrde the seating editor works with onto the celine of the
 * couple's private invitee list, so the guest sidebar can filter by them.
 *
 * A zvanica the couple linked by hand (`linkedRsvpId`) is authoritative. For
 * the rest we fall back to the name — most couples type the same name in both
 * places and never link anything, so without the fallback the filter would be
 * empty for them. The fallback fires only when the name is unambiguous on BOTH
 * sides: two "Marko Marković" rows must not silently land in whichever celina
 * happened to come first.
 */
export function buildGuestGroups(
  guestList: GuestList | null | undefined,
  attending: RSVPEntry[],
): GuestGroupIndex {
  const sections = guestList?.sections ?? [];
  const invitees = guestList?.invitees ?? [];
  if (sections.length === 0 || invitees.length === 0) return EMPTY;

  const sectionIds = new Set(sections.map((s) => s.id));
  const grouped = invitees.filter(
    (i) => i.sectionId && sectionIds.has(i.sectionId),
  );
  if (grouped.length === 0) return EMPTY;

  const groupByGuestId: Record<string, string> = {};
  const attendingIds = new Set(attending.map((g) => g.id));

  for (const inv of grouped) {
    if (inv.linkedRsvpId && attendingIds.has(inv.linkedRsvpId)) {
      groupByGuestId[inv.linkedRsvpId] = inv.sectionId;
    }
  }

  const guestsByName = new Map<string, RSVPEntry[]>();
  for (const g of attending) {
    if (groupByGuestId[g.id]) continue;
    const key = normalizeName(g.name);
    if (!key) continue;
    const bucket = guestsByName.get(key);
    if (bucket) bucket.push(g);
    else guestsByName.set(key, [g]);
  }

  const inviteesByName = new Map<string, Invitee[]>();
  for (const inv of grouped) {
    // A linked zvanica already had its say — if the link points at a potvrda
    // that isn't attending, the zvanica is declined and must not be re-matched.
    if (inv.linkedRsvpId) continue;
    const key = normalizeName(inv.name);
    if (!key) continue;
    const bucket = inviteesByName.get(key);
    if (bucket) bucket.push(inv);
    else inviteesByName.set(key, [inv]);
  }

  for (const [key, matches] of inviteesByName) {
    if (matches.length !== 1) continue;
    const guests = guestsByName.get(key);
    if (!guests || guests.length !== 1) continue;
    groupByGuestId[guests[0].id] = matches[0].sectionId;
  }

  const used = new Set(Object.values(groupByGuestId));
  const groups = sections
    .filter((s) => used.has(s.id))
    .map((s) => ({ id: s.id, name: s.name }));
  if (groups.length === 0) return EMPTY;

  return { groups, groupByGuestId };
}
