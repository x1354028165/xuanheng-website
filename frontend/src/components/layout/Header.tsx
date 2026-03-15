"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";

const navLinks = [
  { key: "products", href: "/products" },
  { key: "solutions", href: "/solutions" },
  { key: "ecosystem", href: "/ecosystem" },
  // developers tooltip is rendered separately between ecosystem and help
  { key: "help", href: "/help" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

const languages = [
  { code: "zh-CN" as const, label: "简体中文", short: "中" },
  { code: "en-US" as const, label: "English", short: "EN" },
  { code: "zh-TW" as const, label: "繁體中文", short: "繁" },
];

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Developer tooltip state
  const [devTooltipOpen, setDevTooltipOpen] = useState(false);
  const devTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const devTooltipRef = useRef<HTMLDivElement>(null);

  // Language dropdown state
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Mobile developer tooltip state
  const [mobileDevTooltipOpen, setMobileDevTooltipOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (devTooltipRef.current && !devTooltipRef.current.contains(e.target as Node)) {
        setDevTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDevMouseEnter = useCallback(() => {
    devTooltipTimer.current = setTimeout(() => setDevTooltipOpen(true), 300);
  }, []);

  const handleDevMouseLeave = useCallback(() => {
    if (devTooltipTimer.current) {
      clearTimeout(devTooltipTimer.current);
      devTooltipTimer.current = null;
    }
    setDevTooltipOpen(false);
  }, []);

  const switchLocale = (targetLocale: string) => {
    router.push(pathname, { locale: targetLocale as "zh-CN" | "en-US" | "zh-TW" });
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  // Split navLinks into before-developers and after-developers
  const beforeDev = navLinks.slice(0, 3); // products, solutions, ecosystem
  const afterDev = navLinks.slice(3); // help, about, contact

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
            {beforeDev.map(({ key, href }) => {
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

            {/* Developer Center Tooltip */}
            <div
              ref={devTooltipRef}
              className="relative"
              onMouseEnter={handleDevMouseEnter}
              onMouseLeave={handleDevMouseLeave}
            >
              <button
                className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => setDevTooltipOpen(!devTooltipOpen)}
                type="button"
              >
                {t("developers")}
              </button>
              {devTooltipOpen && (
                <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 w-72 rounded-lg bg-[#0C1829] border border-white/10 shadow-xl p-4">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#0C1829] border-l border-t border-white/10" />
                  <p className="text-white text-sm leading-relaxed mb-3">
                    🚀 开发者中心即将上线 · API 文档 / SDK 正在准备中
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 rounded-md bg-brand-cyan px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-cyan/90 transition-colors"
                    onClick={() => setDevTooltipOpen(false)}
                  >
                    立即留资 →
                  </Link>
                </div>
              )}
            </div>

            {afterDev.map(({ key, href }) => {
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

            {/* Language switcher */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                type="button"
              >
                <span>🌐</span>
                <span>{currentLang.short}</span>
                <svg
                  className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg bg-[#0C1829] border border-white/10 shadow-xl py-1 overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        currentLocale === lang.code
                          ? "text-brand-cyan bg-white/5"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
              {beforeDev.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="rounded-md px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(key)}
                </Link>
              ))}

              {/* Mobile Developer Center */}
              <div className="relative">
                <button
                  className="w-full text-left rounded-md px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                  onClick={() => setMobileDevTooltipOpen(!mobileDevTooltipOpen)}
                  type="button"
                >
                  {t("developers")}
                </button>
                {mobileDevTooltipOpen && (
                  <div className="mx-3 mb-2 rounded-lg bg-white/5 border border-white/10 p-4">
                    <p className="text-white text-sm leading-relaxed mb-3">
                      🚀 开发者中心即将上线 · API 文档 / SDK 正在准备中
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1 rounded-md bg-brand-cyan px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-cyan/90 transition-colors"
                      onClick={() => {
                        setMobileDevTooltipOpen(false);
                        setMobileOpen(false);
                      }}
                    >
                      立即留资 →
                    </Link>
                  </div>
                )}
              </div>

              {afterDev.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="rounded-md px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(key)}
                </Link>
              ))}

              {/* Mobile Language Switcher */}
              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="flex gap-2 px-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        switchLocale(lang.code);
                        setMobileOpen(false);
                      }}
                      className={`rounded-md px-3 py-2 text-sm transition-colors ${
                        currentLocale === lang.code
                          ? "text-brand-cyan bg-white/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang.short}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </>
  );
}
