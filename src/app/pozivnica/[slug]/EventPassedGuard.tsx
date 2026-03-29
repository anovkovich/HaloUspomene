"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface Props {
  eventDate: string;
  children: React.ReactNode;
}

export default function EventPassedGuard({ eventDate, children }: Props) {
  const pathname = usePathname();

  const isEventOver = useMemo(() => {
    const dayAfter = new Date(eventDate);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(0, 0, 0, 0);
    return new Date() >= dayAfter;
  }, [eventDate]);

  // Management routes bypass the guard — couples need portal access after the event
  const isManagementRoute =
    pathname.includes("/portal") ||
    pathname.includes("/potvrde") ||
    pathname.includes("/prijava") ||
    pathname.includes("/raspored-sedenja") ||
    pathname.includes("/audio-knjiga");

  if (!isEventOver || isManagementRoute) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F5F4DC", color: "#232323" }}
    >
      <div className="max-w-lg mx-auto space-y-8">
        <h1
          className="font-script text-5xl sm:text-6xl"
          style={{ color: "#AE343F" }}
        >
          Halo Pozivnice
        </h1>

        <div className="flex items-center justify-center gap-4">
          <div
            className="h-px w-10"
            style={{ backgroundColor: "#d4af37", opacity: 0.5 }}
          />
          <Heart size={14} style={{ color: "#d4af37" }} fill="currentColor" />
          <div
            className="h-px w-10"
            style={{ backgroundColor: "#d4af37", opacity: 0.5 }}
          />
        </div>

        <p
          className="font-serif text-base sm:text-lg leading-relaxed"
          style={{ color: "#555" }}
        >
          Ovaj događaj je prošao. Ukoliko i vi želite da goste pozovete našom
          website pozivnicom i lako organizujete raspored sedenja — nakon čega
          će gosti još lakše moći da pronađu svoje mesto — možete to učiniti
          popunjavanjem ove jednostavne forme:
        </p>

        <Link
          href="/napravi-pozivnicu"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-elegant text-sm uppercase tracking-[0.2em] transition-all hover:opacity-80"
          style={{
            backgroundColor: "#AE343F",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(174,52,63,0.25)",
          }}
        >
          <Heart size={14} fill="currentColor" />
          Napravi svoju pozivnicu
          <Heart size={14} fill="currentColor" />
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
            className="font-elegant text-xs uppercase tracking-widest"
            style={{ color: "#aaa" }}
          >
            halouspomene.rs
          </p>
        </div>
      </div>
    </div>
  );
}
