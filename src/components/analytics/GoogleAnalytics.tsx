import Script from "next/script";

/**
 * GA4 gtag.js.
 *
 * Ovo je nedostajalo: `NEXT_PUBLIC_GA_ID` je bio postavljen i lokalno i na
 * Vercelu (sve tri sredine), stream `G-XXTC0TP1H0` je aktivan od 2026-02-10 —
 * ali nijedna skripta nikada nije bila renderovana, pa je `window.gtag` uvek
 * bio `undefined`, `trackEvent` je tiho ništa ne radio, a GA4 je za 90 dana
 * zabeležio 0 događaja i 0 pregleda stranica.
 *
 * Prelaske između stranica ne pratimo ručno: „Enhanced measurement → page
 * changes (History API)" je uključen na stream-u, pa gtag sam šalje `page_view`
 * pri klijentskoj navigaciji. Ručno slanje bi pravilo duple preglede.
 */
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
