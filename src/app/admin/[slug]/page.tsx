"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteModal from "../DeleteModal";

export default function EditCouplePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} /> {saving ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Obriši
          </button>
        </div>
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

      </div>

      {showDeleteModal && (
        <DeleteModal
          slug={slug}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => router.push("/admin")}
        />
      )}
    </div>
  );
}
