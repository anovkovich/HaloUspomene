"use client";

import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";

export default function Home() {
  return (
    <div>
      <Hero />
      <Pricing />

      <div className="bg-white py-20 my-10"> </div>
    </div>
  );
}
