import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSolutionBySlug } from '@/lib/api';
import { MOCK_SOLUTIONS, MOCK_PRODUCTS, getMockSolution } from '@/lib/mock-data';

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return MOCK_SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tp = await getTranslations({ locale, namespace: 'products' });

  // Try Strapi first, fall back to mock
  const strapiSolution = await getSolutionBySlug(slug, locale);
  const mockSolution = getMockSolution(slug);

  // Use translations for content
  const title = strapiSolution?.title ?? (t.has(`${slug}.title`) ? t(`${slug}.title`) : (mockSolution?.title ?? slug));
  const tagline = strapiSolution?.tagline ?? (t.has(`${slug}.tagline`) ? t(`${slug}.tagline`) : (mockSolution?.tagline ?? ''));
  const description = strapiSolution?.description ?? (t.has(`${slug}.description`) ? t(`${slug}.description`) : (mockSolution?.description ?? ''));

  // Pain points from translations
  const painPoints: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const key = `${slug}.pain${i}`;
    if (t.has(key)) {
      painPoints.push(t(key));
    }
  }
  // Fallback to mock
  const finalPainPoints = painPoints.length > 0 ? painPoints : (mockSolution?.painPoints ?? []);

  // Features/highlights from translations
  const features: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const key = `${slug}.feature${i}`;
    if (t.has(key)) {
      features.push(t(key));
    }
  }
  // Fallback to mock highlights
  const finalHighlights = features.length > 0 ? features : (mockSolution?.highlights ?? []);

  const relatedProductSlugs = mockSolution?.relatedProducts ?? [];
  const relatedProducts = MOCK_PRODUCTS.filter(p => relatedProductSlugs.includes(p.slug));

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#0C1829] pb-16 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/solutions"
            className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors"
          >
            &larr; {t('backToList')}
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                {title}
              </h1>
              {tagline && (
                <p className="mt-4 text-xl text-[#38C4E8]">{tagline}</p>
              )}
              {description && (
                <p className="mt-6 text-gray-300 leading-relaxed text-lg">{description}</p>
              )}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1A3FAD]/90 hover:shadow-xl"
                >
                  {t('applyDemo')}
                </Link>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center sm:h-80 lg:h-96">
              <div className="text-6xl text-[#1A3FAD]/30">🔋</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      {finalPainPoints.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('painPointsTitle')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {finalPainPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-red-500/20 bg-red-50 p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500 text-xl">
                    ⚠️
                  </div>
                  <p className="text-[#0F172A] text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solution Highlights */}
      {finalHighlights.length > 0 && (
        <section className="bg-[#F8FAFC] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('highlightsTitle')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {finalHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38C4E8]/10 text-[#38C4E8]">
                    ✓
                  </div>
                  <p className="text-[#475569] leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('recommendedProducts')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {relatedProducts.map((product) => {
                const pTitle = tp.has(`${product.slug}.title`) ? tp(`${product.slug}.title`) : product.title;
                const pTagline = tp.has(`${product.slug}.tagline`) ? tp(`${product.slug}.tagline`) : product.tagline;
                return (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group rounded-xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{product.category === 'hardware' ? '⚡' : '☁️'}</span>
                      <span className="inline-block rounded-full bg-[#1A3FAD]/10 px-2 py-0.5 text-xs text-[#1A3FAD]">
                        {product.category === 'hardware' ? t('hardwareLabel') : t('softwareLabel')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">
                      {pTitle}
                    </h3>
                    <p className="mt-2 text-sm text-[#475569]">{pTagline}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                      {t('viewProduct')} →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('ctaReady', { title })}
          </h2>
          <p className="mt-4 text-gray-300">{t('ctaDesc')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl"
            >
              {tc('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
