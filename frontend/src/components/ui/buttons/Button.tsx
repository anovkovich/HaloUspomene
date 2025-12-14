"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  rounded?: boolean;
}

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading,
  rounded = false,
  ...props
}: ButtonProps) {
  // Base styles (Focus, Rounded, Transition)
  const baseStyles =
    "cursor-pointer inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground hover:opacity-80 focus:ring-secondary",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-secondary focus:ring-secondary",
    danger:
      "bg-danger text-danger-foreground hover:opacity-90 focus:ring-danger",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        rounded ? "rounded-full" : "rounded-lg"
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      ) : null}
      {children}
    </button>
  );
}
