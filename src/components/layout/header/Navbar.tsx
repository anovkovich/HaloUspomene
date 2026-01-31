"use client";

import React, { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Zašto mi", href: "#concept" },
  { name: "Proces", href: "#how-it-works" },
  { name: "Paketi", href: "#packages" },
  { name: "Galerija", href: "#gallery" },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-[#F5F4DC]/90 backdrop-blur-lg border-b border-[#232323]/5 py-2" : "bg-transparent py-6"}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-3 group">
              <img
                src="/HaloUspomene/images/logo.png"
                alt="Halo Uspomene LOGO"
                className="h-10 mb-1"
              />
              <span className="text-2xl mb-[-10px] font-serif font-bold tracking-tight text-[#232323]">
                <span className="text-[#AE343F]">Uspomene</span>
              </span>
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm font-semibold text-[#232323]/70 hover:text-[#AE343F] transition-colors tracking-widest uppercase"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#book"
              className="btn bg-[#232323] hover:bg-[#AE343F] text-[#F5F4DC] rounded-full px-10 shadow-xl shadow-black/10 border-none transition-all"
            >
              Kontakt
            </a>
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
        className={`lg:hidden absolute top-full left-0 w-full bg-[#F5F4DC] border-b border-[#232323]/10 shadow-2xl transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="p-4 sm:p-6 space-y-4">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-serif text-[#232323] hover:text-[#AE343F] py-2 transition-colors min-h-[44px] flex items-center"
              >
                {link.name}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a
              href="#book"
              onClick={() => setIsMenuOpen(false)}
              className="btn bg-[#AE343F] hover:bg-[#8A2A32] w-full text-[#F5F4DC] rounded-xl text-lg border-none min-h-[48px]"
            >
              Zakažite razgovor
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
