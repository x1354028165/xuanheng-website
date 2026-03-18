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
  filterLabels?: {
    accessMethod?: string;
    cloud?: string;
    gateway?: string;
    contactCta?: string;
  };
}

interface FilterGroup {
  title: string;
  key: string;
  options: { label: string; value: string | null }[];
}

export function BrandFilter({ brands, noBrandsLabel }: BrandFilterProps) {
  const t = useTranslations('ecosystem');

  const capabilityMap: Record<string, string> = {
    telemetry: t('capabilityTelemetry'),
    control: t('capabilityControl'),
    history: t('capabilityHistory'),
    '遥测': t('capabilityTelemetry'),
    '控制': t('capabilityControl'),
  };

  const filterGroups: FilterGroup[] = [
    {
      title: t('filterDeviceType'),
      key: 'category',
      options: [
        { label: t('filterAll'), value: null },
        { label: t('filterBattery'), value: '储能电池' },
        { label: t('filterInverter'), value: '光伏逆变器' },
        { label: t('filterCharger'), value: '充电桩' },
        { label: t('filterMeter'), value: '智能电表' },
      ],
    },
    {
      title: t('filterAccessMethod'),
      key: 'access',
      options: [
        { label: t('filterAll'), value: null },
        { label: t('filterCloudDirect'), value: '云端' },
        { label: t('filterGatewayAccess'), value: '网关' },
        { label: t('filterBothAccess'), value: 'both' },
      ],
    },
    {
      title: t('filterCapability'),
      key: 'capability',
      options: [
        { label: t('filterAll'), value: null },
        { label: t('filterControlSupport'), value: 'control' },
        { label: t('filterTelemetryOnly'), value: 'telemetry-only' },
      ],
    },
    {
      title: t('filterStatus'),
      key: 'status',
      options: [
        { label: t('filterAll'), value: null },
        { label: t('filterSupported'), value: '已接入' },
        { label: t('filterDeveloping'), value: '适配中' },
      ],
    },
  ];
  const [filters, setFilters] = useState<Record<string, string | null>>({
    category: null,
    access: null,
    capability: null,
    status: null,
  });

  const setFilter = (key: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      if (filters.category && b.category !== filters.category) return false;
      if (filters.access === '云端' && b.accessMethod !== '云端') return false;
      if (filters.access === '网关' && b.accessMethod !== '网关') return false;
      if (filters.access === 'both' && b.accessMethod !== 'both' && b.accessMethod !== '两者') return false;
      const caps = b.capabilities ?? [];
      const hasControl = caps.some(c => c === 'control' || c === '控制');
      if (filters.capability === 'control' && !hasControl) return false;
      if (filters.capability === 'telemetry-only' && hasControl) return false;
      if (filters.status === '已接入' && b.status !== '已接入') return false;
      if (filters.status === '适配中' && b.status !== '适配中') return false;
      return true;
    });
  }, [brands, filters]);

  return (
    <div className="flex gap-0 items-start">

      {/* ===== 左侧筛选面板 ===== */}
      <aside className="w-[220px] shrink-0 sticky top-28">
        {/* 重置按钮 */}
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ category: null, access: null, capability: null, status: null })}
            className="mb-6 text-[13px] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            {t('clearFilters')}
          </button>
        )}

        {/* 筛选分组 */}
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
                      isActive
                        ? 'text-[#1D1D1F] font-semibold'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {/* 极简 radio 圆圈 */}
                    <span
                      className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#1D1D1F]'
                          : 'border-[#D2D2D7] group-hover:border-[#86868B]'
                      }`}
                    >
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#1D1D1F]" />
                      )}
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
        {/* 结果数 */}
        <p className="text-[13px] text-[#86868B] mb-8">
          {t('brandCount', { count: filteredBrands.length })}
        </p>

        {filteredBrands.length === 0 ? (
          <p className="text-center text-[#86868B] py-20 text-[15px]">{noBrandsLabel}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBrands.map((brand) => {
              const logoUrl = brand.logo ? getStrapiMedia(brand.logo.url) : null;
              const caps = brand.capabilities ?? [];
              const isSupported = brand.status === '已接入';

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
                        <span className="text-[12px] text-[#86868B] mt-0.5 block">
                          {brand.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 接入方式 & 能力 */}
                  <div className="flex flex-col gap-2 mb-5 text-[13px] text-[#424245]">
                    {(brand.accessMethod === '云端' || brand.accessMethod === 'both' || brand.accessMethod === '两者') && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        {t('cloudDirectLabel')}
                      </div>
                    )}
                    {(brand.accessMethod === '网关' || brand.accessMethod === 'both' || brand.accessMethod === '两者') && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        {t('gatewayAccessLabel')}
                      </div>
                    )}
                    {caps.map((cap) => {
                      return (
                        <div key={cap} className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {capabilityMap[cap] ?? cap}
                        </div>
                      );
                    })}
                  </div>

                  {/* 状态 */}
                  <div className="mt-auto pt-4 border-t border-[#F5F5F7]">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                      isSupported ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSupported ? 'bg-[#30D158]' : 'bg-[#D2D2D7]'
                      }`} />
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
          <a
            href="/contact"
            className="inline-flex items-center rounded-full bg-[#1D1D1F] px-8 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#000]"
          >
            {t('contactUsBtn')}
          </a>
        </div>
      </div>
    </div>
  );
}
