"use client";

import React, { useState } from "react";
import { CalendarPlus, X, ExternalLink, Download } from "lucide-react";
import {
  type CalendarEvent,
  googleCalendarUrl,
  icsHref,
} from "@/lib/calendar";

interface Props {
  event: CalendarEvent;
  label?: string;
  /** Classes for the trigger element. */
  className?: string;
  style?: React.CSSProperties;
  /** Show the leading calendar icon on the trigger (default true). */
  showIcon?: boolean;
  /** Filename for the downloaded .ics file. */
  icsFilename?: string;
  /** Heading shown inside the chooser dialog. */
  dialogTitle?: string;
  googleLabel?: string;
  appleLabel?: string;
}

/**
 * A trigger button/link that opens a small neutral dialog offering
 * Google Calendar and Apple/Outlook (.ics) options. The dialog is rendered
 * fixed + centered so it never clips inside themed cards.
 */
export default function AddToCalendar({
  event,
  label = "Dodaj u kalendar",
  className,
  style,
  showIcon = true,
  icsFilename = "dogadjaj.ics",
  dialogTitle = "Dodaj u kalendar",
  googleLabel = "Google kalendar",
  appleLabel = "Apple / Outlook",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={style}
      >
        {showIcon && <CalendarPlus size={15} className="shrink-0" />}
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-[#232323]/45 transition-colors hover:text-[#232323] cursor-pointer"
              aria-label="Zatvori"
            >
              <X size={18} />
            </button>

            <p className="mb-4 pr-6 font-serif text-base text-[#232323]">
              {dialogTitle}
            </p>

            <div className="space-y-2">
              <a
                href={googleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#232323]/15 px-4 py-3 text-sm font-medium text-[#232323] transition-colors hover:border-[#AE343F]/45 hover:text-[#AE343F]"
              >
                {googleLabel}
                <ExternalLink size={14} className="shrink-0 opacity-60" />
              </a>
              {/* Real same-origin URL (no `download` attr) so iOS Safari
                  opens the Calendar sheet; desktop/Android download via the
                  endpoint's Content-Disposition header. */}
              <a
                href={icsHref(event, icsFilename)}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#232323]/15 px-4 py-3 text-sm font-medium text-[#232323] transition-colors hover:border-[#AE343F]/45 hover:text-[#AE343F] cursor-pointer"
              >
                {appleLabel}
                <Download size={14} className="shrink-0 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
