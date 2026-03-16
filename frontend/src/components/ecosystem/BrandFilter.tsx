'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getStrapiMedia } from '@/lib/strapi';
import type { StrapiCompatibleBrand } from '@/types/strapi';
import { Button } from '@/components/ui/button';

interface BrandFilterProps {
  brands: StrapiCompatibleBrand[];
  allLabel: string;
  noBrandsLabel: string;
  filterLabels?: {
    category?: string;
    accessMethod?: string;
    capability?: string;
    status?: string;
    cloud?: string;
    gateway?: string;
    telemetry?: string;
    control?: string;
    active?: string;
    adapting?: string;
    contactCta?: string;
  };
}

const capabilityLabels: Record<string, { label: string; icon: string }> = {
  telemetry: { label: "遥测（只读）", icon: "📡" },
  control: { label: "充放电控制", icon: "⚡" },
  history: { label: "历史数据导出", icon: "📊" },
  // Legacy Chinese keys from mock data
  "遥测": { label: "遥测（只读）", icon: "📡" },
  "控制": { label: "充放电控制", icon: "⚡" },
};

export function BrandFilter({ brands, allLabel, noBrandsLabel, filterLabels }: BrandFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeAccess, setActiveAccess] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    brands.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return Array.from(cats).sort();
  }, [brands]);

  const accessMethods = useMemo(() => {
    const methods = new Set<string>();
    brands.forEach((b) => {
      if (b.accessMethod) methods.add(b.accessMethod);
    });
    return Array.from(methods).sort();
  }, [brands]);

  const filteredBrands = useMemo(() => {
    let result = brands;
    if (activeCategory) {
      result = result.filter((b) => b.category === activeCategory);
    }
    if (activeAccess) {
      result = result.filter((b) => b.accessMethod === activeAccess);
    }
    return result;
  }, [brands, activeCategory, activeAccess]);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 space-y-4">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            {allLabel}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        {/* Access method filter */}
        {accessMethods.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeAccess === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveAccess(null)}
            >
              {filterLabels?.accessMethod ?? '全部接入方式'}
            </Button>
            {accessMethods.map((method) => (
              <Button
                key={method}
                variant={activeAccess === method ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveAccess(method)}
              >
                {method === '云端' ? (filterLabels?.cloud ?? '☁️ 云端') : (filterLabels?.gateway ?? '🔗 网关')}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBrands.map((brand) => {
          const logoUrl = brand.logo ? getStrapiMedia(brand.logo.url) : null;
          return (
            <div
              key={brand.documentId}
              className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                {logoUrl ? (
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={logoUrl}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-lg font-bold text-[#1A3FAD]">
                    {brand.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A]">{brand.name}</h3>
                  {brand.category && (
                    <span className="text-xs text-[#64748B]">{brand.category}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {brand.accessMethod && (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    brand.accessMethod === '云端'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {brand.accessMethod === '云端' ? '☁️' : '🔗'} {brand.accessMethod}
                  </span>
                )}
                {brand.capabilities?.map((cap) => {
                  const info = capabilityLabels[cap];
                  return (
                    <span
                      key={cap}
                      className="inline-flex items-center rounded-full bg-[#38C4E8]/10 px-2 py-0.5 text-xs font-medium text-[#38C4E8]"
                    >
                      {info ? `${info.icon} ${info.label}` : cap}
                    </span>
                  );
                })}
                {brand.status && brand.status !== '已接入' && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {brand.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBrands.length === 0 && (
        <p className="mt-8 text-center text-[#64748B]">
          {noBrandsLabel}
        </p>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-[#475569] mb-4">
          {filterLabels?.contactCta ?? '没有找到您的品牌？联系我们'}
        </p>
        <a
          href="/contact"
          className="inline-flex items-center rounded-lg bg-[#0F172A] px-6 py-3 text-base font-semibold text-white shadow transition-all duration-300 hover:bg-[#1E293B] hover:shadow-lg"
        >
          {filterLabels?.contactCta ?? '联系我们'}
        </a>
      </div>
    </div>
  );
}
