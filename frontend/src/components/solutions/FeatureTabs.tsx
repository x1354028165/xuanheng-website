'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Feature {
  label: string;
  desc: string;
  points?: string[];
  image?: string;
}

interface FeatureTabsProps {
  title: string;
  features: Feature[];
  bgImage: string;
}

const INTERVAL = 4000;

export default function FeatureTabs({ title, features, bgImage }: FeatureTabsProps) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(Date.now());

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % features.length);
    startRef.current = Date.now();
    setProgress(0);
  }, [features.length]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    const raf = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
      if (elapsed < INTERVAL) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [active]);

  const handleClick = (idx: number) => {
    setActive(idx);
    startRef.current = Date.now();
    setProgress(0);
  };

  const current = features[active];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-stretch">

          {/* Left: 当前 Tab 标题 + 描述 + 子要点 + 底部进度点（贴底） */}
          <div className="flex flex-col gap-6">

            {/* 当前 Tab 标题 */}
            <h3 className="text-3xl font-bold text-[#0F172A] leading-tight">
              {current.label}
            </h3>

            {/* 描述文字 */}
            <p className="text-[#64748B] text-lg leading-relaxed">
              {current.desc}
            </p>

            {/* 子要点 — #1A3FAD 竖线 */}
            {current.points && current.points.length > 0 && (
              <ul className="flex flex-col gap-4 mt-1">
                {current.points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-base text-[#64748B]">
                    <span className="shrink-0 w-[3px] h-5 rounded-full" style={{ background: '#1A3FAD' }} />
                    {pt}
                  </li>
                ))}
              </ul>
            )}

            {/* 底部胶囊进度指示器 — mt-auto 贴图片底部 */}
            <div className="flex items-center gap-2 mt-auto">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleClick(idx)}
                  className="relative h-[6px] rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: active === idx ? '32px' : '8px',
                    background: '#E2E8F0',
                  }}
                >
                  {active === idx && (
                    <div
                      className="absolute inset-y-0 left-0 bg-[#0F172A] rounded-full"
                      style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: 图片，与左侧垂直居中对齐 */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: '4/3' }}>
            {(current.image || bgImage) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.image || bgImage}
                alt={current.label}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A3FAD] to-[#38C4E8]" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
