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

const CATEGORY_OPTIONS = ['全部', '储能电池', '光伏逆变器', '充电桩', '智能电表'];
const ACCESS_OPTIONS   = [
  { label: '全部',       value: null },
  { label: '仅云端直连', value: '云端' },
  { label: '仅网关接入', value: '网关' },
  { label: '两者均支持', value: 'both' },
];
const CAPABILITY_OPTIONS = [
  { label: '全部',           value: null },
  { label: '支持充放电控制', value: 'control' },
  { label: '仅实时读取',     value: 'telemetry-only' },
];
const STATUS_OPTIONS = [
  { label: '全部',   value: null },
  { label: '已支持', value: '已接入' },
  { label: '开发中', value: '适配中' },
];

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string | null }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const current = options.find(o => o.value === value)?.label ?? label;
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:border-[#38C4E8] transition-colors min-w-[150px] justify-between"
      >
        <span>{current}</span>
        <svg className={`w-4 h-4 text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 min-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1">
          {options.map(opt => (
            <button
              key={opt.label}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#F8FAFC] ${value === opt.value ? 'text-[#1A3FAD] font-semibold' : 'text-[#0F172A]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BrandFilter({ brands, noBrandsLabel, filterLabels }: BrandFilterProps) {
  const [category,   setCategory]   = useState<string | null>(null);
  const [access,     setAccess]     = useState<string | null>(null);
  const [capability, setCapability] = useState<string | null>(null);
  const [status,     setStatus]     = useState<string | null>(null);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      // 设备类型
      if (category && b.category !== category) return false;
      // 接入方式
      if (access === '云端' && b.accessMethod !== '云端') return false;
      if (access === '网关' && b.accessMethod !== '网关') return false;
      if (access === 'both' && b.accessMethod !== 'both' && b.accessMethod !== '两者') return false;
      // 能力
      const caps = b.capabilities ?? [];
      const hasControl = caps.some(c => c === 'control' || c === '控制');
      if (capability === 'control' && !hasControl) return false;
      if (capability === 'telemetry-only' && hasControl) return false;
      // 状态
      if (status === '已接入' && b.status !== '已接入') return false;
      if (status === '适配中' && b.status !== '适配中') return false;
      return true;
    });
  }, [brands, category, access, capability, status]);

  const hasFilter = category || access || capability || status;

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3 mb-10 items-center">
        <Select
          label="设备类型"
          options={CATEGORY_OPTIONS.map(c => ({ label: c, value: c === '全部' ? null : c }))}
          value={category}
          onChange={setCategory}
        />
        <Select
          label="接入方式"
          options={ACCESS_OPTIONS}
          value={access}
          onChange={setAccess}
        />
        <Select
          label="能力"
          options={CAPABILITY_OPTIONS}
          value={capability}
          onChange={setCapability}
        />
        <Select
          label="状态"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        {hasFilter && (
          <button
            onClick={() => { setCategory(null); setAccess(null); setCapability(null); setStatus(null); }}
            className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors underline"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 品牌卡片网格 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBrands.map((brand) => {
          const logoUrl = brand.logo ? getStrapiMedia(brand.logo.url) : null;
          const caps    = brand.capabilities ?? [];
          const isActive = brand.status === '已接入';

          return (
            <div
              key={brand.documentId}
              className="relative flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {/* 右上角 ? tooltip */}
              <div className="absolute top-4 right-4 group">
                <button className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1F5F9] text-xs text-[#64748B] hover:bg-[#E2E8F0]">?</button>
                <div className="absolute right-0 top-6 z-10 hidden w-64 rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#64748B] shadow-lg group-hover:block leading-relaxed">
                  「接入方式」说明物理连接路径；「能力」说明该品牌 API 实际开放的功能范围。部分品牌 API 仅开放只读权限，不支持充放电控制，请在选型前确认所需能力。
                </div>
              </div>

              {/* 品牌 Logo + 名称 */}
              <div className="flex items-center gap-3 mb-4 pr-6">
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

      {filteredBrands.length === 0 && (
        <p className="mt-12 text-center text-[#64748B]">{noBrandsLabel}</p>
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
  );
}
