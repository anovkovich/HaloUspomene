"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function EditCouplePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/couples")
      .then((r) => r.json())
      .then((couples) => {
        const couple = couples.find(
          (c: { slug: string }) => c.slug === slug
        );
        if (couple) {
          const { slug: _s, ...data } = couple;
          setJson(JSON.stringify(data, null, 2));
        } else {
          setError("Pozivnica nije pronađena");
        }
        setLoading(false);
      });
  }, [slug]);

  async function handleSave() {
    setError("");
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      setError("Neispravan JSON: " + (e as Error).message);
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/admin/couples/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Greška pri čuvanju");
      setSaving(false);
      return;
    }

    router.push("/admin");
  }

  async function handleDelete() {
    setDeleteError("");
    setDeleting(true);

    // Verify password via admin auth endpoint
    const authRes = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });

    if (!authRes.ok) {
      setDeleteError("Pogrešna lozinka");
      setDeleting(false);
      return;
    }

    await fetch(`/api/admin/couples/${slug}`, { method: "DELETE" });
    router.push("/admin");
  }

  if (loading) return <p className="text-white/40">Učitavanje...</p>;

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-white/40 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Nazad
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Izmena: <span className="text-[#AE343F]">{slug}</span>
        </h2>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors cursor-pointer"
        >
          <Trash2 size={14} /> Obriši
        </button>
      </div>

      <div className="space-y-4">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={35}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-[#AE343F] resize-y"
          spellCheck={false}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-6 py-3 font-medium transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Čuvanje..." : "Sačuvaj izmene"}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Brisanje pozivnice</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Ovo će trajno obrisati pozivnicu{" "}
                <span className="font-semibold text-white">{slug}</span> i sve
                povezane podatke:
              </p>

              <ul className="text-sm text-red-400/80 space-y-1.5 pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                  Podaci o paru (couples)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                  Sve potvrde dolaska / RSVP odgovori
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                  Raspored sedenja
                </li>
              </ul>

              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs text-white/40 mb-2">
                    Ukucajte <span className="font-mono text-white/70">{slug}</span> da potvrdite
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={slug}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/50"
                    spellCheck={false}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-2">
                    Admin lozinka
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/50"
                  />
                </div>
                {deleteError && (
                  <p className="text-xs text-red-400">{deleteError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== slug || !deletePassword || deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 size={14} />
                {deleting ? "Brisanje..." : "Obriši zauvek"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
