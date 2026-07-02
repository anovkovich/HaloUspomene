"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  X,
  Pencil,
  Link2,
  Unlink,
  Check,
  Search,
  UserPlus,
  FolderPlus,
  Users,
  Star,
} from "lucide-react";
import type { RSVPEntry } from "@/lib/rsvp";
import type {
  GuestList,
  GuestSection,
  Invitee,
  InviteeStatus,
  InviteeCategory,
  KeyRole,
} from "./types";

/* ── Constants ──────────────────────────────────────────────── */

const STATUS_ORDER: InviteeStatus[] = [
  "not-invited",
  "invited",
  "confirmed",
  "declined",
];

const STATUS_META: Record<
  InviteeStatus,
  { label: string; short: string; dot: string; activeChip: string }
> = {
  "not-invited": {
    label: "Nije pozvan",
    short: "Nepozvani",
    dot: "bg-white border-[#232323]/35",
    activeChip: "bg-[#232323]/10 text-[#232323] border-[#232323]/30",
  },
  invited: {
    label: "Pozvan",
    short: "Pozvani",
    dot: "bg-[#d4af37] border-[#d4af37]",
    activeChip: "bg-[#d4af37]/20 text-[#9c7d23] border-[#d4af37]/55",
  },
  confirmed: {
    label: "Potvrdio",
    short: "Potvrdili",
    dot: "bg-[#4a8a5c] border-[#4a8a5c]",
    activeChip: "bg-[#4a8a5c]/15 text-[#3a6e49] border-[#4a8a5c]/50",
  },
  declined: {
    label: "Otkazao",
    short: "Otkazali",
    dot: "bg-[#232323]/30 border-[#232323]/35",
    activeChip: "bg-[#232323]/12 text-[#232323]/70 border-[#232323]/30",
  },
};

const CATEGORIES: { value: Exclude<InviteeCategory, "">; label: string }[] = [
  { value: "Mladini", label: "Mladini" },
  { value: "Mladozenjini", label: "Mladoženjini" },
  { value: "Zajednicki", label: "Zajednički" },
];

const UNGROUPED = "__ungrouped__";
const KEYROLES_KEY = "__keyroles__";

// Predefined wedding-role placeholders (album-style). Stable ids so seeding is
// idempotent; once the user edits roles, the list is persisted and replaces these.
const DEFAULT_KEY_ROLES: KeyRole[] = [
  { id: "kr-kum", group: "kum", label: "Kum (crkveni)", name: "" },
  { id: "kr-kuma", group: "kuma", label: "Kuma / Stari svat (crkveni)", name: "" },
  { id: "kr-barjaktar", group: "barjaktar", label: "Barjaktar", name: "" },
  { id: "kr-dever", group: "dever", label: "Dever", name: "" },
  { id: "kr-deverusa", group: "deverusa", label: "Deveruša", name: "" },
  { id: "kr-caus", group: "caus", label: "Čauš (vođa veselja)", name: "" },
  { id: "kr-buklijas", group: "buklijas", label: "Buklijaš (poziva goste)", name: "" },
  { id: "kr-blagajnik", group: "blagajnik", label: "Blagajnik (poklon-kutija)", name: "" },
  { id: "kr-domacin", group: "domacin", label: "Domaćin / Hostesa", name: "" },
  { id: "kr-kicenje", group: "kicenje", label: "Kićenje svatova", name: "" },
];

// Groups whose "+" appends another slot — with the label of the added slot.
// kum/kuma add the civil-ceremony variant; domacin/kicenje add more of the same.
const ROLE_ADD: Record<string, string> = {
  kum: "Kum (građanski)",
  kuma: "Kuma (građanski)",
  domacin: "Domaćin / Hostesa",
  kicenje: "Kićenje svatova",
};

/* ── Helpers ────────────────────────────────────────────────── */

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Normalize for fuzzy name matching: lowercase, strip diacritics, collapse spaces.
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Link confirmation modal ───────────────────────────────── */

function LinkModal({
  invitee,
  responses,
  linkedIds,
  onClose,
  onLink,
}: {
  invitee: Invitee;
  responses: RSVPEntry[];
  linkedIds: Map<string, string>; // rsvpId -> inviteeId
  onClose: () => void;
  onLink: (rsvp: RSVPEntry) => void;
}) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const target = normalizeName(invitee.name);
    const q = normalizeName(query);
    return responses
      .filter((r) => !q || normalizeName(r.name).includes(q))
      .map((r) => {
        const n = normalizeName(r.name);
        let score = 0;
        if (n === target) score = 3;
        else if (n.includes(target) || target.includes(n)) score = 2;
        else if (
          target &&
          n.split(" ")[0] &&
          n.split(" ")[0] === target.split(" ")[0]
        )
          score = 1;
        return { r, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (
          new Date(b.r.timestamp).getTime() - new Date(a.r.timestamp).getTime()
        );
      });
  }, [responses, query, invitee.name]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-[#232323]">
              Poveži potvrdu
            </h3>
            <p className="text-xs text-[#232323]/60 truncate">
              za: {invitee.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/55"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži potvrde..."
              className="w-full bg-white pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
            />
          </div>
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-2">
          {sorted.length === 0 && (
            <p className="text-center text-sm text-[#232323]/60 py-8">
              {responses.length === 0
                ? "Još nema potvrda gostiju"
                : "Nema rezultata"}
            </p>
          )}
          {sorted.map(({ r, score }) => {
            const linkedTo = linkedIds.get(r.id);
            const linkedElsewhere = linkedTo && linkedTo !== invitee.id;
            const isAttending = r.attending === "Da";
            return (
              <button
                key={r.id}
                onClick={() => onLink(r)}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  score >= 3
                    ? "border-[#AE343F]/45 bg-[#AE343F]/[0.04]"
                    : "border-[#232323]/15 hover:border-[#232323]/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#232323] truncate">
                    {r.name}
                  </span>
                  <span
                    className={`shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                      isAttending
                        ? "bg-[#AE343F]/15 text-[#AE343F]"
                        : "bg-[#232323]/10 text-[#232323]/65"
                    }`}
                  >
                    {isAttending
                      ? `Dolazi · ${r.guestCount}`
                      : "Ne dolazi"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {score >= 3 && (
                    <span className="text-[11px] text-[#AE343F] font-medium">
                      Verovatno poklapanje
                    </span>
                  )}
                  {linkedElsewhere && (
                    <span className="text-[11px] text-[#232323]/55">
                      Već povezano sa drugom zvanicom
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Role assignment picker (search invitees OR type a new name) ─── */

function RolePickerModal({
  roleLabel,
  invitees,
  onClose,
  onAssign,
}: {
  roleLabel: string;
  invitees: Invitee[];
  onClose: () => void;
  onAssign: (name: string, inviteeId?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = normalizeName(query);
  const trimmed = query.trim();

  const matches = useMemo(() => {
    const named = invitees.filter((i) => i.name.trim());
    const list = q
      ? named.filter((i) => normalizeName(i.name).includes(q))
      : named;
    return list.slice(0, 60);
  }, [invitees, q]);

  const exact = invitees.some((i) => normalizeName(i.name) === q);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-[#232323]">Dodeli osobu</h3>
            <p className="text-xs text-[#232323]/60 truncate">
              uloga: {roleLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/55"
            />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && trimmed) {
                  e.preventDefault();
                  onAssign(trimmed);
                }
              }}
              placeholder="Pretraži zvanice ili upiši novo ime..."
              className="w-full bg-white pl-10 pr-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
            />
          </div>
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-2">
          {/* New (free-text) name — for people not in the list (e.g. a guest's child) */}
          {trimmed && !exact && (
            <button
              onClick={() => onAssign(trimmed)}
              className="w-full text-left p-3 rounded-xl border border-[#AE343F]/40 bg-[#AE343F]/[0.04] hover:bg-[#AE343F]/[0.08] transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium text-[#AE343F] flex items-center gap-2">
                <UserPlus size={14} /> Dodaj novo ime: „{trimmed}"
              </span>
              <span className="text-[11px] text-[#232323]/55">
                osoba koja nije na listi zvanica
              </span>
            </button>
          )}
          {matches.length === 0 && !trimmed && (
            <p className="text-center text-sm text-[#232323]/60 py-8">
              Lista zvanica je prazna — upiši ime gore.
            </p>
          )}
          {matches.map((inv) => (
            <button
              key={inv.id}
              onClick={() => onAssign(inv.name, inv.id)}
              className="w-full text-left p-3 rounded-xl border border-[#232323]/15 hover:border-[#232323]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#232323] truncate">
                  {inv.name}
                </span>
                {inv.category && (
                  <span className="shrink-0 text-[10px] font-medium text-[#232323]/55 bg-[#F5F4DC] border border-[#232323]/12 rounded px-1.5 py-0.5">
                    {inv.category === "Mladozenjini"
                      ? "Mladoženjini"
                      : inv.category === "Zajednicki"
                        ? "Zajednički"
                        : inv.category}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Invitee editor modal ──────────────────────────────────── */

function InviteeEditor({
  invitee,
  sections,
  linkedRsvp,
  onClose,
  onSave,
  onDelete,
  onOpenLink,
  onUnlink,
}: {
  invitee: Invitee;
  sections: GuestSection[];
  linkedRsvp: RSVPEntry | null;
  onClose: () => void;
  onSave: (patch: Partial<Invitee>) => void;
  onDelete: () => void;
  onOpenLink: () => void;
  onUnlink: () => void;
}) {
  const [name, setName] = useState(invitee.name);
  const [count, setCount] = useState(invitee.count);
  const [sectionId, setSectionId] = useState(invitee.sectionId);
  const [category, setCategory] = useState<InviteeCategory>(invitee.category);
  const [status, setStatus] = useState<InviteeStatus>(invitee.status);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      count: Math.max(1, count),
      sectionId,
      category,
      status,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[88vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg text-[#232323]">Izmeni zvanicu</h3>
          <button
            onClick={onClose}
            className="text-[#232323]/60 hover:text-[#232323] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Ime
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white px-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 outline-none focus:border-[#AE343F] transition-colors mb-4"
        />

        {/* Count */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Broj osoba
        </label>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="w-10 h-10 flex items-center justify-center text-lg bg-[#F5F4DC] rounded-xl border border-[#232323]/20 text-[#232323]/85 hover:text-[#232323] cursor-pointer transition-colors"
          >
            −
          </button>
          <span className="text-2xl font-serif text-[#232323] w-8 text-center tabular-nums">
            {count}
          </span>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="w-10 h-10 flex items-center justify-center text-lg bg-[#F5F4DC] rounded-xl border border-[#232323]/20 text-[#232323]/85 hover:text-[#232323] cursor-pointer transition-colors"
          >
            +
          </button>
        </div>

        {/* Status */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Status
        </label>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {STATUS_ORDER.map((s) => {
            const active = status === s;
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  active
                    ? meta.activeChip
                    : "bg-white text-[#232323]/70 border-[#232323]/15 hover:border-[#232323]/30"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full border ${meta.dot}`}
                />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Category */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Kategorija
        </label>
        <div className="flex gap-1.5 mb-4">
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(active ? "" : cat.value)}
                className={`flex-1 text-xs font-medium px-2 py-2 rounded-lg border transition-all cursor-pointer ${
                  active
                    ? "bg-[#AE343F] text-white border-[#AE343F]"
                    : "bg-[#F5F4DC]/50 text-[#232323]/75 border-[#232323]/15 hover:border-[#232323]/30"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Section */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Celina
        </label>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="w-full bg-white px-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 outline-none focus:border-[#AE343F] transition-colors mb-4 cursor-pointer"
        >
          <option value="">Bez celine</option>
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}
        </select>

        {/* Linked confirmation */}
        <label className="block text-xs font-medium text-[#232323]/70 mb-1.5">
          Potvrda gosta
        </label>
        {linkedRsvp ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-[#AE343F]/30 bg-[#AE343F]/[0.04] mb-5">
            <span className="text-sm text-[#232323] truncate">
              <Check size={13} className="inline text-[#AE343F] mr-1" />
              {linkedRsvp.name} ·{" "}
              {linkedRsvp.attending === "Da"
                ? `Dolazi (${linkedRsvp.guestCount})`
                : "Ne dolazi"}
            </span>
            <button
              onClick={onUnlink}
              className="shrink-0 text-[#232323]/55 hover:text-[#AE343F] transition-colors cursor-pointer"
              title="Otkaži vezu"
            >
              <Unlink size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLink}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg border border-[#232323]/20 text-[#232323]/80 hover:border-[#AE343F] hover:text-[#AE343F] transition-colors cursor-pointer mb-5"
          >
            <Link2 size={15} />
            Poveži sa potvrdom...
          </button>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3000);
                return;
              }
              onDelete();
              onClose();
            }}
            className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              confirmDelete
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
            }`}
          >
            <Trash2 size={15} />
            {confirmDelete ? "Potvrdi" : "Obriši"}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#AE343F] hover:bg-[#8A2A32] text-white transition-colors cursor-pointer"
          >
            <Check size={15} />
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Invitee row ───────────────────────────────────────────── */

function InviteeRow({
  invitee,
  index,
  total,
  isLinked,
  dragId,
  dragOverId,
  onStatusCycle,
  onEdit,
  onMove,
  onCountChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  invitee: Invitee;
  index: number;
  total: number;
  isLinked: boolean;
  dragId: string | null;
  dragOverId: string | null;
  onStatusCycle: (id: string) => void;
  onEdit: (inv: Invitee) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onCountChange: (id: string, delta: 1 | -1) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const meta = STATUS_META[invitee.status];
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      draggable
      onDragStart={() => onDragStart(invitee.id)}
      onDragOver={(e) => onDragOver(e, invitee.id)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-2 group rounded-lg px-1 py-1.5 transition-colors ${
        dragOverId === invitee.id && dragId !== invitee.id
          ? "bg-[#AE343F]/12"
          : ""
      } ${dragId === invitee.id ? "opacity-40" : ""}`}
    >
      <GripVertical
        size={14}
        className="text-[#232323]/30 group-hover:text-[#232323]/60 cursor-grab shrink-0 hidden sm:block"
      />

      {/* Status dot — tap to cycle */}
      <button
        onClick={() => onStatusCycle(invitee.id)}
        title={`${meta.label} (klik za promenu)`}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${meta.dot}`}
      >
        {invitee.status === "declined" && (
          <X size={10} className="text-white" strokeWidth={3} />
        )}
        {invitee.status === "confirmed" && (
          <Check size={10} className="text-white" strokeWidth={3} />
        )}
      </button>

      {/* Name + meta */}
      <button
        onClick={() => onEdit(invitee)}
        className="flex-1 min-w-0 text-left cursor-pointer"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-[#232323] leading-tight">
            {invitee.name}
          </span>
          {invitee.category && (
            <span className="text-[10px] font-medium text-[#232323]/55 bg-[#F5F4DC] border border-[#232323]/12 rounded px-1.5 py-0.5">
              {invitee.category === "Mladozenjini"
                ? "Mladoženjini"
                : invitee.category === "Zajednicki"
                  ? "Zajednički"
                  : invitee.category}
            </span>
          )}
          {isLinked && (
            <Link2 size={11} className="text-[#AE343F]" />
          )}
        </div>
      </button>

      {/* Count stepper — −/+ on large screens, plain count on mobile */}
      <div className="flex items-center shrink-0 gap-0.5">
        <button
          onClick={() => onCountChange(invitee.id, -1)}
          disabled={invitee.count <= 1}
          title="Smanji broj gostiju"
          className="hidden sm:flex w-6 h-6 items-center justify-center rounded text-base text-[#232323]/45 hover:text-[#AE343F] hover:bg-[#232323]/5 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer transition-colors"
        >
          −
        </button>
        <span className="text-xs text-[#232323]/55 tabular-nums text-center min-w-[1.75rem]">
          ×{invitee.count}
        </span>
        <button
          onClick={() => onCountChange(invitee.id, 1)}
          title="Povećaj broj gostiju"
          className="hidden sm:flex w-6 h-6 items-center justify-center rounded text-base text-[#232323]/45 hover:text-[#AE343F] hover:bg-[#232323]/5 cursor-pointer transition-colors"
        >
          +
        </button>
      </div>

      {/* Reorder + edit */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onMove(invitee.id, -1)}
          disabled={index === 0}
          className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => onMove(invitee.id, 1)}
          disabled={index === total - 1}
          className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
        >
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => onEdit(invitee)}
          className="text-[#232323]/55 hover:text-[#AE343F] transition-colors p-0.5 cursor-pointer"
        >
          <Pencil size={13} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Add invitee inline form ───────────────────────────────── */

function AddInviteeForm({
  onAdd,
}: {
  onAdd: (name: string, count: number) => void;
}) {
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);

  const submit = () => {
    const t = name.trim();
    if (!t) return;
    onAdd(t, count);
    setName("");
    setCount(1);
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Ime zvanice..."
        className="flex-1 min-w-0 bg-white px-3 py-2 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
      />
      <button
        type="button"
        onClick={() => setCount((c) => Math.max(1, c - 1))}
        className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg border border-[#232323]/20 text-[#232323]/75 hover:text-[#232323] cursor-pointer transition-colors"
      >
        −
      </button>
      <span className="text-sm w-4 text-center text-[#232323] shrink-0 tabular-nums">
        {count}
      </span>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg border border-[#232323]/20 text-[#232323]/75 hover:text-[#232323] cursor-pointer transition-colors"
      >
        +
      </button>
      <button
        type="button"
        onClick={submit}
        className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#AE343F] rounded-lg text-white cursor-pointer hover:bg-[#932d35] transition-colors"
      >
        <UserPlus size={14} />
      </button>
    </div>
  );
}

/* ── Status tally (pozvani / dolaze / otkazali, headcount) ──── */

function StatusTally({
  invited,
  confirmed,
  declined,
}: {
  invited: number;
  confirmed: number;
  declined: number;
}) {
  return (
    <span
      className="tabular-nums"
      title="pozvani / dolaze / otkazali (broj osoba)"
    >
      <span className="text-[#232323]/30"> / </span>
      <span className="text-[#9c7d23]">{invited}</span>
      <span className="text-[#232323]/30"> / </span>
      <span className="text-[#3a6e49]">{confirmed}</span>
      <span className="text-[#232323]/30"> / </span>
      <span className="text-[#232323]/55">{declined}</span>
    </span>
  );
}

/* ── Main component ────────────────────────────────────────── */

interface Props {
  responses: RSVPEntry[];
  // Guest list state is owned by the parent (GuestsCard) so the Potvrde view can
  // share the same live, persisted copy (linking works from both directions).
  guestList: GuestList;
  loading: boolean;
  mutate: (fn: (gl: GuestList) => GuestList) => void;
  onLink: (inviteeId: string, rsvp: RSVPEntry) => void;
  onUnlink: (inviteeId: string) => void;
}

export default function InviteeListCard({
  responses,
  guestList,
  loading,
  mutate,
  onLink,
  onUnlink,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InviteeStatus | "all">(
    "all",
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newSectionName, setNewSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [rolePickerId, setRolePickerId] = useState<string | null>(null);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // rsvpId -> inviteeId, for "already linked" detection
  const linkedIds = useMemo(() => {
    const m = new Map<string, string>();
    for (const inv of guestList.invitees) {
      if (inv.linkedRsvpId) m.set(inv.linkedRsvpId, inv.id);
    }
    return m;
  }, [guestList.invitees]);

  const rsvpById = useMemo(() => {
    const m = new Map<string, RSVPEntry>();
    for (const r of responses) m.set(r.id, r);
    return m;
  }, [responses]);

  /* ── Mutations ──────────────────────────────────────────── */

  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    mutate((gl) => ({
      ...gl,
      // New section goes to the top of the list, not the bottom.
      sections: [{ id: uid("sec"), name }, ...gl.sections],
    }));
    setNewSectionName("");
    setShowAddSection(false);
  };

  const renameSection = (id: string, name: string) => {
    const t = name.trim();
    if (!t) return;
    mutate((gl) => ({
      ...gl,
      sections: gl.sections.map((s) => (s.id === id ? { ...s, name: t } : s)),
    }));
  };

  const deleteSection = (id: string) => {
    mutate((gl) => ({
      sections: gl.sections.filter((s) => s.id !== id),
      // invitees in the section fall back to ungrouped
      invitees: gl.invitees.map((inv) =>
        inv.sectionId === id ? { ...inv, sectionId: "" } : inv,
      ),
    }));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    mutate((gl) => {
      const idx = gl.sections.findIndex((s) => s.id === id);
      const to = idx + dir;
      if (idx === -1 || to < 0 || to >= gl.sections.length) return gl;
      const sections = [...gl.sections];
      [sections[idx], sections[to]] = [sections[to], sections[idx]];
      return { ...gl, sections };
    });
  };

  const addInvitee = (sectionId: string, name: string, count: number) => {
    mutate((gl) => ({
      ...gl,
      invitees: [
        ...gl.invitees,
        {
          id: uid("inv"),
          name,
          count,
          sectionId,
          category: "",
          status: "not-invited",
        },
      ],
    }));
  };

  const updateInvitee = (id: string, patch: Partial<Invitee>) => {
    mutate((gl) => ({
      ...gl,
      invitees: gl.invitees.map((inv) =>
        inv.id === id ? { ...inv, ...patch } : inv,
      ),
    }));
  };

  const deleteInvitee = (id: string) => {
    mutate((gl) => ({
      ...gl,
      invitees: gl.invitees.filter((inv) => inv.id !== id),
    }));
  };

  const changeCount = (id: string, delta: 1 | -1) => {
    mutate((gl) => ({
      ...gl,
      invitees: gl.invitees.map((inv) =>
        inv.id === id
          ? { ...inv, count: Math.max(1, inv.count + delta) }
          : inv,
      ),
    }));
  };

  const cycleStatus = (id: string) => {
    mutate((gl) => ({
      ...gl,
      invitees: gl.invitees.map((inv) => {
        if (inv.id !== id) return inv;
        const i = STATUS_ORDER.indexOf(inv.status);
        const next = STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
        return { ...inv, status: next };
      }),
    }));
  };

  // Linking is handled by the parent (it also copies the zvanica's category onto
  // the RSVP), so links made here and from the Potvrde view stay consistent.

  /* ── Key roles (reference album — does not affect totals) ── */

  const setKeyRoles = useCallback(
    (fn: (rs: KeyRole[]) => KeyRole[]) => {
      mutate((gl) => ({
        ...gl,
        keyRoles: fn(gl.keyRoles ?? DEFAULT_KEY_ROLES),
      }));
    },
    [mutate],
  );

  const assignRole = (id: string, name: string, inviteeId?: string) =>
    setKeyRoles((rs) =>
      rs.map((r) => (r.id === id ? { ...r, name: name.trim(), inviteeId } : r)),
    );

  const clearRole = (id: string) =>
    setKeyRoles((rs) =>
      rs.map((r) => (r.id === id ? { ...r, name: "", inviteeId: undefined } : r)),
    );

  const addRoleSlot = (group: string) =>
    setKeyRoles((rs) => {
      const label = ROLE_ADD[group] ?? "Nova uloga";
      let lastIdx = -1;
      rs.forEach((r, i) => {
        if (r.group === group) lastIdx = i;
      });
      const slot: KeyRole = { id: uid("kr"), group, label, name: "" };
      if (lastIdx === -1) return [...rs, slot];
      const next = [...rs];
      next.splice(lastIdx + 1, 0, slot);
      return next;
    });

  const removeRoleSlot = (id: string) =>
    setKeyRoles((rs) => rs.filter((r) => r.id !== id));

  const addCustomRole = () => {
    const label = window.prompt("Naziv uloge:");
    if (label && label.trim()) {
      setKeyRoles((rs) => [
        ...rs,
        { id: uid("kr"), group: "custom", label: label.trim(), name: "" },
      ]);
    }
  };

  // Reorder within the same section (array-order preserving, like ChecklistCard)
  const reorderWithinSection = (
    sectionKey: string,
    fromId: string,
    toId: string,
  ) => {
    mutate((gl) => {
      const inSection = (inv: Invitee) =>
        sectionKey === UNGROUPED
          ? !gl.sections.some((s) => s.id === inv.sectionId)
          : inv.sectionId === sectionKey;
      const groupItems = gl.invitees.filter(inSection);
      const fromIdx = groupItems.findIndex((i) => i.id === fromId);
      const toIdx = groupItems.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return gl;
      const reordered = [...groupItems];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const rest = gl.invitees.filter((i) => !inSection(i));
      const firstIdx = gl.invitees.findIndex(inSection);
      const next = [...rest];
      next.splice(firstIdx, 0, ...reordered);
      return { ...gl, invitees: next };
    });
  };

  const moveInviteeArrow = (
    sectionKey: string,
    id: string,
    dir: -1 | 1,
  ) => {
    const inSection = (inv: Invitee) =>
      sectionKey === UNGROUPED
        ? !guestList.sections.some((s) => s.id === inv.sectionId)
        : inv.sectionId === sectionKey;
    const groupItems = guestList.invitees.filter(inSection);
    const idx = groupItems.findIndex((i) => i.id === id);
    const to = idx + dir;
    if (idx === -1 || to < 0 || to >= groupItems.length) return;
    reorderWithinSection(sectionKey, id, groupItems[to].id);
  };

  /* ── Drag handlers ──────────────────────────────────────── */

  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);
  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);
  const handleDrop = (sectionKey: string) => {
    if (dragId && dragOverId && dragId !== dragOverId) {
      reorderWithinSection(sectionKey, dragId, dragOverId);
    }
    setDragId(null);
    setDragOverId(null);
  };

  /* ── Derived data ───────────────────────────────────────── */

  const q = normalizeName(query);

  const matchesFilters = useCallback(
    (inv: Invitee) => {
      const matchText = !q || normalizeName(inv.name).includes(q);
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchText && matchStatus;
    },
    [q, statusFilter],
  );

  const stats = useMemo(() => {
    const s = {
      total: guestList.invitees.length,
      people: 0,
      "not-invited": 0,
      invited: 0,
      confirmed: 0,
      declined: 0,
      invitedPeople: 0,
      confirmedPeople: 0,
      declinedPeople: 0,
    };
    for (const inv of guestList.invitees) {
      s.people += inv.count;
      s[inv.status]++;
      if (inv.status === "invited") s.invitedPeople += inv.count;
      else if (inv.status === "confirmed") s.confirmedPeople += inv.count;
      else if (inv.status === "declined") s.declinedPeople += inv.count;
    }
    return s;
  }, [guestList.invitees]);

  const editingInvitee =
    editingId != null
      ? guestList.invitees.find((i) => i.id === editingId) ?? null
      : null;
  const linkingInvitee =
    linkingId != null
      ? guestList.invitees.find((i) => i.id === linkingId) ?? null
      : null;

  const keyRoles = guestList.keyRoles ?? DEFAULT_KEY_ROLES;
  const rolesCollapsed = collapsed[KEYROLES_KEY] ?? true;
  const filledRoles = keyRoles.filter((r) => r.name.trim()).length;
  const rolePickerRole =
    rolePickerId != null
      ? keyRoles.find((r) => r.id === rolePickerId) ?? null
      : null;

  // Build render groups: each section, then ungrouped
  const renderGroups: { key: string; section: GuestSection | null }[] = [
    ...guestList.sections.map((s) => ({ key: s.id, section: s })),
    { key: UNGROUPED, section: null },
  ];

  const invFor = (key: string) =>
    guestList.invitees.filter((inv) =>
      key === UNGROUPED
        ? !guestList.sections.some((s) => s.id === inv.sectionId)
        : inv.sectionId === key,
    );

  const filtering = q !== "" || statusFilter !== "all";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-[#AE343F]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <h3 className="font-serif text-lg text-[#232323] mb-1">Lista zvanica</h3>
      <p className="text-xs text-[#232323]/55 mb-3 leading-relaxed">
        Vaš privatni spisak — pratite koga ste pozvali, ko je potvrdio, a ko još
        nije odgovorio.
      </p>

      {/* Prominent overview counter: zvanice · gosti / pozvani / dolaze / otkazali */}
      <div
        className="mb-4 font-serif text-2xl text-[#232323] tabular-nums leading-none"
        title="zvanice · gosti / pozvani / dolaze / otkazali"
      >
        {stats.total} · {stats.people}
        <StatusTally
          invited={stats.invitedPeople}
          confirmed={stats.confirmedPeople}
          declined={stats.declinedPeople}
        />
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(
          [
            { key: "all", label: "Sve", count: stats.total },
            { key: "not-invited", label: "Nepozvani", count: stats["not-invited"] },
            { key: "invited", label: "Pozvani", count: stats.invited },
            { key: "confirmed", label: "Potvrdili", count: stats.confirmed },
            { key: "declined", label: "Otkazali", count: stats.declined },
          ] as const
        ).map((f) => {
          const active = statusFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() =>
                setStatusFilter(
                  active && f.key !== "all"
                    ? "all"
                    : (f.key as InviteeStatus | "all"),
                )
              }
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border ${
                active
                  ? "bg-[#AE343F]/12 border-[#AE343F]/35 text-[#AE343F]"
                  : "bg-[#F5F4DC]/50 border-[#232323]/15 text-[#232323]/75 hover:text-[#232323]"
              }`}
            >
              {f.key !== "all" && (
                <span
                  className={`w-2 h-2 rounded-full border ${STATUS_META[f.key as InviteeStatus].dot}`}
                />
              )}
              {f.label}
              <span
                className={`text-[10px] ${active ? "text-[#AE343F]/85" : "text-[#232323]/55"}`}
              >
                {f.key === "all" ? `${stats.total} / ${stats.people}` : f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#232323]/55"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži zvanice..."
          className="w-full bg-white pl-10 pr-10 py-2.5 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#232323]/55 hover:text-[#232323] cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {stats.total === 0 && (
        <div className="text-center py-10 mb-4 bg-[#F5F4DC]/30 rounded-xl border border-[#232323]/15">
          <Users size={30} className="mx-auto mb-3 text-[#AE343F]/40" />
          <p className="text-sm text-[#232323]/65 mb-1">
            Lista zvanica je prazna
          </p>
          <p className="text-xs text-[#232323]/50">
            Dodajte prvu zvanicu ispod ili napravite celinu (npr. „Mladina
            familija”).
          </p>
        </div>
      )}

      {/* Posebne uloge (key wedding roles) — reference album, not counted in totals */}
      <div className="mb-4 border border-[#d4af37]/40 rounded-xl bg-[#F5F4DC]/40 overflow-hidden">
        <button
          onClick={() =>
            setCollapsed((c) => ({ ...c, [KEYROLES_KEY]: !rolesCollapsed }))
          }
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer"
        >
          <ChevronDown
            size={15}
            className={`text-[#232323]/55 transition-transform shrink-0 ${
              rolesCollapsed ? "-rotate-90" : ""
            }`}
          />
          <Star size={14} className="text-[#d4af37] shrink-0" fill="currentColor" />
          <span className="text-sm font-semibold text-[#232323]">
            Posebne uloge na svadbi
          </span>
          <span className="text-xs text-[#232323]/55 ml-auto shrink-0 tabular-nums">
            popunjeno {filledRoles}/{keyRoles.length}
          </span>
        </button>

        {!rolesCollapsed && (
          <div className="px-3 pb-3">
            <p className="text-[11px] text-[#232323]/50 leading-relaxed pb-2">
              Predefinisana mesta za bitne uloge. Klikni da dodeliš osobu (iz
              liste zvanica ili upiši novo ime). Ne ulazi u broj gostiju.
            </p>
            {/* Album-style placeholder grid — multiple columns on wider screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {keyRoles.map((role) => {
                const addable = !!ROLE_ADD[role.group];
                return (
                  <div
                    key={role.id}
                    className={`rounded-lg border px-3 py-2 ${
                      role.name
                        ? "border-[#232323]/12 bg-white"
                        : "border-dashed border-[#232323]/25 bg-[#F5F4DC]/40"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#232323]/50 truncate">
                      {role.label}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <button
                        onClick={() => setRolePickerId(role.id)}
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {role.name ? (
                          <span className="text-sm font-medium text-[#232323] truncate block">
                            {role.name}
                          </span>
                        ) : (
                          <span className="text-sm italic text-[#232323]/40">
                            dodeli osobu…
                          </span>
                        )}
                      </button>
                      <div className="flex items-center gap-0 shrink-0">
                        {role.name && (
                          <button
                            onClick={() => clearRole(role.id)}
                            title="Ukloni ime"
                            className="text-[#232323]/45 hover:text-[#AE343F] p-1 cursor-pointer transition-colors"
                          >
                            <X size={13} />
                          </button>
                        )}
                        {addable && (
                          <button
                            onClick={() => addRoleSlot(role.group)}
                            title="Dodaj još jedno mesto"
                            className="text-[#232323]/45 hover:text-[#AE343F] p-1 cursor-pointer transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removeRoleSlot(role.id)}
                          title="Ukloni ulogu"
                          className="text-[#232323]/40 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addCustomRole}
              className="flex items-center gap-1.5 text-xs font-medium text-[#232323]/70 hover:text-[#AE343F] transition-colors cursor-pointer pt-3"
            >
              <Plus size={14} /> Dodaj ulogu
            </button>
          </div>
        )}
      </div>

      {/* Add section */}
      <div className="mb-4">
        {showAddSection ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSectionName}
              autoFocus
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSection();
                }
                if (e.key === "Escape") setShowAddSection(false);
              }}
              placeholder="Naziv celine (npr. Kolege sa posla)"
              className="flex-1 min-w-0 bg-white px-3 py-2 text-sm rounded-lg border border-[#232323]/20 placeholder:text-[#232323]/50 outline-none focus:border-[#AE343F] transition-colors"
            />
            <button
              onClick={addSection}
              className="px-3 h-9 shrink-0 flex items-center justify-center bg-[#AE343F] rounded-lg text-white text-sm cursor-pointer hover:bg-[#932d35] transition-colors"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setShowAddSection(false)}
              className="px-2 h-9 shrink-0 flex items-center justify-center text-[#232323]/55 hover:text-[#232323] cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddSection(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#232323]/20 bg-[#F5F4DC]/60 text-xs font-semibold text-[#232323]/80 hover:border-[#AE343F]/50 hover:bg-[#AE343F]/[0.04] hover:text-[#AE343F] transition-colors cursor-pointer"
          >
            <FolderPlus size={14} />
            Dodaj celinu
          </button>
        )}
      </div>

      {/* Groups */}
      <LayoutGroup>
        <div className="space-y-3">
          {renderGroups.map(({ key, section }, gi) => {
            const all = invFor(key);
            const items = all.filter(matchesFilters);
            // Hide empty ungrouped unless it's the only place to add to
            if (
              key === UNGROUPED &&
              all.length === 0 &&
              guestList.sections.length > 0
            ) {
              return null;
            }
            // When filtering, hide groups with no matches
            if (filtering && items.length === 0) return null;

            // Collapsed by default; force-open while filtering so search hits show.
            const isCollapsed = filtering ? false : collapsed[key] ?? true;
            const groupPeople = all.reduce((s, i) => s + i.count, 0);
            const gInvited = all.reduce(
              (s, i) => (i.status === "invited" ? s + i.count : s),
              0,
            );
            const gConfirmed = all.reduce(
              (s, i) => (i.status === "confirmed" ? s + i.count : s),
              0,
            );
            const gDeclined = all.reduce(
              (s, i) => (i.status === "declined" ? s + i.count : s),
              0,
            );

            return (
              <div
                key={key}
                className="border border-[#232323]/12 rounded-xl"
              >
                {/* Section header */}
                <div className="flex items-center justify-between px-3 py-2.5 group/sec">
                  <button
                    onClick={() =>
                      setCollapsed((c) => ({ ...c, [key]: !isCollapsed }))
                    }
                    className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <ChevronDown
                      size={15}
                      className={`text-[#232323]/55 transition-transform shrink-0 ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    />
                    <span className="text-sm font-semibold text-[#232323] truncate">
                      {section ? section.name : "Bez celine"}
                    </span>
                    {all.length > 0 && (
                      <span
                        className="text-xs font-normal text-[#232323]/55 shrink-0 tabular-nums"
                        title="zvanice · osobe / pozvani / dolaze / otkazali"
                      >
                        {all.length} · {groupPeople}
                        <StatusTally
                          invited={gInvited}
                          confirmed={gConfirmed}
                          declined={gDeclined}
                        />
                      </span>
                    )}
                  </button>

                  {section && (
                    <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover/sec:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveSection(section.id, -1)}
                        disabled={gi === 0}
                        className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 p-0.5 cursor-pointer transition-colors"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 1)}
                        disabled={gi >= guestList.sections.length - 1}
                        className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 p-0.5 cursor-pointer transition-colors"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        onClick={() => {
                          const name = window.prompt(
                            "Naziv celine:",
                            section.name,
                          );
                          if (name != null) renameSection(section.id, name);
                        }}
                        className="text-[#232323]/55 hover:text-[#AE343F] p-0.5 cursor-pointer transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            all.length === 0 ||
                            window.confirm(
                              `Obrisati celinu „${section.name}"? Zvanice ostaju u listi (bez celine).`,
                            )
                          ) {
                            deleteSection(section.id);
                          }
                        }}
                        className="text-[#232323]/55 hover:text-red-500 p-0.5 cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="px-3 pb-3">
                    <div className="space-y-0.5">
                      {items.map((inv) => (
                        <InviteeRow
                          key={inv.id}
                          invitee={inv}
                          index={all.findIndex((i) => i.id === inv.id)}
                          total={all.length}
                          isLinked={!!inv.linkedRsvpId}
                          dragId={dragId}
                          dragOverId={dragOverId}
                          onStatusCycle={cycleStatus}
                          onEdit={(i) => setEditingId(i.id)}
                          onMove={(id, dir) => moveInviteeArrow(key, id, dir)}
                          onCountChange={changeCount}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(key)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                    {!filtering && (
                      <AddInviteeForm
                        onAdd={(name, count) =>
                          addInvitee(section ? section.id : "", name, count)
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      {filtering && stats.total > 0 && (
        <p className="text-center text-xs text-[#232323]/45 mt-4">
          Filtriran prikaz — poništite filter da biste dodavali zvanice.
        </p>
      )}

      {/* Editor modal */}
      {editingInvitee && (
        <InviteeEditor
          invitee={editingInvitee}
          sections={guestList.sections}
          linkedRsvp={
            editingInvitee.linkedRsvpId
              ? rsvpById.get(editingInvitee.linkedRsvpId) ?? null
              : null
          }
          onClose={() => setEditingId(null)}
          onSave={(patch) => updateInvitee(editingInvitee.id, patch)}
          onDelete={() => deleteInvitee(editingInvitee.id)}
          onOpenLink={() => {
            setLinkingId(editingInvitee.id);
            setEditingId(null);
          }}
          onUnlink={() => onUnlink(editingInvitee.id)}
        />
      )}

      {/* Link modal */}
      {linkingInvitee && (
        <LinkModal
          invitee={linkingInvitee}
          responses={responses}
          linkedIds={linkedIds}
          onClose={() => setLinkingId(null)}
          onLink={(rsvp) => {
            onLink(linkingInvitee.id, rsvp);
            setLinkingId(null);
          }}
        />
      )}

      {/* Role assignment picker */}
      {rolePickerRole && (
        <RolePickerModal
          roleLabel={rolePickerRole.label}
          invitees={guestList.invitees}
          onClose={() => setRolePickerId(null)}
          onAssign={(name, inviteeId) => {
            assignRole(rolePickerRole.id, name, inviteeId);
            setRolePickerId(null);
          }}
        />
      )}
    </div>
  );
}
