// components/MobileMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu({
  links,
}: {
  links: { name: string; href: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-ghost lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round" // Ovo mora biti "round", "butt" ili "square"
            strokeLinejoin="round"
            /* Logika ide OVDE u atribut "d" */
            d={
              isOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            }
          />
        </svg>
      </button>

      <div
        className={`fixed inset-0 bg-base-100 z-40 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-semibold"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
