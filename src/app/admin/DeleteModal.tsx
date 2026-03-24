"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { mergeAndDownload } from "@/lib/audio-utils/mergeAudio";

interface Props {
  slug: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteModal({ slug, onClose, onDeleted }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError("");
    setDeleting(true);

    // Verify password
    const authRes = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!authRes.ok) {
      setError("Pogrešna lozinka");
      setDeleting(false);
      return;
    }

    // Download audio before deleting (if any)
    try {
      const audioRes = await fetch(`/api/pozivnica/${slug}/audio`);
      if (audioRes.ok) {
        const messages: { blobUrl: string }[] = await audioRes.json();
        if (messages.length > 0) {
          const urls = messages.map((m) => m.blobUrl);
          await mergeAndDownload(urls, `audio-knjiga-${slug}.wav`);
        }
      }
    } catch {
      // Non-critical
    }

    await fetch(`/api/admin/couples/${slug}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#222222] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Brisanje pozivnice
            </h3>
          </div>
          <button
            onClick={onClose}
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
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
              Audio poruke (biće preuzete pre brisanja)
            </li>
          </ul>

          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-2">
                Ukucajte{" "}
                <span className="font-mono text-white/70">{slug}</span> da
                potvrdite
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={slug}
                className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/50"
                style={{ backgroundColor: "#2a2a2a" }}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2">
                Admin lozinka
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/50"
                style={{ backgroundColor: "#2a2a2a" }}
                autoComplete="off"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Otkaži
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== slug || !password || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 size={14} />
            {deleting ? "Brisanje..." : "Obriši zauvek"}
          </button>
        </div>
      </div>
    </div>
  );
}
