// Per-table guest lists for the seating PDF.
//
// Kept out of generatePDF.ts (which needs a browser: canvas, Blob, fonts) so
// the grouping rules stay pure and testable.
//
// A row is a party ("zvanica"), headed by the party holder's name from the RSVP
// roster. When the couple named the individual members in the editor, each is
// listed underneath — a family of five must never print as one member's name.

import type { RSVPEntry } from "@/lib/rsvp";
import type { TableData } from "../types";
import { normalizeName } from "../lookup";

export interface PartyRow {
  /** Party holder name (falls back to the seat name if the RSVP is gone). */
  name: string;
  /** Seats this party takes at this table. */
  here: number;
  /** Seats the party reserved in total (across all tables). */
  total: number;
  /** Named individuals seated here; empty when seats carry only the party label. */
  members: { name: string; seats: number }[];
}

export interface TableGuestList {
  label: string;
  guests: PartyRow[];
}

export function buildTableGuestLists(
  tables: TableData[],
  attending: RSVPEntry[],
): TableGuestList[] {
  const guestMap = Object.fromEntries(attending.map((g) => [g.id, g]));

  return tables
    .filter((t) => t.type !== "decoration")
    .sort((a, b) => {
      const special = (l: string) =>
        l.toLowerCase().includes("mladen") ? -1 : 0;
      const sa = special(a.label),
        sb = special(b.label);
      if (sa !== sb) return sa - sb;
      return a.label.localeCompare(b.label, "sr");
    })
    .map((table) => {
      const parties: Record<
        string,
        { holder: string; here: number; total: number; seen: PartyRow["members"] }
      > = {};
      for (const seat of table.assignments) {
        if (!seat) continue;
        const g = guestMap[seat.guestId];
        let party = parties[seat.guestId];
        if (!party) {
          party = parties[seat.guestId] = {
            holder: g?.name?.trim() || seat.guestName,
            here: 0,
            total: parseInt(g?.guestCount || "1") || 1,
            seen: [],
          };
        }
        party.here++;
        const existing = party.seen.find((m) => m.name === seat.guestName);
        if (existing) existing.seats++;
        else party.seen.push({ name: seat.guestName, seats: 1 });
      }

      const guests = Object.values(parties).map<PartyRow>((p) => {
        // Seats carrying only the party label add nothing — skip the sub-list.
        // Compared script-insensitively so a Cyrillic seat name under a Latin
        // RSVP name ("Душан Блажић" / "Dušan Blažić") isn't printed twice.
        const named =
          p.seen.length > 1 ||
          (p.seen.length === 1 &&
            normalizeName(p.seen[0].name) !== normalizeName(p.holder));
        return {
          name: p.holder,
          here: p.here,
          total: p.total,
          members: named ? p.seen : [],
        };
      });
      return { label: table.label, guests };
    })
    .filter((t) => t.guests.length > 0);
}

/**
 * Alphabetical index — one row per person.
 *
 * A party contributes its named members when it has them, otherwise the party
 * itself. Listing both would print the same person twice (an "Ognjen Ikovic"
 * party whose first member is "Огњен Иковић"), which is exactly what this list
 * is meant to make easy to scan.
 */
export function buildGuestIndex(
  guestLists: TableGuestList[],
): { name: string; tables: string }[] {
  const byName: Record<string, Set<string>> = {};
  const add = (name: string, label: string) => {
    if (!byName[name]) byName[name] = new Set();
    byName[name].add(label);
  };
  for (const t of guestLists) {
    for (const g of t.guests) {
      if (g.members.length > 0) {
        for (const m of g.members) add(m.name, t.label);
      } else {
        add(g.name, t.label);
      }
    }
  }
  return Object.entries(byName)
    .map(([name, tableSet]) => ({ name, tables: [...tableSet].join(", ") }))
    .sort((a, b) => a.name.localeCompare(b.name, "sr"));
}
