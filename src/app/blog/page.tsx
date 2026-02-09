import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { blogPosts } from "@/data/blog/posts";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: "Blog — Audio Guest Book Saveti i Vodiči",
  description:
    "Saznajte sve o audio guest book usluzi za venčanja u Srbiji. Vodiči, saveti, poređenja i trendovi od HALO Uspomene tima.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const featured = blogPosts.filter((p) => p.featured);
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Početna", href: "/" },
                { label: "Blog" },
              ]}
            />
          </div>

          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#AE343F] mb-4">
              HALO Uspomene Blog
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#232323] mb-6">
              Saveti, Vodiči i Inspiracija
            </h1>
            <p className="text-lg text-[#232323]/50 max-w-2xl mx-auto">
              Sve što trebate znati o audio guest book usluzi za venčanja u
              Srbiji — od tehničkih detalja do emotivnih priča naših parova.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-[#232323]/60 border border-stone-100"
              >
                <Tag size={14} />
                {cat}
              </span>
            ))}
          </div>

          {/* Featured Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#AE343F]/10 rounded-full text-xs font-bold text-[#AE343F] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#232323]/40">
                      <Clock size={12} />
                      {post.readTime} min
                    </span>
                  </div>

                  <h2 className="text-xl font-serif font-semibold text-[#232323] mb-3 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-[#232323]/50 text-sm leading-relaxed mb-6 flex-1">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#232323]/30">
                      {new Date(post.publishDate).toLocaleDateString("sr-RS", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#AE343F] hover:gap-3 transition-all"
                    >
                      Pročitaj
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 sm:mt-20">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-100 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#232323] mb-4">
                Imate pitanje?
              </h2>
              <p className="text-[#232323]/50 mb-6">
                Pogledajte naš FAQ ili nas kontaktirajte direktno — rado ćemo
                odgovoriti na sva vaša pitanja o audio guest book usluzi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#faq"
                  className="btn btn-outline border-[#232323]/20 text-[#232323] hover:bg-[#232323] hover:text-[#F5F4DC] hover:border-[#232323] rounded-full px-8"
                >
                  Pogledaj FAQ
                </Link>
                <Link
                  href="/#kontakt"
                  className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-8 border-none"
                >
                  Kontaktirajte nas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
