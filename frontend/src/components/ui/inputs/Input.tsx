import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
}

export default function Input({
  label,
  error,
  className = "",
  prefix,
  postfix,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* 1. PREFIX (Left Side) */}
        {prefix && (
          <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
            {prefix}
          </div>
        )}

        {/* 2. THE INPUT */}
        <input
          className={`
            w-full rounded-lg border border-border bg-background py-2 text-foreground 
            placeholder-muted-foreground/70
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
            disabled:cursor-not-allowed disabled:opacity-50
            transition-all duration-200
            ${
              prefix ? "pl-10" : "pl-3"
            }   /* Add left padding if prefix exists */
            ${
              postfix ? "pr-14" : "pr-3"
            }  /* Add right padding if postfix exists */
            ${
              error ? "border-danger focus:border-danger focus:ring-danger" : ""
            }
            ${className}
          `}
          {...props}
        />

        {/* 3. POSTFIX (Right Side) */}
        {postfix && (
          <div className="absolute right-3 flex items-center text-sm font-medium text-muted-foreground">
            {postfix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
