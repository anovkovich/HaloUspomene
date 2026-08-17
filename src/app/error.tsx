"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] px-6">
      <div className="max-w-md text-center">
        <p className="text-6xl mb-6">😔</p>
        <h1 className="font-serif text-2xl text-[#232323] mb-3">
          Nešto nije u redu
        </h1>
        <p className="text-sm text-[#78716c] mb-8 leading-relaxed">
          Došlo je do neočekivane greške. Pokušajte ponovo ili se vratite na
          početnu stranicu.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#AE343F] text-white text-sm font-medium rounded-lg hover:bg-[#8A2A32] transition-colors"
          >
            Pokušaj ponovo
          </button>
          {/* Namerno `<a>` a ne `<Link>`: ovo je granica greške, i jedino
              puno osvežavanje garantuje čist React tree i čisto klijentsko
              stanje. Klijentska navigacija bi zadržala isti proces koji je
              upravo pukao — a ova stranica se prikazuje baš zato što nešto
              nije u redu. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="px-6 py-2.5 border border-[#d4d0c8] text-[#78716c] text-sm font-medium rounded-lg hover:bg-white/50 transition-colors"
          >
            Početna
          </a>
        </div>
      </div>
    </div>
  );
}
