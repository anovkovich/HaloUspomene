"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Database,
  Building2,
  Music,
  Camera,
  Cake,
  Sparkles,
  Flower2,
  Flame,
  TrainFrontTunnel,
  Palette,
  CircleDot,
  Gift,
} from "lucide-react";
import type { VendorCategory } from "@/app/moje-vencanje/types";

interface VendorRow {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  phone?: string;
  website?: string;
  instagram?: string;
  bio?: string;
  endorsementCount: number;
}

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: "Sala",
  music: "Muzika",
  "photo-video": "Foto/Video",
  cake: "Torta",
  decoration: "Dekoracija",
  flowers: "Cveće",
  fireworks: "Vatromet",
  dress: "Venčanica",
  makeup: "Šminka",
  rings: "Burme",
  gifts: "Pokloni",
};

const CATEGORY_ICONS: Record<VendorCategory, React.ReactNode> = {
  venue: <Building2 size={14} />,
  music: <Music size={14} />,
  "photo-video": <Camera size={14} />,
  cake: <Cake size={14} />,
  decoration: <Sparkles size={14} />,
  flowers: <Flower2 size={14} />,
  fireworks: <Flame size={14} />,
  dress: <TrainFrontTunnel size={14} />,
  makeup: <Palette size={14} />,
  rings: <CircleDot size={14} />,
  gifts: <Gift size={14} />,
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [dumping, setDumping] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [duplicates, setDuplicates] = useState<{ ids: string[]; names: string[]; newCount: number; parsedVendors: unknown[] } | null>(null);

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then((r) => r.json())
      .then((data) => {
        setVendors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = vendors;
    if (filterCategory)
      result = result.filter((v) => v.category === filterCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors, filterCategory, search]);

  const parseVendors = (): unknown[] | null => {
    try {
      const parsed = JSON.parse(importJson);
      const arr = Array.isArray(parsed) ? parsed : parsed.vendors;
      if (!Array.isArray(arr)) return null;
      return arr;
    } catch {
      return null;
    }
  };

  // Step 1: Check for duplicates
  const handleImportCheck = async () => {
    setImporting(true);
    setImportResult(null);
    setDuplicates(null);
    const vendors_arr = parseVendors();
    if (!vendors_arr) {
      setImportResult({ ok: false, message: "JSON must be an array of vendors or { vendors: [...] }" });
      setImporting(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/vendors/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendors: vendors_arr, mode: "check" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setImportResult({ ok: false, message: data.error });
      } else if (data.duplicateCount === 0) {
        // No duplicates — insert directly
        await executeImport(vendors_arr, "insert");
      } else {
        // Show duplicate alert
        setDuplicates({
          ids: data.duplicateIds,
          names: data.duplicateNames,
          newCount: data.newCount,
          parsedVendors: vendors_arr,
        });
      }
    } catch (e) {
      setImportResult({ ok: false, message: `Error: ${e instanceof Error ? e.message : "unknown"}` });
    }
    setImporting(false);
  };

  // Step 2: Execute with chosen mode
  const executeImport = async (vendors_arr: unknown[], mode: "insert" | "update") => {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/vendors/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendors: vendors_arr, mode }),
      });
      const data = await res.json();
      if (data.ok) {
        const parts = [];
        if (data.inserted > 0) parts.push(`${data.inserted} new inserted`);
        if (data.updated > 0) parts.push(`${data.updated} updated`);
        if (data.skipped > 0) parts.push(`${data.skipped} duplicates skipped`);
        setImportResult({ ok: true, message: parts.join(", ") || "No changes" });
        setImportJson("");
        setDuplicates(null);
        const res2 = await fetch("/api/admin/vendors");
        const vendors2 = await res2.json();
        setVendors(Array.isArray(vendors2) ? vendors2 : []);
      } else {
        setImportResult({ ok: false, message: data.error });
      }
    } catch (e) {
      setImportResult({ ok: false, message: `Error: ${e instanceof Error ? e.message : "unknown"}` });
    }
    setImporting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Obriši vendora "${name}"?`)) return;
    const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    vendors.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [vendors]);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-semibold text-white">
              Vendori ({vendors.length})
            </h1>
            <p className="text-xs text-white/50">
              Upravljanje vendor direktorijumom
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setDumping(true);
              try {
                const res = await fetch("/api/admin/vendors/dump");
                const text = await res.text();
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "vendor-db-dump.txt";
                a.click();
                URL.revokeObjectURL(url);
              } catch { /* ignore */ }
              setDumping(false);
            }}
            disabled={dumping}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/15 text-white/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            {dumping ? "..." : "Dump"}
          </button>
          <button
            onClick={() => { setImportOpen(true); setImportResult(null); setDuplicates(null); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/15 text-white/60 transition-colors cursor-pointer"
          >
            <Database size={14} />
            Import
          </button>
          <Link
            href="/admin/vendors/novi"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-[#AE343F] text-white hover:bg-[#AE343F]/90 transition-colors"
          >
            <Plus size={16} />
            Dodaj
          </Link>
        </div>
      </div>

      {/* Import Modal */}
      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[8vh]"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-white">Import vendora</h3>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Paste JSON array — duplicates will be detected before import
                </p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="text-white/30 hover:text-white/60 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {importResult && (
                <div className={`p-3 rounded-lg text-xs ${importResult.ok ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  <pre className="whitespace-pre-wrap">{importResult.message}</pre>
                </div>
              )}

              <div className="text-[10px] text-white/30 font-mono bg-white/5 rounded-lg p-3 leading-relaxed">
                {"Format: [\n"}
                {"  { \"id\": \"v-example\", \"name\": \"Example Venue\",\n"}
                {"    \"category\": \"venue\", \"city\": \"Beograd\",\n"}
                {"    \"phone\": \"+381...\", \"website\": \"example.rs\",\n"}
                {"    \"instagram\": \"@handle\", \"bio\": \"...\",\n"}
                {"    \"capacity\": \"200-400\",\n"}
                {"    \"musicType\": \"Bend\", \"serviceType\": \"Foto\" }\n"}
                {"]"}
              </div>

              {/* Duplicate alert */}
              {duplicates && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
                  <div className="text-xs text-yellow-400 font-medium">
                    {duplicates.ids.length} duplicate(s) found — {duplicates.newCount} new
                  </div>
                  <div className="max-h-24 overflow-y-auto text-[10px] text-yellow-400/70 font-mono space-y-0.5">
                    {duplicates.names.map((n) => (
                      <div key={n}>• {n}</div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => executeImport(duplicates.parsedVendors, "insert")}
                      disabled={importing}
                      className="flex-1 py-2 rounded-lg text-xs bg-white/10 text-white hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {importing ? "..." : `Insert ${duplicates.newCount} new only`}
                    </button>
                    <button
                      onClick={() => executeImport(duplicates.parsedVendors, "update")}
                      disabled={importing}
                      className="flex-1 py-2 rounded-lg text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {importing ? "..." : `Insert new + Update ${duplicates.ids.length} existing`}
                    </button>
                  </div>
                </div>
              )}

              {!duplicates && (
                <>
                  <textarea
                    value={importJson}
                    onChange={(e) => { setImportJson(e.target.value); setImportResult(null); setDuplicates(null); }}
                    placeholder="Paste vendor JSON here..."
                    rows={14}
                    className="w-full px-3 py-2.5 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder-white/20 focus:border-[#AE343F] focus:outline-none resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/30">
                      {(() => {
                        try {
                          const p = JSON.parse(importJson);
                          const arr = Array.isArray(p) ? p : p.vendors;
                          return Array.isArray(arr) ? `${arr.length} vendor(a) detected` : "Invalid format";
                        } catch {
                          return importJson.trim() ? "Invalid JSON" : "";
                        }
                      })()}
                    </p>
                    <button
                      onClick={handleImportCheck}
                      disabled={importing || !importJson.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-[#AE343F] text-white hover:bg-[#AE343F]/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Database size={14} />
                      {importing ? "Checking..." : "Import"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži po imenu, gradu ili ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-[#AE343F] focus:outline-none"
        >
          <option value="">Sve kategorije</option>
          {categories.map(([cat, count]) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat as VendorCategory]} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <p className="text-xs text-white/50 mb-3">
        {filtered.length} vendora
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-[#AE343F]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-sm">
            {vendors.length === 0
              ? 'Baza je prazna — klikni "Seed DB" da uvezete vendore.'
              : "Nema rezultata za ovu pretragu."}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-white/50">
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">
                    Grad
                  </th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Kategorija
                  </th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Endorse
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-white/5 last:border-none hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#AE343F] shrink-0">
                          {CATEGORY_ICONS[v.category]}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">
                            {v.name}
                          </p>
                          <p className="text-[10px] text-white/30 truncate">
                            {v.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 hidden sm:table-cell">
                      {v.city}
                    </td>
                    <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                      {CATEGORY_LABELS[v.category]}
                    </td>
                    <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                      {v.endorsementCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/vendors/${v.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-[#AE343F] transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
