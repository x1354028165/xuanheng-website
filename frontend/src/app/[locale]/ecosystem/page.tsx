import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCompatibleBrands } from '@/lib/api';
import { BrandFilter } from '@/components/ecosystem/BrandFilter';

export const revalidate = 3600;

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'ecosystem' });
  const brands = await getCompatibleBrands();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Brand Filter + Grid */}
        <BrandFilter
          brands={brands}
          allLabel={t('allBrands')}
          noBrandsLabel={t('noBrands')}
        />
      </div>
    </section>
  );
}
