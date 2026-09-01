"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, Loader2, RotateCcw, UserCheck } from "lucide-react";
import {
  normalizeName,
  type GuestLookupEntry,
} from "@/lib/seating/lookup";
import type { TableData } from "@/lib/seating";
import type { StandaloneGuest } from "@/lib/standalone-seating";
import GdeSedimClient from "@/app/pozivnica/[slug]/gde-sedim/GdeSedimClient";
import { checkinGuestAction } from "./actions";

interface Props {
  slug: string;
  token: string;
  guests: StandaloneGuest[];
  guestLookup: GuestLookupEntry[];
  tables: TableData[];
}

/**
 * Hostess mode = the ordinary guest lookup, plus check-in.
 *
 * She works the door the same way a guest would: type a name, see the table,
 * see it highlighted on the hall map — and then additionally tick the guest
 * off. So this reuses `GdeSedimClient` wholesale and only injects an extra
 * block into the found-guest card through its `renderExtra` prop; that
 * component keeps no knowledge of check-in.
 */
export default function HostessCheckinClient({
  slug,
  token,
  guests,
  guestLookup,
  tables,
}: Props) {
  const [rows, setRows] = useState<StandaloneGuest[]>(guests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [errorGuestId, setErrorGuestId] = useState<string | null>(null);
  /** How many of a party the hostess is about to check in, keyed by guest id.
   *  Local until she confirms — set it BEFORE the tap, not after, so a party of
   *  four that arrives as two never has to be corrected down afterwards. */
  const [pending, setPending] = useState<Record<string, number>>({});

  // The lookup is keyed by display name (built from the seating layout), while
  // check-in needs the guest-list entry and its id. Fold both sides the same
  // way so "Ognjen Ikovic" resolves to "Огњен Иковић".
  const byName = useMemo(() => {
    const m = new Map<string, StandaloneGuest>();
    for (const g of rows) m.set(normalizeName(g.name), g);
    return m;
  }, [rows]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, g) => ({
          arrived: acc.arrived + Math.min(g.arrived ?? 0, g.guestCount),
          expected: acc.expected + g.guestCount,
        }),
        { arrived: 0, expected: 0 },
      ),
    [rows],
  );

  async function apply(guest: StandaloneGuest, next: number) {
    const previous = rows;
    const clamped = Math.max(0, Math.min(next, guest.guestCount));
    setBusyId(guest.id);
    setError("");
    setRows((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, arrived: clamped } : g)),
    );
    const res = await checkinGuestAction(slug, token, guest.id, clamped);
    setBusyId(null);
    // Keyed by guest: an error under one entry must not still be showing when
    // the hostess searches the next person.
    setErrorGuestId(res.success ? null : guest.id);
    if (!res.success) {
      setRows(previous);
      setError(res.error ?? "Greška pri upisu.");
      return;
    }
    // Undo puts the party back in front of the door — the picker starts over
    // from the full count.
    if (clamped === 0) {
      setPending((p) => {
        const next = { ...p };
        delete next[guest.id];
        return next;
      });
    }
  }

  function renderExtra(entry: GuestLookupEntry) {
    // A party is checked in under its holder; fall back to the searched name.
    const guest =
      byName.get(normalizeName(entry.partyName ?? "")) ??
      byName.get(normalizeName(entry.guestName));

    if (!guest) {
      return (
        <p
          className="font-raleway text-xs text-center"
          style={{ color: "var(--theme-text-light)" }}
        >
          Ovo ime nije na listi gostiju, pa se dolazak ne može označiti.
        </p>
      );
    }

    const arrived = Math.min(guest.arrived ?? 0, guest.guestCount);
    const isHere = arrived > 0;
    const busy = busyId === guest.id;
    const isParty = guest.guestCount > 1;
    // Whole party by default — the common case is that everyone shows up.
    const toCheckIn = Math.min(
      pending[guest.id] ?? guest.guestCount,
      guest.guestCount,
    );
    const setToCheckIn = (n: number) =>
      setPending((p) => ({
        ...p,
        [guest.id]: Math.max(1, Math.min(n, guest.guestCount)),
      }));

    const stepBtn = {
      backgroundColor: "rgba(0,0,0,0.06)",
      color: "var(--theme-text)",
    };

    return (
      <div
        className="rounded-xl px-4 py-3"
        style={{
          backgroundColor: isHere
            ? "rgba(22,163,74,0.10)"
            : "var(--theme-surface-alt, rgba(0,0,0,0.03))",
          border: `1px solid ${isHere ? "rgba(22,163,74,0.35)" : "var(--theme-border-light)"}`,
        }}
      >
        <p
          className="font-raleway text-[10px] uppercase tracking-[0.2em] mb-2.5 text-center"
          style={{ color: "var(--theme-text-light)" }}
        >
          Prijem gostiju
        </p>

        <div className="flex items-center justify-center gap-2">
          {isHere ? (
            <>
              {isParty && (
                <>
                  <button
                    onClick={() => apply(guest, arrived - 1)}
                    disabled={busy}
                    className="p-2 rounded-lg disabled:opacity-40 cursor-pointer"
                    style={stepBtn}
                    aria-label="Manje"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="w-14 text-center tabular-nums text-sm font-semibold"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {arrived}/{guest.guestCount}
                  </span>
                  <button
                    onClick={() => apply(guest, arrived + 1)}
                    disabled={busy || arrived >= guest.guestCount}
                    className="p-2 rounded-lg disabled:opacity-40 cursor-pointer"
                    style={stepBtn}
                    aria-label="Više"
                  >
                    <Plus size={14} />
                  </button>
                </>
              )}
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-2"
                style={{ color: "#15803d" }}
              >
                <Check size={15} /> Stigli
              </span>
              <button
                onClick={() => apply(guest, 0)}
                disabled={busy}
                className="p-2 rounded-lg disabled:opacity-40 cursor-pointer"
                style={{ color: "var(--theme-text-light)" }}
                title="Poništi dolazak"
                aria-label="Poništi dolazak"
              >
                <RotateCcw size={14} />
              </button>
            </>
          ) : (
            <>
              {/* Count first, confirmation second. */}
              {isParty && (
                <>
                  <button
                    onClick={() => setToCheckIn(toCheckIn - 1)}
                    disabled={busy || toCheckIn <= 1}
                    className="p-2 rounded-lg disabled:opacity-40 cursor-pointer"
                    style={stepBtn}
                    aria-label="Manje"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="w-14 text-center tabular-nums text-sm font-semibold"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {toCheckIn}/{guest.guestCount}
                  </span>
                  <button
                    onClick={() => setToCheckIn(toCheckIn + 1)}
                    disabled={busy || toCheckIn >= guest.guestCount}
                    className="p-2 rounded-lg disabled:opacity-40 cursor-pointer"
                    style={stepBtn}
                    aria-label="Više"
                  >
                    <Plus size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => apply(guest, toCheckIn)}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#16a34a" }}
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Stigli
              </button>
            </>
          )}
        </div>

        {error && errorGuestId === guest.id && (
          <p className="mt-2 text-xs text-center" style={{ color: "#c0392b" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Standing tally — the one thing the hostess wants without searching */}
      <div
        className="rounded-xl px-4 py-3 mb-6 flex items-center justify-between"
        style={{
          backgroundColor: "var(--theme-surface)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <span className="inline-flex items-center gap-2">
          <UserCheck size={15} style={{ color: "var(--theme-primary)" }} />
          <span
            className="font-raleway text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--theme-text-light)" }}
          >
            Prijem gostiju
          </span>
        </span>
        <span
          className="font-serif text-xl tabular-nums"
          style={{ color: "var(--theme-text)" }}
        >
          {totals.arrived}
          <span style={{ color: "var(--theme-text-light)" }}>
            {" "}
            / {totals.expected}
          </span>
        </span>
      </div>

      <GdeSedimClient
        guestLookup={guestLookup}
        tables={tables}
        renderExtra={renderExtra}
      />
    </>
  );
}
