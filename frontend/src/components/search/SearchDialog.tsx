"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, X, Loader2, Package, Lightbulb, FileText, HelpCircle } from "lucide-react";

interface SearchResult {
  type: "product" | "solution" | "article" | "faq";
  title: string;
  slug: string;
  summary?: string;
}

interface SearchResponse {
  products: SearchResult[];
  solutions: SearchResult[];
  articles: SearchResult[];
  faqs: SearchResult[];
}

export function SearchDialog({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const performSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&locale=${locale}`
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
        }
      } catch {
        // Silently fail, keep previous results
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const getResultHref = (result: SearchResult): string => {
    switch (result.type) {
      case "product":
        return `/products/${result.slug}`;
      case "solution":
        return `/solutions/${result.slug}`;
      case "article":
        return `/about/news/${result.slug}`;
      case "faq":
        return "/support";
    }
  };

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.solutions.length > 0 ||
      results.articles.length > 0 ||
      results.faqs.length > 0);

  const categoryIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4 text-brand-cyan" />;
      case "solution":
        return <Lightbulb className="h-4 w-4 text-brand-cyan" />;
      case "article":
        return <FileText className="h-4 w-4 text-brand-cyan" />;
      case "faq":
        return <HelpCircle className="h-4 w-4 text-brand-cyan" />;
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-lg px-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0C1829] shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-5 w-5 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />}
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {loading && !results && (
              <div className="py-8 text-center text-sm text-white/40">
                {t("searching")}
              </div>
            )}

            {query.trim().length >= 2 && !loading && results && !hasResults && (
              <div className="py-8 text-center">
                <p className="text-sm text-white/60">{t("noResults")}</p>
                <p className="mt-1 text-xs text-white/40">{t("noResultsHint")}</p>
              </div>
            )}

            {hasResults && (
              <div className="space-y-2">
                {([
                  { key: "products" as const, label: t("products") },
                  { key: "solutions" as const, label: t("solutions") },
                  { key: "articles" as const, label: t("articles") },
                  { key: "faqs" as const, label: t("faqs") },
                ] as const).map(
                  ({ key, label }) =>
                    results[key].length > 0 && (
                      <div key={key}>
                        <div className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-white/40">
                          {label}
                        </div>
                        {results[key].map((item, idx) => (
                          <Link
                            key={`${key}-${idx}`}
                            href={getResultHref(item)}
                            onClick={() => onOpenChange(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            {categoryIcon(item.type)}
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{item.title}</div>
                              {item.summary && (
                                <div className="truncate text-xs text-white/40">
                                  {item.summary}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )
                )}
              </div>
            )}

            {!query.trim() && (
              <div className="py-6 text-center text-xs text-white/30">
                {t("shortcut")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
