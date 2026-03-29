"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const posts = [
  {
    title: "Šta je Audio Guest Book i Zašto je Hit na Venčanjima?",
    href: "/blog/sta-je-audio-guest-book",
  },
  {
    title: "Kako Funkcioniše Audio Guest Book: Kompletan Vodič",
    href: "/blog/kako-funkcionise-audio-guest-book",
  },
  {
    title: "Audio Guest Book Cena u Srbiji 2026",
    href: "/blog/audio-guest-book-cena",
  },
  {
    title: "Audio Guest Book vs Klasična Knjiga Utisaka",
    href: "/blog/audio-guest-book-vs-knjiga-utisaka",
  },
  {
    title: "Audio Guest Book Iskustva: Šta Kažu Parovi",
    href: "/blog/audio-guest-book-iskustva",
  },
];

export default function RelatedPosts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-[#232323]/50 hover:text-[#AE343F] transition-colors cursor-pointer"
          aria-label="Pomeri levo"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Right arrow */}
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-[#232323]/50 hover:text-[#AE343F] transition-colors cursor-pointer"
          aria-label="Pomeri desno"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x scroll-pl-1 scroll-pr-1"
      >
        {posts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="snap-start shrink-0 w-[240px] sm:w-[260px] bg-[#faf9f6] rounded-xl p-5 border border-stone-100 hover:border-[#AE343F]/20 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <p className="text-sm font-semibold text-[#232323] group-hover:text-[#AE343F] transition-colors mb-3 leading-snug">
              {post.title}
            </p>
            <span className="text-xs text-[#AE343F] font-medium inline-flex items-center gap-1">
              Pročitaj
              <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
