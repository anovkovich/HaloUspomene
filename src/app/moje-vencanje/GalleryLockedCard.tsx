"use client";

import Link from "next/link";
import { Images, Lock, QrCode, Mic, Sparkles } from "lucide-react";

/**
 * The Galerija view for a couple who hasn't activated it.
 *
 * Sits where `GalleryCard` would, and mirrors the unpaid Audio knjiga state:
 * explain the QR-zahvalnica flow, then point at the one thing that makes both
 * features worth more together — a single printed QR that carries all of them.
 */

interface Props {
  slug: string;
  /** Quick-register couples have no invitation to attach an add-on to, so they
   *  get the packages page instead of a checkout for a single feature. */
  draft?: boolean;
}

const STEPS = [
  {
    n: "1",
    title: "Odštampate zahvalnicu sa QR kodom",
    body: "Stavite je na stolove, uz meni ili uz konfete — gde god gost sedne.",
  },
  {
    n: "2",
    title: "Gost skenira telefonom",
    body: "Bez aplikacije, bez registracije, bez naloga. Otvori se odmah u pregledaču.",
  },
  {
    n: "3",
    title: "Fotografije stižu vama",
    body: "Svi kadrovi koje fotograf nije video — sa svih telefona, na jednom mestu.",
  },
];

export default function GalleryLockedCard({ slug, draft }: Props) {
  const ctaHref = draft ? "/cene" : `/placanje/galerija/${slug}/`;
  const ctaLabel = draft ? "Pogledajte pakete" : "Otključajte galeriju";

  return (
    <div className="bg-white rounded-2xl border border-[#232323]/25 p-6 shadow-md">
      <h3 className="font-serif text-lg text-[#232323] mb-4">Galerija</h3>

      <div className="text-center py-6 px-4 mb-4">
        <Lock size={28} className="mx-auto mb-3 text-[#AE343F]/60" />
        <p className="font-serif text-base text-[#232323] mb-1">
          QR galerija fotografija
        </p>
        <p className="text-sm text-[#232323]/75 max-w-lg mx-auto leading-relaxed">
          Stavite QR kod na zahvalnice na stolovima — gosti ga skeniraju i šalju
          vam fotografije direktno sa svojih telefona. Dostupno uz aktivaciju
          galerije.
        </p>
      </div>

      {/* How it works */}
      <div className="border border-[#232323]/15 rounded-xl overflow-hidden mb-4">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F5F4DC]/50 text-sm">
          <Images size={14} className="text-[#AE343F]" />
          <span className="text-[#232323]/75">Kako radi</span>
        </div>
        <div className="divide-y divide-[#232323]/10">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3 px-4 py-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-[#AE343F]/10 text-[#AE343F] text-xs font-semibold flex items-center justify-center">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-medium text-[#232323]">{s.title}</p>
                <p className="text-xs text-[#232323]/70 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-[#F5F4DC]/30">
          <p className="text-[10px] text-center text-[#232323]/55 italic">
            Aktivacijom ovde ćete videti fotografije vaših gostiju — možete ih
            pregledati i preuzeti sve odjednom.
          </p>
        </div>
      </div>

      {/* One QR, both kinds of memories. The guest hub behind the pano /
          zahvalnica QR renders a tab per activated feature, so this is literally
          the same link — not two codes printed side by side. */}
      <div className="border border-[#d4af37]/35 rounded-xl overflow-hidden bg-[#F5F4DC]/40 mb-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={16} className="text-[#d4af37]" />
            <p className="text-sm font-medium text-[#232323]">
              Jedan QR kod — i fotografije i glasovne poruke
            </p>
          </div>
          <p className="text-xs text-[#232323]/75 leading-relaxed">
            Na istoj zahvalnici mogu da stoje obe uspomene. Gost skenira jednom,
            pa sam bira hoće li poslati fotografiju ili ostaviti glasovnu poruku
            — a ako koristite i raspored sedenja, tu su i „Gde sedim” i meni.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#232323]/60">
            <Mic size={11} className="text-[#AE343F]" />
            Audio knjiga se aktivira zasebno, ali deli isti QR kod.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-[#232323]/60">
          <Sparkles size={13} className="text-[#d4af37]" />
          Uspomene koje fotograf nije stigao da uslika.
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
