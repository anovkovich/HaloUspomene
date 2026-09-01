import { getCachedEurRateConfig, setCachedEurRateConfig } from "./portal";
import { FALLBACK_EUR_RATE } from "./currency";

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

/** Scrapes today's official EUR→RSD "srednji kurs" from the National Bank
 *  of Serbia's own public exchange-rate page. No API key or registration
 *  needed — NBS's registered web-service system requires legal-entity
 *  enrollment, but this public HTML page (part of nbs.rs) does not. Never
 *  throws; returns null on any failure so the caller can fall back. */
async function fetchNbsEurRate(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://webappcenter.nbs.rs/ExchangeRateWebApp/ExchangeRate/CurrentMiddleRate",
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const html = await res.text();
    // Row looks like: ...EUR...978...ЕМУ...1...117,3707... — grab the
    // decimal number that follows the EUR currency code cell.
    const match = html.match(/EUR[\s\S]{0,400}?(\d{2,4},\d{2,4})/);
    if (!match) return null;
    const rate = parseFloat(match[1].replace(",", "."));
    // Sanity guard: EUR/RSD has stayed in a ~100-140 band for years — a
    // wildly different number means the page format changed, not that the
    // rate actually moved that much.
    if (!rate || isNaN(rate) || rate < 50 || rate > 300) return null;
    return rate;
  } catch {
    return null;
  }
}

/** Cached EUR→RSD rate for the couple's own private budget/gift displays —
 *  NOT for anything financial/legal, just their own planning estimate.
 *  Refreshes from NBS at most once every 24h; serves the cached value the
 *  rest of the time so a page render never blocks on an external site. */
export async function getEurRate(): Promise<number> {
  const cached = await getCachedEurRateConfig();
  const isStale =
    !cached || Date.now() - cached.updatedAt.getTime() > CACHE_MAX_AGE_MS;
  if (!isStale) return cached.rate;

  const fresh = await fetchNbsEurRate();
  if (fresh) {
    await setCachedEurRateConfig(fresh);
    return fresh;
  }
  return cached?.rate ?? FALLBACK_EUR_RATE;
}