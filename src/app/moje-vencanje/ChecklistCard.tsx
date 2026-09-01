"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical, ArrowDownToLine, Sparkles } from "lucide-react";
import { saveChecklistAction } from "./actions";
import type { ChecklistItem, ChecklistGroup } from "./types";
import { GROUP_LABELS, GROUP_ORDER, AUTO_KEY_BY_TEXT } from "./defaults";
import { currentPhase, isPastPhase } from "./phase";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Props {
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  /** Persist handler — defaults to the couple action; the standalone owner
   *  portal passes a seating-scoped equivalent. */
  onSave?: (checklist: ChecklistItem[]) => void | Promise<unknown>;
  /** Wedding date. Without it the card behaves exactly as it did before phases
   *  existed — no current phase, nothing marked missed. */
  eventDate?: string;
  /** Signals that tick items on the couple's behalf, keyed by `autoKey`.
   *  Display only: an auto-ticked item is never written as completed. */
  autoDone?: Record<string, boolean>;
}

/** Items saved before `autoKey` existed still carry the original text, which is
 *  the only identity stable across the 26–65 item generations in the wild. */
function autoKeyOf(item: ChecklistItem): string | undefined {
  return item.autoKey ?? AUTO_KEY_BY_TEXT[item.text];
}

export default function ChecklistCard({
  checklist,
  setChecklist,
  onSave = saveChecklistAction,
  eventDate,
  autoDone,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  /** Past phases hide their finished items until the couple asks for them. */
  const [showAllPast, setShowAllPast] = useState<Record<string, boolean>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { confirm, dialog } = useConfirmDialog({ variant: "light" });

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const phase = useMemo(() => currentPhase(eventDate), [eventDate]);

  /** True when the platform is vouching for this item right now. An item the
   *  couple already ticked by hand needs no badge, and one they dismissed is
   *  theirs forever. */
  const isAuto = useCallback(
    (item: ChecklistItem): boolean => {
      if (!autoDone || item.completed || item.autoDismissed) return false;
      const key = autoKeyOf(item);
      return !!key && autoDone[key] === true;
    },
    [autoDone],
  );

  const isDone = useCallback(
    (item: ChecklistItem) => item.completed || isAuto(item),
    [isAuto],
  );

  const debouncedSave = useCallback(
    (updated: ChecklistItem[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        // The action returns `{ error }` on a dead session. This used to be
        // dropped on the floor, so an expired login silently discarded edits.
        Promise.resolve(onSave(updated))
          .then((res) => {
            const err = (res as { error?: string } | undefined)?.error;
            if (err) toast.error(err);
          })
          .catch(() =>
            toast.error("Izmena nije sačuvana. Proverite internet vezu."),
          );
      }, 300);
    },
    [onSave],
  );

  const toggleItem = useCallback(
    (id: string) => {
      setChecklist((prev) => {
        const target = prev.find((i) => i.id === id);
        // Unticking an automatic item hands it over permanently: without the
        // marker the signal would re-tick it on the next load and the couple
        // could never overrule us on their own list.
        const handOver = !!target && isAuto(target);
        const next = prev.map((item) =>
          item.id === id
            ? handOver
              ? { ...item, completed: false, autoDismissed: true }
              : { ...item, completed: !item.completed }
            : item,
        );
        debouncedSave(next);
        // Auto-collapse group if all items completed
        const toggled = next.find((i) => i.id === id);
        if (toggled?.completed) {
          const group = toggled.group;
          const groupItems = next.filter((i) => i.group === group);
          if (groupItems.every((i) => i.completed)) {
            setTimeout(() => setCollapsed((c) => ({ ...c, [group]: true })), 400);
          }
        }
        return next;
      });
    },
    [setChecklist, debouncedSave, isAuto],
  );

  /** The only write phases ever trigger, and always from a click. `movedFrom`
   *  keeps the move legible and undoable. */
  const moveToCurrentPhase = useCallback(
    (ids: string[]) => {
      if (!phase || ids.length === 0) return;
      const idSet = new Set(ids);
      setChecklist((prev) => {
        const next = prev.map((item) =>
          idSet.has(item.id)
            ? { ...item, group: phase, movedFrom: item.movedFrom ?? item.group }
            : item,
        );
        debouncedSave(next);
        return next;
      });
      setShowAllPast({});
    },
    [phase, setChecklist, debouncedSave],
  );

  const addCustomItem = useCallback(
    (group: ChecklistGroup) => {
      const text = (newItemText[group] ?? "").trim();
      if (!text) return;

      setChecklist((prev) => {
        const next = [
          ...prev,
          {
            id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text,
            completed: false,
            isCustom: true,
            group,
          },
        ];
        debouncedSave(next);
        return next;
      });
      setNewItemText((prev) => ({ ...prev, [group]: "" }));
    },
    [newItemText, setChecklist, debouncedSave],
  );

  const deleteItem = useCallback(
    (id: string) => {
      setChecklist((prev) => {
        const next = prev.filter((item) => item.id !== id);
        debouncedSave(next);
        return next;
      });
    },
    [setChecklist, debouncedSave],
  );

  const moveItem = useCallback(
    (group: ChecklistGroup, fromIndex: number, direction: -1 | 1) => {
      setChecklist((prev) => {
        const groupItems = prev.filter((i) => i.group === group);
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= groupItems.length) return prev;

        // Swap within group
        const reordered = [...groupItems];
        [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];

        // Rebuild full list preserving order of other groups
        const next = prev.filter((i) => i.group !== group);
        // Insert reordered group items at the position of the first item of this group
        const firstGroupIdx = prev.findIndex((i) => i.group === group);
        next.splice(firstGroupIdx, 0, ...reordered);

        debouncedSave(next);
        return next;
      });
    },
    [setChecklist, debouncedSave],
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (group: ChecklistGroup) => {
      if (!dragId || !dragOverId || dragId === dragOverId) {
        setDragId(null);
        setDragOverId(null);
        return;
      }

      setChecklist((prev) => {
        const groupItems = prev.filter((i) => i.group === group);
        const fromIdx = groupItems.findIndex((i) => i.id === dragId);
        const toIdx = groupItems.findIndex((i) => i.id === dragOverId);
        if (fromIdx === -1 || toIdx === -1) return prev;

        const reordered = [...groupItems];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        const next = prev.filter((i) => i.group !== group);
        const firstGroupIdx = prev.findIndex((i) => i.group === group);
        next.splice(firstGroupIdx, 0, ...reordered);

        debouncedSave(next);
        return next;
      });

      setDragId(null);
      setDragOverId(null);
    },
    [dragId, dragOverId, setChecklist, debouncedSave],
  );

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  const completedCount = checklist.filter((i) => isDone(i)).length;
  const progressPct =
    checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  /**
   * A couple who has never ticked a single item is not behind — they simply do
   * not keep their list here. Without this gate, someone two weeks from their
   * wedding who never opened the checklist would be met by "42 propuštenih
   * stavki", accusing them of skipping work they obviously did in real life and
   * merely never recorded. Measured before shipping: that is exactly what four
   * real couples would have seen.
   *
   * So missed-marking switches on only once the couple has shown they use the
   * list. Opening on the current phase is unconditional — that helps everyone.
   */
  const usesChecklist = useMemo(
    () => checklist.some((i) => i.completed),
    [checklist],
  );

  /** Unfinished items sitting in a phase the couple has already passed. */
  const missed = useMemo(
    () =>
      usesChecklist
        ? checklist.filter((i) => isPastPhase(i.group, phase) && !isDone(i))
        : [],
    [checklist, phase, isDone, usesChecklist],
  );

  const askMoveAll = useCallback(async () => {
    const ok = await confirm({
      title: "Prebaciti propušteno u trenutnu fazu?",
      message: `${missed.length} ${missed.length === 1 ? "stavka će biti prebačena" : "stavki će biti prebačeno"} u „${phase ? GROUP_LABELS[phase] : ""}". Uvek možete da ih vratite ručno.`,
      confirmLabel: "Prebaci",
    });
    if (ok) moveToCurrentPhase(missed.map((i) => i.id));
  }, [confirm, missed, phase, moveToCurrentPhase]);

  // Group items
  const grouped = GROUP_ORDER.reduce(
    (acc, group) => {
      const items = checklist.filter((i) => i.group === group);
      if (items.length > 0 || group === "custom") acc[group] = items;
      return acc;
    },
    {} as Record<ChecklistGroup, ChecklistItem[]>,
  );

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/25 p-6 shadow-md">
      {dialog}
      <h3 className="font-serif text-lg text-[#232323] mb-3">Checklista</h3>

      {/* Missed-work summary — above the progress bar so it is seen before
          anything is scrolled. Muted rose, never the full brand red, which in
          this portal means "press me". */}
      {missed.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#AE343F]/18 bg-[#AE343F]/[0.06] px-4 py-3">
          <span className="text-sm text-[#232323]">
            {missed.length}{" "}
            {missed.length === 1
              ? "propuštena stavka iz ranijih faza"
              : missed.length < 5
                ? "propuštene stavke iz ranijih faza"
                : "propuštenih stavki iz ranijih faza"}
          </span>
          <button
            onClick={askMoveAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#AE343F] hover:underline cursor-pointer"
          >
            <ArrowDownToLine size={13} />
            Prebaci sve u trenutnu fazu
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-[#232323]/70 mb-1">
          <span>
            {completedCount} od {checklist.length} završeno
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2.5 bg-[#232323]/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AE343F] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-3">
        {GROUP_ORDER.map((group) => {
          const items = grouped[group];
          if (!items && group !== "custom") return null;
          const groupItems = items ?? [];
          const groupCompleted = groupItems.filter((i) => isDone(i)).length;

          const isCurrent = phase !== null && group === phase;
          const isPast = isPastPhase(group, phase);
          const groupMissed =
            isPast && usesChecklist
              ? groupItems.filter((i) => !isDone(i))
              : [];

          // Default openness follows the couple's position in time: the current
          // phase and any past phase still holding work open themselves; a past
          // phase that is settled, and everything still ahead, stay shut.
          const defaultCollapsed = phase
            ? !(isCurrent || groupMissed.length > 0)
            : false;
          const isCollapsed = collapsed[group] ?? defaultCollapsed;

          // A past phase shows only what is still outstanding until asked,
          // so it reads as "here is what is left", not as a list of failures.
          const showAll = showAllPast[group] ?? false;
          const visibleItems =
            isPast && groupMissed.length > 0 && !showAll
              ? groupMissed
              : groupItems;
          const hiddenCount = groupItems.length - visibleItems.length;

          return (
            <div
              key={group}
              className={`border rounded-xl transition-colors ${
                isCurrent
                  ? "border-[#AE343F]/40 bg-[#AE343F]/[0.02]"
                  : groupMissed.length > 0
                    ? "border-[#AE343F]/18 bg-[#AE343F]/[0.04]"
                    : "border-[#232323]/12"
              }`}
            >
              <button
                onClick={() =>
                  setCollapsed((p) => ({ ...p, [group]: !isCollapsed }))
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#232323]/[0.02] transition-colors rounded-xl cursor-pointer"
              >
                <span
                  className={`text-sm font-semibold ${
                    isPast && groupMissed.length === 0
                      ? "text-[#232323]/50"
                      : "text-[#232323]"
                  }`}
                >
                  {GROUP_LABELS[group]}
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-[#AE343F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#F5F4DC]">
                      Vaša faza
                    </span>
                  )}
                  {groupItems.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#232323]/65">
                      {groupCompleted}/{groupItems.length}
                    </span>
                  )}
                  {groupMissed.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#AE343F]">
                      · {groupMissed.length} propušteno
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#232323]/65 transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {!isCollapsed && (
                <>
                {groupMissed.length > 1 && (
                  <div className="px-4 pb-1">
                    <button
                      onClick={() =>
                        moveToCurrentPhase(groupMissed.map((i) => i.id))
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#AE343F] hover:underline cursor-pointer"
                    >
                      <ArrowDownToLine size={12} />
                      Prebaci sve propušteno ({groupMissed.length})
                    </button>
                  </div>
                )}
                <LayoutGroup>
                <div className="px-4 pb-3 space-y-1">
                  {visibleItems.map((item) => {
                    // Reorder acts on the group's real order, which differs from
                    // the rendered one whenever a past phase hides finished work.
                    const realIdx = groupItems.findIndex(
                      (i) => i.id === item.id,
                    );
                    return (
                    <motion.div
                      key={item.id}
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDrop={() => handleDrop(group)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 group rounded-lg px-1 py-1.5 transition-colors ${
                        dragOverId === item.id && dragId !== item.id
                          ? "bg-[#AE343F]/12"
                          : ""
                      } ${dragId === item.id ? "opacity-40" : ""}`}
                    >
                      <GripVertical
                        size={14}
                        className="text-[#232323]/35 group-hover:text-[#232323]/65 cursor-grab shrink-0"
                      />
                      <input
                        type="checkbox"
                        checked={isDone(item)}
                        onChange={() => toggleItem(item.id)}
                        className="checkbox checkbox-sm border-[#232323]/35 [--chkbg:#AE343F] [--chkfg:#F5F4DC] cursor-pointer"
                      />
                      <span
                        className={`text-sm flex-1 ${
                          isDone(item)
                            ? "line-through text-[#232323]/45"
                            : "text-[#232323]"
                        }`}
                      >
                        {item.text}
                        {isAuto(item) && (
                          <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-[10px] font-medium uppercase tracking-wide text-[#AE343F]/80">
                            <Sparkles size={10} />
                            automatski
                          </span>
                        )}
                        {item.movedFrom && (
                          <span className="ml-1.5 align-middle text-[10px] text-[#232323]/45">
                            iz: {GROUP_LABELS[item.movedFrom]}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {isPast && !isDone(item) && phase && (
                          <button
                            onClick={() => moveToCurrentPhase([item.id])}
                            title="Prebaci u trenutnu fazu"
                            className="text-[#AE343F]/70 hover:text-[#AE343F] transition-colors p-0.5 cursor-pointer"
                          >
                            <ArrowDownToLine size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => moveItem(group, realIdx, -1)}
                          disabled={realIdx === 0}
                          className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(group, realIdx, 1)}
                          disabled={realIdx === groupItems.length - 1}
                          className="text-[#232323]/55 hover:text-[#232323] disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirmDeleteId === item.id) {
                              deleteItem(item.id);
                              setConfirmDeleteId(null);
                            } else {
                              setConfirmDeleteId(item.id);
                              setTimeout(() => setConfirmDeleteId((c) => c === item.id ? null : c), 3000);
                            }
                          }}
                          className={`transition-colors p-0.5 cursor-pointer ${confirmDeleteId === item.id ? "text-red-500 scale-110" : "text-[#232323]/55 hover:text-red-500"}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() =>
                        setShowAllPast((p) => ({ ...p, [group]: true }))
                      }
                      className="pt-1 text-xs text-[#232323]/55 hover:text-[#232323] cursor-pointer"
                    >
                      Prikaži sve ({groupItems.length})
                    </button>
                  )}
                </div>
                </LayoutGroup>

                  {/* Add custom item */}
                  <div className="px-4 pb-3">
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newItemText[group] ?? ""}
                      onChange={(e) =>
                        setNewItemText((p) => ({
                          ...p,
                          [group]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomItem(group);
                        }
                      }}
                      placeholder="Dodaj stavku..."
                      className="input input-sm input-bordered flex-1 bg-white border-[#232323]/20 text-sm focus:border-[#AE343F] focus:outline-none"
                    />
                    <button
                      onClick={() => addCustomItem(group)}
                      className="btn btn-sm btn-ghost text-[#AE343F] cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
