"use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from "lucide-react";
import { saveChecklistAction } from "./actions";
import type { ChecklistItem, ChecklistGroup } from "./types";
import { GROUP_LABELS, GROUP_ORDER } from "./defaults";

interface Props {
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export default function ChecklistCard({ checklist, setChecklist }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const debouncedSave = useCallback((updated: ChecklistItem[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveChecklistAction(updated);
    }, 300);
  }, []);

  const toggleItem = useCallback(
    (id: string) => {
      setChecklist((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        );
        debouncedSave(next);
        return next;
      });
    },
    [setChecklist, debouncedSave],
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

  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPct =
    checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

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
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <h3 className="font-serif text-lg text-[#232323] mb-3">Checklista</h3>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-[#232323]/50 mb-1">
          <span>
            {completedCount} od {checklist.length} završeno
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2.5 bg-[#232323]/10 rounded-full overflow-hidden">
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
          const isCollapsed = collapsed[group] ?? false;
          const groupCompleted = groupItems.filter((i) => i.completed).length;

          return (
            <div key={group} className="border border-[#232323]/5 rounded-xl">
              <button
                onClick={() =>
                  setCollapsed((p) => ({ ...p, [group]: !isCollapsed }))
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#232323]/[0.02] transition-colors rounded-xl cursor-pointer"
              >
                <span className="text-sm font-semibold text-[#232323]">
                  {GROUP_LABELS[group]}
                  {groupItems.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-[#232323]/40">
                      {groupCompleted}/{groupItems.length}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#232323]/40 transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-3 space-y-1">
                  {groupItems.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDrop={() => handleDrop(group)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 group rounded-lg px-1 py-1.5 transition-colors ${
                        dragOverId === item.id && dragId !== item.id
                          ? "bg-[#AE343F]/5"
                          : ""
                      } ${dragId === item.id ? "opacity-40" : ""}`}
                    >
                      <GripVertical
                        size={14}
                        className="text-[#232323]/15 group-hover:text-[#232323]/30 cursor-grab shrink-0"
                      />
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        className="checkbox checkbox-sm border-[#232323]/20 [--chkbg:#AE343F] [--chkfg:#F5F4DC] cursor-pointer"
                      />
                      <span
                        className={`text-sm flex-1 ${
                          item.completed
                            ? "line-through text-[#232323]/30"
                            : "text-[#232323]"
                        }`}
                      >
                        {item.text}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => moveItem(group, idx, -1)}
                          disabled={idx === 0}
                          className="text-[#232323]/30 hover:text-[#232323]/60 disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(group, idx, 1)}
                          disabled={idx === groupItems.length - 1}
                          className="text-[#232323]/30 hover:text-[#232323]/60 disabled:opacity-0 transition-colors p-0.5 cursor-pointer"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-[#232323]/30 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add custom item */}
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
                      className="input input-sm input-bordered flex-1 bg-white border-[#232323]/10 text-sm focus:border-[#AE343F] focus:outline-none"
                    />
                    <button
                      onClick={() => addCustomItem(group)}
                      className="btn btn-sm btn-ghost text-[#AE343F] cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
