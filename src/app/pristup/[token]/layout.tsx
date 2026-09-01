import type { ReactNode } from "react";

export default function PristupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F4DC] text-[#232323]">
      {children}
    </div>
  );
}
