// components/Header.tsx
import Link from "next/link";
import NavbarShell from "./NavbarShell";
import MobileMenu from "./MobileMenu";
import Image from "next/image";

const Header = () => {
  const navLinks = [
    { name: "Pomoć na putu", href: "/" },
    { name: "Putno osiguranje", href: "/" },
    { name: "Osiguranje domaćinstava", href: "/" },
  ];

  return (
    <NavbarShell>
      {/* LEFT: Logo - Renderuje se na serveru */}
      <div className="navbar-start">
        <Link
          href="/"
          className="btn-ghost hover:bg-transparent border-0 text-xl font-bold tracking-tighter"
        >
          <Image src="/images/logo.png" alt="Logo" width={150} height={45} />
        </Link>
      </div>

      {/* CENTER: Desktop Links - Renderuje se na serveru */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2 font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: CTA i Mobilni Meni */}
      <div className="navbar-end gap-2">
        <Link href="/" className="btn btn-primary rounded-full hidden lg:flex">
          Moj nalog
        </Link>

        {/* Samo je ovaj deo interaktivan klijentski */}
        <MobileMenu links={navLinks} />
      </div>
    </NavbarShell>
  );
};

export default Header;
