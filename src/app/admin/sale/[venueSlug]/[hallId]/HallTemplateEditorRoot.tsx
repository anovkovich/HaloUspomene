"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import RasporedClient from "@/lib/seating/editor/RasporedClient";
import { parseEditorPayload } from "@/lib/seating/payload";
import type { HallTemplate } from "@/lib/hall-venues";

interface Props {
  venueSlug: string;
  hallId: string;
  venueName: string;
  city: string;
  hallName: string;
}

// HALO Uspomene brand palette — replaces the editor's default luxury gold.
const HALO_BRAND_VARS: React.CSSProperties = {
  "--theme-primary": "#AE343F",
  "--theme-primary-light": "rgba(174,52,63,0.25)",
  "--theme-primary-muted": "rgba(174,52,63,0.15)",
} as React.CSSProperties;

/**
 * Admin-side hall scheme editor.
 *
 * Reuses the shared seating editor in `templateMode` with an empty guest list.
 * The save/load actions are plain fetches against the admin API rather than
 * server actions — the route already sits behind the admin cookie gate in
 * `src/middleware.ts`, and the cookie rides along automatically.
 */
export default function HallTemplateEditorRoot({
  venueSlug,
  hallId,
  venueName,
  city,
  hallName,
}: Props) {
  const actions = useMemo(
    () => ({
      // `slug` is the venue slug — that's what this route passes to the editor.
      async save(slug: string, json: string) {
        try {
          const { tables } = parseEditorPayload(json);
          const res = await fetch(
            `/api/admin/hall-venues/${slug}/halls/${hallId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tables }),
            },
          );
          if (res.status === 401) {
            return {
              success: false,
              error: "Sesija je istekla. Prijavite se ponovo na /admin.",
            };
          }
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return {
              success: false,
              error: data.error ?? "Greška pri čuvanju šeme",
            };
          }
          return { success: true };
        } catch (err) {
          return {
            success: false,
            error: err instanceof Error ? err.message : "Greška pri čuvanju",
          };
        }
      },

      async load(slug: string) {
        try {
          const res = await fetch(
            `/api/admin/hall-venues/${slug}/halls/${hallId}`,
          );
          if (!res.ok) {
            if (res.status === 401) {
              toast.error("Sesija je istekla. Prijavite se ponovo na /admin.");
            }
            return null;
          }
          const hall = (await res.json()) as HallTemplate;
          // Templates carry no party member names — the editor's parser expects
          // the same envelope the live products save.
          return JSON.stringify({ tables: hall.tables ?? [], members: {} });
        } catch {
          return null;
        }
      },

      // Hall templates have no paid gate; the admin cookie is the whole check.
      async checkPaid() {
        return true;
      },
    }),
    [hallId],
  );

  return (
    <RasporedClient
      templateMode
      attending={[]}
      slug={venueSlug}
      coupleNames={`${venueName} — ${hallName}`}
      paidForRaspored
      actions={actions}
      backHref="/admin"
      hideWeddingOnlyElements
      themeVarsOverride={HALO_BRAND_VARS}
      guestLookupUrl={`https://halouspomene.rs/raspored-sedenja/`}
      onGenerateWelcomePDF={() => {
        toast.info(`Šema sale ${venueName} (${city}) — bez PDF-a dobrodošlice.`);
      }}
    />
  );
}
