'use client';

import { useState } from 'react';

interface DownloadFile {
  name: string;
  category: string;
  format: string;
  size: string;
  link?: string;
}

interface DownloadSectionProps {
  title: string;
  coverImg: string;
  files: DownloadFile[];
}

export default function DownloadSection({ title, coverImg, files }: DownloadSectionProps) {
  const categories = ['全部', ...Array.from(new Set(files.map((f) => f.category)))];
  const [selected, setSelected] = useState<string>('全部');

  const filtered = selected === '全部' ? files : files.filter((f) => f.category === selected);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-3xl font-bold text-[#0F172A] text-center">资料下载</h2>

        <div className="flex gap-8 items-start">

          {/* 左侧：筛选面板 */}
          <aside className="w-52 shrink-0 flex flex-col gap-6">
            {/* 产品图 */}
            <div className="rounded-2xl overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImg} alt={title} className="w-full h-auto object-contain max-h-40" />
            </div>

            {/* 文档类型筛选 */}
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">文档类型</p>
              <ul className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelected(cat)}
                      className={`flex items-center gap-2.5 w-full text-left text-sm transition-colors ${
                        selected === cat ? 'text-[#0F172A] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        selected === cat ? 'border-[#0F172A]' : 'border-[#CBD5E1]'
                      }`}>
                        {selected === cat && <span className="w-2 h-2 rounded-full bg-[#0F172A]" />}
                      </span>
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* 右侧：文件列表 */}
          <div className="flex-1 flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] py-20 text-center">
                <p className="text-[#64748B] text-sm">暂无相关文档</p>
              </div>
            ) : (
              filtered.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between px-6 py-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#38C4E8]/10">
                      <svg className="w-5 h-5 text-[#38C4E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{file.name}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{file.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-[#94A3B8]">{file.format} · {file.size}</span>
                    {file.link ? (
                      <a href={file.link} className="text-[#38C4E8] hover:text-[#1A3FAD] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
