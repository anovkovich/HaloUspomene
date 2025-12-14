import React from "react";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-background p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
