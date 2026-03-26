"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { VendorCategory } from "@/app/moje-vencanje/types";
import { CITIES, CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";

function slugify(name: string, category: VendorCategory): string {
  const prefix: Record<VendorCategory, string> = {
    venue: "v",
    music: "m",
    "photo-video": "pv",
    cake: "c",
    decoration: "d",
    flowers: "f",
    fireworks: "fx",
    dress: "dr",
    makeup: "mk",
    rings: "r",
    gifts: "g",
  };
  const slug = name
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/[šś]/g, "s")
    .replace(/[žź]/g, "z")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix[category]}-${slug}`;
}

export default function AddVendorPage() {
  const router = useRouter();
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

  const generatedId = name ? slugify(name, category) : "";

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Ime vendora je obavezno");
      return;
    }
    setSaving(true);
    setError("");

    const body: Record<string, string> = {
      id: generatedId,
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
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
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

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/vendors"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-serif font-semibold text-white">
          Novi vendor
        </h1>
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
            placeholder="npr. Belgrade Hills Villa"
            className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
          />
          {generatedId && (
            <p className="text-[10px] text-white/30 mt-1">
              ID: {generatedId}
            </p>
          )}
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

        {/* Category-specific fields */}
        {category === "venue" && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Kapacitet (br. mesta)
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
              placeholder="npr. Bend, DJ, Orkestar"
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
              placeholder="npr. Foto, Video, Foto + Video"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        )}

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Telefon
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+381 ..."
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
              placeholder="example.rs"
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
              placeholder="@handle"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            Bio ({bio.length}/250)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 250))}
            placeholder="Kratki opis vendora..."
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
          {saving ? "Čuvanje..." : "Sačuvaj vendora"}
        </button>
      </div>
    </div>
  );
}
