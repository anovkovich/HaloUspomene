import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blog/posts";
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

// Simple markdown-like renderer for blog content
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const processInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Link
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      // Italic (single *)
      const italicMatch = remaining.match(
        /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/,
      );

      const matches = [
        boldMatch
          ? { type: "bold", index: boldMatch.index!, match: boldMatch }
          : null,
        linkMatch
          ? { type: "link", index: linkMatch.index!, match: linkMatch }
          : null,
        italicMatch
          ? { type: "italic", index: italicMatch.index!, match: italicMatch }
          : null,
      ]
        .filter(Boolean)
        .sort((a, b) => a!.index - b!.index);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      if (first.index > 0) {
        parts.push(remaining.slice(0, first.index));
      }

      if (first.type === "bold") {
        parts.push(<strong key={key++}>{first.match[1]}</strong>);
        remaining = remaining.slice(first.index + first.match[0].length);
      } else if (first.type === "link") {
        parts.push(
          <Link
            key={key++}
            href={first.match[2]}
            className="text-[#AE343F] hover:underline"
          >
            {first.match[1]}
          </Link>,
        );
        remaining = remaining.slice(first.index + first.match[0].length);
      } else if (first.type === "italic") {
        parts.push(<em key={key++}>{first.match[1]}</em>);
        remaining = remaining.slice(first.index + first.match[0].length);
      }
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc pl-6 space-y-2 text-[#232323]/70 mb-6"
        >
          {listItems}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="text-left p-3 bg-[#faf9f6] font-semibold text-[#232323] border-b border-stone-200"
                  >
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="p-3 text-[#232323]/70 border-b border-stone-100"
                    >
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      tableHeaders = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      flushTable();
      continue;
    }

    // Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue; // separator row
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-3xl sm:text-4xl font-serif font-semibold text-[#232323] mb-6 mt-8 first:mt-0"
        >
          {processInline(trimmed.slice(2))}
        </h1>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl sm:text-3xl font-serif font-semibold text-[#232323] mb-4 mt-10"
        >
          {processInline(trimmed.slice(3))}
        </h2>,
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-xl font-serif font-semibold text-[#232323] mb-3 mt-8"
        >
          {processInline(trimmed.slice(4))}
        </h3>,
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="border-l-4 border-[#AE343F]/30 pl-6 py-2 mb-6 text-[#232323]/60 italic"
        >
          {processInline(trimmed.slice(2))}
        </blockquote>,
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === "---") {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-8 border-stone-200" />);
      continue;
    }

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`}>{processInline(trimmed.slice(2))}</li>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        flushList();
        inList = true;
      }
      listItems.push(
        <li key={`li-${i}`}>
          {processInline(trimmed.replace(/^\d+\.\s/, ""))}
        </li>,
      );
      continue;
    }

    flushList();

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[#232323]/70 leading-relaxed mb-4">
        {processInline(trimmed)}
      </p>,
    );
  }

  flushList();
  flushTable();

  return elements;
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
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-16 sm:pb-24">
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
              {new Date(post.publishDate).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>

          {/* Post Content */}
          <div className="prose-custom">{renderContent(post.content)}</div>

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

          {/* CTA */}
          <div className="mt-12 bg-[#232323] rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F4DC] mb-4">
              Spremni za audio guest book?
            </h2>
            <p className="text-[#F5F4DC]/60 mb-6 max-w-lg mx-auto">
              Rezervišite vaš termin kod HALO Uspomene i sačuvajte glasove sa
              vašeg venčanja zauvek.
            </p>
            <Link
              href="/#kontakt"
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-10 border-none"
            >
              Rezervišite termin
            </Link>
          </div>

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
