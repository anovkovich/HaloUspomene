import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "primary";
}

export default function Badge({ children, variant = "neutral" }: BadgeProps) {
  const variants = {
    // Global Green with 15% opacity background
    success: "bg-success/15 text-success border-success/20",

    // Global Yellow
    warning: "bg-warning/15 text-warning border-warning/20",

    // Global Red
    danger: "bg-danger/15 text-danger border-danger/20",

    // Global Blue (Primary)
    primary: "bg-primary/15 text-primary border-primary/20",

    // Global Gray (Secondary)
    neutral: "bg-secondary text-secondary-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
