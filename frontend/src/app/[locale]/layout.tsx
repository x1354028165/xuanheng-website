import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { getProducts } from "@/lib/api";
import { getStrapiMedia } from "@/lib/strapi";
import { fetchEnabledLocales } from "@/lib/api/locales";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
  const enabledLocales = await fetchEnabledLocales();

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
