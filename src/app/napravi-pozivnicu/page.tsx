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
      <main className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6] pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#AE343F] mb-5">
              Napravite svoju pozivnicu
            </h1>
            <p className="text-[#8B2833] text-lg max-w-xl mx-auto">
              Popunite upitnik u 6 koraka — mi ćemo sve ostalo uraditi i Vaša
              pozivnica će biti gotova za 24h
            </p>
          </div>

          <QuestionnaireForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
