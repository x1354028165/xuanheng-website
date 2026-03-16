"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search, ChevronDown, X } from "lucide-react";
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

  // 导航栏透明状态：仅在首页且未滚动时才透明
  // 用内联脚本注入的 __IS_HOME_PAGE 标志初始化，避免首页透明闪现问题
  const [isTransparent, setIsTransparent] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!(window as unknown as Record<string, unknown>).__IS_HOME_PAGE && window.scrollY < 20;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Desktop dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile accordion
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Language full-page overlay
  const [langPageOpen, setLangPageOpen] = useState(false);

  useEffect(() => {
    const p = window.location.pathname;
    const onHome = p === `/${currentLocale}` || p === `/${currentLocale}/` || p === "/";

    if (!onHome) {
      // 非首页：清除 data-page，确保白色导航
      document.documentElement.removeAttribute("data-page");
      document.documentElement.removeAttribute("data-scrolled");
      setIsTransparent(false);
      return;
    }

    // 首页：通过 CSS attribute 控制透明/白色，JS 控制 React 状态保持同步
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

    handleScroll(); // 初始执行
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentLocale, pathname]);


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
    router.push(pathname, { locale: targetLocale as "zh-CN" | "en-US" | "zh-TW" | "de" | "fr" | "es" | "pt" | "ru" });
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
          isTransparent
            ? "bg-transparent"
            : "bg-white/92 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
                    className={`inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "!text-[#38C4E8] font-semibold"
                        : isTransparent
                          ? "text-white/85 hover:text-white"
                          : "text-[#0F172A]/80 hover:text-[#38C4E8]"
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
              className={`rounded-md p-2 transition-colors ${isTransparent ? "text-white/60 hover:text-white hover:bg-white/10" : "text-[#0F172A] hover:text-[#38C4E8] hover:bg-gray-100"}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language switcher trigger */}
            <button
              onClick={() => setLangPageOpen(true)}
              className={`hidden sm:flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors ${isTransparent ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#0F172A]/70 hover:text-[#38C4E8] hover:bg-gray-100"}`}
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.short}</span>
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

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />

      {/* Language full-page overlay */}
      {langPageOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
          <div className="flex items-center justify-between px-8 h-[72px] border-b border-[#E2E8F0]">
            <span className="text-[#0F172A] font-semibold text-lg">选择语言 / Select Language</span>
            <button onClick={() => setLangPageOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
              <X className="h-6 w-6 text-[#0F172A]" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[800px] w-full">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { switchLocale(lang.code); setLangPageOpen(false); }}
                  className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:border-[#38C4E8] hover:shadow-md ${
                    currentLocale === lang.code
                      ? "border-[#38C4E8] bg-[#F0FAFE]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <span className="text-2xl mb-2">{lang.flag}</span>
                  <span className="font-semibold text-[#0F172A] text-base">{lang.label}</span>
                  <span className="text-sm text-[#64748B] mt-1">{lang.native}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
