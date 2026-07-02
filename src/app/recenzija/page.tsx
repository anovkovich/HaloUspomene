import type { Metadata } from "next";
import RecenzijaClient from "./RecenzijaClient";

const title = "Ostavite Recenziju — HALO Uspomene";
const description =
  "Podelite vaše iskustvo sa HALO Uspomene — ostavite Google recenziju.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RecenzijaPage() {
  return <RecenzijaClient />;
}
