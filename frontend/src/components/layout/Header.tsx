"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search, ChevronDown } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";

/* ─── Types ─── */
interface SubItem {
  key: string;
  href: string;
  desc: string;
}

interface NavGroup {
  labelKey: string;
  items: SubItem[];
}

interface NavItemWithGroups {
  key: string;
  href: string;
  children: { groups: NavGroup[] };
}

interface NavItemWithItems {
  key: string;
  href: string;
  children: { items: SubItem[] };
}

interface NavItemPlain {
  key: string;
  href: string;
  children?: undefined;
}

type NavItem = NavItemWithGroups | NavItemWithItems | NavItemPlain;

function hasGroups(children: { groups?: NavGroup[]; items?: SubItem[] }): children is { groups: NavGroup[] } {
  return Array.isArray((children as { groups?: NavGroup[] }).groups);
}

/* ─── Navigation Config ─── */
const NAV_ITEMS: NavItem[] = [
  {
    key: "products",
    href: "/products",
    children: {
      groups: [
        {
          labelKey: "nav-hardware",
          items: [
            { key: "neuron-ii", href: "/products/neuron-ii", desc: "products-neuron-ii-desc" },
            { key: "neuron-iii", href: "/products/neuron-iii", desc: "products-neuron-iii-desc" },
            { key: "neuron-iii-lite", href: "/products/neuron-iii-lite", desc: "products-neuron-iii-lite-desc" },
          ],
        },
        {
          labelKey: "nav-software",
          items: [
            { key: "hems", href: "/products/hems", desc: "products-hems-desc" },
            { key: "ess", href: "/products/ess", desc: "products-ess-desc" },
            { key: "evcms", href: "/products/evcms", desc: "products-evcms-desc" },
            { key: "pqms", href: "/products/pqms", desc: "products-pqms-desc" },
            { key: "vpp", href: "/products/vpp", desc: "products-vpp-desc" },
          ],
        },
      ],
    },
  },
  {
    key: "solutions",
    href: "/solutions",
    children: {
      items: [
        { key: "hems", href: "/solutions/hems", desc: "solutions-hems-desc" },
        { key: "ess", href: "/solutions/ess", desc: "solutions-ess-desc" },
        { key: "evcms", href: "/solutions/evcms", desc: "solutions-evcms-desc" },
        { key: "vpp", href: "/solutions/vpp", desc: "solutions-vpp-desc" },
        { key: "pqms", href: "/solutions/pqms", desc: "solutions-pqms-desc" },
      ],
    },
  },
  { key: "ecosystem", href: "/ecosystem" },
  { key: "developers", href: "/developers" },
  {
    key: "help",
    href: "/support",
    children: {
      items: [
        { key: "docs", href: "/support/docs", desc: "help-docs-desc" },
        { key: "software", href: "/support/docs", desc: "help-software-desc" },
        { key: "faq", href: "/support/faq", desc: "help-faq-desc" },
        { key: "repair", href: "/support/repair", desc: "help-repair-desc" },
      ],
    },
  },
  {
    key: "about",
    href: "/about",
    children: {
      items: [
        { key: "company", href: "/about", desc: "about-company-desc" },
        { key: "news", href: "/about/news", desc: "about-news-desc" },
        { key: "careers", href: "/about/careers", desc: "about-careers-desc" },
      ],
    },
  },
  { key: "contact", href: "/contact" },
];

const languages = [
  { code: "zh-CN" as const, label: "简体中文", short: "中" },
  { code: "en-US" as const, label: "English", short: "EN" },
  { code: "zh-TW" as const, label: "繁體中文", short: "繁" },
];

/* ─── Component ─── */
export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Desktop dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile accordion
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Language dropdown
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((key: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 50);
  }, []);

  const switchLocale = (targetLocale: string) => {
    router.push(pathname, { locale: targetLocale as "zh-CN" | "en-US" | "zh-TW" });
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  const toggleMobileAccordion = (key: string) => {
    setMobileExpanded((prev) => (prev === key ? null : key));
  };

  /* ─── Render helpers ─── */

  // Render a single sub-item row
  const renderSubItem = (parentKey: string, item: SubItem, onClick?: () => void) => (
    <Link
      key={item.key}
      href={item.href}
      onClick={onClick}
      className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F8FAFC] border-l-2 border-transparent hover:border-[#38C4E8]"
    >
      <div>
        <div className="text-sm font-medium text-gray-900 group-hover:text-[#38C4E8]">
          {t(`${parentKey}-${item.key}`)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{t(item.desc)}</div>
      </div>
    </Link>
  );

  // Desktop mega menu (products with groups)
  const renderMegaMenu = (nav: NavItemWithGroups) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-[560px] rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-4"
      onMouseEnter={() => handleMouseEnter(nav.key)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid grid-cols-2 gap-4">
        {nav.children.groups.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t(group.labelKey)}
            </div>
            <div className="flex flex-col">
              {group.items.map((item) => renderSubItem(nav.key, item, () => setOpenDropdown(null)))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop simple dropdown
  const renderDropdown = (nav: NavItemWithItems) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-[280px] rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-2"
      onMouseEnter={() => handleMouseEnter(nav.key)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col">
        {nav.children.items.map((item) => renderSubItem(nav.key, item, () => setOpenDropdown(null)))}
      </div>
    </div>
  );

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
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((nav) => {
              const isActive = pathname === nav.href || pathname.startsWith(`${nav.href}/`);
              const hasChildren = !!nav.children;

              return (
                <div
                  key={nav.key}
                  className="relative"
                  onMouseEnter={() => hasChildren && handleMouseEnter(nav.key)}
                  onMouseLeave={() => hasChildren && handleMouseLeave()}
                >
                  <Link
                    href={nav.href}
                    className={`inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand-cyan"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {t(nav.key)}
                    {hasChildren && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          openDropdown === nav.key ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown panels */}
                  {openDropdown === nav.key && nav.children && (
                    hasGroups(nav.children)
                      ? renderMegaMenu(nav as NavItemWithGroups)
                      : renderDropdown(nav as NavItemWithItems)
                  )}
                </div>
              );
            })}
          </nav>

          {/* Search + Language + Mobile Menu */}
          <div className="flex items-center gap-2">
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
          <div className="md:hidden bg-[#0C1829]/95 backdrop-blur-md border-t border-white/10 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col gap-1 px-4 py-4">
              {NAV_ITEMS.map((nav) => {
                const hasChildren = !!nav.children;
                const isExpanded = mobileExpanded === nav.key;

                return (
                  <div key={nav.key}>
                    {/* Parent item */}
                    <div className="flex items-center">
                      <Link
                        href={nav.href}
                        className="flex-1 rounded-md px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                        onClick={() => {
                          if (!hasChildren) setMobileOpen(false);
                        }}
                      >
                        {t(nav.key)}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => toggleMobileAccordion(nav.key)}
                          className="p-3 text-white/60 hover:text-white transition-colors"
                          aria-label="Toggle submenu"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Mobile sub-items */}
                    {hasChildren && isExpanded && nav.children && (
                      <div className="ml-4 mb-2 border-l border-white/10 pl-2">
                        {hasGroups(nav.children)
                          ? nav.children.groups.map((group) => (
                              <div key={group.labelKey} className="mb-2">
                                <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                  {t(group.labelKey)}
                                </div>
                                {group.items.map((item) => (
                                  <Link
                                    key={item.key}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-sm text-white/70 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {t(`${nav.key}-${item.key}`)}
                                  </Link>
                                ))}
                              </div>
                            ))
                          : (nav.children as { items: SubItem[] }).items.map((item) => (
                              <Link
                                key={item.key}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-sm text-white/70 hover:text-brand-cyan hover:bg-white/5 transition-colors"
                                onClick={() => setMobileOpen(false)}
                              >
                                {t(`${nav.key}-${item.key}`)}
                              </Link>
                            ))}
                      </div>
                    )}
                  </div>
                );
              })}

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

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </>
  );
}
