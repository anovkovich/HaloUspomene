// components/NavbarShell.tsx
"use client";

import { useState, useEffect } from "react";

export default function NavbarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar fixed z-50 transition-all duration-300 ease-in-out px-4 md:px-8
        ${
          isScrolled
            ? "bg-base-100/90 backdrop-blur-md py-1 shadow-md min-h-16"
            : "bg-base-200 py-4 min-h-20 border-b border-base-300"
        }`}
    >
      {children}
    </nav>
  );
}
