import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232323] text-[#F5F4DC] pt-16 sm:pt-20 md:pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/images/full-logo-white.png"
              alt="HALO Uspomene - Audio Guest Book za Venčanja u Srbiji"
              width={3519}
              height={1798}
              className="w-54 h-auto mb-6"
            />
            <p className="text-[#F5F4DC]/40 leading-relaxed mb-4 text-justify">
              HALO Uspomene — kompletna platforma za organizaciju venčanja.
              Website pozivnice sa RSVP-om, rasporedom sedenja i audio knjigom
              utisaka. Retro telefon uspomena za nezaboravne glasovne poruke
              gostiju. Sve što vam treba — na jednom mestu.
            </p>
            <a
              href="https://www.instagram.com/halo_uspomene"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#F5F4DC]/60 hover:text-[#AE343F] transition-colors"
              data-track="social_click"
              data-track-platform="instagram"
              data-track-location="footer"
            >
              <Instagram size={18} />
              <span className="text-sm">@halo_uspomene</span>
            </a>
          </div>

          {/* Column 2: Usluge */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80 mb-6">
              Usluge
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Website Pozivnice", href: "/napravi-pozivnicu" },
                { name: "Retro Telefon Uspomena", href: "/#kontakt" },
                { name: "Kako funkcioniše", href: "/#proces" },
                { name: "Cene", href: "/cene" },
                { name: "FAQ", href: "/#faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="/OP%C5%A0TI%20USLOVI%20NAJMA%20I%20KORI%C5%A0%C4%86ENJA%20AUDIO%20GUEST%20BOOK%20URE%C4%90AJA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
                >
                  Opšti uslovi najma
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Blog */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80 mb-6">
              Blog
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Svi članci", href: "/blog" },
                {
                  name: "Kompletan vodič za pozivnice",
                  href: "/blog/website-pozivnica-kompletan-vodic",
                },
                {
                  name: "Šta je Audio Guest Book?",
                  href: "/blog/sta-je-audio-guest-book",
                },
                {
                  name: "Audio Guest Book vs Knjiga Utisaka",
                  href: "/blog/audio-guest-book-vs-knjiga-utisaka",
                },
                {
                  name: "Pozivnica + Audio Guest Book",
                  href: "/blog/website-pozivnica-audio-guest-book",
                },
                {
                  name: "Checklista za organizaciju venčanja",
                  href: "/blog/planiranje-vencanja-checklista",
                },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Gradovi */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80 mb-6">
              Dostupni gradovi
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Audio Guest Book Beograd", href: "/lokacije/beograd" },
                {
                  name: "Audio Guest Book Novi Sad",
                  href: "/lokacije/novi-sad",
                },
                { name: "Audio Guest Book Niš", href: "/lokacije/nis" },
                {
                  name: "Audio Guest Book Kragujevac",
                  href: "/lokacije/kragujevac",
                },
                {
                  name: "Audio Guest Book Subotica",
                  href: "/lokacije/subotica",
                },
                { name: "Svi gradovi →", href: "/lokacije" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-[#F5F4DC]/20">
          <p>&copy; {new Date().getFullYear()} HALO Uspomene.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={10} className="text-[#AE343F]" /> | Halo
            Uspomene
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
