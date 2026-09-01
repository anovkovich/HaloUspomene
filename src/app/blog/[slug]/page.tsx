import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPublishedPosts, getBlogPost, getRelatedPosts } from "@/data/blog/posts";
import { mdxComponents } from "@/components/blog/mdx-components";
import TableOfContents from "@/components/blog/TableOfContents";
import { extractTableOfContents } from "@/lib/slugify-heading";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import { notFound } from "next/navigation";

// Re-render hourly; render not-yet-built (scheduled) posts on demand once live.
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishDate,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://halouspomene.rs";
  const toc = extractTableOfContents(post.content);
  const hasToc = toc.length >= 2;

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    author: {
      "@type": "Organization",
      name: "HALO Uspomene",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "HALO Uspomene",
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.png` },
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    inLanguage: "sr",
    keywords: post.tags.join(", "),
  };

  // Add HowTo schema for the how-to post
  const isHowTo = post.slug === "kako-funkcionise-audio-guest-book";
  const howToSchema = isHowTo
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Kako koristiti audio guest book na venčanju",
        description:
          "Kompletni vodič od rezervacije do preuzimanja snimaka sa HALO Uspomene audio guest book uslugom.",
        step: [
          {
            "@type": "HowToStep",
            name: "Rezervacija termina",
            text: "Kontaktirajte HALO Uspomene tim putem kontakt forme, ili Instagrama, sa datumom venčanja i željenim paketom.",
          },
          {
            "@type": "HowToStep",
            name: "Priprema telefona",
            text: "HALO Uspomene tim vrši tehničku proveru, punjenje baterije i testiranje snimanja.",
          },
          {
            "@type": "HowToStep",
            name: "Dostava",
            text: "Telefon se dostavlja kurirskom službom u celoj Srbiji. Lična dostava i montaža dostupna je u Novom Sadu.",
          },
          {
            "@type": "HowToStep",
            name: "Korišćenje na venčanju",
            text: "Gosti podižu slušalicu i ostavljaju glasovne poruke. Sve se automatski snima.",
          },
          {
            "@type": "HowToStep",
            name: "Povratak telefona",
            text: "Telefon se vraća kurirskom službom ili ga tim preuzima lično.",
          },
          {
            "@type": "HowToStep",
            name: "Preuzimanje snimaka",
            text: "U roku od 3-5 radnih dana dobijate digitalni album sa svim glasovnim porukama.",
          },
        ],
      }
    : null;

  // Add FAQPage schema for the invitation-timing post
  const isInvitationTiming = post.slug === "kada-slati-pozivnice-za-vencanje";
  const faqSchema = isInvitationTiming
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Kada se šalju pozivnice za venčanje?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Glavne pozivnice šalju se 6 do 8 nedelja pre venčanja. Gostima iz inostranstva 2 do 3 meseca ranije, a najavu (save the date) svima kojima treba vremena za planiranje šaljete 6 do 12 meseci ranije.",
            },
          },
          {
            "@type": "Question",
            name: "Šta je save the date i da li je obavezan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "To je kratka najava datuma koju šaljete pre zvanične pozivnice. Nije obavezna, ali je vrlo korisna za goste iz inostranstva i za venčanja u špicu sezone, kada se kalendari brzo popune.",
            },
          },
          {
            "@type": "Question",
            name: "Koliko ranije poslati pozivnice gostima u inostranstvu?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Gostima iz inostranstva pozivnicu šaljete 2 do 3 meseca ranije, a idealno im još pre toga pošaljete najavu — 6 i više meseci unapred — da na vreme rezervišu karte i godišnji odmor.",
            },
          },
          {
            "@type": "Question",
            name: "Da li je kasno poslati pozivnice mesec dana pre venčanja?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nije idealno, ali je rešivo — naročito digitalnom pozivnicom koja do gosta stiže odmah. Ključno je da rok za potvrdu dolaska ostane bar 2 nedelje pre venčanja.",
            },
          },
          {
            "@type": "Question",
            name: "Kada postaviti rok za potvrdu dolaska?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Rok postavite 2 do 3 nedelje pre venčanja, jer restoran obično traži konačan broj gostiju 7 do 10 dana ranije, a vama posle roka treba vremena za raspored sedenja.",
            },
          },
          {
            "@type": "Question",
            name: "Kada naručiti izradu štampanih pozivnica?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Štampane pozivnice naručujete 3 do 4 meseca pre venčanja — toliko traje dizajn, štampa i vreme potrebno da pozivnice uručite svim gostima.",
            },
          },
          {
            "@type": "Question",
            name: "Da li se pozivnice uručuju lično ili šalju?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "U Srbiji se najbližima pozivnica tradicionalno uručuje lično, uz kafu. Praktičan moderan model je kombinacija: papir za goste koje obilazite, a link i QR kod za ostale — pri čemu sve potvrde dolaska stižu na jedno mesto.",
            },
          },
          {
            "@type": "Question",
            name: "Šta ako gost ne potvrdi dolazak do roka?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pošaljite podsetnik nedelju dana pre isteka roka. Za goste koji potvrde naknadno, njihove odgovore ručno dodajete na spisak — kod digitalne pozivnice to traje nekoliko sekundi.",
            },
          },
        ],
      }
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        {howToSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
          />
        )}
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}

        <div
          className={`container mx-auto px-4 ${
            hasToc ? "max-w-3xl xl:max-w-6xl" : "max-w-3xl"
          }`}
        >
          <div
            className={
              hasToc
                ? "xl:grid xl:grid-cols-[minmax(0,48rem)_15rem] xl:justify-center xl:gap-16"
                : undefined
            }
          >
            <article className="min-w-0">
              <div className="mb-6">
                <Breadcrumbs
                  items={[
                    { label: "Početna", href: "/" },
                    { label: "Blog", href: "/blog" },
                    { label: post.title },
                  ]}
                />
              </div>

              {/* Post Header */}
              <header className="mb-8 border-b border-[#232323]/10 pb-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                  <span className="px-3 py-1 bg-[#AE343F]/10 rounded-full text-xs font-bold text-[#AE343F] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#232323]/40">
                    <Clock size={12} />
                    {post.readTime} min čitanja
                  </span>
                  <span className="text-[#232323]/20" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs text-[#232323]/40">
                    {new Date(post.publishDate).toLocaleDateString("sr-Latn-RS", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] mb-3 leading-tight">
                  {post.title}
                </h1>
                <p className="text-base sm:text-lg text-[#232323]/55 leading-relaxed">
                  {post.description}
                </p>
              </header>

              {/* Collapsible TOC (below xl) */}
              {hasToc && <TableOfContents items={toc} variant="collapsible" />}

              {/* Post Content */}
              <div className="prose-custom">{content}</div>

              {/* AI-generated content disclaimer */}
              <div className="mt-12 sm:mt-14 p-4 sm:p-5 bg-[#F5F4DC]/60 border border-stone-200 rounded-xl flex items-start gap-3">
                <Sparkles
                  size={18}
                  className="text-[#AE343F] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm text-[#232323]/70 leading-relaxed italic">
                  AI generisan sadržaj! Ispravnost informacija proverite
                  direktno sa timom HaloUspomene — kontakt se nalazi u podnožju
                  sajta (u footeru).
                </p>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mt-16 pt-12 border-t border-stone-200">
                  <h2 className="text-2xl font-serif text-[#232323] mb-8">
                    Povezani članci
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group"
                      >
                        <span className="px-2 py-1 bg-[#AE343F]/10 rounded-full text-xs font-bold text-[#AE343F] uppercase">
                          {related.category}
                        </span>
                        <h3 className="font-serif font-semibold text-[#232323] mt-3 mb-2 group-hover:text-[#AE343F] transition-colors">
                          {related.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-sm text-[#AE343F]">
                          Pročitaj <ArrowRight size={14} />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Back to blog */}
              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[#232323]/50 hover:text-[#AE343F] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Nazad na blog
                </Link>
              </div>
            </article>

            {/* Sticky TOC (xl and up) */}
            {hasToc && (
              <aside className="hidden xl:block">
                <div className="sticky top-28">
                  <TableOfContents items={toc} variant="sidebar" />
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
