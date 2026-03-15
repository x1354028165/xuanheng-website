import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "旭衡电子 | AlwaysControl Technology",
    template: "%s | 旭衡电子",
  },
  description: "AlwaysControl Technology — 跨品牌能源管理解决方案，覆盖户用储能、工商储、充电站、VPP全场景",
};

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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header locale={locale} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
