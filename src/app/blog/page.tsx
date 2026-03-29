import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/data/blog/posts";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog — Audio Guest Book Saveti i Vodiči",
  description:
    "Saznajte sve o audio guest book usluzi za venčanja u Srbiji. Vodiči, saveti, poređenja i trendovi od HALO Uspomene tima.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  // Strip content to keep client bundle small
  const posts = blogPosts.map(({ content: _, ...rest }) => rest);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-28 pb-16 sm:pb-24">
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

          <BlogClient posts={posts} categories={categories} />

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
