"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import FeatureInfoModal from "@/components/ui/FeatureInfoModal";

/**
 * Inline "Šta je ovo?" pill that opens the shared FeatureInfoModal on the
 * "raspored" entry — the same explainer used on /cene. The modal is portaled to
 * <body> so the pill stays valid inline content, and the portal wrapper carries
 * the --cene-accent tokens the modal styles read (otherwise it renders
 * colorless off the /cene page). The portal mounts only once the pill is
 * clicked, which is always client-side, so no SSR/document guard is needed.
 */
export default function GdeSedimInfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="align-middle ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide text-[#AE343F] bg-[#AE343F]/[0.06] border border-[#AE343F]/20 hover:bg-[#AE343F]/10 transition-colors cursor-pointer"
      >
        <HelpCircle size={10} /> Šta je ovo?
      </button>
      {open &&
        createPortal(
          <div
            style={
              {
                "--cene-accent": "#AE343F",
                "--cene-accent-rgb": "174,52,63",
              } as React.CSSProperties
            }
          >
            <FeatureInfoModal
              feature="raspored"
              onClose={() => setOpen(false)}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
