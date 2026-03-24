"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Save, Check, ChevronDown, FileDown, QrCode } from "lucide-react";
import type { TableData } from "./types";

interface Props {
  slug: string;
  coupleNames: string;
  tables: TableData[];
  isDirty: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string;
  paidForRaspored: boolean;
  onSave: () => void;
  onDownloadPDF: () => void;
}

async function downloadQR(slug: string) {
  const QRCode = (await import("qrcode")).default;
  const url = `https://halouspomene.rs/pozivnica/${slug}/gde-sedim/`;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 1200,
    margin: 2,
    color: { dark: "#232323", light: "#ffffff" },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `gde-sedim-qr-${slug}.png`;
  a.click();
}

export default function Toolbar({
  slug,
  coupleNames,
  tables,
  isDirty,
  isSaving,
  saveSuccess,
  saveError,
  paidForRaspored,
  onSave,
  onDownloadPDF,
}: Props) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b shrink-0"
      style={{
        borderColor: "var(--theme-border-light)",
        backgroundColor: "var(--theme-surface)",
      }}
    >
      <Link
        href="/moje-vencanje?tab=guests"
        className="flex items-center gap-1.5 text-xs font-raleway transition-opacity hover:opacity-60"
        style={{ color: "var(--theme-text-light)" }}
      >
        <ArrowLeft size={13} />
        Portal
      </Link>

      <div className="h-4 w-px" style={{ backgroundColor: "var(--theme-border-light)" }} />

      <p className="font-script text-lg leading-none" style={{ color: "var(--theme-primary)" }}>
        {coupleNames}
      </p>

      <p
        className="font-raleway text-xs uppercase tracking-widest hidden sm:block"
        style={{ color: "var(--theme-text-light)" }}
      >
        — Raspored sedenja
      </p>

      <div className="flex-1" />

      {/* Download dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDownloadOpen((v) => !v)}
          disabled={tables.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-raleway font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1px solid var(--theme-border-light)",
            color: "var(--theme-text)",
          }}
        >
          <Download size={13} />
          Preuzmi
          <ChevronDown
            size={11}
            className="transition-transform"
            style={{ transform: downloadOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {downloadOpen && (
          <div
            className="absolute top-full right-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
              minWidth: 200,
            }}
          >
            <button
              onClick={() => { onDownloadPDF(); setDownloadOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
              style={{ color: "var(--theme-text)" }}
            >
              <FileDown size={14} style={{ color: "var(--theme-primary)" }} />
              Preuzmi PDF raspored
            </button>
            <div className="h-px" style={{ backgroundColor: "var(--theme-border-light)" }} />
            <button
              onClick={() => { downloadQR(slug); setDownloadOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
              style={{ color: "var(--theme-text)" }}
            >
              <QrCode size={14} style={{ color: "var(--theme-primary)" }} />
              Preuzmi QR kod
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={isSaving || tables.length === 0 || !paidForRaspored}
        title={!paidForRaspored ? "Potrebna je aktivacija za čuvanje rasporeda" : undefined}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-raleway font-medium transition-all hover:opacity-80 disabled:opacity-30${isDirty && !saveSuccess ? " animate-pulse" : ""}`}
        style={{
          backgroundColor: saveSuccess ? "#4caf50" : isDirty ? "var(--theme-primary)" : "var(--theme-surface)",
          border: `1px solid ${saveSuccess ? "#4caf50" : isDirty ? "var(--theme-primary)" : "var(--theme-border-light)"}`,
          color: saveSuccess || isDirty ? "white" : "var(--theme-text)",
        }}
      >
        {saveSuccess ? <Check size={13} /> : <Save size={13} />}
        {isSaving ? "Čuvam..." : saveSuccess ? "Sačuvano" : "Sačuvaj"}
      </button>

      {saveError && (
        <p className="text-[10px] font-raleway" style={{ color: "#c0392b" }}>
          {saveError}
        </p>
      )}
    </div>
  );
}
