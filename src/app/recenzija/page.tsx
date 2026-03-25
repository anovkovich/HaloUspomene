import type { Metadata } from "next";
import RecenzijaClient from "./RecenzijaClient";

export const metadata: Metadata = {
  title: "Ostavite Recenziju — HALO Uspomene",
  description:
    "Podelite vaše iskustvo sa HALO Uspomene — ostavite Google recenziju.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Ostavite Recenziju — HALO Uspomene",
    description:
      "Podelite vaše iskustvo sa HALO Uspomene — ostavite Google recenziju.",
    type: "website",
  },
};

export default function RecenzijaPage() {
  return <RecenzijaClient />;
}
