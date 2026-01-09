import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Instagram } from "lucide-react"; // Možeš koristiti lucide ili obične SVG-ove

const Footer = () => {
  return (
    <footer className="bg-slate-700 text-slate-300 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* GLAVNI DEO FOOTERA */}
        <div className="footer grid-cols-1 md:grid-cols-3 gap-12 pb-12">
          {/* KOLONA 1: LOGO I OPIS */}
          <aside className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/"
                className="btn-ghost hover:bg-transparent border-0 text-xl font-bold tracking-tighter"
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={150}
                  height={45}
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              OsiguranjeNaKlik štedi novac i vreme prilikom odabira i kupovine
              osiguranja kao Vaš lični posrednik u osiguranju. Besplatno, lako i
              sigurno.
            </p>
          </aside>

          {/* KOLONA 2: OSIGURANJE */}
          <nav>
            <h6 className="footer-title text-primary opacity-100 mb-6">
              Osiguranje
            </h6>
            <div className="flex flex-col gap-4">
              <Link
                href="/pomoc-na-putu"
                className="link link-hover hover:text-white transition-colors"
              >
                Pomoć na putu
              </Link>
              <Link
                href="/putno-osiguranje"
                className="link link-hover hover:text-white transition-colors"
              >
                Putno osiguranje
              </Link>
              <Link
                href="/osiguranje-domacinstva"
                className="link link-hover hover:text-white transition-colors"
              >
                Osiguranje domaćinstva
              </Link>
            </div>
          </nav>

          {/* KOLONA 3: KORISNI LINKOVI */}
          <nav>
            <h6 className="footer-title text-primary opacity-100 mb-6">
              Korisni linkovi
            </h6>
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="link link-hover hover:text-white transition-colors"
              >
                Početna
              </Link>
              <Link
                href="/o-nama"
                className="link link-hover hover:text-white transition-colors"
              >
                O nama
              </Link>
              <Link
                href="/faq"
                className="link link-hover hover:text-white transition-colors"
              >
                Najčešće postavljena pitanja
              </Link>
              <Link
                href="/uslovi"
                className="link link-hover hover:text-white transition-colors"
              >
                Uslovi korišćenja i pravila
              </Link>
              <Link
                href="/kontakt"
                className="link link-hover hover:text-white transition-colors"
              >
                Kontakt
              </Link>
            </div>
          </nav>
        </div>

        {/* LINIJA RAZDVAJANJA */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* DONJI DEO FOOTERA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          {/* Copyright */}
          <div className="opacity-60 order-3 md:order-1">
            © Copyright 2026 Osiguranje na klik
          </div>

          {/* Kolačići i Socials */}
          <div className="flex flex-col md:flex-row items-center gap-8 order-1 md:order-2">
            <Link
              href="/cookies"
              className="link link-hover opacity-80 hover:text-white"
            >
              Preferencije o kolačićima
            </Link>

            {/* Social Icons */}
            <div className="flex items-center gap-5">
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
