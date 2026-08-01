// Guest-seat lookup: shared by every /gde-sedim page (wedding, birthday,
// standalone) and by the seating PDF.
//
// Two problems this module exists to solve:
//
// 1. Script + spelling mismatch. Couples type their guest list in whatever
//    script they like (often Cyrillic), while a guest at the party types on a
//    Latin phone keyboard — "Ognjen Ikovic" must find "Огњен Иковић". Names are
//    also typed surname-first as often as name-first, so matching has to be
//    token-based, not a raw substring of the whole string.
//
// 2. Parties. One RSVP ("zvanica") can cover a whole family, and the couple can
//    name each member individually in the editor. Whoever from that family
//    searches must see the WHOLE party's arrangement, labelled with the party
//    holder's name — not just their own seat, and not a dead end when they type
//    the holder's name that was never placed on a seat.

import type { TableData } from "./types";

/** Serbian Cyrillic → Latin. Macedonian/Russian letters a guest list might
 *  contain are included as cheap insurance; unknown scripts drop out below. */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e", ж: "z", з: "z",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o",
  п: "p", р: "r", с: "s", т: "t", ћ: "c", у: "u", ф: "f", х: "h", ц: "c",
  ч: "c", џ: "dz", ш: "s",
  // Non-Serbian Cyrillic fallbacks
  ѓ: "dj", ќ: "c", ѕ: "dz", щ: "sc", ю: "ju", я: "ja", э: "e", ы: "i",
  ъ: "", ь: "", ё: "e",
};

/**
 * Folds a name to a comparable form: Cyrillic transliterated to Latin,
 * diacritics stripped, punctuation collapsed to spaces, lowercased.
 * "Огњен Иковић", "Ognjen Iković" and "OGNJEN IKOVIC" all fold to "ognjen ikovic".
 */
export function normalizeName(value: string): string {
  let out = "";
  for (const ch of value.toLowerCase()) out += CYRILLIC_TO_LATIN[ch] ?? ch;
  return out
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // đ has no combining form, so NFD leaves it untouched
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * True when every word of the query appears in the name, in any order and as a
 * partial word: "dobric marko", "marko dob" and "dobrić" all match "Marko Dobrić".
 */
export function nameMatchesQuery(name: string, query: string): boolean {
  const queryTokens = normalizeName(query).split(" ").filter(Boolean);
  if (queryTokens.length === 0) return false;
  const nameTokens = normalizeName(name).split(" ").filter(Boolean);
  if (nameTokens.length === 0) return false;
  const full = nameTokens.join(" ");
  return queryTokens.every(
    (qt) => nameTokens.some((nt) => nt.includes(qt)) || full.includes(qt),
  );
}

/** Ranking helper: whole-word/prefix hits sort above mid-word ones. */
export function nameMatchScore(name: string, query: string): number {
  const queryTokens = normalizeName(query).split(" ").filter(Boolean);
  const nameTokens = normalizeName(name).split(" ").filter(Boolean);
  let score = 0;
  for (const qt of queryTokens) {
    if (nameTokens.some((nt) => nt === qt)) score += 3;
    else if (nameTokens.some((nt) => nt.startsWith(qt))) score += 2;
    else score += 1;
  }
  return score;
}

export interface GuestTableEntry {
  tableId: string;
  tableLabel: string;
  /** How many seats this guest occupies at this table. */
  assignedSeats: number;
  /** Total capacity of the table. */
  seatCount: number;
  /** Total occupied seats at this table. */
  occupiedCount: number;
}

/** One seated person of a party, with the table they were placed at. */
export interface PartyMemberSeat {
  name: string;
  tableId: string;
  tableLabel: string;
  /** Seats this person's name occupies at that table (normally 1). */
  assignedSeats: number;
}

export interface GuestLookupEntry {
  /** The searchable/display name — an individual, or the party label when the
   *  couple never named the members. */
  guestName: string;
  tables: GuestTableEntry[];
  /** Party ("zvanica") holder name, when known and the party seats 2+ people. */
  partyName?: string;
  /** Everyone seated from the same party. Only set for 2+ named people. */
  partyMembers?: PartyMemberSeat[];
}

/** Party roster row — RSVP entry / standalone guest, narrowed to what's needed. */
export interface SeatingParty {
  id: string;
  name: string;
}

interface NameSeats {
  name: string;
  /** tableId → seats occupied by this name at that table */
  tables: Map<string, number>;
}

/**
 * Builds the guest→table lookup from a saved layout.
 *
 * @param tables  Saved seating layout.
 * @param parties Guest roster (RSVP responses / standalone guests). Used to
 *                label a seated individual with their party holder's name and
 *                to make the holder searchable even when only the members were
 *                placed on seats.
 */
export function buildGuestLookup(
  tables: TableData[],
  parties: SeatingParty[] = [],
): GuestLookupEntry[] {
  const partyNameById = new Map(parties.map((p) => [p.id, p.name]));

  const tableInfo = new Map<
    string,
    { label: string; seatCount: number; occupiedCount: number }
  >();
  // partyId → (name → seats per table). Insertion order drives display order.
  const byParty = new Map<string, Map<string, NameSeats>>();

  for (const table of tables) {
    if (table.type === "decoration") continue;
    tableInfo.set(table.id, {
      label: table.label,
      seatCount: table.seats,
      occupiedCount: table.assignments.filter(Boolean).length,
    });

    for (const seat of table.assignments) {
      if (!seat) continue;
      const name = seat.guestName.trim();
      if (!name) continue;
      const partyId = seat.guestId || `__seat__${name}`;
      let names = byParty.get(partyId);
      if (!names) {
        names = new Map();
        byParty.set(partyId, names);
      }
      let entry = names.get(name);
      if (!entry) {
        entry = { name, tables: new Map() };
        names.set(name, entry);
      }
      entry.tables.set(table.id, (entry.tables.get(table.id) ?? 0) + 1);
    }
  }

  const toTableEntries = (seatsByTable: Map<string, number>) =>
    Array.from(seatsByTable.entries()).map<GuestTableEntry>(
      ([tableId, assignedSeats]) => {
        const info = tableInfo.get(tableId);
        return {
          tableId,
          tableLabel: info?.label ?? "",
          assignedSeats,
          seatCount: info?.seatCount ?? 0,
          occupiedCount: info?.occupiedCount ?? 0,
        };
      },
    );

  const lookup: GuestLookupEntry[] = [];

  for (const [partyId, names] of byParty) {
    const people = Array.from(names.values());
    const partyName = partyNameById.get(partyId);
    // A party is only worth breaking down when the couple actually named 2+
    // people; a party seated under one repeated label stays a single entry.
    const isNamedParty = people.length > 1;

    const partyMembers: PartyMemberSeat[] | undefined = isNamedParty
      ? people.flatMap((p) =>
          Array.from(p.tables.entries()).map<PartyMemberSeat>(
            ([tableId, assignedSeats]) => ({
              name: p.name,
              tableId,
              tableLabel: tableInfo.get(tableId)?.label ?? "",
              assignedSeats,
            }),
          ),
        )
      : undefined;

    for (const person of people) {
      lookup.push({
        guestName: person.name,
        tables: toTableEntries(person.tables),
        ...(isNamedParty && partyName ? { partyName } : {}),
        ...(partyMembers ? { partyMembers } : {}),
      });
    }

    // The party holder is usually one of the seated members, but not always —
    // "Glavonjić - Čukelj" can seat "Jovan Glavonjić" and "Anastasija
    // Glavonjić". Add the holder as its own searchable entry so typing the name
    // from the invitation still resolves to the party.
    if (partyName) {
      const holderKey = normalizeName(partyName);
      const alreadySeated = people.some(
        (p) => normalizeName(p.name) === holderKey,
      );
      if (!alreadySeated && holderKey) {
        const union = new Map<string, number>();
        for (const p of people)
          for (const [tableId, n] of p.tables)
            union.set(tableId, (union.get(tableId) ?? 0) + n);
        lookup.push({
          guestName: partyName,
          tables: toTableEntries(union),
          ...(isNamedParty ? { partyName } : {}),
          ...(partyMembers ? { partyMembers } : {}),
        });
      }
    }
  }

  return lookup;
}

/** Filters + ranks the lookup for a typed query. */
export function searchGuestLookup(
  lookup: GuestLookupEntry[],
  query: string,
  limit = 8,
): GuestLookupEntry[] {
  if (!normalizeName(query)) return [];
  return lookup
    .filter((e) => nameMatchesQuery(e.guestName, query))
    .map((e, i) => ({ e, i, score: nameMatchScore(e.guestName, query) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.e);
}
