"use client";

import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import type {
  EventInvitation,
  EventInvitationAgendaItem,
} from "@/lib/standalone-seating";

/** Theme keys for the public /dogadjaj invitation. Placeholder set while the
 *  visual language is being designed — the field is a plain string on the
 *  record, so adding one here is the only change needed. */
const THEMES: { key: string; label: string }[] = [
  { key: "executive_navy", label: "Executive Navy" },
  { key: "graphite_silver", label: "Graphite & Silver" },
  { key: "gala_black_gold", label: "Gala Black & Gold" },
];

interface Props {
  slug: string;
  eventName: string;
  initialEventTime?: string;
  initialInvitation?: EventInvitation;
  onClose: () => void;
  onSaved: (eventTime: string, invitation: EventInvitation) => void;
}

export default function SeatingInvitationModal({
  slug,
  eventName,
  initialEventTime,
  initialInvitation,
  onClose,
  onSaved,
}: Props) {
  const [eventTime, setEventTime] = useState(initialEventTime ?? "");
  const [locName, setLocName] = useState(
    initialInvitation?.location?.name ?? "",
  );
  const [locAddress, setLocAddress] = useState(
    initialInvitation?.location?.address ?? "",
  );
  const [submitUntil, setSubmitUntil] = useState(
    initialInvitation?.submitUntil ?? "",
  );
  const [theme, setTheme] = useState(
    initialInvitation?.theme ?? THEMES[0].key,
  );
  const [tagline, setTagline] = useState(initialInvitation?.tagline ?? "");
  const [dressCode, setDressCode] = useState(
    initialInvitation?.dressCode ?? "",
  );
  const [agenda, setAgenda] = useState<EventInvitationAgendaItem[]>(
    initialInvitation?.agenda ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateAgenda(i: number, patch: Partial<EventInvitationAgendaItem>) {
    setAgenda((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  }

  async function handleSave() {
    setError("");
    if (!locName.trim()) {
      setError("Naziv lokacije je obavezan.");
      return;
    }
    setSaving(true);

    // Google Maps embed built from the typed address — same trick the
    // punoletstvo create route uses, so the invitation can show a map without
    // the admin hunting for an embed URL.
    const query = [locName.trim(), locAddress.trim()]
      .filter(Boolean)
      .join(", ");
    const invitation: EventInvitation = {
      location: {
        name: locName.trim(),
        address: locAddress.trim(),
        map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
      },
      submitUntil: submitUntil || undefined,
      theme,
      tagline: tagline.trim() || undefined,
      dressCode: dressCode.trim() || undefined,
      agenda: agenda.filter((a) => a.time.trim() || a.title.trim()),
    };

    const res = await fetch(`/api/admin/seatings/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventTime, invitation }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Greška pri čuvanju");
      return;
    }
    onSaved(eventTime, invitation);
  }

  const labelCls =
    "text-[10px] uppercase tracking-wider text-white/40 mb-1 block";
  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2563eb]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111] border border-white/10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Pozivnica za događaj
            </h3>
            <p className="text-xs text-white/40 mt-0.5">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 cursor-pointer"
            aria-label="Zatvori"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Vreme početka</label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-[10px] text-white/30">
              Čuva se odvojeno od datuma — datum vozi rokove za galeriju i
              audio, pa se ne sme spajati sa vremenom.
            </p>
          </div>

          <div>
            <label className={labelCls}>Naziv lokacije</label>
            <input
              type="text"
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              placeholder="npr. Hotel Metropol, Sala Ambasador"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Adresa</label>
            <input
              type="text"
              value={locAddress}
              onChange={(e) => setLocAddress(e.target.value)}
              placeholder="Bulevar kralja Aleksandra 69, Beograd"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Rok za potvrdu dolaska</label>
            <DatePicker
              value={submitUntil}
              onChange={setSubmitUntil}
              variant="dark"
              accentColor="#2563eb"
              placeholder="Bez roka"
              showQuickActions={false}
            />
            <p className="mt-1 text-[10px] text-white/30">
              Prazno = bez roka, potvrde stižu do kraja.
            </p>
          </div>

          <div>
            <label className={labelCls}>Tema</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {THEMES.map((t) => (
                <option key={t.key} value={t.key} className="bg-[#1a1a1a]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Podnaslov (opciono)</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="npr. Deset godina zajedno"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Dress code (opciono)</label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="npr. Svečano / Black tie"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Satnica (opciono)</label>
            <div className="space-y-2">
              {agenda.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={row.time}
                    onChange={(e) => updateAgenda(i, { time: e.target.value })}
                    className={`${inputCls} w-28 shrink-0`}
                  />
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateAgenda(i, { title: e.target.value })}
                    placeholder="npr. Koktel dobrodošlice"
                    className={inputCls}
                  />
                  <button
                    onClick={() =>
                      setAgenda((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 shrink-0 cursor-pointer"
                    aria-label="Ukloni stavku"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setAgenda((prev) => [...prev, { time: "", title: "" }])
                }
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 cursor-pointer"
              >
                <Plus size={13} /> Dodaj stavku
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 cursor-pointer"
          >
            Otkaži
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2563eb] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}
