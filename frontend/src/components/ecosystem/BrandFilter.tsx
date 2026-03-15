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
}

export function BrandFilter({ brands, allLabel, noBrandsLabel }: BrandFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    brands.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return Array.from(cats).sort();
  }, [brands]);

  const filteredBrands = useMemo(() => {
    if (!activeCategory) return brands;
    return brands.filter((b) => b.category === activeCategory);
  }, [brands, activeCategory]);

  return (
    <div>
      {/* Category filter buttons */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
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

      {/* Brand grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {filteredBrands.map((brand) => {
          const logoUrl = getStrapiMedia(brand.logo?.url);
          const inner = (
            <div
              key={brand.documentId}
              className="group flex flex-col items-center rounded-xl border border-foreground/10 bg-card p-4 text-center transition-shadow hover:shadow-lg"
            >
              <div className="relative mb-3 h-16 w-full">
                <Image
                  src={logoUrl}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              <span className="text-sm font-medium text-foreground">{brand.name}</span>
              {brand.category && (
                <span className="mt-1 text-xs text-muted-foreground">{brand.category}</span>
              )}
              {brand.websiteUrl && (
                <span className="mt-2 text-xs text-[#38C4E8] opacity-0 transition-opacity group-hover:opacity-100">
                  &rarr;
                </span>
              )}
            </div>
          );

          if (brand.websiteUrl) {
            return (
              <a
                key={brand.documentId}
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            );
          }

          return <div key={brand.documentId}>{inner}</div>;
        })}
      </div>

      {filteredBrands.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          {noBrandsLabel}
        </p>
      )}
    </div>
  );
}
