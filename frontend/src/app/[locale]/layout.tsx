import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { getProducts } from "@/lib/api";
import { getStrapiMedia } from "@/lib/strapi";
import { fetchEnabledLocales, getLocalesForBuild } from "@/lib/api/locales";

// Dynamic: fetch enabled locales from Strapi at build time
export const dynamicParams = true;

export async function generateStaticParams() {
  const codes = await getLocalesForBuild();
  return codes.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate against the full superset — middleware already redirects disabled locales
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  // 拉产品数据传给 Header（封面图 + title + tagline，server side）
  const productCovers: Record<string, string> = {};
  const productTitles: Record<string, string> = {};
  const productTaglines: Record<string, string> = {};
  try {
    const products = await getProducts(locale);
    for (const p of products) {
      if (p.cover?.url) productCovers[p.slug] = getStrapiMedia(p.cover.url);
      if (p.title) productTitles[p.slug] = p.title;
      if (p.tagline) productTaglines[p.slug] = p.tagline;
    }
  } catch { /* fallback 到翻译文件 */ }

  // Fetch enabled locales from Strapi (with fallback)
  // Fetch enabled locales — use /api/locales proxy (reads SQLite, always reliable)
  let enabledLocales = await fetchEnabledLocales();
  if (!enabledLocales || enabledLocales.length <= 2) {
    // Fallback: call our own API route directly
    try {
      const res = await fetch('http://localhost:3000/api/locales', {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data: Array<{ code: string; name: string; isDefault: boolean }> = await res.json();
        const { LANGUAGE_META } = await import('@/lib/api/locales');
        enabledLocales = data.map((l) => {
          const meta = LANGUAGE_META[l.code] ?? { label: l.name, native: l.name, flag: '🌐', short: l.code.toUpperCase() };
          return { code: l.code, label: meta.label, native: meta.native, flag: meta.flag, short: meta.short };
        });
      }
    } catch { /* use whatever fetchEnabledLocales returned */ }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header
        locale={locale}
        productCovers={productCovers}
        productTitles={productTitles}
        productTaglines={productTaglines}
        enabledLocales={enabledLocales}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
