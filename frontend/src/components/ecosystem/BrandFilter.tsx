'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { getStrapiMedia } from '@/lib/strapi';
import type { StrapiCompatibleBrand } from '@/types/strapi';

interface BrandFilterProps {
  brands: StrapiCompatibleBrand[];
  allLabel: string;
  noBrandsLabel: string;
  filterLabels?: Record<string, string>;
}

interface FilterGroup {
  title: string;
  key: string;
  options: { label: string; value: string | null }[];
}

// 对接进度显示
const INTEGRATION_LABELS: Record<string, string> = {
  read:         '基础接入',
  read_history: '标准接入',
  full_control: '完整接入',
};

// 接入方式显示（统一英文枚举 → 中文显示）
const ACCESS_LABELS: Record<string, string> = {
  cloud:   '云端直联',
  gateway: '网关接入',
  both:    '云端 + 网关',
};

export function BrandFilter({ brands, noBrandsLabel }: BrandFilterProps) {
  const t = useTranslations('ecosystem');

  const filterGroups: FilterGroup[] = [
    {
      title: t('filterDeviceType'),
      key: 'category',
      options: [
        { label: t('filterAll'), value: null },
        { label: t('filterBattery'),   value: '储能电池' },
        { label: t('filterInverter'),  value: '光伏逆变器' },
        { label: t('filterCharger'),   value: '充电桩' },
        { label: t('filterMeter'),     value: '智能电表' },
        { label: t('filterOther'),     value: '其他' },
      ],
    },
    {
      title: t('filterAccessMethod'),
      key: 'access',
      options: [
        { label: t('filterAll'),          value: null },
        { label: t('filterCloudDirect'),  value: 'cloud' },
        { label: t('filterGatewayAccess'), value: 'gateway' },
        { label: t('filterBothAccess'),   value: 'both' },
      ],
    },
    {
      title: t('filterIntegration'),
      key: 'integration',
      options: [
        { label: t('filterAll'),                value: null },
        { label: t('filterIntegrationBasic'),   value: 'read' },
        { label: t('filterIntegrationStandard'), value: 'read_history' },
        { label: t('filterIntegrationFull'),    value: 'full_control' },
      ],
    },
    {
      title: t('filterStatus'),
      key: 'status',
      options: [
        { label: t('filterAll'),        value: null },
        { label: t('filterSupported'),  value: 'connected' },
        { label: t('filterDeveloping'), value: 'adapting' },
      ],
    },
  ];

  const [filters, setFilters] = useState<Record<string, string | null>>({
    category:    null,
    access:      null,
    integration: null,
    status:      null,
  });

  const setFilter = (key: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      if (filters.category    && b.category          !== filters.category)    return false;
      if (filters.access      && b.accessMethod       !== filters.access)      return false;
      if (filters.integration && b.integrationLevel   !== filters.integration) return false;
      if (filters.status      && b.status             !== filters.status)      return false;
      return true;
    });
  }, [brands, filters]);

  return (
    <div className="flex gap-0 items-start">

      {/* ===== 左侧筛选面板 ===== */}
      <aside className="w-[220px] shrink-0 sticky top-28">
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ category: null, access: null, integration: null, status: null })}
            className="mb-6 text-[13px] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            {t('clearFilters')}
          </button>
        )}

        {filterGroups.map((group) => (
          <div key={group.key} className="mb-8">
            <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-widest mb-3">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.options.map((opt) => {
                const isActive = filters[group.key] === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setFilter(group.key, opt.value)}
                    className={`flex items-center gap-2.5 w-full text-left py-1.5 text-[14px] transition-colors ${
                      isActive ? 'text-[#1D1D1F] font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-all ${
                      isActive ? 'border-[#1D1D1F]' : 'border-[#D2D2D7]'
                    }`}>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#1D1D1F]" />}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* ===== 右侧品牌卡片网格 ===== */}
      <div className="flex-1 pl-12">
        <p className="text-[13px] text-[#86868B] mb-8">
          {t('brandCount', { count: filteredBrands.length })}
        </p>

        {filteredBrands.length === 0 ? (
          <p className="text-center text-[#86868B] py-20 text-[15px]">{noBrandsLabel}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBrands.map((brand) => {
              const logoUrl = brand.logo ? getStrapiMedia(brand.logo.url) : null;
              const isSupported = brand.status === 'connected';

              return (
                <div
                  key={brand.documentId}
                  className="group flex flex-col rounded-xl border border-[#E8E8ED] bg-white p-6 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                >
                  {/* Logo + 名称 */}
                  <div className="flex items-center gap-3 mb-5">
                    {logoUrl ? (
                      <div className="relative h-10 w-10 shrink-0">
                        <Image src={logoUrl} alt={brand.name} fill className="object-contain" sizes="40px" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F7] text-[15px] font-semibold text-[#1D1D1F]">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1D1D1F] leading-tight">{brand.name}</h3>
                      {brand.category && (
                        <span className="text-[12px] text-[#86868B] mt-0.5 block">{brand.category}</span>
                      )}
                    </div>
                  </div>

                  {/* 接入方式 + 对接进度 */}
                  <div className="flex flex-col gap-2 mb-5 text-[13px] text-[#424245]">
                    {brand.accessMethod && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        {ACCESS_LABELS[brand.accessMethod] ?? brand.accessMethod}
                      </div>
                    )}
                    {brand.integrationLevel && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {INTEGRATION_LABELS[brand.integrationLevel] ?? brand.integrationLevel}
                      </div>
                    )}
                  </div>

                  {/* 支持状态 */}
                  <div className="mt-auto pt-4 border-t border-[#F5F5F7]">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                      isSupported ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSupported ? 'bg-[#30D158]' : 'bg-[#D2D2D7]'}`} />
                      {isSupported ? t('supportedStatus') : t('developingStatus')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-20 text-center py-12">
          <p className="text-[22px] font-semibold text-[#1D1D1F] mb-2">{t('brandNotFound')}</p>
          <p className="text-[15px] text-[#86868B] mb-8">{t('contactUsQuick')}</p>
          <a href="/contact"
            className="inline-flex items-center rounded-full bg-[#1D1D1F] px-8 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#000]">
            {t('contactUsBtn')}
          </a>
        </div>
      </div>
    </div>
  );
}
