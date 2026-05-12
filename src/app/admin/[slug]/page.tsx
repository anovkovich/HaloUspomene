"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, MapPin, ChevronDown, Phone } from "lucide-react";
import Link from "next/link";
import DeleteModal from "../DeleteModal";
import PlannerStatsSection from "@/app/pozivnica/[slug]/PlannerStatsSection";

export default function EditCouplePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; pathname: string }>>([]);
  const [paidForImages, setPaidForImages] = useState(false);
  const [imageLayout, setImageLayout] = useState<"line" | "triangle">("line");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [showNumbers, setShowNumbers] = useState<boolean[]>([]);

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
          setPaidForImages(data.paid_for_images ?? false);
          setImages(data.images ?? []);
          setImageLayout(data.image_layout ?? "line");
          setContactPhone(data.contact_phone ?? "");
          setShowNumbers(Array.isArray(data.show_numbers) ? data.show_numbers : []);
        } else {
          toast.error("Pozivnica nije pronađena");
        }
        setLoading(false);
      });
  }, [slug]);

  async function autoPatch(fields: Record<string, unknown>) {
    await fetch(`/api/admin/couples/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  function syncJsonFields(fields: Record<string, unknown>) {
    try {
      const parsed = JSON.parse(json);
      for (const [k, v] of Object.entries(fields)) {
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
          delete parsed[k];
        } else {
          parsed[k] = v;
        }
      }
      setJson(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON in textarea; leave it for handleSave to surface the error.
    }
  }

  const parsedPhones = contactPhone
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  async function saveContactPhone() {
    const normalized = parsedPhones.join(",");
    // Trim show_numbers to match the new phone count so toggles never drift past
    // the list (e.g. when admin shortens it from 2 phones to 1).
    const trimmed = parsedPhones.map((_, i) => showNumbers[i] ?? false);
    setContactPhone(normalized);
    setShowNumbers(trimmed);
    syncJsonFields({ contact_phone: normalized, show_numbers: trimmed });
    await autoPatch({ contact_phone: normalized, show_numbers: trimmed });
  }

  async function toggleShowNumber(idx: number) {
    const next = parsedPhones.map((_, i) => showNumbers[i] ?? false);
    next[idx] = !next[idx];
    setShowNumbers(next);
    syncJsonFields({ show_numbers: next });
    await autoPatch({ show_numbers: next });
  }

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
    setJsonOpen(false);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setUploading(true);

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`/api/admin/couples/${slug}/images`, {
      method: "POST",
      body: form,
    });

    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setImageError(data.error || "Greška pri otpremanju");
      return;
    }

    const data = await res.json();
    const updatedImages = [...images, { url: data.url, pathname: data.pathname }];
    setImages(updatedImages);
    // Sync images to JSON
    try {
      const parsed = JSON.parse(json);
      parsed.images = updatedImages;
      setJson(JSON.stringify(parsed, null, 2));
    } catch {
      /* ignore JSON parse errors */
    }
    // Reset file input
    e.target.value = "";
  }

  async function handleImageDelete(img: { url: string; pathname: string }) {
    if (!confirm("Obriši sliku?")) return;
    setImageError(null);

    const res = await fetch(`/api/admin/couples/${slug}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: img.url, pathname: img.pathname }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setImageError(data.error || "Greška pri brisanju");
      return;
    }
    const updatedImages = images.filter((i) => i.pathname !== img.pathname);
    setImages(updatedImages);
    // Sync images to JSON
    try {
      const parsed = JSON.parse(json);
      parsed.images = updatedImages.length > 0 ? updatedImages : undefined;
      setJson(JSON.stringify(parsed, null, 2));
    } catch {
      /* ignore JSON parse errors */
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
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setJsonOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <span>JSON</span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${jsonOpen ? "rotate-180" : ""}`}
            />
          </button>
          {jsonOpen && (
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={25}
              className="w-full px-3 sm:px-4 py-3 bg-white/5 border-t border-white/10 text-white font-mono text-[11px] sm:text-xs leading-relaxed focus:outline-none resize-y"
              spellCheck={false}
            />
          )}
        </div>

        {/* Images toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
          <span className="text-sm font-medium text-white/70">Slike</span>
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(json);
                const newVal = !paidForImages;
                parsed.paid_for_images = newVal;
                setJson(JSON.stringify(parsed, null, 2));
                setPaidForImages(newVal);
                autoPatch({ paid_for_images: newVal });
              } catch {
                toast.error("Neispravan JSON");
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              paidForImages ? "bg-[#AE343F]" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                paidForImages ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {paidForImages && (
          <div className="border border-white/10 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/70">
                Slike ({images.length}/3)
              </h3>
              {images.length < 3 && (
                <label
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    uploading
                      ? "bg-white/5 text-white/30"
                      : "bg-[#AE343F] hover:bg-[#8A2A32] text-white"
                  }`}
                >
                  {uploading ? "Otpremanje..." : "+ Dodaj sliku"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            {imageError && (
              <p className="text-red-400 text-xs">{imageError}</p>
            )}

            {/* Layout switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Raspored:</span>
              {(["line", "triangle"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(json);
                      parsed.image_layout = opt;
                      setJson(JSON.stringify(parsed, null, 2));
                      setImageLayout(opt);
                      autoPatch({ image_layout: opt });
                    } catch {
                      toast.error("Neispravan JSON");
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    imageLayout === opt
                      ? "bg-[#AE343F] text-white"
                      : "bg-white/10 text-white/50 hover:bg-white/20"
                  }`}
                >
                  {opt === "line" ? "Linija" : "Trougao"}
                </button>
              ))}
            </div>

            {images.length === 0 ? (
              <p className="text-white/30 text-xs italic">
                Nema otpremljenih slika.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.pathname} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      onClick={() => handleImageDelete(img)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Obriši sliku"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Brojevi telefona — toggle per number to surface a call-CTA below the RSVP form */}
        <div className="border border-white/10 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Phone size={14} /> Brojevi telefona
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-wider text-white/40">
              Kontakt brojevi (razdvojeni zarezima, npr. +381638261775,+381615000363)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                onBlur={saveContactPhone}
                placeholder="+381..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-[#AE343F]"
                spellCheck={false}
              />
              <button
                onClick={saveContactPhone}
                className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Sačuvaj
              </button>
            </div>
          </div>

          {parsedPhones.length === 0 ? (
            <p className="text-xs text-white/30 italic">
              Nema sačuvanih brojeva. Dodaj jedan ili više brojeva pa će se pojaviti prekidači za prikaz ispod RSVP forme.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Prikaži ispod RSVP forme
              </p>
              {parsedPhones.map((phone, idx) => {
                const enabled = showNumbers[idx] ?? false;
                return (
                  <div
                    key={`${phone}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-md"
                  >
                    <span className="text-sm text-white/80 font-mono">{phone}</span>
                    <button
                      onClick={() => toggleShowNumber(idx)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? "bg-[#AE343F]" : "bg-white/20"
                      }`}
                      aria-label={`Prikaži ${phone}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Planner Stats Section */}
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <PlannerStatsSection
            slug={slug}
            themeVariables={{
              "--theme-primary": "#AE343F",
              "--theme-text": "#ffffff",
              "--theme-surface": "rgba(255, 255, 255, 0.05)",
              "--theme-border": "rgba(255, 255, 255, 0.15)",
            }}
            useCyrillic={true}
          />
        </div>
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
