import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Instagram, Mail, ArrowRight } from "lucide-react";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);
import { CATEGORY_CONTENT } from "@/data/vendori/categories";
import { CATEGORY_META } from "@/app/moje-vencanje/vendor-constants";

const vendorCategoryLinks = CATEGORY_META.map((meta) => {
  const content = CATEGORY_CONTENT.find((c) => c.category === meta.id);
  return content
    ? { name: meta.labelPlural, href: `/vendori/${content.slug}` }
    : null;
}).filter((x): x is { name: string; href: string } => x !== null);

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
              sizes="216px"
              loading="lazy"
              quality={80}
              className="w-54 h-auto mb-6"
            />
            <p className="text-[#F5F4DC]/40 leading-relaxed mb-4 text-justify">
              HALO Uspomene — kompletna platforma za organizaciju venčanja.
              Website pozivnice sa RSVP-om, rasporedom sedenja i audio knjigom
              utisaka. Retro telefon uspomena za nezaboravne glasovne poruke
              gostiju. Sve što vam treba — na jednom mestu.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:halouspomene@gmail.com"
                aria-label="Pošalji email na halouspomene@gmail.com"
                className="text-[#F5F4DC]/60 hover:text-[#AE343F] transition-colors"
                data-track="social_click"
                data-track-platform="email"
                data-track-location="footer"
              >
                <Mail size={20} />
              </a>
              <a
                href="https://wa.me/381677621766"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pošalji WhatsApp poruku na +381 67 762 1766"
                className="text-[#F5F4DC]/60 hover:text-[#AE343F] transition-colors"
                data-track="social_click"
                data-track-platform="whatsapp"
                data-track-location="footer"
              >
                <WhatsAppIcon size={20} />
              </a>
              <a
                href="https://www.instagram.com/halo_uspomene"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#F5F4DC]/60 hover:text-[#AE343F] transition-colors"
                data-track="social_click"
                data-track-platform="instagram"
                data-track-location="footer"
              >
                <Instagram size={20} />
                <span className="text-sm">@halo_uspomene</span>
              </a>
            </div>
            <a
              href="/OP%C5%A0TI%20USLOVI%20NAJMA%20I%20KORI%C5%A0%C4%86ENJA%20AUDIO%20GUEST%20BOOK%20URE%C4%90AJA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-[#F5F4DC]/30 hover:text-[#AE343F] transition-colors text-xs"
            >
              Opšti uslovi najma
            </a>
          </div>

          {/* Column 2: Pozivnice */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80 mb-6">
              Pozivnice
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Website Pozivnice", href: "/pozivnice" },
                { name: "QR Pano dobrodošlice", href: "/qr-pano-dobrodoslice" },
                { name: "Telefon Uspomena", href: "/telefon-uspomena" },
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

        {/* Alati */}
        <div className="border-t border-white/5 pt-10 sm:pt-12 mb-10 sm:mb-12">
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 items-baseline">
            <li>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80">
                Alati
              </h4>
            </li>
            {[
              { name: "Planer za Venčanje", href: "/planiranje-vencanja" },
              {
                name: "Raspored sedenja za organizatore",
                href: "/raspored-sedenja",
              },
              { name: "Vendori", href: "/vendori" },
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

        {/* Vendori po kategorijama */}
        <div className="border-t border-white/5 pt-10 sm:pt-12 mb-12 sm:mb-16">
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5F4DC]/80 mb-6">
            Vendori po kategorijama
          </h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            {vendorCategoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/vendori"
                className="inline-flex items-center gap-1.5 text-[#F5F4DC]/40 hover:text-[#AE343F] transition-colors text-sm"
              >
                Svi vendori
                <ArrowRight size={12} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Cancellation policy */}
        <div className="border-t border-white/5 pt-8 pb-6">
          <p className="text-[11px] text-[#F5F4DC]/25 leading-relaxed max-w-3xl">
            <span className="text-[#F5F4DC]/40 font-semibold uppercase tracking-widest text-[10px]">Politika odustanka — </span>
            U slučaju odustanka nakon popunjenog i poslatog formulara, korisnik je dužan da uplati 50% od ukupne vrednosti usluge na ime naknade za obavljeni posao. Slanjem formulara prihvatate ove uslove.
          </p>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-[#F5F4DC]/20">
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
