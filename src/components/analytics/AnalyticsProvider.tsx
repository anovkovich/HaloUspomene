"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/utils/analytics";

/**
 * Skuplja događaje koje gtag ne pravi sam: `cta_click` (delegacijom na
 * `[data-track]`), `scroll_depth`, `section_view` i `faq_interaction`.
 *
 * Podeljeno je u dva efekta namerno. Slušači na `document`-u se vezuju jednom i
 * preživljavaju navigaciju. Dubina skrola i posmatrač sekcija MORAJU da se
 * obnove na svakoj promeni putanje — komponenta se mount-uje jednom u root
 * layout-u, pa bi sa jednim `[]` efektom posmatrala samo sekcije prve stranice
 * koju je posetilac otvorio, a `scroll_depth` bi za ceo boravak na sajtu bio
 * poslat najviše jednom po pragu.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();

  // ── Slušači na document-u: vezuju se jednom ────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-track]");
      if (!target) return;

      const el = target as HTMLElement;
      const eventName = el.dataset.track;
      if (!eventName) return;

      const params: Record<string, string> = {};
      for (const key of Object.keys(el.dataset)) {
        if (key.startsWith("track") && key !== "track") {
          // "trackCtaName" → "cta_name"
          const paramName = key
            .slice(5)
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "");
          params[paramName] = el.dataset[key]!;
        }
      }

      trackEvent(eventName, params);
    }

    // FAQ je `<details>`/`<summary>`, ne DaisyUI `.collapse` sa checkbox-om.
    // `toggle` se NE propagira nagore, pa se sluša u fazi hvatanja (treći
    // argument `true`) — bez toga slušač na `document` nikada ne opali.
    function handleFaqToggle(e: Event) {
      const details = e.target as HTMLElement;
      if (!(details instanceof HTMLDetailsElement)) return;
      if (!details.open || !details.closest("#faq")) return;

      const question = details.querySelector("summary")?.textContent?.trim();
      if (question) trackEvent("faq_interaction", { question });
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("toggle", handleFaqToggle, true);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("toggle", handleFaqToggle, true);
    };
  }, []);

  // ── Po stranici: dubina skrola + vidljivost sekcija ────────────────────────
  useEffect(() => {
    const scrollMilestones = new Set<number>();

    function handleScroll() {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);

      for (const milestone of [25, 50, 75, 100]) {
        if (percent >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          trackEvent("scroll_depth", {
            depth_percent: milestone,
            page_path: pathname,
          });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    const viewedSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = entry.target.id;
          if (!sectionId || !entry.isIntersecting) continue;
          if (viewedSections.has(sectionId)) continue;

          // Sekcija se računa kao viđena ako je 30% NJE u vidokrugu ILI ako
          // popunjava bar pola ekrana.
          //
          // Drugi uslov nije ukras: sa samim pragom od 0.3, sekcija viša od
          // ~3,3 ekrana ne može nikada da ga dostigne, pa se za nju `section_view`
          // ne pošalje nijednom. Na telefonu je to većina dugih sekcija — i
          // greška bi bila nevidljiva, jer izveštaj samo pokaže manji broj.
          const enough =
            entry.intersectionRatio >= 0.3 ||
            entry.intersectionRect.height >= window.innerHeight * 0.5;
          if (!enough) continue;

          viewedSections.add(sectionId);
          trackEvent("section_view", {
            section_id: sectionId,
            page_path: pathname,
          });
        }
      },
      // Više pragova: bez 0 i 0.1 posmatrač za visoke sekcije ne bi ni dobio
      // poziv u kojem se gornji uslov proverava.
      { threshold: [0, 0.1, 0.3] },
    );

    document
      .querySelectorAll("section[id]")
      .forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
