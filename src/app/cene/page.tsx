
import type { Metadata } from "next";
import Link from "next/link";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Cene Digitalnih Pozivnica i Paketa za Venčanje",
  description:
    "Tri paketa za venčanje: Osnovno (5.000 din), Kompletno (9.900 din) i Premium. Pozivnica, raspored sedenja, QR galerija i gratis PDF za štampu.",
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
    title: "Paketi i Cene za Venčanje | HALO Uspomene",
    description:
      "Tri paketa za venčanje: Osnovno, Kompletno i Premium. Pozivnica, raspored sedenja, QR galerija i audio knjiga utisaka — izaberite gotov paket ili sastavite svoj.",
    type: "website",
    url: "https://halouspomene.rs/cene",
    siteName: "Halo Uspomene",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cenovnik standardne i premium pozivnice sa dodatnim opcijama",
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
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 0,
        unitCode: "DAY",
      },
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
          "Personalizovana web stranica za venčanje sa formom za potvrdu dolaska, odbrojavanjem i besplatnom PDF pozivnicom za štampu.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Raspored Sedenja",
        price: "2500",
        description:
          "Alat za raspored stolova. Gosti pronalaze svoje mesto putem linka.",
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
        name: "Kompletno Venčanje",
        price: "9900",
        description:
          "Website pozivnica + raspored sedenja + audio knjiga utisaka + QR galerija fotografija — sve u jednom po sniženoj ceni.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Premium Pozivnica",
        price: "10000",
        description:
          "Luksuzna animirana premium pozivnica u 3 stila, sa animiranim kovertom i filmskim parallax scenama.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "Raspored Sedenja — samostalno",
        price: "5000",
        description:
          "Raspored sedenja za organizatore događaja, bez digitalne pozivnice.",
        ...offerDefaults,
      },
      {
        "@type": "Offer",
        name: "QR Galerija Fotografija — samostalno",
        price: "3500",
        description:
          "Gosti skeniraju QR kod sa zahvalnice i dodaju svoje fotografije sa venčanja.",
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
          text: "Website pozivnica košta 5.000 dinara i uključuje besplatnu PDF pozivnicu za štampu. Kompletno Venčanje (pozivnica + raspored sedenja + audio knjiga utisaka + QR galerija fotografija) košta 9.900 dinara.",
        },
      },
      {
        "@type": "Question",
        name: "Kako funkcioniše potvrda dolaska na venčanje?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gosti skeniraju QR kod sa pozivnice ili otvore link i popunjavaju formu za potvrdu dolaska — potvrđuju dolazak, broj osoba i ostavljaju poruku. Vi pratite sve potvrde u realnom vremenu kroz portal.",
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

export default async function CenePage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  // Čita se na serveru da bi `PricingClient` mogao da se server-renderuje —
  // v. komentar uz `PricingClient`.
  const initialMode =
    (await searchParams).premium === "1" ? "premium" : "classic";

  return (
    <>
      <PricingStructuredData />
      <FAQStructuredData />
      {/* Bez `<Suspense>`: komponenta više ne koristi `useSearchParams()`, pa
          se ceo cenovnik server-renderuje i stoji u HTML-u. Ne vraćati Suspense
          bez čitanja komentara u `PricingClient.tsx`. */}
      <PricingClient initialMode={initialMode} />

      {/* Ranije je ovde stajao `sr-only` blok od 332 reči. Sadržaj je bio
          duplikat: cene i spisak usluga sada stoje vidljivo u konfiguratoru
          iznad (stranica je do jutros imala 339 reči jer se uopšte nije
          server-renderovala), a spisak od 15 gradova je bio golo nabrajanje
          ključnih reči — gradske stranice ionako žive na `/lokacije`.
          Zadržana su jedino dva objašnjenja koja nose stvaran podatak, i to
          VIDLJIVO, jer skriven tekst Google gotovo ne vrednuje. */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-6 font-serif text-2xl text-[#232323] sm:text-3xl">
          Dva pitanja koja se najčešće ponavljaju
        </h2>

        <h3 className="font-serif text-lg text-[#232323]">
          Šta tačno dobijate uz PDF pozivnicu za štampu
        </h3>
        <p className="mt-2 leading-relaxed text-[#232323]/70">
          PDF pozivnica je u A5 formatu i sadrži imena mladenaca, datum i mesto
          venčanja, program dana i QR kod. Gost koji skenira taj kod stiže na
          vašu web pozivnicu i tu potvrđuje dolazak — dakle papir za ruke, a
          potvrde i dalje stižu same. Odštampate je u štampariji ili kod kuće,
          a uz nju ide i poseban popust na ručno rađene štampane pozivnice i
          zahvalnice sa QR kodovima.
        </p>

        <h3 className="mt-6 font-serif text-lg text-[#232323]">
          Kako radi digitalna audio knjiga utisaka
        </h3>
        <p className="mt-2 leading-relaxed text-[#232323]/70">
          Gosti skeniraju QR kod na stolu i snimaju glasovnu poruku pravo sa
          svog telefona — bez aplikacije i bez registracije. Sve snimke
          preuzimate iz portala. Ako želite autentičniji doživljaj, isto radi i
          vintage retro telefon sa brojčanikom, a snimljene poruke mogu da se
          dobiju i kao fizički suvenir: retro kaseta sa USB-om ili uspomene u
          bočici.
        </p>

        <p className="mt-8 text-sm text-[#232323]/55">
          Radimo u celoj Srbiji — digitalni proizvodi svuda, a retro telefon i
          QR pano šaljemo kurirskom službom. Pregled po gradovima je na stranici{" "}
          <Link
            href="/lokacije"
            className="font-medium text-[#AE343F] hover:underline"
          >
            dostupni gradovi
          </Link>
          .
        </p>
      </section>
    </>
  );
}
