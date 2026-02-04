"use client";

import React, { useEffect, useRef } from "react";

const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.filter = "blur(2px)";
    el.style.transition =
      "opacity 1s ease-out, transform 1s ease-out, filter 1s ease-out";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          el.style.filter = "blur(0px)";
        } else {
          const rect = entry.boundingClientRect;
          if (rect.top > 0) {
            el.style.opacity = "0";
            el.style.transform = "translateY(40px)";
            el.style.filter = "blur(2px)";
          } else {
            el.style.opacity = "0.3";
            el.style.transform = "translateY(-20px)";
            el.style.filter = "blur(1px)";
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
