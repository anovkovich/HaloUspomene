import React from "react";
import Link from "next/link";
import { Heart, Cake, PartyPopper, Sparkles, ArrowRight } from "lucide-react";

export type ClusterKey =
  | "vencanje"
  | "deciji"
  | "prvi-rodjendan"
  | "punoletstvo";

interface ClusterItem {
  key: ClusterKey;
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}

// Single source of truth for the invitation topic-cluster.
const ITEMS: ClusterItem[] = [
  {
    key: "vencanje",
    label: "Za venčanje",
    desc: "Website pozivnica sa RSVP-om",
    href: "/napravi-pozivnicu",
    icon: <Heart size={22} />,
  },
  {
    key: "deciji",
    label: "Za dečiji rođendan",
    desc: "Šarena pozivnica za proslavu",
    href: "/napravi-deciju-pozivnicu",
    icon: <PartyPopper size={22} />,
  },
  {
    key: "prvi-rodjendan",
    label: "Za prvi rođendan",
    desc: "Pozivnica za prvu godinu",
    href: "/pozivnica-za-prvi-rodjendan",
    icon: <Cake size={22} />,
  },
  {
    key: "punoletstvo",
    label: "Za punoletstvo (18. rođendan)",
    desc: "Elegantna pozivnica za punoletstvo",
    href: "/napravi-punoletstvo",
    icon: <Sparkles size={22} />,
  },
];

/**
 * Internal-linking block for the invitation topic-cluster. Renders cards to
 * every invitation type except `current`. Used on the hub page (no `current`
 * → all four) and on each spoke page (one excluded). Server component.
 */
export default function InvitationClusterLinks({
  current,
  title = "Napravite pozivnicu i za druge prilike",
  subtitle,
  showHubLink = true,
}: {
  current?: ClusterKey;
  title?: string;
  subtitle?: string;
  showHubLink?: boolean;
}) {
  const items = ITEMS.filter((i) => i.key !== current);

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#232323] mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[#232323]/55 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>

      <div
        className={`grid gap-4 ${
          items.length >= 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col items-center text-center bg-white rounded-2xl p-6 border border-[#232323]/8 shadow-sm hover:border-[#AE343F]/25 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#AE343F]/10 text-[#AE343F] flex items-center justify-center mb-3 group-hover:bg-[#AE343F] group-hover:text-[#F5F4DC] transition-colors">
              {item.icon}
            </div>
            <p className="font-serif text-lg text-[#232323] group-hover:text-[#AE343F] transition-colors">
              {item.label}
            </p>
            <p className="text-xs text-[#232323]/45 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {showHubLink && (
        <div className="text-center mt-8">
          <Link
            href="/izrada-pozivnica-online"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#AE343F] hover:underline"
          >
            Sve vrste pozivnica na jednom mestu
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
