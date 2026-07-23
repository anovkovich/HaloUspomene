"use client";

import { Globe } from "lucide-react";

type Variant = "light" | "dark";

interface Props {
  /** Bare local digits (no calling code). */
  value: string;
  onChange: (v: string) => void;
  /** E.164 calling code with leading "+", e.g. "+387". */
  callingCode: string;
  /** Country label for the bypass badge, e.g. "Bosna i Hercegovina". */
  countryLabel: string;
  variant?: Variant;
  placeholder?: string;
  required?: boolean;
}

/**
 * Stripped-down phone input used in foreign-customer bypass mode. No SMS
 * verification UI — the bypass token already authorizes the submission, so we
 * only need to collect the number with the correct country prefix.
 */
export function BypassPhoneInput({
  value,
  onChange,
  callingCode,
  countryLabel,
  variant = "light",
  placeholder,
  required = false,
}: Props) {
  // "+" is the INT catch-all: the customer types their own country code as part
  // of the number, so the prompt must ask for the full international number.
  const international = callingCode === "+";
  const effectivePlaceholder =
    placeholder ?? (international ? "381 6X XXX XXX" : "6X XXX XXX");
  const styles =
    variant === "dark"
      ? {
          wrapper: "bg-white/5 border border-white/10 rounded-xl focus-within:border-[#AE343F] transition-colors",
          prefix: "py-3 pl-4 pr-2 text-[#F5F4DC]/80 text-lg select-none",
          input:
            "flex-1 bg-transparent py-3 pr-4 text-[#F5F4DC] text-lg outline-none placeholder:text-white/50",
          hint: "inline-flex items-center gap-1.5 text-xs text-emerald-400 mt-2",
        }
      : {
          wrapper:
            "bg-stone-50 border border-stone-200 rounded-xl focus-within:border-[var(--accent,#AE343F)] transition-colors",
          prefix: "py-3 pl-4 pr-2 text-stone-400 text-base select-none",
          input:
            "flex-1 bg-transparent py-3 pr-2 text-stone-800 text-base outline-none placeholder:text-stone-300",
          hint: "inline-flex items-center gap-1.5 text-xs text-emerald-700 mt-1.5",
        };

  return (
    <div className="space-y-2">
      <div className={`flex items-center ${styles.wrapper}`}>
        <span className={styles.prefix}>{callingCode}</span>
        <input
          required={required}
          type="tel"
          inputMode="numeric"
          autoComplete={international ? "tel" : "tel-national"}
          className={styles.input}
          placeholder={effectivePlaceholder}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
                .replace(/\D/g, "")
                .replace(/^0+/, ""),
            )
          }
        />
      </div>
      <div className={styles.hint}>
        <Globe size={13} className="shrink-0" />
        <span className="min-w-0 truncate">
          Personalni link aktivan ({international ? "Internacionalno" : countryLabel})
        </span>
      </div>
      {international && (
        <p
          className={`text-[11px] mt-1 ${variant === "dark" ? "text-white/45" : "text-stone-400"}`}
        >
          Unesite ceo broj sa pozivnim brojem vaše zemlje (npr. 43 660 123 456 za
          Austriju).
        </p>
      )}
    </div>
  );
}
