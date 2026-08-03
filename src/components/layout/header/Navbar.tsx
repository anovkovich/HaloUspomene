"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavChild {
  name: string;
  href: string;
  desc: string;
}

interface NavLink {
  name: string;
  href?: string;
  children?: NavChild[];
}

// Padajuća lista se uvek renderuje u DOM (skriva se samo CSS-om), pa su svi
// linkovi vidljivi pretraživačima bez obzira na to da li je meni otvoren.
const navLinks: NavLink[] = [
  { name: "Cene", href: "/cene" },
  { name: "Pozivnice", href: "/pozivnice" },
  { name: "QR-Galerija", href: "/qr-galerija-slika-sa-vencanja" },
  { name: "QR-Pano", href: "/qr-pano-dobrodoslice" },
  {
    name: "Iznajmljivanje",
    children: [
      {
        name: "Retro telefon",
        href: "/telefon-uspomena",
        desc: "Audio knjiga uspomena — poruke gostiju",
      },
      {
        name: "Paviljoni i oprema",
        href: "/iznajmljivanje-opreme-za-vencanje",
        desc: "Paviljoni i barski stolovi za doček",
      },
      {
        name: "Retro automobili",
        href: "/iznajmljivanje-oldtajmera-za-vencanje",
        desc: "Oldtajmeri sa vozačem za mladence",
      },
      {
        name: "Luksuzni automobili",
        href: "/iznajmljivanje-automobila-za-vencanje",
        desc: "Mercedes flota sa profesionalnim šoferom",
      },
    ],
  },
  { name: "Blog", href: "/blog" },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zatvori padajuću listu klikom van menija ili tasterom Escape.
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  const closeAll = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-[#F5F4DC]/90 backdrop-blur-lg border-b border-[#232323]/5 py-2" : `${isMenuOpen ? "bg-[#F5F4DC]" : "bg-transparent"} py-6`}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/full-logo.png"
                alt="HALO Uspomene - Audio Guest Book za Venčanja u Srbiji"
                width={3519}
                height={1798}
                className="h-14 mb-1 w-auto"
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.name} className="relative group">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === link.name ? null : link.name,
                        )
                      }
                      aria-expanded={openDropdown === link.name}
                      aria-haspopup="true"
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#232323]/70 hover:text-[#AE343F] group-hover:text-[#AE343F] transition-colors tracking-widest uppercase cursor-pointer"
                    >
                      {link.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          openDropdown === link.name
                            ? "rotate-180"
                            : "group-hover:rotate-180"
                        }`}
                      />
                    </button>

                    {/* Uvek u DOM-u zbog indeksiranja — vidljivost ide preko CSS-a */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 w-72 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 ${
                        openDropdown === link.name
                          ? "visible opacity-100 translate-y-0"
                          : "invisible opacity-0 -translate-y-1"
                      }`}
                    >
                      <ul className="bg-[#F5F4DC] rounded-2xl border border-[#232323]/8 shadow-2xl shadow-[#232323]/10 overflow-hidden py-2">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={closeAll}
                              className="block px-5 py-3 hover:bg-[#AE343F]/8 transition-colors"
                            >
                              <span className="block text-sm font-semibold text-[#232323] hover:text-[#AE343F]">
                                {child.name}
                              </span>
                              <span className="block text-xs text-[#232323]/45 mt-0.5 leading-snug">
                                {child.desc}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={link.name}>
                    <Link
                      href={link.href!}
                      className="text-sm font-semibold text-[#232323]/70 hover:text-[#AE343F] transition-colors tracking-widest uppercase"
                    >
                      {link.name}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <Link
              href="/moje-vencanje"
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] text-[#F5F4DC] rounded-full px-10 shadow-xl shadow-[#AE343F]/20 border-none transition-all"
            >
              MOJE VENČANJE
            </Link>
          </div>

          <button
            className="lg:hidden btn btn-ghost btn-circle text-[#232323] min-w-[44px] min-h-[44px]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu with CSS transition */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-[#F5F4DC] -mt-px shadow-2xl transition-all duration-300 overflow-hidden ${
          isMenuOpen
            ? "max-h-[calc(100vh-5rem)] overflow-y-auto opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <ul className="py-2">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.name}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#232323]/40 text-center pt-4 pb-1">
                  {link.name}
                </p>
                <ul>
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={closeAll}
                        className="block text-lg font-serif text-[#232323] hover:text-[#AE343F] hover:bg-[#232323]/3 py-3 text-center transition-colors min-h-[44px]"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mx-auto my-2 h-px w-16 bg-[#232323]/10" />
              </li>
            ) : (
              <li key={link.name}>
                <Link
                  href={link.href!}
                  onClick={closeAll}
                  className="block text-xl font-serif text-[#232323] hover:text-[#AE343F] hover:bg-[#232323]/3 py-3.5 text-center transition-colors min-h-[44px]"
                >
                  {link.name}
                </Link>
              </li>
            ),
          )}
          <li className="px-4 sm:px-6 pt-3 pb-4">
            <Link
              href="/moje-vencanje"
              onClick={closeAll}
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] w-full text-[#F5F4DC] rounded-xl text-lg border-none min-h-[48px]"
            >
              Moje venčanje
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
