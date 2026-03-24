import type { Metadata, Viewport } from "next";
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
  Raleway,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const raleway = Raleway({
  weight: ["300", "400", "500", "600"],
  variable: "--font-raleway",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Website Pozivnice i Audio Knjiga Uspomena Srbija | Audio Guest Book + Website pozivnice | HALO Uspomene",
    template: "%s | HALO Uspomene",
  },

  description:
    "HALO Uspomene — website pozivnice i telefon uspomena za venčanja u Srbiji. Kreirajte personalizovane web pozivnice i iznajmite retro telefon za glasovne poruke gostiju. Audio guest book (telefon uspomena), i interaktivne pozivnice sa odbrojavanje. Dostava u Beograd, i sve gradove.",

  keywords: [
    // Audio uspomene / Audio Guest Book
    "audio uspomene",
    "audio guest book venčanje",
    "audio guestbook Srbija",
    "telefon uspomena",
    "telefon uspomena Beograd",
    "audio uspomene Beograd",
    "audio uspomene Novi Sad",
    "retro telefon",
    "retro telefon za venčanje",
    "retro telefon za svadbe",
    "vintage telefon venčanje",
    "telefon za glasovne poruke",
    "audio guest book",
    "iznajmljivanje retro telefona",
    "audio poruke sa venčanja",
    "sačuvaj glasove sa svadbe",
    "telefon za poruke na svadbi",
    "audio knjiga utisaka",
    "audio knjiga uspomena",
    "audio guestbook rental Serbia",
    "retro phone guest book",
    "audio guest book cena",
    "cena iznajmljivanja telefona za svadbu",
    "rezervacija audio telefona za venčanje",
    "telefon sa rotirajućim brojčanikom za svadbe",
    "svadbeni telefon za glasovne poruke",
    "audio spomenar za venčanja",
    "beli retro telefon za venčanje",
    "retro telefon za svadbe",
    "dekorativni telefon za slikanje i poruke",
    "audio guest book Beograd",
    "audio guest book Novi Sad",
    "retro telefon za poruke gostiju",
    "audio uspomene sa venčanja",
    "kjiga utisaka za venčanje",
    "telefon za snimanje poruka na svadbi",
    "vintage telefon za venčanje iznajmljivanje",

    // Website pozivnice / Web invitations
    "website pozivnice",
    "website pozivnice Srbija",
    "website pozivnice za venčanje",
    "web pozivnice",
    "web invitations",
    "elektronske pozivnice",
    "pozivnice sa RSVP",
    "interaktivne pozivnice",
    "personalizovane pozivnice",
    "pozivnice sa odbrojavanje",
    "dinamičke pozivnice",
    "online pozivnice",
    "website pozivnice sa audio",
    "pozivnice sa glasovnom porukom",
    "e-pozivnice",
    "smernice za website pozivnice",
    "originalne ideje za venčanja",

    // Combined / General
    "moderne ideje za venčanja 2026",
    "venčanje ideje Srbija",
    "audio guest book za rođendan",
    "wedding phone Serbia",
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
    title:
      "Website Pozivnice i Audio Knjiga Uspomena za Venčanja | HALO Uspomene Srbija",
    description:
      "HALO Uspomene — website pozivnice i telefon uspomena za venčanja u Srbiji. Kreirajte personalizovane web pozivnice i iznajmite retro telefon za glasovne poruke gostiju. Audio guest book (telefon uspomena), i interaktivne pozivnice sa odbrojavanje. Dostava u Beograd, i sve gradove.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "HALO Uspomene - Audio Guest Book za Venčanja",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Website Pozivnice i Audio Knjiga Uspomena | HALO Uspomene Srbija",
    description:
      "Website pozivnice i telefon uspomena za venčanja u Srbiji. Kreirajte web pozivnice sa RSVP ili iznajmite retro telefon za glasovne poruke. Audio guest book dostava u Beograd, i sve gradove.",
    images: ["/images/og-image.png"],
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
    alternateName: [
      "Audio Guest Book Srbija",
      "Audio Knjiga Utisaka",
      "Audio Knjiga Uspomena",
      "Audio Uspomene",
      "Telefon Uspomena",
      "Telefon za Poruke na Svadbi",
      "Retro Telefon za Venčanja",
      "Website Pozivnice",
      "Web Pozivnice",
      "E-Pozivnice",
    ],
    description:
      "HALO Uspomene — premium servisi za venčanja: kreirajte website pozivnice sa RSVP ili iznajmite audio guest book za glasovne poruke gostiju. Audio uspomene, web pozivnice, telefon uspomena sa dostavom u celoj Srbiji.",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/og-image.png`,
    // telephone: "+381601234567",
    // email: "info@halouspomene.rs",
    email: "halouspomene@gmail.com",
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
    hasOfferCatalog: [
      {
        "@type": "OfferCatalog",
        name: "Audio Guest Book Paketi za Venčanja",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Audio Guest Book Paket",
              description:
                "Iznajmljivanje retro telefona sa rotirajućim brojčanikom za venčanja. Audio knjiga uspomena, audio uspomene sa kurirskom dostavom, elegantno uputstvo i svi audio snimci u digitalnom formatu.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Audio Guest Book — Lična dostava u Novom Sadu",
              description:
                "Audio guest book sa kurirskom dostavom u celoj Srbiji. Lična dostava i montaža dostupna u Novom Sadu. Personalizovana audio dobrodošlica kao dodatna opcija. Svadbeni telefon za glasovne poruke gostiju.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Rezervacija Audio Telefona za Venčanje",
              description:
                "Rezervišite vintage retro telefon za poruke gostiju na venčanju. Dostava u Beograd, Novi Sad, Niš, Kragujevac, Suboticu i sve gradove u Srbiji. Audio uspomene cena po dogovoru.",
            },
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Website Pozivnice Paketi za Venčanja",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Pozivnica",
              description:
                "Kreirajte personalizovanu website pozivnicu za venčanje sa RSVP formom, odbrojavanjem, galerijom fotografija i mapom lokacije. Web pozivnice sa integrisanom glasovnom porukom.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Interaktivna Web Pozivnica",
              description:
                "Premium website pozivnica sa temama, kustomnim fontovima, animacijama i mogućnostima za gostiju da ostave poruke. E-pozivnice sa RSVP praćenjem.",
            },
          },
        ],
      },
    ],
    knowsAbout: [
      // Audio memories service
      "Audio uspomene",
      "Audio guest book",
      "Audio knjiga utisaka",
      "Audio knjiga uspomena",
      "Audio spomenar",
      "Telefon uspomena",
      "Telefon za poruke na svadbi",
      "Vintage telefon sa rotirajućim brojčanikom",
      "Retro telefon za svadbe",
      "Svadbeni telefon za glasovne poruke",
      "Dekorativni telefon za venčanja",
      "Retro phone guest book",
      "Retro telefon",
      "Iznajmljivanje retro telefona za svadbe",
      "Beli retro telefon za venčanje",

      // Digital invitations service
      "Website pozivnice",
      "Web pozivnice",
      "E-pozivnice",
      "Elektronske pozivnice",
      "RSVP forma",
      "Pozivnice sa odbrojavanje",
      "Interaktivne pozivnice",
      "Personalizovane pozivnice",
      "Online pozivnice",
      "Digital wedding invitations",
      "Web invitations with RSVP",

      // General
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
      "HALO Uspomene — kreirajte website pozivnice sa RSVP formom i audio uspomene (audio guest book) za venčanja u Srbiji. Telefon uspomena, web pozivnice sa odbrojavanje i interaktivnim mogućnostima. Dostava u celoj Srbiji.",
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
      "HALO Uspomene — kreirajte website pozivnice sa RSVP formom ili iznajmite audio guest book za venčanja. Audio uspomene i web pozivnice u Srbiji.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${dancingScript.variable} ${alexBrush.variable} ${parisienne.variable} ${allura.variable} ${marckScript.variable} ${caveat.variable} ${badScript.variable} ${cormorantGaramond.variable} ${josefinSans.variable} ${raleway.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
