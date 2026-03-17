'use client';

import { useState, useMemo } from 'react';
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

const CAPABILITY_MAP: Record<string, { label: string; icon: string }> = {
  telemetry:  { label: '实时数据读取（遥测）', icon: '📡' },
  control:    { label: '充放电控制（调度）',   icon: '⚡' },
  history:    { label: '历史数据导出',          icon: '📊' },
  遥测:       { label: '实时数据读取（遥测）', icon: '📡' },
  控制:       { label: '充放电控制（调度）',   icon: '⚡' },
};

interface FilterGroup {
  title: string;
  key: string;
  options: { label: string; value: string | null }[];
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    title: '设备类型',
    key: 'category',
    options: [
      { label: '全部', value: null },
      { label: '储能电池', value: '储能电池' },
      { label: '光伏逆变器', value: '光伏逆变器' },
      { label: '充电桩', value: '充电桩' },
      { label: '智能电表', value: '智能电表' },
    ],
  },
  {
    title: '接入方式',
    key: 'access',
    options: [
      { label: '全部', value: null },
      { label: '云端直连', value: '云端' },
      { label: '网关接入', value: '网关' },
      { label: '两者均支持', value: 'both' },
    ],
  },
  {
    title: '能力',
    key: 'capability',
    options: [
      { label: '全部', value: null },
      { label: '支持充放电控制', value: 'control' },
      { label: '仅实时读取', value: 'telemetry-only' },
    ],
  },
  {
    title: '状态',
    key: 'status',
    options: [
      { label: '全部', value: null },
      { label: '已支持', value: '已接入' },
      { label: '开发中', value: '适配中' },
    ],
  },
];

export function BrandFilter({ brands, noBrandsLabel }: BrandFilterProps) {
  const [filters, setFilters] = useState<Record<string, string | null>>({
    category: null,
    access: null,
    capability: null,
    status: null,
  });

  const setFilter = (key: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
    <div className="flex gap-12 items-start">

      {/* ===== 左侧筛选面板 ===== */}
      <aside className="w-52 shrink-0 flex flex-col gap-8">
        {FILTER_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">{group.title}</p>
            <ul className="flex flex-col gap-2">
              {group.options.map((opt) => {
                const isActive = filters[group.key] === opt.value;
                return (
                  <li key={opt.label}>
                    <button
                      onClick={() => setFilter(group.key, opt.value)}
                      className={`flex items-center gap-2.5 w-full text-left text-sm transition-colors ${
                        isActive ? 'text-[#0F172A] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isActive ? 'border-[#38C4E8]' : 'border-[#CBD5E1]'
                      }`}>
                        {isActive && <span className="w-2 h-2 rounded-full bg-[#38C4E8]" />}
                      </span>
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* ===== 右侧品牌卡片网格 ===== */}
      <div className="flex-1">
        {/* 结果数 */}
        <p className="text-sm text-[#64748B] mb-6">
          共 <span className="font-semibold text-[#0F172A]">{filteredBrands.length}</span> 个品牌
        </p>

        {filteredBrands.length === 0 ? (
          <p className="text-center text-[#64748B] py-20">{noBrandsLabel}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBrands.map((brand) => {
              const logoUrl = brand.logo ? getStrapiMedia(brand.logo.url) : null;
              const caps    = brand.capabilities ?? [];
              const isActive = brand.status === '已接入';

              return (
                <div
                  key={brand.documentId}
                  className="relative flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  {/* 品牌 Logo + 名称 */}
                  <div className="flex items-center gap-3 mb-4">
                    {logoUrl ? (
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image src={logoUrl} alt={brand.name} fill className="object-contain" sizes="40px" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-base font-bold text-[#1A3FAD]">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A]">{brand.name}</h3>
                      {brand.category && (
                        <span className="inline-block mt-0.5 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#64748B]">
                          {brand.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 接入方式 */}
                  <div className="flex flex-col gap-1.5 mb-3">
                    {(brand.accessMethod === '云端' || brand.accessMethod === 'both' || brand.accessMethod === '两者') && (
                      <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                        <span className="text-[#38C4E8]">✅</span> 云端直连
                      </div>
                    )}
                    {(brand.accessMethod === '网关' || brand.accessMethod === 'both' || brand.accessMethod === '两者') && (
                      <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                        <span className="text-[#38C4E8]">✅</span> 网关接入
                      </div>
                    )}
                  </div>

                  {/* 能力标签 */}
                  {caps.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-4">
                      {caps.map((cap) => {
                        const info = CAPABILITY_MAP[cap];
                        return (
                          <div key={cap} className="flex items-center gap-2 text-sm text-[#0F172A]">
                            <span className="text-[#38C4E8]">✅</span>
                            {info ? info.label : cap}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 状态 */}
                  <div className="mt-auto pt-3 border-t border-[#F1F5F9]">
                    <span className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isActive ? '● 已支持' : '○ 开发中'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-8 py-10 text-center">
          <p className="text-lg font-semibold text-[#0F172A] mb-2">没有找到您的品牌？</p>
          <p className="text-[#64748B] mb-6">联系我们，快速接入</p>
          <a
            href="/contact"
            className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-8 py-3 text-base font-semibold text-white shadow transition-all duration-300 hover:bg-[#1535A0] hover:shadow-lg"
          >
            联系我们 →
          </a>
        </div>
      </div>
    </div>
  );
}
