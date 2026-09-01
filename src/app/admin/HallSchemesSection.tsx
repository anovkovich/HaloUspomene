"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { HallVenueSummary } from "@/lib/hall-venues";
import {
  hallsLabel,
  seatsLabel,
  tablesLabel,
  venuesLabel,
} from "@/lib/seating/labels";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Props {
  onNeedsLogin: () => void;
}

/**
 * Venue hall scheme library.
 *
 * Renders above the standalone seatings list on the "Raspored sedenja" tab.
 * Schemes are drawn once per hall and later loaded by clients into their own
 * seating editor, so nothing here is tied to a single event.
 */
export default function HallSchemesSection({ onNeedsLogin }: Props) {
  const { confirm, prompt, dialog } = useConfirmDialog({ variant: "dark" });

  const [venues, setVenues] = useState<HallVenueSummary[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createHallName, setCreateHallName] = useState("Velika sala");
  const [createError, setCreateError] = useState("");

  // `onNeedsLogin` is an inline arrow from the admin page, so it changes
  // identity on every parent render — hold it in a ref instead of making it a
  // `load` dependency, otherwise the mount effect below refetches endlessly.
  const needsLoginRef = useRef(onNeedsLogin);
  needsLoginRef.current = onNeedsLogin;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hall-venues");
      if (res.status === 401) {
        needsLoginRef.current();
        return;
      }
      const data = (await res.json()) as {
        venues: HallVenueSummary[];
        cities: string[];
      };
      setVenues(data.venues ?? []);
      setCities(data.cities ?? []);
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Shared handling for the small mutation calls: 401 → login, other failures
   *  surfaced instead of silently doing nothing. */
  async function runMutation(res: Response): Promise<boolean> {
    if (res.status === 401) {
      onNeedsLogin();
      return false;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await confirm({
        title: "Nije sačuvano",
        message: data.error ?? "Greška pri upisu. Pokušajte ponovo.",
        confirmLabel: "U redu",
        cancelLabel: "Zatvori",
      });
      return false;
    }
    return true;
  }

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleCreate() {
    setCreateError("");
    if (createName.trim().length < 2) {
      setCreateError("Naziv sale je obavezan (min 2 karaktera).");
      return;
    }
    if (createCity.trim().length < 2) {
      setCreateError("Grad je obavezan (min 2 karaktera).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/hall-venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          city: createCity,
          address: createAddress,
          firstHallName: createHallName,
        }),
      });
      if (res.status === 401) {
        onNeedsLogin();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error ?? "Greška pri kreiranju.");
        return;
      }
      setShowCreate(false);
      setCreateName("");
      setCreateCity("");
      setCreateAddress("");
      setCreateHallName("Velika sala");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddHall(venue: HallVenueSummary) {
    const name = await prompt({
      title: "Nova sala",
      message: `Dodaj salu u objekat ${venue.name}.`,
      input: { label: "Naziv sale", placeholder: "npr. Mala sala 1" },
      confirmLabel: "Dodaj",
    });
    if (!name) return;

    const res = await fetch(`/api/admin/hall-venues/${venue.slug}/halls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!(await runMutation(res))) return;
    setExpanded((prev) => new Set(prev).add(venue.slug));
    await load();
  }

  async function handleRenameHall(
    venue: HallVenueSummary,
    hallId: string,
    current: string,
  ) {
    const name = await prompt({
      title: "Preimenuj salu",
      input: { label: "Naziv sale", defaultValue: current },
      confirmLabel: "Sačuvaj",
    });
    if (!name || name === current) return;

    const res = await fetch(
      `/api/admin/hall-venues/${venue.slug}/halls/${hallId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      },
    );
    if (!(await runMutation(res))) return;
    await load();
  }

  async function handleDeleteHall(
    venue: HallVenueSummary,
    hallId: string,
    hallName: string,
  ) {
    const ok = await confirm({
      title: "Obriši salu?",
      message: `Šema za "${hallName}" (${venue.name}) biće trajno obrisana.`,
      danger: true,
      confirmLabel: "Obriši",
    });
    if (!ok) return;

    const res = await fetch(
      `/api/admin/hall-venues/${venue.slug}/halls/${hallId}`,
      { method: "DELETE" },
    );
    if (!(await runMutation(res))) return;
    await load();
  }

  async function handleDeleteVenue(venue: HallVenueSummary) {
    const ok = await confirm({
      title: "Obriši objekat?",
      message: `${venue.name} (${venue.city}) — briše se ${hallsLabel(venue.halls.length)} sa šemama.`,
      danger: true,
      confirmLabel: "Obriši sve",
    });
    if (!ok) return;

    const res = await fetch(`/api/admin/hall-venues/${venue.slug}`, {
      method: "DELETE",
    });
    if (!(await runMutation(res))) return;
    await load();
  }

  const totalHalls = venues.reduce((s, v) => s + v.halls.length, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Šeme sala{" "}
          <span className="text-white/40 text-sm font-normal">
            ({venuesLabel(venues.length)} · {hallsLabel(totalHalls)})
          </span>
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Dodaj šemu za novu salu</span>
          <span className="sm:hidden">Nova sala</span>
        </button>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Učitavanje šema...</p>
      ) : venues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-10 px-6 text-center">
          <Building2 size={26} className="mx-auto text-white/30 mb-3" />
          <p className="text-sm text-white/60 mb-1">Još nema sačuvanih šema</p>
          <p className="text-xs text-white/40">
            Dodaj objekat sa gradom, pa nacrtaj raspored stolova. Klijenti
            kasnije učitaju gotovu šemu umesto da sami crtaju.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {venues.map((v) => {
            const open = expanded.has(v.slug);
            return (
              <div
                key={v.slug}
                className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => toggle(v.slug)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    {open ? (
                      <ChevronDown size={15} className="text-white/40 shrink-0" />
                    ) : (
                      <ChevronRight size={15} className="text-white/40 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-white truncate">
                      {v.name}
                    </span>
                    <span className="text-xs text-white/40 shrink-0">
                      {v.city}
                      {v.address ? ` · ${v.address}` : ""}
                    </span>
                  </button>
                  <span className="text-xs text-white/40 shrink-0">
                    {hallsLabel(v.halls.length)}
                  </span>
                  <button
                    onClick={() => handleDeleteVenue(v)}
                    title="Obriši objekat"
                    className="p-1.5 rounded-lg text-white/30 hover:text-[#e26b76] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {open && (
                  <div className="border-t border-white/10 px-4 py-3 space-y-2">
                    {v.halls.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        <span className="text-sm text-white/80 flex-1 min-w-0 truncate">
                          {h.name}
                        </span>
                        <span className="text-xs text-white/40 shrink-0">
                          {tablesLabel(h.tableCount)} · {seatsLabel(h.totalSeats)}
                        </span>
                        <Link
                          href={`/admin/sale/${v.slug}/${h.id}`}
                          className="text-xs text-[#8ab4f8] hover:text-[#a8c7fa] transition-colors shrink-0"
                        >
                          Uredi šemu →
                        </Link>
                        <button
                          onClick={() => handleRenameHall(v, h.id, h.name)}
                          title="Preimenuj"
                          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteHall(v, h.id, h.name)}
                          title="Obriši salu"
                          className="p-1.5 rounded-lg text-white/30 hover:text-[#e26b76] hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddHall(v)}
                      className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer pt-1"
                    >
                      <Plus size={13} /> Dodaj salu
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create venue modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60"
          onClick={() => !saving && setShowCreate(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: "#1e1e1e",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-1">
              Dodaj šemu za novu salu
            </h3>
            <p className="text-xs text-white/40 mb-5">
              Objekat se vezuje za grad i može imati više sala.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Naziv objekta
                </label>
                <input
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="npr. Restoran Kristal"
                  className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Grad
                </label>
                <input
                  list="hall-venue-cities"
                  value={createCity}
                  onChange={(e) => setCreateCity(e.target.value)}
                  placeholder="npr. Zrenjanin"
                  className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
                />
                <datalist id="hall-venue-cities">
                  {cities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Adresa (opciono)
                </label>
                <input
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Naziv prve sale
                </label>
                <input
                  value={createHallName}
                  onChange={(e) => setCreateHallName(e.target.value)}
                  placeholder="npr. Velika sala"
                  className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25"
                />
              </div>
            </div>

            {createError && (
              <p className="text-xs text-[#e26b76] mt-3">{createError}</p>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors cursor-pointer disabled:opacity-40"
              >
                Otkaži
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium transition-colors cursor-pointer disabled:opacity-40"
              >
                {saving ? "Kreiram..." : "Kreiraj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog}
    </div>
  );
}
