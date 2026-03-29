"use client";

import { useState } from "react";
import { Check, X, Users, MessageSquare, RefreshCw, Loader2 } from "lucide-react";
import type { BirthdayRSVPEntry } from "@/lib/birthday-rsvp";

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  responses: BirthdayRSVPEntry[];
  slug: string;
  childName: string;
}

export default function BirthdayPortalClient({ responses: initial, slug, childName }: Props) {
  const [responses, setResponses] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload page to get fresh server data
      window.location.reload();
    } catch {
      setRefreshing(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--theme-text)" }}
        >
          Prijave ({responses.length})
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: "var(--theme-surface)",
            color: "var(--theme-primary)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          {refreshing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Osveži
        </button>
      </div>

      {/* Response list */}
      {responses.length === 0 ? (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            backgroundColor: "var(--theme-surface)",
            border: "1px solid var(--theme-border-light)",
          }}
        >
          <p style={{ color: "var(--theme-text-muted)" }}>
            Još nema prijava. Podelite link pozivnice sa gostima!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((entry) => {
            const isAttending = entry.attending === "Da";
            const guestCount = parseInt(entry.guestCount) || 1;

            return (
              <div
                key={entry.id}
                className="p-4 sm:p-5 rounded-2xl transition-all"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  border: "1px solid var(--theme-border-light)",
                  boxShadow: "var(--theme-shadow)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status icon */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isAttending
                          ? "var(--theme-primary-muted)"
                          : "rgba(0,0,0,0.05)",
                      }}
                    >
                      {isAttending ? (
                        <Check size={14} style={{ color: "var(--theme-primary)" }} />
                      ) : (
                        <X size={14} style={{ color: "var(--theme-text-light)" }} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {entry.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--theme-text-light)" }}
                      >
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Guest count badge */}
                  {isAttending && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: "var(--theme-primary-muted)",
                        color: "var(--theme-primary)",
                      }}
                    >
                      <Users size={12} />
                      <span className="text-xs font-bold">{guestCount}</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                {entry.message && (
                  <div className="mt-3 flex items-start gap-2">
                    <MessageSquare
                      size={12}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--theme-text-light)" }}
                    />
                    <p
                      className="text-sm italic"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {entry.message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
