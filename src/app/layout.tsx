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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HALO Uspomene | Audio Guest Book za Venčanja i Proslave",
    template: "%s | HALO Uspomene",
  },

  description:
    "Prvi audio guest book u Srbiji. Sačuvajte glasove i emocije vaših gostiju na venčanju, rođendanu ili proslavi. Iznajmljivanje retro telefona za nezaboravne uspomene.",

  keywords: [
    "audio guest book",
    "audio guestbook Srbija",
    "retro telefon za venčanje",
    "knjiga utisaka",
    "venčanje",
    "wedding guest book",
    "audio poruke venčanje",
    "iznajmljivanje telefona",
    "uspomene sa venčanja",
    "vintage telefon",
    "Beograd",
    "Srbija",
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
    title: "HALO Uspomene | Audio Guest Book za Venčanja i Proslave",
    description:
      "Prvi audio guest book u Srbiji. Sačuvajte glasove i emocije vaših gostiju zauvek uz naš autentični retro telefon.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HALO Uspomene - Audio Guest Book",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HALO Uspomene | Audio Guest Book",
    description:
      "Prvi audio guest book u Srbiji. Sačuvajte glasove vaših gostiju zauvek.",
    images: ["/images/og-image.jpg"],
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
  // JSON-LD Structured Data for LocalBusiness
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: "HALO Uspomene",
    description:
      "Audio guest book servis za venčanja i proslave. Iznajmljivanje retro telefona za snimanje audio poruka gostiju.",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/og-image.jpg`,
    telephone: "+381601234567",
    email: "info@halouspomene.rs",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beograd",
      addressCountry: "RS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "44.8176",
      longitude: "20.4633",
    },
    areaServed: {
      "@type": "Country",
      name: "Serbia",
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    sameAs: [
      // Add your social media links when available:
      // "https://www.instagram.com/halouspomene",
      // "https://www.facebook.com/halouspomene",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "24",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Audio Guest Book Paketi",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Classic Paket",
            description: "Iznajmljivanje retro telefona sa dostavom poštom",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Premium Paket",
            description: "Lična dostava, montaža i ekskluzivna drvena govornica",
          },
        },
      ],
    },
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
