import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getProductBySlug } from '@/lib/api';

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const specs = product.specs ?? {};
  const specEntries = Object.entries(specs);
  const gallery = product.gallery ?? [];

  return (
    <>
      {/* Product Header */}
      <section className="bg-[#0C1829] pb-16 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors"
          >
            &larr; {t('backToList')}
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            {/* Product Image */}
            <div className="relative h-72 overflow-hidden rounded-xl sm:h-96">
              <Image
                src={getStrapiMedia(product.cover?.url)}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {product.title}
              </h1>
              {product.tagline && (
                <p className="mt-4 text-lg text-[#38C4E8]">{product.tagline}</p>
              )}
              {product.description && (
                <div className="mt-6 text-gray-300 leading-relaxed">
                  {product.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mt-3 first:mt-0">{paragraph}</p>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1A3FAD]/90 hover:shadow-xl hover:shadow-[#1A3FAD]/20"
                >
                  {tc('contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Table */}
      {specEntries.length > 0 && (
        <section className="bg-[#0f1b2e] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{t('specifications')}</h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full">
                <tbody>
                  {specEntries.map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-300 w-1/3 border-r border-white/10">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="bg-[#0C1829] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{t('gallery')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((media, idx) => (
                <div key={media.documentId || idx} className="relative h-64 overflow-hidden rounded-xl">
                  <Image
                    src={getStrapiMedia(media.url)}
                    alt={media.alternativeText || `${product.title} - ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {tc('contactUs')}
          </h2>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl"
          >
            {tc('getStarted')}
          </Link>
        </div>
      </section>
    </>
  );
}
