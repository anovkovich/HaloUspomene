"use client";

import React, { useState } from "react";
import Input from "./Input";

// Inherit all props from Input, but we handle 'type' and 'postfix' internally
type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "postfix"
>;

export default function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      // Toggle between text and password
      type={showPassword ? "text" : "password"}
      className={className}
      // Add the toggle button
      postfix={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="cursor-pointer text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          tabIndex={-1} // Skip tab index so user tabs from input to next input, not the eye icon
        >
          {showPassword ? (
            // Eye Off Icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            // Eye Icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      }
    />
  );
}
