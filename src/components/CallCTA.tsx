"use client";

import React from "react";

interface CallCTAProps {
  contactPhone?: string;
  showNumbers?: boolean[];
  numberNames?: string[];
  useCyrillic?: boolean;
}

// +381638261775 → "+381 63 826 1775"
function formatPhone(raw: string): string {
  const match = raw.replace(/\s+/g, "").match(/^\+381(\d{2})(\d{3})(\d+)$/);
  if (match) return `+381 ${match[1]} ${match[2]} ${match[3]}`;
  return raw;
}

// Theme-token-driven phone CTA rendered under the RSVP form on classic
// invitations. Premium themes have their own variant (PremiumCallCTA)
// because they need explicit overrides for their dark/burgundy palettes.
export default function CallCTA({
  contactPhone,
  showNumbers,
  numberNames,
  useCyrillic,
}: CallCTAProps) {
  const phones = (contactPhone ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const enabled = phones
    .map((num, i) => ({ num, name: (numberNames?.[i] ?? "").trim() }))
    .filter((_, i) => showNumbers?.[i] === true);
  if (enabled.length === 0) return null;

  const hasAnyName = enabled.some((e) => e.name !== "");

  const label = useCyrillic
    ? enabled.length > 1
      ? "Или позови један од бројева:"
      : "Или позови број:"
    : enabled.length > 1
      ? "Ili pozovi jedan od brojeva:"
      : "Ili pozovi broj:";

  return (
    <div className="text-center mt-6 max-w-xl mx-auto">
      <p
        className="font-elegant text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-2"
        style={{ color: "var(--theme-text-light)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-3">
        {enabled.map(({ num, name }, i) => (
          <React.Fragment key={`${num}-${i}`}>
            {i > 0 && !hasAnyName && (
              <span style={{ color: "var(--theme-text-light)", opacity: 0.5 }}>
                •
              </span>
            )}
            <div className="flex flex-col items-center gap-0.5">
              {name && (
                <span
                  className="text-[10px] sm:text-xs tracking-wide"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  {name}
                </span>
              )}
              <a
                href={`tel:${num.replace(/\s+/g, "")}`}
                className="text-sm font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--theme-primary)" }}
              >
                {formatPhone(num)}
              </a>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
