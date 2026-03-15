import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getProducts } from '@/lib/api';
import type { StrapiProduct } from '@/types/strapi';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

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

  let products = await getProducts(locale);
  if (!products || products.length === 0) {
    products = MOCK_PRODUCTS as unknown as StrapiProduct[];
  }

  // Group by category
  const hardware = MOCK_PRODUCTS.filter(p => p.category === 'hardware');
  const software = MOCK_PRODUCTS.filter(p => p.category === 'software');
  const usesMock = products.length <= 8 && products[0]?.slug === 'neuron-ii';

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      {/* Hardware Section */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white">智能网关（硬件）</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(usesMock ? hardware : products.slice(0, 3)).map((product) => (
              <Link
                key={product.documentId}
                href={`/products/${product.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:shadow-[#1A3FAD]/10 hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#0C1829] flex items-center justify-center">
                  <div className="text-4xl text-[#38C4E8]/30">⚡</div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white group-hover:text-[#38C4E8] transition-colors duration-300">
                    {product.title}
                  </h3>
                  {product.tagline && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{product.tagline}</p>
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
      <section className="bg-[#0C1829] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white">云平台（软件）</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(usesMock ? software : products.slice(3)).map((product) => (
              <Link
                key={product.documentId}
                href={`/products/${product.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:shadow-[#1A3FAD]/10 hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#0C1829] flex items-center justify-center">
                  <div className="text-4xl text-[#1A3FAD]/30">☁️</div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white group-hover:text-[#38C4E8] transition-colors duration-300">
                    {product.title}
                  </h3>
                  {product.tagline && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{product.tagline}</p>
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
