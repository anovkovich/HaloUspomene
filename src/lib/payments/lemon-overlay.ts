// Opens a Lemon Squeezy checkout in an overlay hosted on our own page, instead
// of throwing the buyer onto a foreign domain to type card details — a big deal
// for this market. Client-only; pairs with checkout_options.embed on the server.

const LEMON_JS = "https://app.lemonsqueezy.com/js/lemon.js";
const LOAD_TIMEOUT_MS = 4000;

interface LemonSqueezyGlobal {
  Setup: (opts: { eventHandler: (e: { event: string }) => void }) => void;
  Url: { Open: (url: string) => void };
}

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: LemonSqueezyGlobal;
  }
}

/** Resolves false rather than throwing — a missing script is an expected state
 *  here (ad blockers), not an error.
 *
 *  Probes for `createLemonSqueezy`, NOT `LemonSqueezy`: the script only defines
 *  the factory, and `window.LemonSqueezy` springs into existence when that
 *  factory runs. Checking for the latter here always fails and silently demotes
 *  every checkout to the redirect fallback. Lemon.js also self-triggers on the
 *  window `load` event, which has long fired by the time we inject it — so
 *  calling the factory ourselves is required, not belt-and-braces. */
function loadLemonJs(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.createLemonSqueezy === "function") return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    // Some blockers neither load nor error the request — it just hangs, so the
    // timeout is what actually guarantees we fall back.
    const timer = setTimeout(() => finish(false), LOAD_TIMEOUT_MS);

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LEMON_JS}"]`,
    );
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () =>
      finish(typeof window.createLemonSqueezy === "function"),
    );
    script.addEventListener("error", () => finish(false));
    if (!existing) {
      script.src = LEMON_JS;
      document.head.appendChild(script);
    }
  });
}

/**
 * Opens `url` as an overlay and sends the buyer to `successHref` once Lemon
 * Squeezy reports the payment went through.
 *
 * Falls back to a full-page redirect to the same URL whenever Lemon.js is
 * unavailable. That fallback is not optional: a blocked script must never turn
 * into an order the customer cannot pay.
 */
export async function openCheckout(
  url: string,
  successHref: string,
): Promise<void> {
  const ready = await loadLemonJs();
  if (!ready || typeof window.createLemonSqueezy !== "function") {
    window.location.href = url;
    return;
  }
  try {
    window.createLemonSqueezy(); // this is what creates window.LemonSqueezy
    const ls = window.LemonSqueezy;
    if (!ls) {
      window.location.href = url;
      return;
    }
    ls.Setup({
      eventHandler: (e) => {
        // The webhook may still be in flight; the hvala page polls for it.
        if (e.event === "Checkout.Success") window.location.href = successHref;
      },
    });
    // Url.Open appends embed=1 itself. That param is whitelisted by LS's URL
    // signature (unlike locale/dark), so the signed URL survives it.
    ls.Url.Open(url);
  } catch {
    window.location.href = url;
  }
}
