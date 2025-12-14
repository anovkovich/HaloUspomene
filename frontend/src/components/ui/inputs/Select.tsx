import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export default function Select({
  label,
  options,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            w-full cursor-pointer appearance-none rounded-lg border border-border bg-background 
            pl-3 pr-10 py-2 text-foreground 
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              error ? "border-danger focus:border-danger focus:ring-danger" : ""
            } 
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground">
          <svg
            className="h-4 w-4 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
