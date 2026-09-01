"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, MapPin, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ClientUploadLinkButton from "@/app/admin/ClientUploadLinkButton";
import { prepareImageForUpload } from "@/lib/image-utils";

interface BirthdayImage {
  url: string;
  pathname: string;
}

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

  // Gallery — punoletstvo only (the children's renderer ignores these fields).
  const [isPunoletstvo, setIsPunoletstvo] = useState(false);
  const [paidForImages, setPaidForImages] = useState(false);
  const [images, setImages] = useState<BirthdayImage[]>([]);
  const [imageLayout, setImageLayout] = useState<"line" | "triangle">("line");
  const [uploading, setUploading] = useState(false);
  const [heroEmblemUrl, setHeroEmblemUrl] = useState("");
  const [emblemUploading, setEmblemUploading] = useState(false);
  const [bgColor, setBgColor] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");

  useEffect(() => {
    fetch("/api/admin/birthdays")
      .then((r) => r.json())
      .then((birthdays) => {
        const birthday = birthdays.find(
          (b: { slug: string }) => b.slug === slug,
        );
        if (birthday) {
          // Slug is the route param, not editable content — keep it out of the
          // textarea so a typo there can never rewrite the record's identity.
          const data = { ...birthday };
          delete data.slug;
          setJson(JSON.stringify(data, null, 2));
          setIsPunoletstvo(data.type === "eighteenth");
          setPaidForImages(!!data.paid_for_images);
          setImages(data.images ?? []);
          setImageLayout(data.image_layout === "triangle" ? "triangle" : "line");
          setHeroEmblemUrl(data.hero_emblem_url ?? "");
          setBgColor(data.custom_background_color ?? "");
          setPrimaryColor(data.custom_primary_color ?? "");
        } else {
          toast.error("Rođendan nije pronađen");
        }
        setLoading(false);
      });
  }, [slug]);

  /** Merge a patch into the JSON textarea so it never drifts from the DB. */
  function mergeIntoJson(patch: Record<string, unknown>) {
    try {
      const parsed = JSON.parse(json);
      setJson(JSON.stringify({ ...parsed, ...patch }, null, 2));
    } catch {
      // Textarea holds invalid JSON — the PATCH still lands; the operator will
      // see the field reappear on reload rather than get a silent mismatch.
      toast.warning("JSON u editoru je neispravan — polje je snimljeno na server");
    }
  }

  /** Write a field straight to the DB, bypassing the full-document Save. */
  async function autoPatch(patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/birthdays/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) toast.error("Greška pri čuvanju");
    return res.ok;
  }

  async function handleToggleImages() {
    const next = !paidForImages;
    setPaidForImages(next);
    mergeIntoJson({ paid_for_images: next });
    await autoPatch({ paid_for_images: next });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-picking the same file after an error

    setUploading(true);
    // HEIC -> JPEG + downscale to 2560px, same as the client upload link.
    // Gallery photos only — the emblem keeps its original file because this
    // pipeline flattens transparency into a white JPEG background.
    let prepared: File;
    try {
      prepared = await prepareImageForUpload(file);
    } catch {
      setUploading(false);
      toast.error("Sliku nije moguće obraditi");
      return;
    }

    const fd = new FormData();
    fd.append("image", prepared);
    const res = await fetch(`/api/admin/birthdays/${slug}/images`, {
      method: "POST",
      body: fd,
    });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Otpremanje nije uspelo");
      return;
    }
    const { url, pathname } = await res.json();
    const next = [...images, { url, pathname }];
    setImages(next);
    mergeIntoJson({ images: next });
    toast.success("Slika dodata");
  }

  async function handleImageDelete(img: BirthdayImage) {
    const res = await fetch(`/api/admin/birthdays/${slug}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(img),
    });
    if (!res.ok) {
      toast.error("Brisanje nije uspelo");
      return;
    }
    const next = images.filter((i) => i.pathname !== img.pathname);
    setImages(next);
    mergeIntoJson({ images: next });
  }

  async function handleEmblemUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setEmblemUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("slot", "emblem");
    const res = await fetch(`/api/admin/birthdays/${slug}/images`, {
      method: "POST",
      body: fd,
    });
    setEmblemUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Otpremanje nije uspelo");
      return;
    }
    const { url } = await res.json();
    setHeroEmblemUrl(url);
    mergeIntoJson({ hero_emblem_url: url });
    toast.success("Ilustracija postavljena");
  }

  async function handleEmblemDelete() {
    const res = await fetch(`/api/admin/birthdays/${slug}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot: "emblem" }),
    });
    if (!res.ok) {
      toast.error("Brisanje nije uspelo");
      return;
    }
    setHeroEmblemUrl("");
    mergeIntoJson({ hero_emblem_url: "" });
    toast.success("Vraćen zlatni pečat");
  }

  /** Empty string clears the override and restores the theme default. */
  async function handleColorCommit(
    field: "custom_background_color" | "custom_primary_color",
    value: string,
  ) {
    const clean = value.trim();
    if (clean && !/^#[0-9a-fA-F]{6}$/.test(clean)) {
      toast.error("Boja mora biti u formatu #RRGGBB");
      return;
    }
    mergeIntoJson({ [field]: clean });
    await autoPatch({ [field]: clean });
  }

  async function handleLayoutChange(opt: "line" | "triangle") {
    setImageLayout(opt);
    mergeIntoJson({ image_layout: opt });
    await autoPatch({ image_layout: opt });
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
        href="/admin?tab=rodjendani"
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

      {/* Izgled + galerija — samo punoletstvo renderuje ova polja */}
      {isPunoletstvo && (
        <div className="space-y-4 mb-6">
          {/* Ilustracija umesto zlatnog pečata */}
          <div className="border border-white/10 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-white/70">
              Ilustracija u zaglavlju
            </h3>
            <p className="text-[11px] text-white/40">
              Zamenjuje zlatni pečat, zrake i broj 18. Bez nje ide podrazumevani pečat.
            </p>
            <div className="flex items-center gap-3">
              {heroEmblemUrl && (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroEmblemUrl}
                    alt=""
                    className="w-20 h-20 object-contain rounded-lg border border-white/10 bg-white/5"
                  />
                  <button
                    onClick={handleEmblemDelete}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Ukloni ilustraciju"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              )}
              <label
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  emblemUploading
                    ? "bg-white/5 text-white/30"
                    : "bg-[#FF6B6B] hover:bg-[#E55A5A] text-white"
                }`}
              >
                {emblemUploading
                  ? "Otpremanje..."
                  : heroEmblemUrl
                    ? "Zameni"
                    : "+ Dodaj ilustraciju"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={emblemUploading}
                  onChange={handleEmblemUpload}
                />
              </label>
            </div>
          </div>

          {/* Boje po pozivnici */}
          <div className="border border-white/10 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-white/70">Boje pozivnice</h3>
            <p className="text-[11px] text-white/40">
              Prazno polje = boja iz teme. Format #RRGGBB. Pozadina farba samo
              stranu — uokvirene kartice zadržavaju boju iz teme.
            </p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["Pozadina", bgColor, setBgColor, "custom_background_color"],
                  ["Primarna", primaryColor, setPrimaryColor, "custom_primary_color"],
                ] as const
              ).map(([label, value, setter, field]) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-xs text-white/50 w-16">{label}:</span>
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
                    onChange={(e) => {
                      setter(e.target.value);
                      handleColorCommit(field, e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                  />
                  <input
                    type="text"
                    value={value}
                    placeholder="#RRGGBB"
                    onChange={(e) => setter(e.target.value)}
                    onBlur={(e) => handleColorCommit(field, e.target.value)}
                    className="w-28 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs font-mono focus:outline-none focus:border-[#FF6B6B]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
            <span className="flex items-center gap-2 text-sm font-medium text-white/70">
              <ImageIcon size={15} /> Galerija fotografija
            </span>
            <button
              onClick={handleToggleImages}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                paidForImages ? "bg-[#FF6B6B]" : "bg-white/20"
              }`}
              aria-label="Uključi galeriju fotografija"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  paidForImages ? "translate-x-5" : ""
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
                        : "bg-[#FF6B6B] hover:bg-[#E55A5A] text-white"
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

              <ClientUploadLinkButton
                productKind="birthday"
                slug={slug}
                accent="#FF6B6B"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Raspored:</span>
                {(["line", "triangle"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleLayoutChange(opt)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      imageLayout === opt
                        ? "bg-[#FF6B6B] text-white"
                        : "bg-white/10 text-white/50 hover:bg-white/20"
                    }`}
                  >
                    {opt === "line" ? "Linija" : "Trougao"}
                  </button>
                ))}
                {imageLayout === "triangle" && images.length !== 3 && (
                  <span className="text-[11px] text-white/30">
                    (trougao važi samo pri tačno 3 slike)
                  </span>
                )}
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
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
        </div>
      )}

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
