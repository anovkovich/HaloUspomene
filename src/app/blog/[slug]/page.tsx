import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blog/posts";
import { mdxComponents } from "@/components/blog/mdx-components";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
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
            text: "Telefon se dostavlja kurirskom službom (Essential) ili lično sa profesionalnom instalacijom (Full Service).",
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

        <article className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          </div>

          {/* Post Header */}
          <header className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#AE343F]/10 rounded-full text-xs font-bold text-[#AE343F] uppercase tracking-wider">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#232323]/40">
                <Clock size={12} />
                {post.readTime} min čitanja
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-[#232323]/50">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs text-[#232323]/40 border border-stone-100"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#232323]/30 mt-4">
              Objavljeno:{" "}
              {new Date(post.publishDate).toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>

          {/* Post Content */}
          <div className="prose-custom">{content}</div>

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
      </main>
      <Footer />
    </>
  );
}
