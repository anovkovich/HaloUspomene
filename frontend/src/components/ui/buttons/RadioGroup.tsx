import React from "react";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  selected?: string;
  label?: string;
}

export default function RadioGroup({
  name,
  options,
  selected,
  onChange,
  label,
}: RadioGroupProps) {
  return (
    <div>
      {label && (
        <label className="mb-3 pb-2 block text-sm border-b border-border font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="peer sr-only"
              />

              {/* The Outer Circle */}
              <div
                className="h-5 w-5 rounded-full border border-border bg-background transition-all 
                peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 
                peer-checked:border-primary peer-checked:bg-primary"
              ></div>

              {/* The Inner Dot (White) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary-foreground opacity-0 scale-0 transition-all duration-200 peer-checked:opacity-100 peer-checked:scale-100"></div>
            </div>

            <span className="text-sm text-foreground select-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
