"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";

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
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0C1829]/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-display text-white">
              AlwaysControl
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ key, href }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={key}
                  href={href}
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

          {/* Search + Language + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language switcher placeholder */}
            <span className="hidden text-xs text-white/60 sm:inline-block">
              {locale.toUpperCase()}
            </span>

            {/* Mobile hamburger */}
            <button
              className="md:hidden rounded-md p-2 text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
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
                {mobileOpen ? (
                  <>
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Panel */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0C1829]/95 backdrop-blur-md border-t border-white/10">
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="rounded-md px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </>
  );
}
