'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FAQ {
  documentId: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
}

export default function FAQClientFilter({ faqs }: { faqs: FAQ[] }) {
  const t = useTranslations('help');
  const allLabel = t('allCategories');
  const categories = [allLabel, ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))) as string[]];
  const [activeCategory, setActiveCategory] = useState(allLabel);
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = faqs.filter((faq) => {
    const matchCategory = activeCategory === allLabel || faq.category === activeCategory;
    const matchSearch =
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#38C4E8] focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/20"
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#38C4E8] text-white'
                : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filtered.map((faq) => (
          <div
            key={faq.documentId}
            className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden"
          >
            <button
              onClick={() => setOpenId(openId === faq.documentId ? null : faq.documentId)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-[#0F172A] font-medium pr-4">{faq.question}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-[#475569] transition-transform ${
                  openId === faq.documentId ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openId === faq.documentId && (
              <div className="border-t border-[#E2E8F0] px-6 py-4">
                <p className="text-[#475569] leading-relaxed text-sm">{faq.answer}</p>
                {faq.category && (
                  <span className="mt-3 inline-block rounded-full bg-[#1A3FAD]/10 px-2.5 py-0.5 text-xs text-[#1A3FAD]">
                    {faq.category}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[#475569] py-8">{t('noMatchingFaq')}</p>
        )}
      </div>
    </>
  );
}
