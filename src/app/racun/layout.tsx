import type { Metadata } from "next";

// /racun/ exposes per-customer receipt URLs (each one encodes a payload
// in the query string). We want two things at the same time:
//
//   1. Social-media preview scrapers (facebookexternalhit, Twitterbot,
//      Slackbot, etc.) MUST be able to fetch the page so OG previews
//      render on Instagram/Messenger/Slack. robots.txt now allows the
//      route for `*` while still blocking AI-training bots.
//   2. Google etc. MUST NOT index individual receipts — every paying
//      customer would generate a unique indexable URL otherwise. This
//      `noindex` directive is what enforces that.
//
// page.tsx is a client component so it can't export metadata itself —
// hence this colocated server layout. Next.js automatically picks up
// the colocated `opengraph-image.tsx`; we still set openGraph.type +
// title explicitly so the preview card has good copy.
export const metadata: Metadata = {
  title: "HaloUspomene.rs — Račun",
  description: "Vaša porudžbina je spremna. Skenirajte NBS IPS QR kod i platite u sekundi.",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: "HaloUspomene.rs — Račun",
    description:
      "Vaša porudžbina je spremna. Skenirajte NBS IPS QR kod i platite u sekundi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HaloUspomene.rs — Račun",
    description:
      "Vaša porudžbina je spremna. Skenirajte NBS IPS QR kod i platite u sekundi.",
  },
};

export default function RacunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
