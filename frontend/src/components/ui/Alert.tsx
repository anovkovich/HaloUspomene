import React from "react";

interface AlertProps {
  title: string;
  description?: string;
  variant?: "primary" | "success" | "danger" | "warning";
}

export default function Alert({
  title,
  description,
  variant = "primary",
}: AlertProps) {
  const styles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      <h5 className="font-medium leading-none tracking-tight">{title}</h5>
      {/* UPDATED: Uses the global muted color now */}
      {description && (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      )}
    </div>
  );
}
