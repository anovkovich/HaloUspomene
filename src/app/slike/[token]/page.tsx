import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageOff } from "lucide-react";
import { resolveUploadTarget } from "@/lib/upload-link-product";
import { recordUploadLinkVisit } from "@/lib/upload-links";
import SlikeClient from "./SlikeClient";

// The token is the credential and the photo list must be current on every
// open — nothing here may be cached.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const target = await resolveUploadTarget(token);
  const robots = { index: false, follow: false };
  if (!target) return { title: "Slike za pozivnicu · HaloUspomene", robots };
  return {
    title: `Slike za pozivnicu — ${target.displayName} · HaloUspomene`,
    robots,
  };
}

export default async function SlikePage({ params }: PageProps) {
  const { token } = await params;
  const target = await resolveUploadTarget(token);
  if (!target) notFound();

  // Bookkeeping only — a failed write must never cost the client their page.
  await recordUploadLinkVisit(token).catch(() => {});

  if (!target.enabled) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-4">
          <ImageOff size={22} className="text-[#AE343F]" />
        </div>
        <h1 className="text-2xl font-serif font-light mb-2">
          Galerija još nije uključena
        </h1>
        <p className="text-[#232323]/70">
          Javite nam se i uključićemo je — link ostaje isti, pa ga sačuvajte.
        </p>
      </main>
    );
  }

  return (
    <SlikeClient
      token={token}
      displayName={target.displayName}
      eventDate={target.eventDate}
      initialImages={target.images}
    />
  );
}
