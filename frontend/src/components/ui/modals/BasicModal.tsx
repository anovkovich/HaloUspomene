import React, { useEffect } from "react";
import IconButton from "../buttons/IconButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode; // Optional footer (usually buttons)
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size = "md",
}: ModalProps) {
  // 1. Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Size Classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-[95vw]",
  };

  return (
    // BACKDROP
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      {/* MODAL WINDOW */}
      <div
        className={`w-full ${sizeClasses[size]} flex flex-col rounded-xl border border-border bg-background shadow-xl max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER (Optional) */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <h3 className="text-lg font-semibold text-foreground">
            {title || "Modal"}
          </h3>
          <IconButton onClick={onClose} variant="ghost" size="sm" rounded>
            {/* X Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* CONTENT (Scrollable if too long) */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6">{children}</div>

        {/* FOOTER (Optional) */}
        {footer && (
          <div className="border-t border-border p-4 sm:px-6 bg-muted/20 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
