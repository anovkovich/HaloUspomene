"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditBirthdayPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/birthdays")
      .then((r) => r.json())
      .then((birthdays) => {
        const birthday = birthdays.find(
          (b: { slug: string }) => b.slug === slug,
        );
        if (birthday) {
          const { slug: _s, ...data } = birthday;
          setJson(JSON.stringify(data, null, 2));
        } else {
          toast.error("Rođendan nije pronađen");
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
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
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

  function handleGenerateMapUrl() {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.location) return;

      const loc = parsed.location;
      const query = [loc.name, loc.address].filter(Boolean).join(", ");
      if (!query) return;

      parsed.location = {
        ...loc,
        map_url: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
      };

      setJson(JSON.stringify(parsed, null, 2));
    } catch {
      // invalid JSON, ignore
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== slug) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setDeleting(false);
      toast.error("Greška pri brisanju");
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
          Izmena: <span className="text-[#FF6B6B]">{slug}</span>
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleGenerateMapUrl}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Generiši map_url za lokaciju"
          >
            <MapPin size={14} /> <span className="hidden sm:inline">Generiši mapu</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
              saveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-[#FF6B6B] hover:bg-[#E55A5A]"
            } text-white`}
          >
            <Save size={15} /> {saving ? "Čuvanje..." : saveSuccess ? "✓ Sačuvano!" : "Sačuvaj"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
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
          className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-[11px] sm:text-xs leading-relaxed focus:outline-none focus:border-[#FF6B6B] resize-y"
          spellCheck={false}
        />
      </div>

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#2a2a2a] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Obriši <span className="text-red-400">{slug}</span>
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Ovo će obrisati pozivnicu i sve RSVP prijave. Unesite slug za potvrdu:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={slug}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm mb-4 focus:outline-none focus:border-red-400"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== slug || deleting}
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
