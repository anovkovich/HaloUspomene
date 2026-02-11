import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Great_Vibes,
  Dancing_Script,
  Alex_Brush,
  Parisienne,
  Allura,
  Marck_Script,
  Caveat,
  Bad_Script,
  Cormorant_Garamond,
  Josefin_Sans,
} from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { testimonials } from "@/data/testimonials";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Wedding script fonts
const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  weight: "400",
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  weight: "400",
  variable: "--font-alex-brush",
  subsets: ["latin"],
  display: "swap",
});

const parisienne = Parisienne({
  weight: "400",
  variable: "--font-parisienne",
  subsets: ["latin"],
  display: "swap",
});

const allura = Allura({
  weight: "400",
  variable: "--font-allura",
  subsets: ["latin"],
  display: "swap",
});

// Cyrillic script fonts
const marckScript = Marck_Script({
  weight: "400",
  variable: "--font-marck-script",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const caveat = Caveat({
  weight: "400",
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const badScript = Bad_Script({
  weight: "400",
  variable: "--font-bad-script",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const josefinSans = Josefin_Sans({
  weight: ["300", "400"],
  variable: "--font-elegant",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HALO Uspomene | Reči koje postaju uspomena",
    template: "%s | HALO Uspomene",
  },

  description:
    "Premium iskustvo za čuvanje uspomena sa venčanja i posebnih događaja. Sačuvajte glasove najdražih i vratite se tim trenucima kad god poželite. Dostava u celoj Srbiji i lična instalacija u Novom Sadu.",

  keywords: [
    "audio guest book venčanje",
    "audio guestbook Srbija",
    "knjiga utisaka za venčanje",
    "vintage telefon venčanje",
    "wedding guest book Serbia",
    "iznajmljivanje retro telefona",
    "audio poruke sa venčanja",
    "uspomene sa venčanja",
    "originalan poklon za mladence",
    "sačuvaj glasove sa svadbe",
    "audio uspomene Beograd",
    "venčanje ideje Srbija",
  ],

  authors: [{ name: "HALO Uspomene" }],
  creator: "HALO Uspomene",
  publisher: "HALO Uspomene",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: siteUrl,
    siteName: "HALO Uspomene",
    title: "HALO Uspomene | Reči koje postaju uspomena",
    description:
      "Premium iskustvo za čuvanje uspomena sa venčanja i posebnih događaja. Sačuvajte glasove najdražih i vratite se tim trenucima kad god poželite. Dostava u celoj Srbiji i lična instalacija u Novom Sadu.",
    images: [
      {
        url: "/images/gallery/og-image.png",
        width: 1200,
        height: 630,
        alt: "HALO Uspomene - Audio Guest Book za Venčanja",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HALO Uspomene | Reči koje postaju uspomena",
    description:
      "Zamislite da za nekoliko godina ponovo čujete kako vam baka čestita venčanje. Mi to omogućavamo.",
    images: ["/images/gallery/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google:
      "google-site-verification=WCTG9ozG2RETseK0m-TaZnr7bTyzcW8CPouqW2lmTb8",
    // yandex: "your-yandex-verification-code",
  },

  alternates: {
    canonical: siteUrl,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/images/icon-192.png", sizes: "192x192" }],
  },

  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for LocalBusiness + Service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: "HALO Uspomene",
    description:
      "Premium iskustvo za čuvanje uspomena sa venčanja i posebnih događaja. Sačuvajte glasove najdražih i vratite se tim trenucima kad god poželite. Dostava u celoj Srbiji i lična instalacija u Novom Sadu.",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/gallery/og-image.png`,
    // telephone: "+381601234567",
    // email: "info@halouspomene.rs",
    email: "aleksa.novkovic98@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Novi Sad",
      addressRegion: "Srbija",
      addressCountry: "RS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "45.25167",
      longitude: "19.83694",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Serbia",
      },
      {
        "@type": "City",
        name: "Novi Sad",
      },
      {
        "@type": "City",
        name: "Beograd",
      },
    ],
    // priceRange: "$$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "23:00",
    },
    sameAs: ["https://www.instagram.com/halo_uspomene"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "5",
      reviewCount: "3",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Audio Guest Book Paketi za Venčanja",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Essential Paket",
            description:
              "Autentični vintage telefon sa kurirskom dostavom, elegantno uputstvo i svi audio snimci u digitalnom formatu.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Full Service Paket",
            description:
              "Kompletna premium usluga: lična dostava, profesionalna montaža, ekskluzivna drvena govornica, personalizovana dobrodošlica.",
          },
        },
      ],
    },
    knowsAbout: [
      "Audio guest book",
      "Wedding services",
      "Event planning",
      "Audio recording",
      "Vintage telephone rental",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "HALO Uspomene",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description:
      "HALO Uspomene je premium audio guest book servis za venčanja i posebne događaje u Srbiji. Dostava u celoj Srbiji.",
    sameAs: ["https://www.instagram.com/halo_uspomene"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Serbian", "English"],
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "HALO Uspomene",
    url: siteUrl,
    description:
      "Audio guest book za venčanja u Srbiji — sačuvajte glasove najdražih zauvek.",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "sr",
  };

  const reviewSchemas = testimonials.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: t.coupleName },
    datePublished: `2025-${String(["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"].indexOf(t.date.split(" ")[0].slice(0, 3)) + 1).padStart(2, "0")}-01`,
    reviewBody: t.quote,
    reviewRating: {
      "@type": "Rating",
      ratingValue: t.rating,
      bestRating: 5,
    },
    itemReviewed: { "@id": `${siteUrl}/#business` },
  }));

  return (
    <html lang="sr" data-theme="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchemas) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        {clarityId && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  let t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  let y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${dancingScript.variable} ${alexBrush.variable} ${parisienne.variable} ${allura.variable} ${marckScript.variable} ${caveat.variable} ${badScript.variable} ${cormorantGaramond.variable} ${josefinSans.variable} antialiased`}
      >
        {children}
        {gaId && <AnalyticsProvider />}
      </body>
    </html>
  );
}
