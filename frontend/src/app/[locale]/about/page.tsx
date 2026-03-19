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
  const tc = await getTranslations({ locale, namespace: 'common' });
  const t_contact = await getTranslations({ locale, namespace: 'contact' });

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
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" /></svg>,
      title: t('cap1Title'), desc: t('cap1Desc'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.12l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l4.5-4.5a4.5 4.5 0 016.364 6.364z" /></svg>,
      title: t('cap2Title'), desc: t('cap2Desc'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
      title: t('cap3Title'), desc: t('cap3Desc'),
    },
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

      {/* Core Numbers - 参考首页风格 */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {coreNumbers.map((num) => (
              <div key={num.label} className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-[clamp(64px,5.5vw,96px)] font-black text-[#0F172A] leading-none tracking-[-3px]">
                  {num.value}
                </div>
                <div className="mt-4 text-[13px] font-medium text-[#94A3B8] tracking-[2px] uppercase">
                  {num.label}
                </div>
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
              <div key={cap.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  {cap.icon}
                </div>
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

      {/* 联系方式 - 左右布局 */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#0F172A]">{tc('contactUs')}</h2>
          <div className="grid gap-10 lg:grid-cols-2">
            {/* 左边：地址+联系方式 */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">{tc('address')}</h3>
                  <p className="mt-1 text-sm text-[#475569]">{t_contact('info.address')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">{tc('phone')}</h3>
                  <p className="mt-1 text-sm text-[#475569]">{t_contact('info.phone')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">{tc('email')}</h3>
                  <p className="mt-1 text-sm text-[#475569]">{t_contact('info.email')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">{tc('hours')}</h3>
                  <p className="mt-1 text-sm text-[#475569]">{t_contact('info.hours')}</p>
                </div>
              </div>
            </div>
            {/* 右边：地图（静态图片+点击跳转） */}
            <a
              href="https://uri.amap.com/marker?position=113.856,22.602&name=旭衡电子&coordinate=gaode&callnative=0"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-sm relative group"
              style={{ minHeight: '320px' }}
            >
              <Image
                src="https://restapi.amap.com/v3/staticmap?location=113.856,22.602&zoom=15&size=600*400&markers=mid,,A:113.856,22.602&key=a7a90e05a37d3f6bf76d4a9032fc9129"
                alt="Office Location Map"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                <span className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium text-[#1A3FAD] opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  {tc('viewMap')} →
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
