import React, { useEffect } from "react";
import Button from "../buttons/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: "danger" | "primary";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "primary",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmationModalProps) {
  // 1. Close on Escape key press (BLOCKED if loading)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CHANGED: Added '!isLoading' check here
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]); // CHANGED: Added 'isLoading' to dependencies

  // 2. Prevent scrolling
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

  return (
    // OVERLAY
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity ${
        isLoading ? "cursor-wait" : ""
      }`}
      // CHANGED: Only close if NOT loading
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      {/* MODAL CONTENT */}
      <div
        className="w-full max-w-md scale-100 transform rounded-xl border border-border bg-background p-6 shadow-lg transition-all"
        onClick={(e) => e.stopPropagation()} // Stop click from reaching overlay
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex justify-end gap-3">
          {/* Cancel button is disabled during loading */}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>

          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
