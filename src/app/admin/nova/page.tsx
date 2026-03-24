"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Zap, FileJson } from "lucide-react";
import Link from "next/link";

const TEMPLATE = `{
  "theme": "classic_rose",
  "scriptFont": "great-vibes",
  "useCyrillic": false,
  "potvrde_password": "",
  "couple_names": {
    "bride": "",
    "groom": "",
    "full_display": ""
  },
  "event_date": "2026-01-01T16:00:00",
  "submit_until": "2026-01-01",
  "tagline": "",
  "locations": [
    {
      "name": "",
      "address": "",
      "map_url": "",
      "type": "hall"
    }
  ],
  "timeline": [
    {
      "title": "",
      "time": "16:00",
      "description": "",
      "what": "Skup u svečanoj sali",
      "icon": "CalendarHeart"
    }
  ],
  "countdown_enabled": true,
  "map_enabled": true,
  "paid_for_raspored": false,
  "paid_for_audio": false,
  "paid_for_audio_USB": "",
  "paid_for_pdf": false,
  "draft": false,
  "receipt_valid": false,
  "custom_discount": 0
}`;

type Mode = "quick" | "full";

export default function NovaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("quick");
  const [slug, setSlug] = useState("");
  const [json, setJson] = useState(TEMPLATE);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Quick mode fields
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [password, setPassword] = useState("");

  async function handleSave() {
    setError("");
    const trimmedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmedSlug) {
      setError("Slug je obavezan (npr. ana-dejan)");
      return;
    }

    let body: Record<string, unknown>;

    if (mode === "quick") {
      const b = bride.trim();
      const g = groom.trim();
      if (!b || !g) {
        setError("Ime mlade i mladoženje su obavezni");
        return;
      }
      body = {
        slug: trimmedSlug,
        couple_names: {
          bride: b,
          groom: g,
          full_display: `${b} & ${g}`,
        },
        potvrde_password: password || "",
        draft: true,
        receipt_valid: false,
        custom_discount: 0,
        paid_for_raspored: false,
        paid_for_audio: false,
        paid_for_audio_USB: "",
        paid_for_pdf: false,
      };
      if (eventDate) {
        body.event_date = `${eventDate}T16:00:00`;
      }
    } else {
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        setError("Neispravan JSON: " + (e as Error).message);
        return;
      }
      body = { slug: trimmedSlug, ...parsed };
    }

    setSaving(true);
    const res = await fetch("/api/admin/couples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
        <h2 className="text-2xl font-semibold text-white">Nova pozivnica</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={15} /> {saving ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("quick")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            mode === "quick"
              ? "bg-[#AE343F] text-white"
              : "bg-white/5 text-white/50 hover:text-white border border-white/10"
          }`}
        >
          <Zap size={14} /> Brzi start
        </button>
        <button
          onClick={() => setMode("full")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            mode === "full"
              ? "bg-[#AE343F] text-white"
              : "bg-white/5 text-white/50 hover:text-white border border-white/10"
          }`}
        >
          <FileJson size={14} /> Puna pozivnica (JSON)
        </button>
      </div>

      <div className="space-y-4">
        {/* Slug — shared */}
        <div>
          <label className="block text-sm text-white/60 mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm">/pozivnica/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mlada-mladozenja"
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#AE343F]"
            />
          </div>
        </div>

        {mode === "quick" ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
                Brzi start — samo planiranje
              </p>
              <p className="text-sm text-white/50">
                Par dobija pristup checklistama, budžetu i vendorima. Pozivnica se dodaje kasnije.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Ime mlade *</label>
                  <input
                    type="text"
                    value={bride}
                    onChange={(e) => setBride(e.target.value)}
                    placeholder="Ana"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#AE343F]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Ime mladoženje *</label>
                  <input
                    type="text"
                    value={groom}
                    onChange={(e) => setGroom(e.target.value)}
                    placeholder="Dejan"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#AE343F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Datum venčanja <span className="text-white/25">(opciono)</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#AE343F] [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Lozinka za portal <span className="text-white/25">(opciono)</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ostavi prazno za bez lozinke"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#AE343F]"
                />
              </div>

              <div className="text-xs text-white/25 space-y-1 pt-2 border-t border-white/5">
                <p>draft: true · sve paid_for opcije: false</p>
                <p>Par može koristiti /moje-vencanje odmah</p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-white/60 mb-1">
              Wedding Data (JSON)
            </label>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={30}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-[#AE343F] resize-y"
              spellCheck={false}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
