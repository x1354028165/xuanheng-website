'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SoftwareTab {
  name: string;
  gradient: string;
}

const tabs: SoftwareTab[] = [
  { name: 'HEMS', gradient: 'linear-gradient(135deg, #38C4E8 0%, #1A3FAD 100%)' },
  { name: 'ESS', gradient: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)' },
  { name: 'EVCMS', gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' },
  { name: 'PQMS', gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)' },
  { name: 'VPP', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
];

export default function SoftwareTabs({ tabLabels, coverImages }: { tabLabels?: Record<string, string>; coverImages?: Record<string, string> }) {
  const [active, setActive] = useState(0);
  const t = useTranslations('home');

  const descriptions: Record<string, string> = {
    HEMS: t('swDescHems'),
    ESS: t('swDescEss'),
    EVCMS: t('swDescEvcms'),
    PQMS: t('swDescPqms'),
    VPP: t('swDescVpp'),
  };

  return (
    <div className="w-full">
      {/* Image preview area */}
      <div className="w-full rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/7', background: '#F8FAFC' }}>
        {tabs.map((tab, idx) => {
          const imgUrl = coverImages?.[tab.name];
          return (
            <div
              key={tab.name}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
              style={{
                opacity: active === idx ? 1 : 0,
                background: imgUrl ? 'transparent' : tab.gradient,
              }}
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={tab.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white/40 text-4xl font-bold">{tab.name} Platform</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tab row */}
      <div className="grid grid-cols-5 border-t border-[#E2E8F0] mt-8">
        {tabs.map((tab, idx) => (
          <button
            key={tab.name}
            onClick={() => setActive(idx)}
            className="pt-5 pb-5 pr-4 text-left -mt-px cursor-pointer transition-colors duration-200"
            style={{
              borderTop: active === idx ? '3px solid #0F172A' : '3px solid transparent',
            }}
          >
            <div
              className="font-bold text-base lg:text-lg leading-tight mb-2"
              style={{ color: active === idx ? '#0F172A' : '#888' }}
            >
              {tabLabels?.[tab.name] || descriptions[tab.name]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
