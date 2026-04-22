"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Instagram,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { VendorCategory } from "@/app/moje-vencanje/types";
import { CITIES, CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";

export default function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<VendorCategory>("venue");
  const [city, setCity] = useState("Beograd");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [capacity, setCapacity] = useState("");
  const [musicType, setMusicType] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoBusy, setLogoBusy] = useState<"upload" | "import" | null>(null);
  const [logoMsg, setLogoMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/vendors/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((v) => {
        setName(v.name || "");
        setCategory(v.category || "venue");
        setCity(v.city || "Beograd");
        setPhone(v.phone || "");
        setWebsite(v.website || "");
        setInstagram(v.instagram || "");
        setCapacity(v.capacity || "");
        setMusicType(v.musicType || "");
        setServiceType(v.serviceType || "");
        setBio(v.bio || "");
        setLogoUrl(v.logoUrl || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Vendor nije pronađen");
        setLoading(false);
      });
  }, [id]);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setLogoMsg({ kind: "err", text: "Fajl mora biti slika." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoMsg({ kind: "err", text: "Slika mora biti ispod 2MB." });
      return;
    }
    setLogoBusy("upload");
    setLogoMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/vendors/${id}/logo`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Upload nije uspeo.");
      setLogoUrl(data.url);
      setLogoMsg({ kind: "ok", text: "Logo je sačuvan." });
    } catch (e) {
      setLogoMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Greška pri uploadu.",
      });
    } finally {
      setLogoBusy(null);
    }
  };

  const handleImportFromInstagram = async () => {
    if (!instagram.trim()) {
      setLogoMsg({
        kind: "err",
        text: "Unesi Instagram handle pre uvoza.",
      });
      return;
    }
    setLogoBusy("import");
    setLogoMsg(null);
    try {
      // Ensure the IG handle is persisted before the server tries to scrape.
      await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram: instagram.trim() }),
      });
      const res = await fetch(
        `/api/admin/vendors/${id}/import-instagram`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Uvoz sa Instagrama nije uspeo.");
      setLogoUrl(data.url);
      setLogoMsg({
        kind: "ok",
        text: `Logo uvezen sa Instagrama (@${data.handle}).`,
      });
    } catch (e) {
      setLogoMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Greška pri uvozu.",
      });
    } finally {
      setLogoBusy(null);
    }
  };

  const handleLogoRemove = async () => {
    if (!confirm("Obriši trenutni logo?")) return;
    setLogoBusy("upload");
    setLogoMsg(null);
    try {
      const res = await fetch(`/api/admin/vendors/${id}/logo`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Brisanje nije uspelo.");
      setLogoUrl("");
      setLogoMsg({ kind: "ok", text: "Logo je obrisan." });
    } catch (e) {
      setLogoMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Greška pri brisanju.",
      });
    } finally {
      setLogoBusy(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Ime vendora je obavezno");
      return;
    }
    setSaving(true);
    setError("");

    const body: Record<string, string> = {
      id,
      name: name.trim(),
      category,
      city,
    };
    if (phone.trim()) body.phone = phone.trim();
    if (website.trim()) body.website = website.trim();
    if (instagram.trim()) body.instagram = instagram.trim();
    if (bio.trim()) body.bio = bio.trim();
    if (category === "venue" && capacity.trim())
      body.capacity = capacity.trim();
    if (category === "music" && musicType.trim())
      body.musicType = musicType.trim();
    if (category === "photo-video" && serviceType.trim())
      body.serviceType = serviceType.trim();

    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/admin/vendors");
      } else {
        setError(data.error || "Greška pri čuvanju");
      }
    } catch {
      setError("Greška pri povezivanju");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Obriši vendora "${name}"? Ovo se ne može poništiti.`)) return;
    const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/vendors");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex justify-center pt-20">
        <span className="loading loading-spinner loading-lg text-[#AE343F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/vendors"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-semibold text-white">
              Izmeni vendora
            </h1>
            <p className="text-xs text-white/40">ID: {id}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
          Obriši
        </button>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            Ime vendora *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
          />
        </div>

        {/* Category + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Kategorija *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VendorCategory)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            >
              {CATEGORY_META.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Grad *
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category-specific */}
        {category === "venue" && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Kapacitet
            </label>
            <input
              type="text"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="npr. 200-400"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        )}
        {category === "music" && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Tip muzike
            </label>
            <input
              type="text"
              value={musicType}
              onChange={(e) => setMusicType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        )}
        {category === "photo-video" && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Tip usluge
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        )}

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Telefon
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">
            Logo
          </label>
          <div className="flex items-start gap-3">
            <div className="relative w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    disabled={logoBusy !== null}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    aria-label="Obriši logo"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <span className="text-white/25 text-[10px] text-center px-1">
                  Bez logo-a
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoBusy !== null}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {logoBusy === "upload" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  Upload logo
                </button>
                <button
                  type="button"
                  onClick={handleImportFromInstagram}
                  disabled={logoBusy !== null || !instagram.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white text-xs font-medium transition-opacity cursor-pointer disabled:opacity-40"
                >
                  {logoBusy === "import" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Instagram size={14} />
                  )}
                  Uvezi sa Instagrama
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                    e.target.value = "";
                  }}
                />
              </div>
              {logoMsg && (
                <p
                  className={`text-[11px] ${
                    logoMsg.kind === "ok" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {logoMsg.text}
                </p>
              )}
              {!logoMsg && (
                <p className="text-[11px] text-white/35">
                  Max 2MB. IG uvoz radi samo za javne profile.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            Bio ({bio.length}/500)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#AE343F] text-white text-sm font-medium hover:bg-[#AE343F]/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} />
          {saving ? "Čuvanje..." : "Sačuvaj izmene"}
        </button>
      </div>
    </div>
  );
}
