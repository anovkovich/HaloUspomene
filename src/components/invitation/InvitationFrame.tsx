"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Desktop phone-frame for the mobile-first invitations.
 *
 * On large screens (lg+, ≥1024px) the invitation renders inside a real
 * `<iframe>` sized to a phone-width portrait frame. Because an iframe has its
 * OWN viewport, all width-based CSS — Tailwind `sm:`/`lg:` breakpoints AND
 * `vw` units — resolves against the ~440px frame instead of the desktop
 * window. That makes the invitation show its true mobile layout on desktop,
 * instead of cramming the landscape/desktop layout into a narrow box (the old
 * `max-width` div could not do this — a plain div is not a viewport).
 *
 * On phones/tablets (<1024px) and inside the iframe itself (`?embed=1`) the
 * children render untouched, full width — so the guest experience and the
 * server-rendered / crawler HTML are unchanged.
 *
 * The desktop check uses `useSyncExternalStore`: the server snapshot is
 * `false`, so SSR and the first client paint render `children` (no hydration
 * mismatch, and the common case — a guest on a phone — never remounts). Only
 * on desktop does React re-render into the framed iframe, and it does so before
 * the heavy `ssr:false` invitation chunks finish loading, so there is no
 * visible full-width flash.
 *
 * The frame is same-origin, so we (1) inject a stylesheet that hides the
 * invitation's scrollbar (it looks out of place inside the phone mock) and
 * (2) forward wheel events that land on the surrounding backdrop into the
 * iframe, so scrolling anywhere on the page scrolls the invitation.
 */
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export default function InvitationFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Must come from the router, not window.location: on a client-side <Link>
  // navigation React renders this page before the history entry is swapped, so
  // window.location still points at the PREVIOUS page and the iframe would
  // load that instead. usePathname() is reactive and already correct here.
  // (useSearchParams() would be the matching hook for the query string, but it
  // opts these statically-rendered routes out of static generation, and no
  // route behind this frame reads query params anyway.)
  const pathname = usePathname();

  // On the embedded pass (`?embed=1`) we ARE the iframe → render full width.
  const isEmbed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("embed");
  const framed = isDesktop && !isEmbed;

  // Lock the outer document while framed: the stage is exactly viewport-sized,
  // so there is nothing to scroll — without this the window itself scrolls
  // (past the backdrop, exposing a bar) when wheel events are forwarded in.
  useEffect(() => {
    if (!framed) return;
    const html = document.documentElement;
    const { overflow } = html.style;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = overflow;
    };
  }, [framed]);

  // Hide the inner scrollbar. Same-origin, so we can style the framed document
  // directly; runs on every (re)load of the iframe.
  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const style = doc.createElement("style");
    style.textContent = `
      html { scrollbar-width: none; -ms-overflow-style: none; }
      html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; display: none; }
    `;
    doc.head.appendChild(style);
  };

  // Wheel events over the iframe scroll it natively; events over the backdrop
  // would otherwise be lost (the backdrop can't scroll) — forward them in.
  const handleWheel = (e: React.WheelEvent) => {
    iframeRef.current?.contentWindow?.scrollBy({ top: e.deltaY });
  };

  if (!framed) return <>{children}</>;

  const src = `${pathname}?embed=1`;

  return (
    <div
      onWheel={handleWheel}
      className="min-h-screen flex items-center justify-center py-4"
      style={{
        backgroundColor: "#e9e8df",
        backgroundImage:
          "radial-gradient(circle, rgba(35,35,35,0.10) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="w-[440px] h-[calc(100dvh-2rem)] max-h-[1040px] overflow-hidden rounded-[2.5rem] border border-[#232323]/20 bg-white shadow-2xl shadow-black/25">
        <iframe
          ref={iframeRef}
          src={src}
          title="Pozivnica"
          onLoad={handleLoad}
          className="block w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
