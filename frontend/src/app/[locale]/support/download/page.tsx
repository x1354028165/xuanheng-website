"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Category = 'industrial' | 'mobile';

export default function DownloadPage() {
  const t = useTranslations("help");
  const [activeCategory, setActiveCategory] = useState<Category>('industrial');

  const DOWNLOADS = {
    industrial: [
      {
        name: t('mockSwNeuronTool'),
        desc: t('mockSwNeuronToolDesc'),
        version: 'v3.0.2',
        date: '2026-03-10',
        items: [
          { label: 'Windows x64', ext: '.exe', size: '45MB' },
          { label: 'macOS Intel', ext: '.dmg', size: '52MB' },
          { label: 'macOS ARM (Apple Silicon)', ext: '.dmg', size: '48MB' },
          { label: 'Linux x64', ext: '.AppImage', size: '50MB' },
        ],
      },
    ],
    mobile: [
      {
        name: 'AlwaysControl HEMS App',
        desc: t('mockSwHemsAppDesc'),
        version: 'v2.5.0',
        date: '2026-03-08',
        items: [
          { label: 'Google Play', ext: '', size: '' },
          { label: 'App Store', ext: '', size: '' },
          { label: t('mockSwAndroidApk'), ext: '.apk', size: '38MB' },
        ],
      },
      {
        name: 'AlwaysControl ESS App',
        desc: t('mockSwEssAppDesc'),
        version: 'v1.2.0',
        date: '2026-02-20',
        items: [
          { label: 'Google Play', ext: '', size: '' },
          { label: 'App Store', ext: '', size: '' },
        ],
      },
    ],
  };

  const categories: { key: Category; icon: string; label: string }[] = [
    { key: 'industrial', icon: '🖥', label: t('categoryIndustrial') },
    { key: 'mobile', icon: '📱', label: t('categoryMobile') },
  ];

  const currentDownloads = DOWNLOADS[activeCategory];

  return (
    <>
      <section className="bg-[#F8FAFC] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/support" className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#38C4E8] transition-colors">
            &larr; {t('backToHelp')}
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">{t('downloadTitle')}</h1>
          <p className="mt-2 text-[#64748B]">{t('downloadSubtitle')}</p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b border-[#E2E8F0] sticky top-16 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat.key
                    ? 'border-[#38C4E8] text-[#38C4E8]'
                    : 'border-transparent text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Download Cards */}
      <section className="bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {currentDownloads.map((sw, idx) => (
              <div key={idx} className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-semibold text-[#0F172A]">{sw.name}</h3>
                  <span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#059669]">{sw.version}</span>
                </div>
                <p className="text-sm text-[#475569] mb-1">{sw.desc}</p>
                <p className="text-xs text-[#94A3B8] mb-4">{t('updatedOn', { date: sw.date })}</p>
                <div className="space-y-2">
                  {sw.items.map((dl, i) => (
                    <button
                      key={i}
                      className="flex w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] hover:border-[#38C4E8]/30 hover:bg-[#38C4E8]/5 transition-colors"
                    >
                      <span>📦 {dl.label} {dl.ext}</span>
                      {dl.size && <span className="text-xs text-[#475569]">{dl.size}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Also check docs */}
      <section className="bg-white py-12 text-center">
        <div className="mx-auto max-w-lg px-6">
          <p className="text-[#475569] mb-4">{t('needDocs')}</p>
          <Link
            href="/support/docs"
            className="inline-flex items-center gap-2 text-[#38C4E8] hover:underline font-medium"
          >
            {t('goToDocs')}
          </Link>
        </div>
      </section>
    </>
  );
}
