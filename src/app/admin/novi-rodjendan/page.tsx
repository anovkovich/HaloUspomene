"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const TEMPLATE = `{
  "theme": "neutral_safari",
  "gender": "neutral",
  "displayFont": "fredoka",
  "child_name": "",
  "parent_names": "",
  "age": 1,
  "event_date": "2026-06-01T16:00:00",
  "submit_until": "2026-05-25",
  "tagline": "",
  "location": {
    "name": "",
    "address": "",
    "map_url": ""
  },
  "countdown_enabled": true,
  "map_enabled": true,
  "admin_password": "",
  "draft": false
}`;

export default function NoviRodjendanPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [json, setJson] = useState(TEMPLATE);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError("");
    const trimmedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmedSlug) {
      setError("Slug je obavezan (npr. marko-prvi-rodjendan)");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      setError("Neispravan JSON: " + (e as Error).message);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/birthdays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: trimmedSlug, data: parsed }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Greška pri čuvanju");
      setSaving(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-white/40 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Nazad
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Novi rođendan</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#E55A5A] text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={15} /> {saving ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm">/deciji-rodjendan/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ime-datum"
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6B6B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1">
            Birthday Data (JSON)
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={25}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-[#FF6B6B] resize-y"
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
