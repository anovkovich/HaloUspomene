import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Checkbox({
  label,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input type="checkbox" className="peer sr-only" {...props} />

        {/* The Box */}
        <div
          className="h-5 w-5 rounded border border-border bg-background transition-all 
          peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 
          peer-checked:bg-primary peer-checked:border-primary"
        ></div>

        {/* The Checkmark Icon */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-primary-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <span className="text-sm text-foreground select-none">{label}</span>
    </label>
  );
}
