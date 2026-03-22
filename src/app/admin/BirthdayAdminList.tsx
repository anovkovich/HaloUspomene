"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, Pencil, Users, Cake } from "lucide-react";

interface Birthday {
  slug: string;
  child_name: string;
  parent_names: string;
  event_date: string;
  theme: string;
  gender: string;
  age: number;
  draft?: boolean;
}

interface BirthdayStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
}

interface Props {
  onNeedsLogin: () => void;
}

export default function BirthdayAdminList({ onNeedsLogin }: Props) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [stats, setStats] = useState<Record<string, BirthdayStats>>({});
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/birthdays")
      .then((r) => {
        if (r.status === 401) {
          onNeedsLogin();
          setLoading(false);
          return [];
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBirthdays(data);
          fetch("/api/admin/birthday-stats")
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch(() => {});
        }
        setLoading(false);
      });
  }, [onNeedsLogin]);

  async function handleToggleDraft(slug: string, current: boolean) {
    const newVal = !current;
    setBirthdays((prev) =>
      prev.map((b) =>
        b.slug === slug ? { ...b, draft: newVal } : b
      )
    );
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: newVal }),
    });
    if (!res.ok) {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.slug === slug ? { ...b, draft: current } : b
        )
      );
    }
  }

  function daysUntil(dateStr: string) {
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 0) return `za ${diff} dana`;
    if (diff === 0) return "danas!";
    return `pre ${Math.abs(diff)} dana`;
  }

  async function handleDelete() {
    if (!deleteSlug || deleteConfirm !== deleteSlug) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/birthdays/${deleteSlug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBirthdays((b) => b.filter((x) => x.slug !== deleteSlug));
      setDeleteSlug(null);
      setDeleteConfirm("");
    }
    setDeleting(false);
  }

  if (loading) return <p className="text-white/40">Učitavanje...</p>;

  const genderLabel = (g: string) =>
    g === "boy" ? "Dečak" : g === "girl" ? "Devojčica" : "Neutralno";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Rođendani ({birthdays.length})
        </h2>
        <button
          onClick={() => router.push("/admin/novi-rodjendan")}
          className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#E55A5A] text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus size={14} /> Novi rođendan
        </button>
      </div>

      <div className="space-y-3">
        {birthdays.map((b) => {
          const s = stats[b.slug];
          const eventDate = new Date(b.event_date);
          const today = new Date();
          const isPast = eventDate < today;

          return (
            <div
              key={b.slug}
              className={`rounded-xl px-5 py-4 ${
                isPast
                  ? "bg-white/5 opacity-50 border border-white/10"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${b.draft ? "bg-orange-400" : "bg-green-400"}`}
                        title={b.draft ? "Draft" : "Live"}
                      />
                      <Cake size={14} className="text-[#FF6B6B] shrink-0" />
                      <span className="font-semibold text-white">
                        {b.child_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {b.age}. rođendan
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {genderLabel(b.gender)}
                      </span>
                      <span className="text-[10px] text-white/60 shrink-0">
                        {daysUntil(b.event_date)}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      /{b.slug} &middot; {b.parent_names} &middot;{" "}
                      {new Date(b.event_date).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`/deciji-rodjendan/${b.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      title="Otvori pozivnicu"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => router.push(`/admin/rodjendan/${b.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white cursor-pointer"
                      title="Izmeni"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteSlug(b.slug)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400 cursor-pointer"
                      title="Obriši"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats + toggles */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                {s?.rsvp && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Users size={12} />
                    <span>
                      <span className="text-green-400">{s.rsvp.attending} Da</span>
                      {" / "}
                      <span className="text-red-400">{s.rsvp.declined} Ne</span>
                      {" — "}
                      <span className="text-white/70">{s.rsvp.totalGuests} gostiju</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className="text-xs text-white/30">Draft</span>
                  <button
                    onClick={() => handleToggleDraft(b.slug, !!b.draft)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      b.draft ? "bg-orange-400" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        b.draft ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete modal */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#2a2a2a] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Obriši <span className="text-red-400">{deleteSlug}</span>
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Ovo će obrisati rođendansku pozivnicu i sve RSVP prijave. Unesite slug za potvrdu:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={deleteSlug}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm mb-4 focus:outline-none focus:border-red-400"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setDeleteSlug(null); setDeleteConfirm(""); }}
                className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== deleteSlug || deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-30 cursor-pointer"
              >
                {deleting ? "Brisanje..." : "Obriši"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
