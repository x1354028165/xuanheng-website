import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getProducts } from '@/lib/api';
import type { StrapiProduct, StrapiMedia } from '@/types/strapi';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { getProductMessage, getProductLabel } from '@/lib/i18n-helpers';

/** Extract a displayable image URL from cover (string from mock or StrapiMedia from CMS) */
function getCoverUrl(cover: StrapiMedia | string | null | undefined): string | null {
  if (!cover) return null;
  if (typeof cover === 'string') return cover;
  if (cover.url) return getStrapiMedia(cover.url);
  return null;
}

import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: `${t('productsPage')} | ${locale === 'zh-CN' || locale === 'zh-TW' ? t('siteName') : t('siteNameEn')}` };
}


export const revalidate = 3600;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  // Helper to get translated product fields (using direct import to avoid next-intl production issues)
  const getPTitle = (slug: string, fallback: string) => getProductMessage(locale, slug, 'title') ?? fallback;
  const getPTagline = (slug: string, fallback: string) => getProductMessage(locale, slug, 'tagline') ?? fallback;

  let products = await getProducts(locale);
  if (!products || products.length === 0) {
    products = MOCK_PRODUCTS as unknown as StrapiProduct[];
  }

  // Group by category from actual products (Strapi or mock)
  const hardware = products.filter(p => p.category === 'hardware');
  const software = products.filter(p => p.category === 'software');

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#F8FAFC] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-[#64748B]">{t('subtitle')}</p>
        </div>
      </section>

      {/* Hardware Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">{getProductLabel(locale, 'hardwareSectionTitle')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(usesMock ? hardware : products.slice(0, 3)).map((product) => (
              <Link
                key={product.documentId}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center">
                  {getCoverUrl(product.cover) ? (
                    <Image src={getCoverUrl(product.cover)!} alt={product.title} fill className="object-contain p-4" />
                  ) : (
                    <div className="text-4xl text-[#1A3FAD]/30">⚡</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors duration-300">
                    {getPTitle(product.slug, product.title)}
                  </h3>
                  {product.tagline && (
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2">{getPTagline(product.slug, product.tagline)}</p>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                    {tc('viewDetails')} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Software Section */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">{getProductLabel(locale, 'softwareSectionTitle')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(usesMock ? software : products.slice(3)).map((product) => (
              <Link
                key={product.documentId}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center">
                  {getCoverUrl(product.cover) ? (
                    <Image src={getCoverUrl(product.cover)!} alt={product.title} fill className="object-contain p-4" />
                  ) : (
                    <div className="text-4xl text-[#1A3FAD]/30">☁️</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors duration-300">
                    {getPTitle(product.slug, product.title)}
                  </h3>
                  {product.tagline && (
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2">{getPTagline(product.slug, product.tagline)}</p>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                    {tc('viewDetails')} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
