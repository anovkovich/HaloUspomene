"use client";

import React from "react";

interface PremiumCallCTAProps {
  contactPhone?: string;
  showNumbers?: boolean[];
  useCyrillic?: boolean;
  /** Tailwind text color class for the label (e.g. "text-white/65"). */
  labelClassName?: string;
  /** Tailwind text color class for the number links (e.g. "text-white"). */
  numberClassName?: string;
  /** Tailwind text color class for the separator dot. */
  separatorClassName?: string;
  /** Extra classes for the outer wrapper, used to control margin. */
  wrapperClassName?: string;
}

// +381638261775 → "+381 63 826 1775"
function formatPhone(raw: string): string {
  const match = raw.replace(/\s+/g, "").match(/^\+381(\d{2})(\d{3})(\d+)$/);
  if (match) return `+381 ${match[1]} ${match[2]} ${match[3]}`;
  return raw;
}

export default function PremiumCallCTA({
  contactPhone,
  showNumbers,
  useCyrillic,
  labelClassName = "text-white/70",
  numberClassName = "text-white",
  separatorClassName = "text-white/40",
  wrapperClassName = "mt-5",
}: PremiumCallCTAProps) {
  const phones = (contactPhone ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const enabled = phones.filter((_, i) => showNumbers?.[i] === true);
  if (enabled.length === 0) return null;

  const label = useCyrillic
    ? enabled.length > 1
      ? "Или позови један од бројева:"
      : "Или позови број:"
    : enabled.length > 1
      ? "Ili pozovi jedan od brojeva:"
      : "Ili pozovi broj:";

  return (
    <div className={`text-center ${wrapperClassName}`}>
      <p
        className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-2 ${labelClassName}`}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {enabled.map((num, i) => (
          <React.Fragment key={`${num}-${i}`}>
            {i > 0 && <span className={separatorClassName}>•</span>}
            <a
              href={`tel:${num.replace(/\s+/g, "")}`}
              className={`text-sm font-medium underline-offset-2 hover:underline ${numberClassName}`}
            >
              {formatPhone(num)}
            </a>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
