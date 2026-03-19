import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: `${t('aboutPage')} | ${locale === 'zh-CN' || locale === 'zh-TW' ? t('siteName') : t('siteNameEn')}` };
}

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const milestones = Array.from({ length: 8 }, (_, i) => ({
    year: t(`milestones.${i}.year`),
    text: t(`milestones.${i}.text`),
  }));

  const coreNumbers = [
    { value: t('coreNum1Value'), label: t('coreNum1Label') },
    { value: t('coreNum2Value'), label: t('coreNum2Label') },
    { value: t('coreNum3Value'), label: t('coreNum3Label') },
  ];

  const capabilities = [
    { icon: t('cap1Icon'), title: t('cap1Title'), desc: t('cap1Desc') },
    { icon: t('cap2Icon'), title: t('cap2Title'), desc: t('cap2Desc') },
    { icon: t('cap3Icon'), title: t('cap3Title'), desc: t('cap3Desc') },
  ];

  return (
    <>
      {/* Hero Banner - 参考首页风格 */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center overflow-hidden bg-[#0C1829]">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop"
          alt="About us background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,.10) 0%, rgba(0,0,0,.05) 45%, rgba(0,0,0,.30) 100%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,196,232,.15) 0%, transparent 65%)',
        }} />
        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">
          <h1 className="text-[clamp(36px,4vw,72px)] font-bold text-white leading-[1.15] tracking-tight" style={{ textShadow: '0 1px 20px rgba(0,0,0,.3)' }}>
            {t('title')}
          </h1>
          <p className="text-[clamp(15px,1.1vw,20px)] text-white/80 max-w-[680px] mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-[#0F172A]">{t('companyIntro')}</h2>
          <p className="text-lg leading-relaxed text-[#475569]">{t('companyIntroText')}</p>
        </div>
      </section>

      {/* Core Numbers */}
      <section className="bg-[#0C1829] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {coreNumbers.map((num) => (
              <div key={num.label} className="text-center">
                <p className="text-4xl font-black text-[#38C4E8]">{num.value}</p>
                <p className="mt-2 text-sm text-gray-400">{num.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#0F172A]">{t('capabilitiesTitle')}</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {capabilities.map((cap) => (
              <div key={cap.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center">
                <span className="text-4xl">{cap.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">{cap.title}</h3>
                <p className="mt-2 text-sm text-[#475569]">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-[#0F172A]">{t('historyTitle')}</h2>
          <p className="mb-12 text-center text-[#475569]">{t('historySubtitle')}</p>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-[#1A3FAD]/20 md:left-1/2 md:-translate-x-px" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#38C4E8] bg-white md:left-1/2" />
                  <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <span className="inline-block rounded-full bg-[#1A3FAD] px-3 py-1 text-sm font-bold text-white">{m.year}</span>
                    <p className="mt-2 text-[#475569]">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/about/news" className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md">
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">{t('newsTitle')}</h3>
              <p className="mt-2 text-sm text-[#475569]">{t('newsSubtitle')}</p>
            </Link>
            <Link href="/about/careers" className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md">
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">{t('careersTitle')}</h3>
              <p className="mt-2 text-sm text-[#475569]">{t('careersSubtitle')}</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
