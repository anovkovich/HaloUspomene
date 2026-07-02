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
  placeholder = "6X XXX XXX",
  required = false,
}: Props) {
  const styles =
    variant === "dark"
      ? {
          wrapper: "border-b border-white/10 focus-within:border-[#AE343F]",
          prefix: "py-3 pl-4 pr-2 text-[#F5F4DC]/80 text-lg select-none",
          input:
            "flex-1 bg-transparent py-3 pr-4 text-[#F5F4DC] text-lg outline-none placeholder:text-white/50",
          hint: "inline-flex items-center gap-1.5 text-xs text-emerald-400 mt-2",
        }
      : {
          wrapper:
            "flex items-center border-b border-stone-200 focus-within:border-[var(--accent,#AE343F)] transition-colors",
          prefix: "py-1.5 pl-1 pr-2 text-stone-400 text-base select-none",
          input:
            "flex-1 bg-transparent py-1.5 pr-1 text-stone-800 text-base outline-none placeholder:text-stone-300",
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
          autoComplete="tel-national"
          className={styles.input}
          placeholder={placeholder}
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
        <Globe size={13} /> Personalni link aktivan — verifikacija nije potrebna ({countryLabel}).
      </div>
    </div>
  );
}
