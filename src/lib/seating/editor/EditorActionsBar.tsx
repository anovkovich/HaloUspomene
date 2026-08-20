"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Save,
  Check,
  ChevronDown,
  FileDown,
  QrCode,
  Link2,
  Heart,
  Sparkles,
  Undo2,
  Redo2,
} from "lucide-react";
import type { TableData } from "../types";

async function downloadQR(slug: string, guestLookupUrl: string) {
  const QRCode = (await import("qrcode")).default;
  const dataUrl = await QRCode.toDataURL(guestLookupUrl, {
    width: 1200,
    margin: 2,
    color: { dark: "#232323", light: "#ffffff" },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `gde-sedim-qr-${slug}.png`;
  a.click();
}

function copyGdeSedimLink(guestLookupUrl: string, onCopied: () => void) {
  navigator.clipboard.writeText(guestLookupUrl).then(onCopied);
}

interface Props {
  slug: string;
  tables: TableData[];
  isDirty: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string;
  paidForRaspored: boolean;
  onSave: () => void;
  onDownloadPDF: () => void | Promise<unknown>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** One entry per welcome-sign design this product offers. */
  welcomeSigns: { label: string; run: () => void | Promise<unknown> }[];
  guestLookupUrl: string;
  onRequestPanoDesign?: () => void;
  onDownloadRsvpQR?: () => void;
  /** Hall-scheme mode drops the whole download menu — none of it fits a template. */
  templateMode?: boolean;
}

/**
 * The editor's action pill: Preuzmi, undo/redo, Sačuvaj.
 *
 * Floats at the top-right of the canvas, level with the add-table strip on the
 * left, so the two bars frame the work area as one row. It lives here rather
 * than in `Toolbar` because the toolbar is a full-width header outside the
 * canvas and could not be positioned against the canvas edge.
 */
export default function EditorActionsBar({
  slug,
  tables,
  isDirty,
  isSaving,
  saveSuccess,
  saveError,
  paidForRaspored,
  onSave,
  onDownloadPDF,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  welcomeSigns,
  guestLookupUrl,
  onRequestPanoDesign,
  onDownloadRsvpQR,
  templateMode = false,
}: Props) {
  const lookupUrl = guestLookupUrl;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Which slow download is running. Rendering two B1 signs with four embedded
   * fonts each takes seconds, so the menu stays open and reports progress
   * instead of closing on click and leaving the couple staring at nothing.
   */
  const [busy, setBusy] = useState<string | null>(null);

  const runDownload = async (
    key: string,
    fn: () => void | Promise<unknown>,
    errorMessage: string,
  ) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      setDownloadOpen(false);
    } catch (err) {
      console.error(errorMessage, err);
      alert(errorMessage);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="absolute z-10 flex flex-col items-end gap-1" style={{ top: 12, right: 12 }}>
      {/* Action cluster — one pill, matching the two canvas bars, so the whole
          editor speaks the same language: white ground, gold in the icons. */}
      <div
        className="flex items-center gap-0.5 p-1 rounded-xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--theme-surface) 88%, #ffffff)",
          border:
            "1px solid color-mix(in srgb, var(--theme-primary) 22%, transparent)",
          boxShadow:
            "0 1px 2px rgba(35,35,35,0.06), 0 10px 24px -12px rgba(35,35,35,0.3)",
        }}
      >
      {/* Editing actions first, then a divider, then the two output actions —
          Preuzmi and Sačuvaj read as the pair they are. */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Opozovi (Ctrl+Z)"
        aria-label="Opozovi"
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
        style={{ color: "var(--theme-primary)" }}
        onMouseEnter={(e) => {
          if (canUndo)
            e.currentTarget.style.backgroundColor =
              "color-mix(in srgb, var(--theme-primary) 12%, transparent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Ponovi (Ctrl+Shift+Z)"
        aria-label="Ponovi"
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
        style={{ color: "var(--theme-primary)" }}
        onMouseEnter={(e) => {
          if (canRedo)
            e.currentTarget.style.backgroundColor =
              "color-mix(in srgb, var(--theme-primary) 12%, transparent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Redo2 size={14} />
      </button>
      <span
        className="self-stretch my-1 mx-0.5"
        style={{
          width: 1,
          backgroundColor:
            "color-mix(in srgb, var(--theme-primary) 22%, transparent)",
        }}
      />

      {/* Download dropdown — nothing in it applies to a hall template */}
      {!templateMode && (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDownloadOpen((v) => !v)}
          disabled={tables.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-raleway font-medium transition-colors disabled:opacity-30 cursor-pointer"
          style={{ color: "var(--theme-text)" }}
          onMouseEnter={(e) => {
            if (tables.length > 0)
              e.currentTarget.style.backgroundColor =
                "color-mix(in srgb, var(--theme-primary) 12%, transparent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Download size={13} style={{ color: "var(--theme-primary)" }} />
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
              minWidth: 230,
            }}
          >
            <button
              onClick={() =>
                runDownload(
                  "pdf",
                  onDownloadPDF,
                  "Greška pri generisanju PDF-a rasporeda. Pokušajte ponovo.",
                )
              }
              disabled={busy !== null}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer disabled:opacity-50 disabled:cursor-default"
              style={{ color: "var(--theme-text)" }}
            >
              {busy === "pdf" ? (
                <span
                  className="loading loading-spinner loading-xs"
                  style={{ color: "var(--theme-primary)" }}
                />
              ) : (
                <FileDown size={14} style={{ color: "var(--theme-primary)" }} />
              )}
              {busy === "pdf" ? "Pripremam PDF..." : "Preuzmi PDF raspored"}
            </button>
            <div
              className="h-px"
              style={{ backgroundColor: "var(--theme-border-light)" }}
            />
            {welcomeSigns.map((sign, i) => (
              <button
                key={sign.label}
                onClick={() =>
                  runDownload(
                    `pano-${i}`,
                    sign.run,
                    "Greška pri generisanju QR pano PDF-a. Pokušajte ponovo.",
                  )
                }
                disabled={busy !== null}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                style={{ color: "var(--theme-text)" }}
              >
                {busy === `pano-${i}` ? (
                  <span
                    className="loading loading-spinner loading-xs"
                    style={{ color: "var(--theme-primary)" }}
                  />
                ) : (
                  <Heart size={14} style={{ color: "var(--theme-primary)" }} />
                )}
                {busy === `pano-${i}` ? "Pripremam..." : sign.label}
              </button>
            ))}
            {/* Pano group: QR pano PDF + samo QR + Zatraži dizajn — no internal dividers */}
            <button
              onClick={() => {
                downloadQR(slug, lookupUrl);
                setDownloadOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
              style={{ color: "var(--theme-text)" }}
            >
              <QrCode size={14} style={{ color: "var(--theme-primary)" }} />
              Preuzmi samo QR za pano
            </button>
            {onRequestPanoDesign && (
              <button
                onClick={() => {
                  onRequestPanoDesign();
                  setDownloadOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
                style={{ color: "var(--theme-text)" }}
              >
                <Sparkles size={14} style={{ color: "var(--theme-primary)" }} />
                Zatraži dizajn QR panoa
              </button>
            )}
            {onDownloadRsvpQR && (
              <>
                <div
                  className="h-px"
                  style={{ backgroundColor: "var(--theme-border-light)" }}
                />
                <button
                  onClick={() => {
                    onDownloadRsvpQR();
                    setDownloadOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
                  style={{ color: "var(--theme-text)" }}
                >
                  <QrCode size={14} style={{ color: "var(--theme-primary)" }} />
                  QR za potvrdu dolaska
                </button>
              </>
            )}
            <div
              className="h-px"
              style={{ backgroundColor: "var(--theme-border-light)" }}
            />
            <button
              onClick={() => {
                copyGdeSedimLink(lookupUrl, () => {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                });
                setDownloadOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-raleway font-medium transition-colors hover:bg-black/5 cursor-pointer"
              style={{ color: "var(--theme-text)" }}
            >
              {linkCopied ? (
                <Check size={14} style={{ color: "var(--theme-primary)" }} />
              ) : (
                <Link2 size={14} style={{ color: "var(--theme-primary)" }} />
              )}
              {linkCopied ? "Link kopiran!" : "Kopiraj link Gde sedim"}
            </button>
          </div>
        )}
      </div>
      )}

      {/* Unsaved work announces itself with a pulsing dot rather than by
          pulsing the whole button — the old animate-pulse dimmed the label on
          every cycle, so the one control you needed to read was the one that
          kept fading out. */}
      <button
        onClick={onSave}
        disabled={isSaving || tables.length === 0 || !paidForRaspored}
        title={
          !paidForRaspored
            ? "Potrebna je aktivacija za čuvanje rasporeda"
            : isDirty
              ? "Imaš nesačuvane izmene"
              : undefined
        }
        className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-raleway font-semibold transition-all hover:opacity-90 disabled:opacity-30 cursor-pointer"
        style={{
          backgroundColor: saveSuccess
            ? "#16a34a"
            : isDirty
              ? "var(--theme-primary)"
              : "transparent",
          color: saveSuccess || isDirty ? "white" : "var(--theme-text-light)",
          boxShadow:
            isDirty && !saveSuccess
              ? "0 4px 14px -4px color-mix(in srgb, var(--theme-primary) 70%, transparent)"
              : "none",
        }}
      >
        {saveSuccess ? <Check size={13} /> : <Save size={13} />}
        {isSaving
          ? "Čuvam..."
          : saveSuccess
            ? "Sačuvano"
            : templateMode
              ? "Sačuvaj šemu"
              : "Sačuvaj"}

        {isDirty && !saveSuccess && !isSaving && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: "#ef4444" }}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: "#ef4444",
                border: "1.5px solid #ffffff",
              }}
            />
          </span>
        )}
      </button>
      </div>

      {saveError && (
        <p className="text-[10px] font-raleway" style={{ color: "#c0392b" }}>
          {saveError}
        </p>
      )}
    </div>
  );
}
