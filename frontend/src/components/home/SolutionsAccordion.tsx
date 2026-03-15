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
      <div className="hidden lg:flex gap-2 max-w-[1200px] mx-auto h-[500px] overflow-hidden rounded-2xl">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] group"
            style={{
              flex: activeIndex === idx ? 4 : 1,
              minWidth: '60px',
              background: '#1a2a3a',
            }}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-105"
              style={{ backgroundImage: `url('${item.bgImage}')` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.2) 50%, rgba(0,0,0,.3) 100%)',
            }} />
            {/* Vertical label (collapsed) */}
            <div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-bold text-lg whitespace-nowrap transition-opacity duration-300"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                opacity: activeIndex === idx ? 0 : 1,
              }}
            >
              {item.title}
            </div>
            {/* Expanded content */}
            <div
              className="absolute bottom-0 left-0 right-0 p-8 text-white transition-all duration-400"
              style={{
                opacity: activeIndex === idx ? 1 : 0,
                transform: activeIndex === idx ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: activeIndex === idx ? '150ms' : '0ms',
              }}
            >
              <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#38C4E8] mb-2">
                {item.tag}
              </div>
              <h3 className="text-2xl font-extrabold mb-2.5 leading-tight">{item.title}</h3>
              <p className="text-sm text-white/75 leading-relaxed mb-4">{item.description}</p>
              <Link href={item.href} className="text-sm font-semibold text-[#38C4E8] hover:underline">
                {item.linkText} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className="lg:hidden space-y-3 max-w-[420px] mx-auto">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500"
            style={{
              height: activeIndex === idx ? '280px' : '72px',
              background: '#1a2a3a',
            }}
            onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${item.bgImage}')` }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.2) 50%, rgba(0,0,0,.3) 100%)',
            }} />
            {/* Label */}
            <div className="absolute bottom-4 left-4 text-white font-bold text-base"
              style={{ opacity: activeIndex === idx ? 0 : 1, transition: 'opacity .3s' }}
            >
              {item.title}
            </div>
            {/* Content */}
            <div
              className="absolute bottom-0 left-0 right-0 p-6 text-white"
              style={{
                opacity: activeIndex === idx ? 1 : 0,
                transform: activeIndex === idx ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity .4s, transform .4s',
              }}
            >
              <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#38C4E8] mb-2">{item.tag}</div>
              <h3 className="text-xl font-extrabold mb-2">{item.title}</h3>
              <p className="text-sm text-white/75 mb-3">{item.description}</p>
              <Link href={item.href} className="text-sm font-semibold text-[#38C4E8]">{item.linkText} →</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
