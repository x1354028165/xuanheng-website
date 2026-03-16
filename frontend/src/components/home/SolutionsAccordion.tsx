'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SolutionItem {
  tag: string;
  title: string;
  description: string;
  href: string;
  bgImage: string;
  linkText: string;
}

export default function SolutionsAccordion({ items }: { items: SolutionItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      {/* Desktop: horizontal accordion */}
      <div className="hidden lg:flex gap-3 w-full max-w-[1652px] mx-auto h-[540px]">
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <Link
              key={idx}
              href={item.href}
              className="relative overflow-hidden rounded-2xl block"
              style={{
                flex: isActive ? 2.8 : 1,
                minWidth: 0,
                transition: 'flex 0.5s cubic-bezier(.4,0,.2,1)',
                background: '#1a2a3a',
                textDecoration: 'none',
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
                style={{
                  backgroundImage: `url('${item.bgImage}')`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 50%, rgba(0,0,0,.2) 100%)',
              }} />

              {/* Collapsed state: 只显示缩写文字，白色，字号与展开标题一致 */}
              <div
                className="absolute inset-0 flex items-center justify-center text-white text-center px-2"
                style={{
                  opacity: isActive ? 0 : 1,
                  transition: 'opacity 0.25s',
                  pointerEvents: 'none',
                }}
              >
                <span className="text-[22px] font-extrabold leading-tight">{item.tag}</span>
              </div>

              {/* Expanded content：不显示缩写文字 */}
              <div
                className="absolute bottom-0 left-0 right-0 p-8 text-white"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.35s, transform 0.35s',
                  transitionDelay: isActive ? '100ms' : '0ms',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <h3 className="text-[22px] font-extrabold mb-2 leading-tight">{item.title}</h3>
                <p className="text-[13px] text-white/80 leading-relaxed mb-5 line-clamp-3">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white border border-white/40 rounded px-4 py-2 hover:bg-white/10 transition-colors">
                  {item.linkText} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile: stacked cards */}
      <div className="lg:hidden space-y-3 max-w-[420px] mx-auto">
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500"
              style={{ height: isActive ? '280px' : '72px', background: '#1a2a3a' }}
              onClick={() => setActiveIndex(isActive ? null : idx)}
            >
              <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${item.bgImage}')` }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.2) 60%, rgba(0,0,0,.2) 100%)',
              }} />
              {/* Collapsed label */}
              <div className="absolute bottom-4 left-4 text-white font-bold text-base"
                style={{ opacity: isActive ? 0 : 1, transition: 'opacity .3s' }}>
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#38C4E8] mr-2">{item.tag}</span>
                {item.title}
              </div>
              {/* Expanded content */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6 text-white"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity .4s, transform .4s',
                }}
              >
                <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#38C4E8] mb-1">{item.tag}</div>
                <h3 className="text-lg font-extrabold mb-1">{item.title}</h3>
                <p className="text-[12px] text-white/75 mb-3 line-clamp-2">{item.description}</p>
                <Link href={item.href} className="text-[12px] font-semibold text-[#38C4E8]" onClick={e => e.stopPropagation()}>
                  {item.linkText} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
