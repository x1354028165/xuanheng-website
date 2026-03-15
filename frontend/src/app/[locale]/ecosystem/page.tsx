import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCompatibleBrands } from '@/lib/api';
import { BrandFilter } from '@/components/ecosystem/BrandFilter';
import { MOCK_BRANDS } from '@/lib/mock-data';
import type { StrapiCompatibleBrand } from '@/types/strapi';

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
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
