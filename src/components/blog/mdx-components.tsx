import Link from "next/link";
import { ArrowRight, Lightbulb, Info } from "lucide-react";
import type { MDXComponents } from "mdx/types";

// ── Custom blog components ────────────────────────────────────────────────────

type InfoBoxType = "tip" | "info";

export function InfoBox({
  type = "info",
  children,
}: {
  type?: InfoBoxType;
  children: React.ReactNode;
}) {
  const styles: Record<InfoBoxType, { bg: string; border: string; iconColor: string }> = {
    tip: { bg: "#fdf6d8", border: "#c9a227", iconColor: "#c9a227" },
    info: { bg: "#f0eaf0", border: "#AE343F", iconColor: "#AE343F" },
  };
  const s = styles[type];
  const Icon = type === "tip" ? Lightbulb : Info;

  return (
    <div
      className="flex gap-4 rounded-2xl px-5 py-4 mb-6 not-prose"
      style={{ backgroundColor: s.bg, borderLeft: `4px solid ${s.border}`, boxShadow: "0 1px 4px rgba(35,35,35,0.07)" }}
    >
      <Icon size={18} style={{ color: s.iconColor, flexShrink: 0, marginTop: 2 }} />
      <div className="text-sm text-[#232323]/70 leading-relaxed">{children}</div>
    </div>
  );
}

export function PriceCard({
  name,
  price,
  tag,
  highlight,
  features = [],
}: {
  name: string;
  price: string;
  tag?: string;
  highlight?: string;
  features?: string[];
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-stone-200 p-6 mb-4 not-prose shadow-sm">
      {tag && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-[#AE343F] text-white text-xs font-bold rounded-full uppercase tracking-wider">
          {tag}
        </span>
      )}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-serif text-xl text-[#232323] font-semibold">{name}</h3>
        <span className="font-serif text-2xl font-bold text-[#AE343F] whitespace-nowrap">{price}</span>
      </div>
      {highlight && (
        <p className="text-sm text-[#232323]/50 mb-4 italic">{highlight}</p>
      )}
      {features.length > 0 && (
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#232323]/70">
              <span className="text-[#AE343F] mt-0.5">✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CtaBlock({
  title,
  text,
  href = "/#kontakt",
  btnText = "Kontaktirajte nas",
}: {
  title: string;
  text: string;
  href?: string;
  btnText?: string;
}) {
  return (
    <div className="mt-12 bg-[#232323] rounded-3xl p-8 sm:p-12 text-center not-prose">
      <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F4DC] mb-4">{title}</h2>
      <p className="text-[#F5F4DC]/60 mb-6 max-w-lg mx-auto">{text}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-10 py-3 text-sm font-medium transition-colors"
      >
        {btnText} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

// ── HTML element overrides (replace the old renderContent() parser) ───────────

export const mdxComponents: MDXComponents = {
  // Custom components
  InfoBox,
  PriceCard,
  CtaBlock,

  // Headings
  h1: ({ children }) => (
    <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#232323] mb-6 mt-8 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#232323] mb-4 mt-10">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-serif font-semibold text-[#232323] mb-3 mt-8">
      {children}
    </h3>
  ),

  // Text
  p: ({ children }) => (
    <p className="text-[#232323]/70 leading-relaxed mb-4">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-[#232323]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  // Links
  a: ({ href, children }) => (
    <Link href={href ?? "#"} className="text-[#AE343F] hover:underline">
      {children}
    </Link>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 text-[#232323]/70 mb-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-[#232323]/70 mb-6">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#AE343F]/30 pl-6 py-2 mb-6 text-[#232323]/60 italic">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-8 border-stone-200" />,

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6 not-prose">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left px-3 py-2.5 bg-[#e8e5cc] font-semibold text-[#232323] text-xs uppercase tracking-wide border-b-2 border-[#d4c98a]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2.5 text-[#232323]/75 border-b border-[#e8e5cc] [&>p]:mb-0 [&>p]:leading-normal">
      {children}
    </td>
  ),
};
