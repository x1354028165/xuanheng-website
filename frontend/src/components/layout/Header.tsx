"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search, ChevronDown, X, Globe } from "lucide-react";
import { SearchDialog } from "@/components/search/SearchDialog";
import Image from "next/image";

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

/* ─── Product image map ─── */
const PRODUCT_IMAGES: Record<string, string> = {
  "neuron-ii": "/images/neuron-ii-clean.png",
  "neuron-iii": "/images/neuron-iii-clean.png",
  "neuron-iii-lite": "/images/neuron-iii-lite-clean.png",
};

/* ─── Software emoji map ─── */
const SOFTWARE_ICONS: Record<string, string> = {
  hems: "🏠",
  ess: "🔋",
  evcms: "⚡",
  pqms: "📊",
  vpp: "🌐",
};

/* ─── Navigation Config ─── */
const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/" },
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
    href: "/solutions/hems",
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
  { code: "zh-CN" as const, label: "简体中文", native: "Chinese (Simplified)", flag: "🇨🇳", short: "中文" },
  { code: "en-US" as const, label: "English", native: "English (US)", flag: "🇺🇸", short: "EN" },
  { code: "zh-TW" as const, label: "繁體中文", native: "Chinese (Traditional)", flag: "🇹🇼", short: "繁中" },
  { code: "de" as const, label: "Deutsch", native: "German", flag: "🇩🇪", short: "DE" },
  { code: "fr" as const, label: "Français", native: "French", flag: "🇫🇷", short: "FR" },
  { code: "es" as const, label: "Español", native: "Spanish", flag: "🇪🇸", short: "ES" },
  { code: "pt" as const, label: "Português", native: "Portuguese", flag: "🇵🇹", short: "PT" },
  { code: "ru" as const, label: "Русский", native: "Russian", flag: "🇷🇺", short: "RU" },
];

/* ─── Component ─── */
export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const [isTransparent, setIsTransparent] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!(window as unknown as Record<string, unknown>).__IS_HOME_PAGE && window.scrollY < 20;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Desktop mega menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Products panel: active category tab (index into groups)
  const [activeProductTab, setActiveProductTab] = useState(0);

  // Mobile accordion
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Language full-page overlay
  const [langPageOpen, setLangPageOpen] = useState(false);

  useEffect(() => {
    const p = window.location.pathname;
    const onHome = p === `/${currentLocale}` || p === `/${currentLocale}/` || p === "/";

    if (!onHome) {
      document.documentElement.removeAttribute("data-page");
      document.documentElement.removeAttribute("data-scrolled");
      setIsTransparent(false);
      return;
    }

    document.documentElement.setAttribute("data-page", "home");

    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled) {
        document.documentElement.setAttribute("data-scrolled", "");
        setIsTransparent(false);
      } else {
        document.documentElement.removeAttribute("data-scrolled");
        setIsTransparent(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentLocale, pathname]);

  // When mega menu opens for products, reset to first tab
  useEffect(() => {
    if (openDropdown === "products") {
      setActiveProductTab(0);
    }
  }, [openDropdown]);

  // Force close mega menu when dropdown is open and transparent state changes (user scrolled)
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
    }, 80);
  }, []);

  const switchLocale = (targetLocale: string) => {
    router.push(pathname, { locale: targetLocale as "zh-CN" | "en-US" | "zh-TW" | "de" | "fr" | "es" | "pt" | "ru" });
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  const toggleMobileAccordion = (key: string) => {
    setMobileExpanded((prev) => (prev === key ? null : key));
  };

  /* ─── Desktop Mega Menu Panels ─── */

  // Products mega panel: left category tabs + right product cards
  const renderProductsPanel = (nav: NavItemWithGroups) => {
    const activeGroup = nav.children.groups[activeProductTab];

    return (
      <div className="max-w-[1440px] mx-auto px-[60px] py-8">
        <div className="flex gap-10">
          {/* Left: category tabs */}
          <div className="w-1/4 flex flex-col gap-1 border-r border-[#E2E8F0] pr-8">
            {nav.children.groups.map((group, idx) => (
              <button
                key={group.labelKey}
                onMouseEnter={() => setActiveProductTab(idx)}
                onClick={() => setActiveProductTab(idx)}
                className={`text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  activeProductTab === idx
                    ? "bg-[#F1F5F9] text-[#1A3FAD]"
                    : "text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#38C4E8]"
                }`}
              >
                {t(group.labelKey)}
              </button>
            ))}
          </div>

          {/* Right: product cards */}
          <div className="w-3/4">
            <div className="font-semibold text-xs uppercase tracking-widest text-[#64748B] mb-4">
              {t(activeGroup.labelKey)}
            </div>
            <div className={`grid gap-4 ${activeGroup.items.length <= 3 ? "grid-cols-3" : "grid-cols-3 lg:grid-cols-5"}`}>
              {activeGroup.items.map((item) => {
                const img = PRODUCT_IMAGES[item.key];
                const emoji = SOFTWARE_ICONS[item.key];

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpenDropdown(null)}
                    className="group flex flex-col items-center gap-3 rounded-xl p-4 transition-colors hover:bg-[#F8FAFC]"
                  >
                    {/* Product image or emoji icon */}
                    {img ? (
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={img}
                          alt={t(`products-${item.key}`)}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-2xl flex-shrink-0">
                        {emoji || "📦"}
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-sm font-medium text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
                        {t(`products-${item.key}`)}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                        {t(item.desc)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Solutions mega panel: vertical list with descriptions
  const renderSolutionsPanel = (nav: NavItemWithItems) => (
    <div className="max-w-[1440px] mx-auto px-[60px] py-8">
      <div className="flex gap-10">
        <div className="w-1/4 pr-8">
          <div className="text-lg font-semibold text-[#0F172A]">{t("solutions")}</div>
          <div className="text-sm text-[#94A3B8] mt-1">{t("solutions-hems-desc")}</div>
        </div>
        <div className="w-3/4">
          <div className="grid grid-cols-1 gap-1">
            {nav.children.items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpenDropdown(null)}
                className="group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#38C4E8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
                    {t(`solutions-${item.key}`)}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{t(item.desc)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // About mega panel: horizontal cards
  const renderAboutPanel = (nav: NavItemWithItems) => (
    <div className="max-w-[1440px] mx-auto px-[60px] py-8">
      <div className="grid grid-cols-3 gap-6">
        {nav.children.items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setOpenDropdown(null)}
            className="group rounded-xl p-5 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="text-sm font-medium text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
              {t(`about-${item.key}`)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">{t(item.desc)}</div>
          </Link>
        ))}
      </div>
    </div>
  );

  // Help mega panel: horizontal cards
  const renderHelpPanel = (nav: NavItemWithItems) => (
    <div className="max-w-[1440px] mx-auto px-[60px] py-8">
      <div className="grid grid-cols-4 gap-6">
        {nav.children.items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setOpenDropdown(null)}
            className="group rounded-xl p-5 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="text-sm font-medium text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
              {t(`help-${item.key}`)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">{t(item.desc)}</div>
          </Link>
        ))}
      </div>
    </div>
  );

  // Render the correct mega panel based on nav key
  const renderMegaPanel = (nav: NavItem) => {
    if (!nav.children) return null;

    if (nav.key === "products" && hasGroups(nav.children)) {
      return renderProductsPanel(nav as NavItemWithGroups);
    }
    if (nav.key === "solutions" && !hasGroups(nav.children)) {
      return renderSolutionsPanel(nav as NavItemWithItems);
    }
    if (nav.key === "about" && !hasGroups(nav.children)) {
      return renderAboutPanel(nav as NavItemWithItems);
    }
    if (nav.key === "help" && !hasGroups(nav.children)) {
      return renderHelpPanel(nav as NavItemWithItems);
    }

    return null;
  };

  // Check if any mega menu is open
  const activeMegaNav = openDropdown
    ? NAV_ITEMS.find((n) => n.key === openDropdown && n.children)
    : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/92 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm"
        }`}
      >
        <div className="flex h-[72px] w-full items-center justify-between px-4 sm:px-8 lg:px-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {isTransparent ? (
              <Image src="/images/logo-white.png" alt="AlwaysControl Technology" width={160} height={36} className="h-9 w-auto" />
            ) : (
              <Image src="/images/logo.png" alt="AlwaysControl Technology" width={160} height={36} className="h-9 w-auto" />
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((nav) => {
              const isActive = pathname === nav.href || (nav.href !== "/" && pathname.startsWith(`${nav.href}/`));
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
                    className={`inline-flex items-center gap-0.5 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#38C4E8] font-semibold"
                        : openDropdown === nav.key
                          ? isTransparent ? "text-white" : "text-[#38C4E8]"
                          : isTransparent
                            ? "text-white/85 hover:text-white"
                            : "text-[#0F172A] hover:text-[#38C4E8]"
                    }`}
                  >
                    {t(nav.key)}
                    {hasChildren && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-150 ${
                          openDropdown === nav.key ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Active indicator underline */}
                  {(isActive || openDropdown === nav.key) && (
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#38C4E8] rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Search + Language + Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className={`rounded-md p-2 transition-colors ${isTransparent ? "text-white/60 hover:text-white hover:bg-white/10" : "text-[#0F172A] hover:text-[#38C4E8] hover:bg-gray-100"}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language switcher trigger */}
            <button
              onClick={() => setLangPageOpen(true)}
              className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors ${isTransparent ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#0F172A]/70 hover:text-[#38C4E8] hover:bg-gray-100"}`}
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden rounded-md p-2 transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"}`}
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

        {/* ─── Desktop Mega Menu Panel (full-width, below navbar) ─── */}
        <div
          className={`hidden md:block fixed left-0 w-screen bg-white shadow-lg transition-all duration-150 ease-out overflow-hidden ${
            activeMegaNav
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ top: "72px" }}
          onMouseEnter={() => {
            if (openDropdown) handleMouseEnter(openDropdown);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {activeMegaNav && renderMegaPanel(activeMegaNav)}
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
                <button
                  onClick={() => { setMobileOpen(false); setLangPageOpen(true); }}
                  className="flex items-center gap-2 px-3 py-3 text-base font-medium text-white/80 hover:text-brand-cyan hover:bg-white/5 transition-colors rounded-md w-full"
                >
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.label}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 语言选择器蒙版 */}
      {langPageOpen && (
        <div
          className="fixed inset-0 z-[190] bg-black/40"
          onClick={() => setLangPageOpen(false)}
        />
      )}

      {/* 语言面板 — 从顶部滑下 */}
      <div
        className={`fixed top-0 left-0 right-0 z-[200] bg-white shadow-lg transition-transform duration-300 ease-out ${
          langPageOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* 面板顶栏 */}
        <div className="flex items-center justify-between px-8 sm:px-16 h-[72px] border-b border-[#F1F5F9]">
          <Globe className="h-5 w-5 text-[#94A3B8]" />
          <button
            onClick={() => setLangPageOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="h-4 w-4 text-[#64748B]" />
          </button>
        </div>

        {/* 语言选项 4列×2行 */}
        <div className="px-8 sm:px-16 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 max-w-[800px]">
            {languages.map((lang) => {
              const isActive = currentLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => { switchLocale(lang.code); setLangPageOpen(false); }}
                  className={`flex flex-col items-start px-4 py-3 rounded-lg text-left transition-colors duration-150 ${
                    isActive
                      ? "bg-[#F1F5F9]"
                      : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className={`text-[15px] leading-snug ${isActive ? "font-semibold text-[#0F172A]" : "font-medium text-[#0F172A]"}`}>
                    {lang.label}
                  </span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5">{lang.native}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </>
  );
}
