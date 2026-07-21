"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Branded replacement for window.confirm / window.prompt.
 *
 *  Usage:
 *    const { confirm, prompt, dialog } = useConfirmDialog({ variant: "dark" });
 *    ...
 *    if (!(await confirm({ title: "Obriši vendora?", danger: true }))) return;
 *    const note = await prompt({ title: "Razlog", input: { optional: true } });
 *    ...
 *    return <>{...}{dialog}</>;
 *
 *  `confirm` resolves to boolean; `prompt` resolves to the entered string or
 *  null when cancelled (same contract as window.prompt). */

export interface ConfirmOptions {
  title?: string;
  /** Supports \n line breaks. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /** Warning strip shown above the buttons (e.g. duplicate-payment notice). */
  warning?: string;
  input?: {
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    /** When true, confirming with an empty value is allowed. */
    optional?: boolean;
  };
}

type Variant = "dark" | "light";

interface ActiveDialog extends ConfirmOptions {
  mode: "confirm" | "prompt";
  resolve: (value: boolean | string | null) => void;
}

const STYLES: Record<
  Variant,
  {
    panel: React.CSSProperties;
    title: string;
    message: string;
    warning: string;
    input: string;
    cancel: string;
    confirm: string;
    confirmDanger: string;
  }
> = {
  dark: {
    panel: {
      backgroundColor: "#1e1e1e",
      border: "1px solid rgba(255,255,255,0.12)",
    },
    title: "text-white font-semibold",
    message: "text-white/60",
    warning: "bg-amber-500/10 border border-amber-500/30 text-amber-300",
    input:
      "w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/25",
    cancel:
      "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90",
    confirm: "bg-green-500/20 hover:bg-green-500/30 text-green-300",
    confirmDanger: "bg-[#AE343F] hover:bg-[#c24651] text-white",
  },
  light: {
    panel: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(35,35,35,0.1)",
    },
    title: "text-[#232323] font-semibold",
    message: "text-[#232323]/60",
    warning: "bg-amber-50 border border-amber-300 text-amber-800",
    input:
      "w-full text-sm text-[#232323] bg-[#232323]/5 border border-[#232323]/15 rounded-lg px-3 py-2 outline-none focus:border-[#AE343F]/50",
    cancel:
      "bg-[#232323]/5 hover:bg-[#232323]/10 text-[#232323]/60 hover:text-[#232323]",
    confirm: "bg-[#AE343F] hover:bg-[#c24651] text-white",
    confirmDanger: "bg-[#AE343F] hover:bg-[#c24651] text-white",
  },
};

function ConfirmDialogView({
  dialog,
  variant,
  onClose,
}: {
  dialog: ActiveDialog;
  variant: Variant;
  onClose: (value: boolean | string | null) => void;
}) {
  const s = STYLES[variant];
  const [value, setValue] = useState(dialog.input?.defaultValue ?? "");
  const confirmRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPrompt = dialog.mode === "prompt";
  const canConfirm = !isPrompt || dialog.input?.optional || value.trim() !== "";

  function cancel() {
    onClose(isPrompt ? null : false);
  }
  function confirmAction() {
    if (!canConfirm) return;
    onClose(isPrompt ? value : true);
  }

  useEffect(() => {
    (isPrompt ? inputRef.current : confirmRef.current)?.focus();
  }, [isPrompt]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cancel();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      // stopPropagation: the dialog may be nested inside another modal whose
      // backdrop also closes on click — this click must not fall through.
      onClick={(e) => {
        e.stopPropagation();
        cancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4"
        style={STYLES[variant].panel}
        onClick={(e) => e.stopPropagation()}
      >
        {dialog.title && <h3 className={`text-base ${s.title}`}>{dialog.title}</h3>}

        {dialog.message && (
          <p className={`text-sm whitespace-pre-line ${s.message}`}>
            {dialog.message}
          </p>
        )}

        {dialog.warning && (
          <p className={`text-xs rounded-lg px-3 py-2 ${s.warning}`}>
            ⚠ {dialog.warning}
          </p>
        )}

        {isPrompt && (
          <div className="space-y-1.5">
            {dialog.input?.label && (
              <label className={`text-xs ${s.message}`}>{dialog.input.label}</label>
            )}
            <input
              ref={inputRef}
              type="text"
              value={value}
              placeholder={dialog.input?.placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAction()}
              className={s.input}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={cancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${s.cancel}`}
          >
            {dialog.cancelLabel ?? "Otkaži"}
          </button>
          <button
            ref={confirmRef}
            onClick={confirmAction}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 ${
              dialog.danger ? s.confirmDanger : s.confirm
            }`}
          >
            {dialog.confirmLabel ?? "Potvrdi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog(defaults?: { variant?: Variant }) {
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const variant = defaults?.variant ?? "dark";

  const confirm = useCallback((opts: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setActive({
        ...opts,
        mode: "confirm",
        resolve: (v) => resolve(v === true),
      });
    });
  }, []);

  const prompt = useCallback(
    (opts: ConfirmOptions = {}): Promise<string | null> => {
      return new Promise((resolve) => {
        setActive({
          ...opts,
          mode: "prompt",
          resolve: (v) => resolve(typeof v === "string" ? v : null),
        });
      });
    },
    [],
  );

  const dialog = active ? (
    <ConfirmDialogView
      dialog={active}
      variant={variant}
      onClose={(value) => {
        active.resolve(value);
        setActive(null);
      }}
    />
  ) : null;

  return { confirm, prompt, dialog };
}
