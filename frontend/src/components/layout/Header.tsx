"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { key: "solutions", href: "/solutions" },
  { key: "products", href: "/products" },
  { key: "ecosystem", href: "/ecosystem" },
  { key: "help", href: "/help" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0C1829]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold font-display text-white">
            AlwaysControl
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ key, href }) => {
            const fullHref = `/${locale}${href}`;
            const isActive = pathname === fullHref;
            return (
              <Link
                key={key}
                href={fullHref}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-cyan"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher Placeholder + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Language switcher placeholder */}
          <span className="hidden text-xs text-white/60 sm:inline-block">
            {locale.toUpperCase()}
          </span>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button variant="ghost" size="icon" className="text-white" />
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0C1829] text-white">
              <SheetTitle className="text-white">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={`/${locale}${href}`}
                    className="text-lg font-medium text-white/80 hover:text-brand-cyan transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(key)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
