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
import { Toaster } from "sonner";
import { testimonials } from "@/data/testimonials";
import { RecaptchaProvider } from "@/components/forms/RecaptchaProvider";

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
      "HALO Uspomene — Sve za Venčanje: Pozivnice, QR Pano, Audio...",
    template: "%s | HALO Uspomene",
  },

  description:
    "Sve za venčanje u Srbiji na jednom mestu: web i Premium AI pozivnice, QR Pano raspored sedenja, audio knjiga uspomena, planer i vendori.",

  keywords: [
    // Platform / brand
    "halo uspomene",
    "platforma za venčanje",
    "sve za venčanje",
    "organizacija venčanja Srbija",
    "venčanje u Srbiji",

    // Website pozivnice / Web invitations
    "website pozivnice",
    "website pozivnice Srbija",
    "website pozivnice za venčanje",
    "web pozivnice",
    "elektronske pozivnice",
    "pozivnice sa RSVP",
    "interaktivne pozivnice",
    "personalizovane pozivnice",
    "pozivnice sa odbrojavanje",
    "online pozivnice",
    "e-pozivnice",
    "digitalne pozivnice za venčanje",

    // Premium AI pozivnice
    "premium pozivnice",
    "AI pozivnice za venčanje",
    "luksuzne pozivnice",
    "pozivnice sa AI ilustracijom",
    "akvarel pozivnice",

    // QR Pano / Raspored sedenja
    "QR pano dobrodošlice",
    "raspored sedenja",
    "raspored sedenja za venčanje",
    "digitalni raspored sedenja",
    "QR kod za salu",
    "pametan raspored sedenja",
    "drag and drop raspored sedenja",

    // Audio uspomene / Audio Guest Book
    "audio guest book",
    "audio guest book Srbija",
    "audio guest book Beograd",
    "audio knjiga uspomena",
    "audio knjiga utisaka",
    "audio spomenar",
    "telefon uspomena",
    "retro telefon za venčanje",
    "vintage telefon za venčanje",
    "iznajmljivanje retro telefona",
    "telefon za glasovne poruke",
    "digitalni audio guest book",

    // Moje Venčanje planer
    "planer za venčanje",
    "online planer venčanje",
    "checklista za venčanje",
    "budžet kalkulator za venčanje",
    "moje venčanje",
    "besplatan planer venčanje",

    // Vendori
    "vendori za venčanje",
    "vendori za venčanje Srbija",
    "direktorijum vendora venčanje",

    // Dečji rođendani / punoletstvo
    "dečje pozivnice",
    "pozivnice za dečji rođendan",
    "pozivnice za punoletstvo",

    // Geo
    "venčanje Beograd",
    "venčanje Novi Sad",
    "venčanje Niš",
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
    title: "HALO Uspomene — Sve za Venčanje na Jednom Mestu",
    description:
      "Web i Premium AI pozivnice, QR Pano raspored sedenja, audio knjiga uspomena, planer venčanja i direktorijum vendora — sve za vaše venčanje u Srbiji.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "HALO Uspomene — platforma za venčanja u Srbiji",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HALO Uspomene — Sve za Venčanje na Jednom Mestu",
    description:
      "Web i Premium AI pozivnice, QR Pano raspored sedenja, audio knjiga uspomena, planer i vendori — sve za venčanje u Srbiji.",
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
      "HALO Uspomene Platforma za Venčanja",
      "Website Pozivnice",
      "Premium AI Pozivnice",
      "QR Pano Dobrodošlice",
      "Raspored Sedenja",
      "Audio Guest Book Srbija",
      "Audio Knjiga Uspomena",
      "Audio Knjiga Utisaka",
      "Telefon Uspomena",
      "Retro Telefon za Venčanja",
      "Moje Venčanje Planer",
      "Direktorijum Vendora za Venčanje",
    ],
    description:
      "HALO Uspomene — sveobuhvatna platforma za venčanja u Srbiji: web i Premium AI pozivnice sa RSVP, QR Pano raspored sedenja, audio knjiga uspomena (digitalna i preko retro telefona), planer venčanja i direktorijum vendora.",
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
                "Iznajmljivanje retro telefona sa brojčanikom za venčanja. Audio knjiga uspomena, audio uspomene sa kurirskom dostavom, elegantno uputstvo i svi audio snimci u digitalnom formatu.",
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
      {
        "@type": "OfferCatalog",
        name: "Premium AI Pozivnice za Venčanja",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Premium AI Pozivnica — Akvarel Tema",
              description:
                "Luksuzna pozivnica za venčanje sa AI generisanom akvarel ilustracijom para, parallax hero sekcijom, animiranim envelope-om i vintage automobilima.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Premium AI Pozivnica — Line-Art Tema",
              description:
                "Luksuzna pozivnica sa line-art AI ilustracijom para i glassmorphism dizajnom. Personalizovan grad i sakralni spomenici uključeni.",
            },
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "QR Pano Dobrodošlice — Pametan Raspored Sedenja",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "QR Pano Dobrodošlice",
              description:
                "Pametan raspored sedenja za venčanja kroz štampani QR pano za ulaz u salu. Gosti sami pronalaze svoje mesto skeniranjem koda — bez hostesa i spiskova. Drag and drop editor za stolove uključen.",
            },
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Moje Venčanje — Besplatan Planer Venčanja",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Moje Venčanje Planer",
              description:
                "Besplatan online planer za venčanje uz svaku pozivnicu: checklista zadataka po vremenskim grupama, budžet kalkulator sa EUR/RSD konverzijom, RSVP praćenje i pristup direktorijumu vendora.",
            },
            price: "0",
            priceCurrency: "RSD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Direktorijum Vendora za Venčanje",
              description:
                "Pregled proverenih vendora za venčanje u Srbiji: sale, muzika (bendovi i DJ), fotografi, torte, dekoracija, cveće, vatromet, venčanice, šminka, burme i pokloni za goste.",
            },
          },
        ],
      },
    ],
    knowsAbout: [
      // Website / digital invitations
      "Website pozivnice",
      "Web pozivnice",
      "E-pozivnice",
      "Elektronske pozivnice",
      "Pozivnice sa RSVP",
      "Pozivnice sa odbrojavanje",
      "Interaktivne pozivnice",
      "Personalizovane pozivnice",
      "Online pozivnice",

      // Premium AI pozivnice
      "Premium AI pozivnice",
      "Pozivnice sa AI ilustracijom",
      "Luksuzne pozivnice",
      "Akvarel pozivnice",
      "Line-art pozivnice",

      // Raspored sedenja / QR Pano
      "QR Pano dobrodošlice",
      "Raspored sedenja",
      "Digitalni raspored sedenja",
      "Drag and drop raspored sedenja",
      "Pametan raspored sedenja",

      // Audio guest book
      "Audio guest book",
      "Audio knjiga uspomena",
      "Audio knjiga utisaka",
      "Audio spomenar",
      "Telefon uspomena",
      "Retro telefon za venčanje",
      "Vintage telefon sa brojčanikom",
      "Iznajmljivanje retro telefona",
      "Digitalni audio guest book",

      // Moje Venčanje planer
      "Planer za venčanje",
      "Online planer venčanje",
      "Checklista za venčanje",
      "Budžet kalkulator za venčanje",
      "Direktorijum vendora za venčanje",

      // Dečje pozivnice / punoletstvo
      "Dečje pozivnice",
      "Pozivnice za rođendan",
      "Pozivnice za punoletstvo",

      // General
      "Wedding services",
      "Wedding planning",
      "Event planning",
      "Audio recording",
      "Digital wedding invitations",
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
      "HALO Uspomene — sveobuhvatna platforma za organizaciju venčanja u Srbiji: web i Premium AI pozivnice, QR Pano raspored sedenja, audio knjiga uspomena, planer venčanja i direktorijum vendora.",
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
      "HALO Uspomene — platforma za organizaciju venčanja u Srbiji: web i Premium AI pozivnice, QR Pano raspored sedenja, audio knjiga uspomena, planer i vendori.",
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
        <RecaptchaProvider>{children}</RecaptchaProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#232323",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
              padding: "0.625rem 1rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              maxWidth: "20rem",
              textAlign: "center",
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
