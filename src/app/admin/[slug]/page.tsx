"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import DeleteModal from "../DeleteModal";

export default function EditCouplePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
          toast.error("Pozivnica nije pronađena");
        }
        setLoading(false);
      });
  }, [slug]);

  async function handleSave() {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      toast.error("Neispravan JSON: " + (e as Error).message);
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
      toast.error(data.error || "Greška pri čuvanju");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }


  function handleGenerateMapUrls() {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.locations || !Array.isArray(parsed.locations)) return;

      let changed = false;
      parsed.locations = parsed.locations.map((loc: { name?: string; address?: string; map_url?: string }) => {
        const query = [loc.name, loc.address].filter(Boolean).join(", ");
        if (!query) return loc;
        changed = true;
        return {
          ...loc,
          map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
        };
      });

      if (changed) {
        setJson(JSON.stringify(parsed, null, 2));
      }
    } catch {
      // invalid JSON, ignore
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Izmena: <span className="text-[#AE343F]">{slug}</span>
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleGenerateMapUrls}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Generiši map_url za lokacije bez mape"
          >
            <MapPin size={14} /> <span className="hidden sm:inline">Generiši mape</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
              saveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-[#AE343F] hover:bg-[#8A2A32]"
            } text-white`}
          >
            <Save size={15} /> {saving ? "Čuvanje..." : saveSuccess ? "✓ Sačuvano!" : "Sačuvaj"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> <span className="hidden sm:inline">Obriši</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={25}
          className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-[11px] sm:text-xs leading-relaxed focus:outline-none focus:border-[#AE343F] resize-y"
          spellCheck={false}
        />
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
