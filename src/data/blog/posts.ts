import fs from "fs";
import path from "path";
import { BlogPost } from "./types";

function loadContent(slug: string): string {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "blog",
    "content",
    `${slug}.md`,
  );
  return fs.readFileSync(filePath, "utf-8");
}

// All posts including scheduled/unpublished ones
const allBlogPosts: BlogPost[] = [
  {
    slug: "sta-je-audio-guest-book",
    title: "Šta je Audio Guest Book i Zašto je Hit na Venčanjima u Srbiji?",
    description:
      "Saznajte šta je audio guest book, kako funkcioniše na venčanjima u Srbiji, i zašto sve više parova bira ovu uslugu umesto klasične knjige utisaka. HALO Uspomene objašnjava sve.",
    category: "Vodič",
    tags: [
      "audio guest book",
      "venčanje",
      "Srbija",
      "knjiga utisaka",
      "HALO Uspomene",
    ],
    publishDate: "2025-09-27",
    readTime: 8,
    featured: true,
    content: loadContent("sta-je-audio-guest-book"),
  },
  {
    slug: "audio-guest-book-vs-knjiga-utisaka",
    title: "Audio Guest Book vs Klasična Knjiga Utisaka: Kompletno Poređenje",
    description:
      "Detaljno poređenje audio guest book-a i klasične knjige utisaka za venčanja. Prednosti, mane, cene i iskustva parova u Srbiji. Saznajte koja opcija je bolja za vaše venčanje.",
    category: "Poređenje",
    tags: [
      "audio guest book",
      "knjiga utisaka",
      "poređenje",
      "venčanje Srbija",
      "HALO Uspomene",
    ],
    publishDate: "2025-10-25",
    readTime: 10,
    featured: true,
    content: loadContent("audio-guest-book-vs-knjiga-utisaka"),
  },
  {
    slug: "kako-funkcionise-audio-guest-book",
    title: "Kako Funkcioniše Audio Guest Book: Kompletan vodič",
    description:
      "Kompletni vodič o tome kako funkcioniše audio guest book na venčanjima. Od rezervacije do preuzimanja snimaka — korak po korak objašnjenje HALO Uspomene usluge u Srbiji.",
    category: "Vodič",
    tags: [
      "kako funkcioniše",
      "audio guest book",
      "vodič",
      "venčanje",
      "HALO Uspomene",
      "Srbija",
    ],
    publishDate: "2025-11-29",
    readTime: 9,
    featured: true,
    content: loadContent("kako-funkcionise-audio-guest-book"),
  },
  {
    slug: "originalne-ideje-za-vencanja",
    title:
      "Originalne Ideje za Venčanja 2026/2027 — Trendovi koji Oduševljavaju",
    description:
      "Moderne i originalne ideje za venčanja 2026 i 2027. Od audio guest book-a do interaktivnih iskustava — saznajte koji su najnoviji trendovi za nezaboravnu svadbu u Srbiji.",
    category: "Trendovi",
    tags: [
      "originalne ideje za venčanja",
      "moderne ideje za venčanja 2026",
      "trendovi venčanja",
      "venčanje Srbija",
      "audio guest book",
      "HALO Uspomene",
    ],
    publishDate: "2026-02-28",
    readTime: 10,
    featured: true,
    content: loadContent("originalne-ideje-za-vencanja"),
  },
  {
    slug: "planiranje-vencanja-checklista",
    title: "Planiranje Venčanja 2026: Kompletna Checklista",
    description:
      "Kompletna checklista za planiranje venčanja u Srbiji 2026 — korak po korak od 12 meseci pre do dana venčanja. Budžet, lokacija, vendor-i, dekoracija i svi detalji na jednom mestu.",
    category: "Checklista",
    tags: [
      "planiranje venčanja",
      "checklista venčanje",
      "organizacija svadbe",
      "venčanje Srbija",
      "audio guest book",
    ],
    publishDate: "2026-03-28",
    readTime: 12,
    featured: true,
    content: loadContent("planiranje-vencanja-checklista"),
  },
  {
    slug: "najbolji-gadgeti-za-proslave",
    title: "Najbolji Gadgeti za Proslave i Venčanja u 2026 — Vodič za Parove",
    description:
      "Pregled najboljih gadgeta za proslave i venčanja u 2026. Audio guest book, foto kabina, neon znaci i još mnogo toga — kompletni vodič za nezaboravan dan.",
    category: "Saveti",
    tags: [
      "najbolji gadgeti za proslave i venčanja",
      "gadgeti za venčanje",
      "audio guest book",
      "proslave",
      "HALO Uspomene",
      "Srbija",
    ],
    publishDate: "2026-04-25",
    readTime: 9,
    featured: true,
    content: loadContent("najbolji-gadgeti-za-proslave"),
  },
  {
    slug: "ideje-za-vencanje-srbija",
    title: "10 Originalnih Ideja za Venčanje u Srbiji 2026",
    description:
      "Originalne ideje za venčanje u Srbiji 2026 — od vojvođanskih salaša i Fruške Gore do beogradskih rooftop-ova i Zlatibora. Lokacije, food stanice, rakija bar i audio guest book.",
    category: "Trendovi",
    tags: [
      "ideje za venčanje Srbija",
      "srpska venčanja",
      "originalna svadba",
      "Vojvodina salaš",
      "Fruška Gora",
      "Zlatibor",
    ],
    publishDate: "2026-05-30",
    readTime: 10,
    featured: true,
    content: loadContent("ideje-za-vencanje-srbija"),
  },
  {
    slug: "audio-guest-book-cena",
    title: "Audio Guest Book Cena u Srbiji 2026: Koliko Košta?",
    description:
      "Transparentan pregled cena audio guest book usluge u Srbiji 2026. HALO Uspomene paketi, dodatne opcije, poređenje sa konkurencijom i bundle popusti za digitalnu pozivnicu.",
    category: "Vodič",
    tags: [
      "audio guest book cena",
      "cena iznajmljivanja",
      "koliko košta audio guest book",
      "HALO Uspomene cene",
      "venčanje budžet",
    ],
    publishDate: "2026-06-27",
    readTime: 8,
    featured: true,
    content: loadContent("audio-guest-book-cena"),
  },
  {
    slug: "audio-guest-book-iskustva",
    title: "Audio Guest Book Iskustva: Šta Kažu Parovi",
    description:
      "Stvarna iskustva parova koji su koristili HALO Uspomene audio guest book na venčanjima u Srbiji. Recenzije, utisci i saveti od Jelene & Marka, Sare & Nikole i Marine & Aleksandra.",
    category: "Saveti",
    tags: [
      "audio guest book iskustva",
      "recenzije",
      "utisci parova",
      "HALO Uspomene utisci",
      "venčanje Srbija",
    ],
    publishDate: "2026-07-25",
    readTime: 9,
    featured: true,
    content: loadContent("audio-guest-book-iskustva"),
  },
  {
    slug: "digitalna-pozivnica-audio-guest-book",
    title: "Digitalna Pozivnica + Audio Guest Book: Savršena Kombinacija",
    description:
      "Kako digitalna pozivnica i audio guest book zajedno čine savršen digitalni paket za venčanje. Prednosti, bundle popust od 20% i primeri iz prakse — HALO Uspomene vodič.",
    category: "Saveti",
    tags: [
      "digitalna pozivnica venčanje",
      "online pozivnica",
      "audio guest book",
      "HALO Uspomene",
      "pozivnica i audio guest book",
    ],
    publishDate: "2026-08-29",
    readTime: 8,
    featured: true,
    content: loadContent("digitalna-pozivnica-audio-guest-book"),
  },
  {
    slug: "srpske-svadbene-tradicije-moderni-trendovi",
    title: "Srpske Svadbene Tradicije i Moderni Trendovi",
    description:
      "Kako moderni parovi u Srbiji čuvaju svadbene tradicije uz moderne trendove. Kupovina mlade, lomljenje čaše, kum, audio guest book i evolucija srpske svadbe.",
    category: "Trendovi",
    tags: [
      "srpske svadbene tradicije",
      "moderni trendovi venčanja",
      "srpska svadba",
      "tradicionalno venčanje Srbija",
    ],
    publishDate: "2026-09-26",
    readTime: 10,
    featured: true,
    content: loadContent("srpske-svadbene-tradicije-moderni-trendovi"),
  },
];

// Published posts: only those with publishDate <= current build date
const now = new Date();
export const blogPosts: BlogPost[] = (
  process.env.NODE_ENV === "development"
    ? allBlogPosts
    : allBlogPosts.filter((post) => new Date(post.publishDate) <= now)
).sort(
  (a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
);

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getPostsByCategory(category: BlogPost["category"]): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const current = getBlogPost(currentSlug);
  if (!current) return [];

  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const aSharedTags = a.tags.filter((t) => current.tags.includes(t)).length;
      const bSharedTags = b.tags.filter((t) => current.tags.includes(t)).length;
      return bSharedTags - aSharedTags;
    })
    .slice(0, limit);
}
