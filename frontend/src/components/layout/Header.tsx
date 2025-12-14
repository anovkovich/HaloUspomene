"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
// Adjust these imports to match where your components actually live
import Button from "@/components/ui/buttons/Button";
import IconButton from "@/components/ui/buttons/IconButton";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auth State
  const [authStatus, setAuthStatus] = useState<"loading" | "guest" | "user">(
    "loading"
  );

  // YOUR LINKS
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Basic modal", href: "/modals/basic" },
    { name: "Confirmation modal", href: "/modals" },
  ];

  // (Safe Hydration)
  useEffect(() => {
    const token = Cookies.get("token");

    // Defer state update to avoid synchronous setState in effect
    const id = setTimeout(() => {
      setAuthStatus(token ? "user" : "guest");
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setAuthStatus("guest");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. LOGO */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              NextApp
            </span>
          </Link>
        </div>

        {/* 2. DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. ACTIONS (Dynamic based on Auth) */}
        <div className="hidden md:flex items-center gap-4">
          {/* LOADING STATE (Skeleton) */}
          {authStatus === "loading" && (
            <div className="w-24 h-9 bg-muted/20 animate-pulse rounded-md" />
          )}

          {/* USER LOGGED IN */}
          {authStatus === "user" && (
            <>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  My Profile
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {/* GUEST (Your old buttons) */}
          {authStatus === "guest" && (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 4. MOBILE MENU TOGGLE */}
        <div className="flex md:hidden">
          <IconButton
            variant="ghost"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12h16M4 6h16M4 18h16" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {/* 5. MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {/* Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {authStatus === "loading" && (
                <div className="w-full h-10 bg-muted/20 animate-pulse rounded-md" />
              )}

              {authStatus === "user" && (
                <>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      My Profile
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="w-full justify-center"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}

              {authStatus === "guest" && (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
