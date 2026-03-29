"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Tag, Search, X } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishDate: string;
  readTime: number;
}

interface BlogClientProps {
  posts: Post[];
  categories: string[];
}

export default function BlogClient({ posts, categories }: BlogClientProps) {
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();

  const filtered = posts.filter((post) => {
    const matchesCat = !activeCategory || post.category === activeCategory;
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#232323]/30 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži postove..."
            className="w-full pl-11 pr-10 py-3 bg-white rounded-full text-sm text-[#232323] placeholder:text-[#232323]/30 border border-stone-100 outline-none focus:border-[#AE343F]/30 transition-colors shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#232323]/30 hover:text-[#232323]/60 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveCategory("")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer"
          style={{
            backgroundColor: !activeCategory ? "#AE343F" : "white",
            color: !activeCategory ? "white" : "rgba(35,35,35,0.6)",
            borderColor: !activeCategory ? "#AE343F" : "rgb(245,245,244)",
          }}
        >
          Svi ({posts.length})
        </button>
        {categories.map((cat) => {
          const count = posts.filter((p) => p.category === cat).length;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(active ? "" : cat)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer"
              style={{
                backgroundColor: active ? "#AE343F" : "white",
                color: active ? "white" : "rgba(35,35,35,0.6)",
                borderColor: active ? "#AE343F" : "rgb(245,245,244)",
              }}
            >
              <Tag size={14} />
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-[#232323]/40 mb-2">
            Nema rezultata{q ? ` za „${search}"` : ""}
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("");
            }}
            className="text-sm text-[#AE343F] hover:underline cursor-pointer"
          >
            Prikaži sve postove
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setActiveCategory(post.category)}
                    className="px-3 py-1 bg-[#AE343F]/10 rounded-full text-xs font-bold text-[#AE343F] uppercase tracking-wider hover:bg-[#AE343F]/20 transition-colors cursor-pointer"
                  >
                    {post.category}
                  </button>
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
                    {new Date(post.publishDate).toLocaleDateString("sr-Latn-RS", {
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
      )}
    </>
  );
}
