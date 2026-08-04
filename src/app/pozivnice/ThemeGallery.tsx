import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ThemePreview from "@/components/ui/ThemePreview";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";

interface GalleryTheme {
  name: string;
  poster: string;
  video: string;
  href: string;
  desc: string;
  premium?: boolean;
}

const classicThemes: GalleryTheme[] = [
  {
    name: "Classic Rose",
    poster: "/videos/poz-rose-poster.webp",
    video: "/videos/poz-rose.webm",
    href: "/pozivnica/ana-dejan",
    desc: "Romantična tema u nežnim tonovima ruže — za venčanja puna emocije.",
  },
  {
    name: "Luxury Gold",
    poster: "/videos/poz-gold-poster.webp",
    video: "/videos/poz-gold.webm",
    href: "/pozivnica/ana-dejan",
    desc: "Raskošni zlatni detalji i svečana atmosfera — elegancija bez kompromisa.",
  },
  {
    name: "Modern Blue",
    poster: "/videos/poz-blue-poster.webp",
    video: "/videos/poz-blue.webm",
    href: "/pozivnica/ana-dejan",
    desc: "Čiste linije i smirena plava — za parove koji vole moderan izraz.",
  },
];

const premiumThemes: GalleryTheme[] = [
  {
    name: "Watercolor",
    poster: "/videos/pre-watercolor-poster.webp",
    video: "/videos/pre-watercolor.webm",
    href: "/premium-pozivnica/teodora-bojan",
    desc: "Animirana scena kao iz filma — retro automobil po izboru i pozadina vašeg mesta venčanja.",
    premium: true,
  },
  {
    name: "Parallax",
    poster: "/videos/pre-paper-poster.webp",
    video: "/videos/pre-paper.webm",
    href: "/premium-pozivnica/ana-marko",
    desc: "Papirni svet sa vašom ilustracijom u centru pažnje — više slojeva i paralaks dubina, pozivnica koja se pri skrolovanju otvara kao animirana pozornica.",
    premium: true,
  },
  {
    name: "Fountain",
    poster: "/videos/pre-burgundy-poster.webp",
    video: "/videos/pre-burgundy.webm",
    href: "/premium-pozivnica/milica-nikola",
    desc: "Kraljevski bordo tonovi, animirana fontana i par belih golubova koji polete pri otvaranju pozivnice.",
    premium: true,
  },
];

const allThemes = [...classicThemes, ...premiumThemes];

function altFor(t: GalleryTheme) {
  return t.premium
    ? `Premium digitalna pozivnica za venčanje — tema ${t.name}`
    : `Website pozivnica za venčanje — tema ${t.name}`;
}

const gallerySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Teme website pozivnica za venčanje",
  description:
    "Galerija tema digitalnih pozivnica za venčanje — klasične i premium teme, svaka sa demo pozivnicom uživo.",
  itemListElement: allThemes.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "ImageObject",
      name: altFor(t),
      contentUrl: `${siteUrl}${t.poster}`,
      description: t.desc,
    },
  })),
};

function ThemeCard({ theme }: { theme: GalleryTheme }) {
  return (
    <article className="flex flex-col items-center text-center bg-white/[0.06] border border-white/10 rounded-3xl px-5 sm:px-6 pt-7 pb-6 hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-colors">
      {/* Simplified phone frame: dark bezel, notch, screen carries the clip's
          own 135/226 ratio so nothing is cropped. */}
      <div className="relative w-[180px] sm:w-[200px] rounded-[2rem] bg-[#0d0d0d] px-1.5 pt-6 pb-3.5 shadow-2xl">
        <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/10" />
        <ThemePreview
          poster={theme.poster}
          video={theme.video}
          alt={altFor(theme)}
        />
      </div>

      {theme.premium && (
        <span className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/15 text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.18em] rounded-full">
          <Sparkles size={11} />
          Premium
        </span>
      )}

      <h4
        className={`font-serif text-xl text-[#F5F4DC] ${
          theme.premium ? "mt-2" : "mt-5"
        }`}
      >
        {theme.name}
      </h4>
      <p className="mt-1.5 text-sm text-[#F5F4DC]/50 leading-relaxed max-w-[260px]">
        {theme.desc}
      </p>

      <a
        href={theme.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#d4af37] hover:gap-2.5 transition-all"
      >
        Pogledaj temu {theme.name} uživo
        <ArrowRight size={14} />
      </a>
    </article>
  );
}

/**
 * Static gallery of wedding themes — all six cards, posters and demo links
 * live in the initial HTML so crawleri i AI modeli vide dizajne direktno na
 * ovoj stranici (demo pozivnice su noindex). Video na hover je samo bonus.
 */
export default function ThemeGallery() {
  return (
    <section
      id="teme"
      className="py-16 sm:py-24 bg-[#232323] relative overflow-hidden scroll-mt-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#AE343F]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#d4af37]/8 rounded-full blur-[110px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-4">
            Primeri uživo
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F4DC] mb-4">
            Pogledajte teme na pravim pozivnicama
          </h2>
          <p className="text-[#F5F4DC]/50 max-w-2xl mx-auto">
            Svaki primer je prava website pozivnica za venčanje — otvorite je,
            listajte program dana i probajte potvrdu dolaska.
          </p>
        </div>

        {/* ── Premium teme ── */}
        <div className="flex items-center gap-4 mb-3">
          <span className="h-px flex-1 bg-white/10" />
          <h3 className="font-serif text-xl sm:text-2xl text-[#F5F4DC]">
            Premium pozivnice
          </h3>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-center text-sm text-[#F5F4DC]/40 mb-8">
          Moderna koverta sa mašnom i premium doživljaj u svakoj verziji.
          Pređite mišem preko kartice da pokrenete animaciju, ili otvorite link
          ispod nje da je isprobate uživo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {premiumThemes.map((t) => (
            <ThemeCard key={t.name} theme={t} />
          ))}
        </div>

        {/* ── Klasične teme ── */}
        <div className="flex items-center gap-4 mt-14 mb-3">
          <span className="h-px flex-1 bg-white/10" />
          <h3 className="font-serif text-xl sm:text-2xl text-[#F5F4DC]">
            Standardne pozivnice
          </h3>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-center text-sm text-[#F5F4DC]/40 mb-8">
          Tri od pet predefinisanih tema. Sve boje i njihova značenja navedene
          su ispod.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {classicThemes.map((t) => (
            <ThemeCard key={t.name} theme={t} />
          ))}
        </div>

        {/* Diskretan link za ostale prilike — bez kanibalizacije upita. */}
        <p className="mt-12 text-center text-sm text-[#F5F4DC]/40">
          Slavite nešto drugo? Pogledajte i{" "}
          <Link
            href="/izrada-pozivnica-online"
            className="text-[#d4af37]/80 underline underline-offset-4 hover:text-[#d4af37] transition-colors"
          >
            pozivnice za dečje rođendane i punoletstva
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
