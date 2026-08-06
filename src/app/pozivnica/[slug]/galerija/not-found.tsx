import Link from "next/link";
import { Camera, QrCode, Download, ArrowRight } from "lucide-react";

/**
 * Rendered by `notFound()` from the guest gallery route — unknown slug, gallery
 * never bought, or the upload window is over.
 *
 * A QR printed on a table or a thank-you card outlives the event by years, so
 * every late scan is a warm lead: someone who just watched this work at a
 * wedding. Next serves this with a real 404 status, so it stays out of the
 * index without Google seeing a soft 404.
 */

const STEPS = [
  {
    icon: QrCode,
    title: "Gosti skeniraju QR",
    text: "Kod na stolu ili zahvalnici — bez aplikacije i bez registracije.",
  },
  {
    icon: Camera,
    title: "Šalju slike sa telefona",
    text: "Sve fotografije sa slavlja stižu na jedno mesto, dok traje veselje.",
  },
  {
    icon: Download,
    title: "Vi ih preuzimate",
    text: "Posle slavlja skidate sve odjednom, u jednom ZIP fajlu.",
  },
];

export default function GalerijaNotFound() {
  return (
    <main className="min-h-screen bg-[#F5F4DC] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-6">
          <Camera size={28} className="text-[#AE343F]" strokeWidth={1.5} />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-[#232323] mb-3">
          Ova galerija više nije dostupna
        </h1>
        <p className="text-sm sm:text-base text-[#232323]/65 leading-relaxed mb-10">
          Slike su bile dostupne kratko nakon slavlja i u međuvremenu su
          obrisane. Ako ste ovde stigli skeniranjem koda sa stola — upravo ste
          videli kako to izgleda.
        </p>

        <div className="bg-white rounded-2xl border border-[#232323]/10 shadow-sm p-6 sm:p-7 text-left mb-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#AE343F] font-medium mb-5 text-center">
            Želite ovako nešto na svom slavlju?
          </p>

          <ul className="space-y-4 mb-7">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#F5F4DC] flex items-center justify-center">
                  <Icon size={16} className="text-[#AE343F]" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#232323]">{title}</div>
                  <p className="text-xs text-[#232323]/60 leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/qr-galerija-slika-sa-vencanja/"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#AE343F] hover:bg-[#8A2A32] text-white font-medium text-sm px-6 py-3.5 rounded-xl transition-colors"
          >
            Napravite svoju galeriju <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-xs text-[#232323]/50">
          <Link href="/cene/" className="hover:text-[#AE343F] transition-colors underline underline-offset-4">
            Pogledajte kompletnu ponudu i cene
          </Link>
        </p>

        <p className="text-[11px] text-[#232323]/35 mt-10">
          <Link href="/" className="hover:text-[#AE343F] transition-colors">
            halouspomene.rs
          </Link>
        </p>
      </div>
    </main>
  );
}
