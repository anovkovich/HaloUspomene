"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

interface Props {
  eventDate: string;
  children: React.ReactNode;
}

export default function BirthdayPassedGuard({ eventDate, children }: Props) {
  const pathname = usePathname();

  const isEventOver = useMemo(() => {
    const dayAfter = new Date(eventDate);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(0, 0, 0, 0);
    return new Date() >= dayAfter;
  }, [eventDate]);

  // Management routes bypass the guard
  const isManagementRoute =
    pathname.includes("/portal") || pathname.includes("/prijava");

  if (!isEventOver || isManagementRoute) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FFF8F0", color: "#232323" }}
    >
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center justify-center gap-3">
          <PartyPopper size={40} style={{ color: "#FF6B6B" }} />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold"
          style={{ color: "#FF6B6B" }}
        >
          Proslava je završena!
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: "#555" }}
        >
          Ovaj rođendanski događaj je prošao. Ukoliko i vi želite da napravite
          šarenu digitalnu pozivnicu za dečiji rođendan — sa RSVP formom i
          odbrojavanjem — možete to učiniti ovde:
        </p>

        <Link
          href="/napravi-deciju-pozivnicu"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm uppercase tracking-[0.15em] font-bold transition-all hover:opacity-85"
          style={{
            backgroundColor: "#FF6B6B",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(255,107,107,0.3)",
          }}
        >
          <PartyPopper size={16} />
          Napravi pozivnicu za rođendan
        </Link>

        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="inline-block opacity-60 hover:opacity-100 transition-opacity"
          >
            <Image
              src="/images/full-logo.png"
              alt="Halo Uspomene"
              width={3519}
              height={1798}
              className="h-12 mx-auto w-auto"
            />
          </Link>

          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "#aaa" }}
          >
            halouspomene.rs
          </p>
        </div>
      </div>
    </div>
  );
}
