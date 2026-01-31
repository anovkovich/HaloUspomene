import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Navbar";
import Footer from "@/components/layout/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://anovkovich.github.io/HaloUspomene";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HALO Uspomene | Uspomene koje ne blede",
    template: "%s | HALO Uspomene",
  },

  description:
    "Sačuvajte glasove najdražih sa vašeg venčanja zauvek. Premium audio guest book servis sa ličnom dostavom, montažom i kompletnom brigom o svakom detalju. Jedinstven poklon koji nadživljava generacije.",

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
    title: "HALO Uspomene | Uspomene koje ne blede",
    description:
      "Premium audio guest book za Vaše događaje. Sačuvajte glasove najdražih zauvek. Dostava brzom poštom na teritoriji cele Srbije ili lična dostava sa montažom govornice u Novom Sadu.",
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
    title: "HALO Uspomene | Uspomene koje ne blede",
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
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },

  alternates: {
    canonical: siteUrl,
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
      "Premium audio guest book servis za venčanja u Srbiji. Lična dostava, profesionalna montaža, digitalni album sa svim porukama gostiju. Sačuvajte glasove najdražih zauvek.",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/gallery/og-image.png`,
    telephone: "+381601234567",
    email: "info@halouspomene.rs",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beograd",
      addressRegion: "Srbija",
      addressCountry: "RS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "44.8176",
      longitude: "20.4633",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Serbia",
      },
      {
        "@type": "City",
        name: "Beograd",
      },
      {
        "@type": "City",
        name: "Novi Sad",
      },
    ],
    priceRange: "$$$",
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
      closes: "21:00",
    },
    sameAs: [
      "https://www.instagram.com/halo_uspomene",
      // Add your social media links when available:
      // "https://www.facebook.com/halouspomene",
      // "https://www.tiktok.com/@halouspomene",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
      reviewCount: "47",
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
              "Kompletna premium usluga: lična dostava, profesionalna montaža, ekskluzivna drvena govornica, personalizovana dobrodošlica i uređen digitalni album.",
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

  return (
    <html lang="sr" data-theme="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
