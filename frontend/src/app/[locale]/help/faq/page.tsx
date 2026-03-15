'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_FAQS } from '@/lib/mock-data';

const categories = ['全部', '设备接入', '云平台使用', '网关配置', '账号与权限', '故障排查'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = MOCK_FAQS.filter((faq) => {
    const matchCategory = activeCategory === '全部' || faq.category === activeCategory;
    const matchSearch =
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <section className="bg-[#0C1829] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/help" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors">
            &larr; 返回帮助中心
          </Link>
          <h1 className="text-3xl font-bold text-white">常见问题 (FAQ)</h1>
          <p className="mt-2 text-gray-400">快速找到您的问题答案</p>
        </div>
      </section>

      <section className="bg-[#0f1b2e] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#38C4E8]/50 focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/50"
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
                    ? 'bg-[#38C4E8] text-[#0C1829]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
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
                key={faq.id}
                className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openId === faq.id && (
                  <div className="border-t border-white/10 px-6 py-4">
                    <p className="text-gray-300 leading-relaxed text-sm">{faq.answer}</p>
                    <span className="mt-3 inline-block rounded-full bg-[#1A3FAD]/20 px-2.5 py-0.5 text-xs text-[#38C4E8]">
                      {faq.category}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-8">未找到匹配的问题</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
