import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCompatibleBrands } from '@/lib/api';
import { BrandFilter } from '@/components/ecosystem/BrandFilter';
import { MOCK_BRANDS } from '@/lib/mock-data';
import type { StrapiCompatibleBrand } from '@/types/strapi';

import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: `${t('ecosystemPage')} | ${locale === 'zh-CN' || locale === 'zh-TW' ? t('siteName') : t('siteNameEn')}` };
}


export const revalidate = 3600;

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'ecosystem' });
  let brands = await getCompatibleBrands();
  if (!brands || brands.length === 0) {
    brands = MOCK_BRANDS as unknown as StrapiCompatibleBrand[];
  }

  return (
    <>
      <section className="bg-white pb-12 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] sm:text-4xl md:text-[40px]">
            {t('title')}
          </h1>
          <p className="mt-4 text-[17px] text-[#86868B]">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BrandFilter
            brands={brands}
            allLabel={t('allBrands')}
            noBrandsLabel={t('noBrands')}
            filterLabels={{
              accessMethod: t('allAccess'),
              cloud: t('cloud'),
              gateway: t('gateway'),
              contactCta: t('contactCta'),
            }}
          />
        </div>
      </section>
    </>
  );
}
