import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: `${t('developersPage')} | ${locale === 'zh-CN' || locale === 'zh-TW' ? t('siteName') : t('siteNameEn')}` };
}


export default async function DevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'developers' });

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-[#F8FAFC] pt-32 pb-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#38C4E8]/10 px-4 py-2 text-sm text-[#38C4E8]">
            🚀 {t('badge')}
          </div>
          <h1 className="text-4xl font-bold text-[#0F172A] mb-4">{t('title')}</h1>
          <p className="text-lg text-[#64748B] mb-8">{t('subtitle')}</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#38C4E8] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2BA8C8] transition-colors"
          >
            {t('cta')} →
          </Link>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-12">{t('featuresTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['quickstart', 'cloudApi', 'gatewayApi', 'applyAccess'].map((key) => (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] opacity-60">
                <div className="text-3xl mb-3">{t(`features.${key}.icon`)}</div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{t(`features.${key}.title`)}</h3>
                <p className="text-sm text-[#475569]">{t(`features.${key}.desc`)}</p>
                <span className="mt-3 inline-block text-xs bg-[#F1F5F9] text-[#64748B] px-2 py-1 rounded">{t('comingSoon')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notify CTA */}
      <section className="py-16 bg-white text-center">
        <div className="mx-auto max-w-lg px-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">{t('notifyTitle')}</h2>
          <p className="text-[#475569] mb-6">{t('notifyDesc')}</p>
          <Link
            href="/contact?intent=api"
            className="inline-flex items-center gap-2 bg-[#1A3FAD] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1533A0] transition-colors"
          >
            {t('notifyCta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
