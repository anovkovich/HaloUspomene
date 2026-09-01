"use client";

import { useEffect } from "react";

/**
 * Polls the /hvala status by reloading with an incrementing `?r=` counter until
 * the order flips to a terminal state or we hit `max` attempts. Covers the
 * card redirect-before-webhook window (buyer lands here in seconds; the webhook
 * lands within ~30s). The counter lives in the URL so a reload can't loop
 * forever.
 */
export default function Refresher({
  order,
  attempt,
  max = 6,
  intervalMs = 5000,
}: {
  order: string;
  attempt: number;
  max?: number;
  intervalMs?: number;
}) {
  useEffect(() => {
    if (attempt >= max) return;
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("order", order);
      url.searchParams.set("r", String(attempt + 1));
      window.location.href = url.toString();
    }, intervalMs);
    return () => clearTimeout(t);
  }, [order, attempt, max, intervalMs]);

  return null;
}
