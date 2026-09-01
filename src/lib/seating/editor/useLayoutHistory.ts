"use client";

import { useCallback, useRef, useState } from "react";
import type { TableData } from "../types";

/** One undo step. `members` travels with `tables` because `handleSaveMembers`
 *  changes both in a single edit — undoing only the tables would revert the
 *  seat labels while the entered names stayed, and the next placement would
 *  then seat people under names the user thought they had undone. It is also
 *  exactly the unit that gets persisted. */
export interface LayoutSnapshot {
  tables: TableData[];
  members: Record<string, string[]>;
}

/**
 * How many steps back the editor remembers.
 *
 * Deliberately generous: every mutator builds the next state with structural
 * sharing (untouched tables keep their identity), so a step costs roughly one
 * cloned table — a couple of kilobytes, not a copy of the hall. Thirty steps
 * cost about as much as five and cover a whole working session, including the
 * expensive mistakes: Počni ispočetka and loading a hall scheme over your work.
 */
const HISTORY_LIMIT = 30;

/**
 * Undo/redo stacks for the seating layout.
 *
 * The stacks live in refs, not state: pushing a step must not re-render a
 * canvas full of tables. Only the two booleans the buttons need are state, and
 * their updater preserves identity, so a push re-renders solely when a button
 * actually flips between enabled and disabled.
 */
export function useLayoutHistory() {
  const pastRef = useRef<LayoutSnapshot[]>([]);
  const futureRef = useRef<LayoutSnapshot[]>([]);
  const [caps, setCaps] = useState({ canUndo: false, canRedo: false });

  const syncCaps = useCallback(() => {
    setCaps((prev) => {
      const canUndo = pastRef.current.length > 0;
      const canRedo = futureRef.current.length > 0;
      return prev.canUndo === canUndo && prev.canRedo === canRedo
        ? prev
        : { canUndo, canRedo };
    });
  }, []);

  /** Record the state as it was BEFORE an edit. Any redo future is discarded. */
  const record = useCallback(
    (previous: LayoutSnapshot) => {
      pastRef.current.push(previous);
      if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
      futureRef.current = [];
      syncCaps();
    },
    [syncCaps],
  );

  /** Returns the snapshot to restore, or null when there is nothing to undo. */
  const undo = useCallback(
    (current: LayoutSnapshot): LayoutSnapshot | null => {
      const snap = pastRef.current.pop() ?? null;
      if (snap) {
        futureRef.current.push(current);
        syncCaps();
      }
      return snap;
    },
    [syncCaps],
  );

  const redo = useCallback(
    (current: LayoutSnapshot): LayoutSnapshot | null => {
      const snap = futureRef.current.pop() ?? null;
      if (snap) {
        pastRef.current.push(current);
        syncCaps();
      }
      return snap;
    },
    [syncCaps],
  );

  const reset = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    syncCaps();
  }, [syncCaps]);

  return {
    canUndo: caps.canUndo,
    canRedo: caps.canRedo,
    record,
    undo,
    redo,
    reset,
  };
}
