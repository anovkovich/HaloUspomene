import type { TableData } from "./types";

/**
 * Wire format exchanged between the seating editor and the save/load actions.
 * Historically the payload was a bare `TableData[]`; it is now an object that
 * also carries per-party member names. `parseEditorPayload` accepts both so old
 * saved layouts keep loading.
 */
export interface EditorPayload {
  tables: TableData[];
  members: Record<string, string[]>;
}

export function parseEditorPayload(json: string): EditorPayload {
  const parsed = JSON.parse(json);
  if (Array.isArray(parsed)) {
    return { tables: parsed as TableData[], members: {} };
  }
  return {
    tables: Array.isArray(parsed?.tables) ? (parsed.tables as TableData[]) : [],
    members:
      parsed && typeof parsed.members === "object" && parsed.members
        ? (parsed.members as Record<string, string[]>)
        : {},
  };
}

export function serializeEditorPayload(
  tables: TableData[],
  members: Record<string, string[]>,
): string {
  return JSON.stringify({ tables, members });
}
