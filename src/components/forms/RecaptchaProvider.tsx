"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

interface RecaptchaContextValue {
  /** Executes a v3 challenge for the given action and returns the token. */
  execute: (action: string) => Promise<string>;
  ready: boolean;
}

const Ctx = createContext<RecaptchaContextValue | null>(null);

const SCRIPT_ID = "halo-recaptcha-v3";

export function RecaptchaProvider({ children }: { children: ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const loadStarted = useRef(false);
  const readyPromise = useRef<Promise<void> | null>(null);

  const ensureLoaded = useCallback((): Promise<void> => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("recaptcha: SSR"));
    }
    if (!siteKey) {
      return Promise.reject(new Error("recaptcha: site key missing"));
    }
    if (readyPromise.current) return readyPromise.current;

    readyPromise.current = new Promise<void>((resolve, reject) => {
      const finalize = () => {
        if (!window.grecaptcha) {
          reject(new Error("recaptcha: grecaptcha not on window"));
          return;
        }
        window.grecaptcha.ready(() => resolve());
      };

      if (window.grecaptcha) {
        finalize();
        return;
      }
      if (loadStarted.current) {
        const existing = document.getElementById(SCRIPT_ID);
        existing?.addEventListener("load", finalize);
        existing?.addEventListener("error", () =>
          reject(new Error("recaptcha: script error")),
        );
        return;
      }
      loadStarted.current = true;

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", finalize);
      script.addEventListener("error", () =>
        reject(new Error("recaptcha: script error")),
      );
      document.head.appendChild(script);
    });

    return readyPromise.current;
  }, [siteKey]);

  const execute = useCallback(
    async (action: string): Promise<string> => {
      if (!siteKey) throw new Error("recaptcha: site key missing");
      await ensureLoaded();
      if (!window.grecaptcha) throw new Error("recaptcha: not loaded");
      return window.grecaptcha.execute(siteKey, { action });
    },
    [siteKey, ensureLoaded],
  );

  // Hide the persistent reCAPTCHA badge once the script has loaded;
  // we display the required disclosure inside each form instead.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "halo-recaptcha-badge-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = ".grecaptcha-badge { visibility: hidden !important; }";
    document.head.appendChild(style);
  }, []);

  return (
    <Ctx.Provider value={{ execute, ready: !!siteKey }}>{children}</Ctx.Provider>
  );
}

export function useRecaptcha() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useRecaptcha must be used inside <RecaptchaProvider>");
  }
  return ctx;
}

/**
 * Disclosure text required by Google's reCAPTCHA Terms of Service when the
 * badge is hidden. Render under any form that calls execute().
 */
export function RecaptchaDisclosure({ className }: { className?: string }) {
  return (
    <p className={className}>
      Sajt je zaštićen reCAPTCHA-om i primenjuju se Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Pravila privatnosti
      </a>{" "}
      i{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Uslovi korišćenja
      </a>
      .
    </p>
  );
}
