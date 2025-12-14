import React from "react";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

export default function IconButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  rounded = false,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "p-2 cursor-pointer flex items-center justify-center transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground hover:opacity-80 focus:ring-secondary",
    ghost:
      "bg-transparent text-foreground hover:bg-secondary active:bg-secondary focus:ring-secondary",
  };

  const sizes = {
    sm: "h-8 w-8", // 32px (Matches standard button sm height)
    md: "h-10 w-10", // 40px (Matches standard button md height)
    lg: "h-12 w-12", // 48px (Matches standard button lg height)
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}
      ${sizes[size]} ${rounded ? "rounded-full" : "rounded-lg"}`}
      {...props}
    >
      {children}
    </button>
  );
}
