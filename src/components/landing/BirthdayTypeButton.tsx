"use client";

import { useState, type ReactNode } from "react";
import BirthdayTypeModal from "./BirthdayTypeModal";

interface BirthdayTypeButtonProps {
  className?: string;
  children: ReactNode;
  /**
   * Optional analytics location label — passed through to the modal via body
   * attribute so downstream selection can be segmented by entry point.
   */
  entryLabel?: string;
}

/**
 * Button that opens the "dečiji rođendan vs punoletstvo" picker modal.
 * Renders a native <button> (not a link) so we can intercept the click
 * without a pre-navigation nav event.
 */
export default function BirthdayTypeButton({
  className,
  children,
  entryLabel,
}: BirthdayTypeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-entry={entryLabel ?? undefined}
        className={className}
      >
        {children}
      </button>
      <BirthdayTypeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
