import type { Metadata } from "next";
import { Header } from "@/components/layout";
import Footer from "@/components/layout/footer/Footer";
import QuestionnaireForm from "./QuestionnaireForm";

export const metadata: Metadata = {
  title: "Napravi Pozivnicu — Digitalna Venčana Pozivnica",
  description:
    "Popunite upitnik i mi ćemo napraviti vašu personalozivanu digitalnu venčanu pozivnicu sa RSVP formom, odbrojavanjem i programom dana.",
  robots: { index: false, follow: false },
};

export default function NapraviPozivnicuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#faf9f6] pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9e4a5d] mb-4">
              Halo Pozivnice
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-800 mb-5">
              Napravite svoju pozivnicu
            </h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Popunite upitnik u 7 koraka — mi ćemo sve ostalo uraditi i
              pozivnica će biti gotova za 24h.
            </p>
          </div>

          <QuestionnaireForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
