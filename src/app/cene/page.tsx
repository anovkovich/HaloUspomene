import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title:
    "BESPLATNA Pozivnica za Venčanje — Digitalna Pozivnica + PDF za Štampu | Halo Uspomene",
  description:
    "Besplatna pozivnica za venčanje spremna za štampu uz našu digitalnu website pozivnicu. QR kod za potvrdu dolaska — bez poziva, nikad lakše! Raspored sedenja, audio knjiga utisaka. Od 5.000 din.",
  keywords: [
    "pozivnica za venčanje",
    "pozivnice za vencanje",
    "besplatna pozivnica za venčanje",
    "digitalna pozivnica za vencanje",
    "wedding invitation serbia",
    "pozivnica za svadbu",
    "pozivnice za svadbu",
    "pozivnica za venčanje online",
    "website pozivnica",
    "pozivnica za štampu",
    "elektronska pozivnica za vencanje",
    "pozivnica sa QR kodom",
    "potvrda dolaska na vencanje",
    "RSVP pozivnica",
    "raspored sedenja vencanje",
    "audio knjiga utisaka vencanje",
    "cene pozivnica za vencanje",
    "jeftina pozivnica za vencanje",
    "moderna pozivnica za vencanje",
    "pozivnica za vencanje srbija",
    "pozivnica za vencanje novi sad",
    "pozivnica za vencanje beograd",
  ],
  openGraph: {
    title: "BESPLATNA Pozivnica za Venčanje | Halo Uspomene",
    description:
      "Digitalna pozivnica + besplatna PDF za štampu sa QR kodom za potvrdu dolaska. Raspored sedenja, audio knjiga utisaka — sve na jednom mestu.",
    type: "website",
    url: "https://halouspomene.rs/cene",
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "BESPLATNA Pozivnica za Venčanje | Halo Uspomene",
    description:
      "Digitalna pozivnica + besplatna PDF za štampu sa QR kodom za potvrdu dolaska. Od 5.000 din.",
  },
  alternates: {
    canonical: "https://halouspomene.rs/cene",
  },
};

function PricingStructuredData() {
  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: "RSD",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "RS",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
    },
  };

  const returnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "RS",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  };

  const offerDefaults = {
    priceCurrency: "RSD",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Halo Uspomene" },
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Website Pozivnica za Venčanje",
    description:
      "Digitalna pozivnica za venčanje sa besplatnom PDF verzijom za štampu, QR kodom za potvrdu dolaska, rasporedom sedenja i audio knjigom utisaka.",
    image: "https://halouspomene.rs/cene/opengraph-image",
    brand: {
      "@type": "Brand",
      name: "Halo Uspomene",
    },
    url: "https://halouspomene.rs/cene",
    offers: [
      {
        "@type": "Offer",
        name: "Website Pozivnica",
        price: "5000",
        description:
          "Personalizovana web stranica za venčanje sa RSVP formom, odbrojavanjem i besplatnom PDF pozivnicom za štampu.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Raspored Sedenja",
        price: "2000",
        description:
          "Drag-and-drop editor za raspored stolova. Gosti pronalaze svoje mesto putem linka.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Digitalna Audio Knjiga Utisaka",
        price: "3000",
        description:
          "Gosti skeniraju QR kod i snimaju audio poruke za mladence direktno sa telefona.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Kompletni Paket",
        price: "8000",
        description:
          "Website pozivnica + raspored sedenja + digitalna audio knjiga — sve u jednom po sniženoj ceni.",
        ...offerDefaults,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FAQStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Da li je PDF pozivnica za štampu besplatna?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Da, PDF pozivnica za štampu u A5 formatu je potpuno besplatna uz svaku website pozivnicu. Sadrži sve detalje venčanja i QR kod za potvrdu dolaska.",
        },
      },
      {
        "@type": "Question",
        name: "Koliko košta digitalna pozivnica za venčanje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Website pozivnica košta 5.000 dinara i uključuje besplatnu PDF pozivnicu za štampu. Kompletni paket sa rasporedom sedenja i audio knjigom utisaka košta 8.000 dinara.",
        },
      },
      {
        "@type": "Question",
        name: "Kako funkcioniše potvrda dolaska na venčanje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gosti skeniraju QR kod sa pozivnice ili otvore link i popunjavaju RSVP formu — potvrđuju dolazak, broj osoba i ostavljaju poruku. Vi pratite sve potvrde u realnom vremenu kroz portal.",
        },
      },
      {
        "@type": "Question",
        name: "Šta je digitalna audio knjiga utisaka?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gosti skeniraju QR kod i snimaju audio poruke za mladence direktno sa svog telefona — bez aplikacije, bez registracije. Vi dobijate sve snimke u portalu. Dostupna je i opcija sa fizičkim retro telefonom.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function CenePage() {
  return (
    <>
      <PricingStructuredData />
      <FAQStructuredData />
      <PricingClient />

      {/* Hidden SEO content — server-rendered, visible to crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h2>Cene website pozivnice za venčanje — besplatna PDF pozivnica za štampu</h2>
        <p>
          HALO Uspomene nudi digitalne website pozivnice za venčanja u Srbiji po ceni od 5.000
          dinara. Svaka pozivnica uključuje besplatnu PDF verziju za štampu sa QR kodom za
          potvrdu dolaska gostiju — bez telefonskih poziva, bez komplikacija.
        </p>
        <h3>Šta je uključeno u website pozivnicu za venčanje?</h3>
        <ul>
          <li>Personalizovana web stranica sa animacijama i odbrojavanjem do venčanja</li>
          <li>RSVP forma za online potvrdu dolaska gostiju</li>
          <li>Besplatna PDF pozivnica za štampu u A5 formatu sa QR kodom</li>
          <li>Program dana venčanja sa lokacijom na mapi</li>
          <li>Podrška za latinicu i ćirilicu</li>
          <li>Optimizovano za mobilne uređaje</li>
        </ul>
        <h3>Dodatne usluge i cene</h3>
        <p>
          Raspored sedenja za venčanje: 2.000 dinara — drag-and-drop editor za stolove,
          gosti pronalaze svoje mesto putem linka. Digitalna audio knjiga utisaka: 3.000 dinara
          — gosti skeniraju QR kod i snimaju audio poruke za mladence direktno sa telefona.
          Kompletni paket (pozivnica + raspored + audio knjiga): 8.000 dinara umesto 10.000 dinara.
        </p>
        <h3>Pozivnice za venčanje — gradovi u Srbiji</h3>
        <p>
          Pozivnica za venčanje Beograd, pozivnica za venčanje Novi Sad, pozivnica za svadbu Niš,
          pozivnica za venčanje Kragujevac, Subotica, Zrenjanin, Pančevo, Čačak, Kraljevo,
          Leskovac, Vranje, Valjevo, Šabac, Sombor, Kikinda. Pozivnice za sva venčanja u Srbiji.
        </p>
        <h3>Besplatna pozivnica za venčanje za štampu</h3>
        <p>
          Uz svaku digitalnu pozivnicu dobijate besplatnu elegantnu pozivnicu u PDF formatu
          koju možete odštampati. PDF pozivnica sadrži imena mladenaca, datum i mesto venčanja,
          program dana i QR kod koji gosti mogu skenirati da potvrde dolazak online.
          Nikad lakše — bez poziva, bez papirnih formulara.
        </p>
        <h3>Digitalna audio knjiga utisaka za venčanje</h3>
        <p>
          Audio knjiga utisaka je moderna alternativa tradicionalnoj knjizi utisaka.
          Gosti skeniraju QR kod na venčanju i snimaju audio poruke direktno sa svog telefona
          — bez aplikacije, bez registracije. Dostupna je i opcija sa fizičkim retro telefonom
          za potpuno autentično iskustvo. USB retro kaseta (2.500 din) i USB u bočici (2.000 din)
          su dostupni kao fizički suveniri sa svim snimljenim porukama.
        </p>
      </div>
    </>
  );
}
