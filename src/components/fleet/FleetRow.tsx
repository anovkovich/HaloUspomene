"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Jedan red kartica vozila sa horizontalnim skrolovanjem.
 *
 * Kartice se ne prelamaju u vise redova: na velikim ekranima staju tri, na
 * manjim dve, a ostale se dohvataju skrolovanjem. Strelice se pojavljuju samo
 * kada red stvarno ima sta da skroluje — i to svaka posebno, pa se odmah vidi
 * ima li jos vozila levo ili desno.
 *
 * Sirinu kartice postavlja stranica (`shrink-0 w-[...]` na `<article>`), da bi
 * kartica ostala obican server-renderovan markup, a ovde je samo omotac.
 */
export default function FleetRow({
  label,
  children,
}: {
  /** Pristupacno ime reda, npr. „Oldtajmeri iz Paracina". */
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // Tolerancija od 4px: subpiksel zaokruzivanje ume da ostavi scrollLeft na
    // 0.5 ili max-0.5, pa bi strelica treperila na krajevima.
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    // Prati i promenu sirine (rotacija telefona, promena prozora), ne samo skrol.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    // Korak = tacno jedna kartica sa razmakom, izmeren iz DOM-a da se ne
    // duplira vrednost `gap` klase.
    const by =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: "smooth" });
  };

  // Strelica stoji preko fotografije, ne preko teksta: na telefonu je kartica
  // niska pa je fiksna vrednost tacnija od procenta.
  const arrow =
    "absolute top-12 sm:top-[34%] z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-[#232323]/10 shadow-lg text-[#232323]/70 hover:text-[#AE343F] hover:border-[#AE343F]/40 flex items-center justify-center transition-colors cursor-pointer";

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label={label}
        className="flex gap-4 lg:gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory py-2 rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AE343F]"
      >
        {children}
      </div>

      {canPrev && (
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Prikaži prethodna vozila"
          className={`${arrow} left-1 sm:-left-4`}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Prikaži sledeća vozila"
          className={`${arrow} right-1 sm:-right-4`}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
