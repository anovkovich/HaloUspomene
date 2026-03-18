"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, Pencil, Users, Armchair } from "lucide-react";

interface Couple {
  slug: string;
  couple_names: { bride: string; groom: string; full_display: string };
  event_date: string;
  theme: string;
  paid_for_raspored?: boolean;
}

interface CoupleStats {
  rsvp: { attending: number; declined: number; totalGuests: number } | null;
  seating: { totalSeats: number; assignedSeats: number } | null;
}

export default function AdminPage() {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [stats, setStats] = useState<Record<string, CoupleStats>>({});
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/couples")
      .then((r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          setLoading(false);
          return [];
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCouples(data);
          // Load stats async
          fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch(() => {});
        }
        setLoading(false);
      });
  }, []);

  if (needsLogin)
    return (
      <LoginForm
        onSuccess={() => {
          setNeedsLogin(false);
          setLoading(true);
          window.location.reload();
        }}
      />
    );
  if (loading) return <p className="text-white/40">Učitavanje...</p>;

  async function handleDelete(slug: string) {
    if (!confirm(`Obrisati ${slug}?`)) return;
    await fetch(`/api/admin/couples/${slug}`, { method: "DELETE" });
    setCouples((c) => c.filter((x) => x.slug !== slug));
  }

  async function handleToggleRaspored(slug: string, current: boolean) {
    const newVal = !current;
    // Optimistic update
    setCouples((prev) =>
      prev.map((c) =>
        c.slug === slug ? { ...c, paid_for_raspored: newVal } : c
      )
    );
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_for_raspored: newVal }),
    });
    if (!res.ok) {
      // Revert on error
      setCouples((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, paid_for_raspored: current } : c
        )
      );
    }
  }

  function daysUntil(dateStr: string) {
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0) return `za ${diff} dana`;
    if (diff === 0) return "danas!";
    return `pre ${Math.abs(diff)} dana`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Pozivnice ({couples.length})
        </h2>
        <button
          onClick={() => router.push("/admin/nova")}
          className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nova pozivnica
        </button>
      </div>

      <div className="space-y-3">
        {couples.map((c) => {
          const s = stats[c.slug];
          const isPast = new Date(c.event_date) < new Date();

          return (
            <div
              key={c.slug}
              className={`bg-white/5 border border-white/10 rounded-xl px-5 py-4 ${isPast ? "opacity-50" : ""}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">
                      {c.couple_names.full_display}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {c.theme}
                    </span>
                    <span
                      className={`text-xs ${isPast ? "text-white/30" : "text-white/60"}`}
                    >
                      {daysUntil(c.event_date)}
                    </span>
                  </div>
                  <div className="text-sm text-white/40">
                    /{c.slug} &middot;{" "}
                    {new Date(c.event_date).toLocaleDateString("sr-RS", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/pozivnica/${c.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    title="Otvori pozivnicu"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => router.push(`/admin/${c.slug}`)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                    title="Izmeni"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.slug)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400"
                    title="Obriši"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-2">
                {/* RSVP */}
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

                {/* Seating */}
                {s?.seating && c.paid_for_raspored && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Armchair size={12} />
                    <span>
                      {s.seating.assignedSeats}/{s.seating.totalSeats} raspoređeno
                    </span>
                    {s.seating.totalSeats > 0 && (
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#AE343F] rounded-full transition-all"
                          style={{
                            width: `${Math.round((s.seating.assignedSeats / s.seating.totalSeats) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* paid_for_raspored toggle */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-white/30">Raspored</span>
                  <button
                    onClick={() =>
                      handleToggleRaspored(c.slug, !!c.paid_for_raspored)
                    }
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      c.paid_for_raspored ? "bg-green-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        c.paid_for_raspored ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        Admin Prijava
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin lozinka"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#AE343F]"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">Pogrešna lozinka</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-xl px-4 py-3 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Proveravam..." : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}
