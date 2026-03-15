import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSolutionBySlug } from '@/lib/api';
import { MOCK_SOLUTIONS, MOCK_PRODUCTS, getMockSolution } from '@/lib/mock-data';
import { getSolutionMessage, getSolutionLabel, getProductMessage, interpolate } from '@/lib/i18n-helpers';

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

  // Try Strapi first, fall back to direct message access, then mock
  const strapiSolution = await getSolutionBySlug(slug, locale);
  const mockSolution = getMockSolution(slug);

  const title = strapiSolution?.title ?? getSolutionMessage(locale, slug, 'title') ?? mockSolution?.title ?? slug;
  const tagline = strapiSolution?.tagline ?? getSolutionMessage(locale, slug, 'tagline') ?? mockSolution?.tagline ?? '';
  const description = strapiSolution?.description ?? getSolutionMessage(locale, slug, 'description') ?? mockSolution?.description ?? '';

  // Pain points from direct message access
  const painPoints: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const val = getSolutionMessage(locale, slug, `pain${i}`);
    if (val) painPoints.push(val);
  }
  const finalPainPoints = painPoints.length > 0 ? painPoints : (mockSolution?.painPoints ?? []);

  // Features/highlights from direct message access
  const features: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const val = getSolutionMessage(locale, slug, `feature${i}`);
    if (val) features.push(val);
  }
  const finalHighlights = features.length > 0 ? features : (mockSolution?.highlights ?? []);

  const relatedProductSlugs = mockSolution?.relatedProducts ?? [];
  const relatedProducts = MOCK_PRODUCTS.filter(p => relatedProductSlugs.includes(p.slug));

  // Labels from direct message access
  const painPointsTitle = getSolutionLabel(locale, 'painPointsTitle');
  const highlightsTitle = getSolutionLabel(locale, 'highlightsTitle');
  const recommendedProducts = getSolutionLabel(locale, 'recommendedProducts');
  const hardwareLabel = getSolutionLabel(locale, 'hardwareLabel');
  const softwareLabel = getSolutionLabel(locale, 'softwareLabel');
  const viewProduct = getSolutionLabel(locale, 'viewProduct');
  const applyDemo = getSolutionLabel(locale, 'applyDemo');

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
                  {applyDemo}
                </Link>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-xl bg-[#0f1b2e] border border-white/10 flex items-center justify-center sm:h-80 lg:h-96">
              <div className="text-6xl text-[#38C4E8]/20">🔋</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      {finalPainPoints.length > 0 && (
        <section className="bg-[#F8FAFC] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{painPointsTitle}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {finalPainPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500 text-xl">
                    ⚠️
                  </div>
                  <p className="text-[#64748B] text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solution Highlights */}
      {finalHighlights.length > 0 && (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{highlightsTitle}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {finalHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38C4E8]/10 text-[#38C4E8]">
                    ✓
                  </div>
                  <p className="text-[#64748B] leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Access Modes */}
      {mockSolution && mockSolution.accessModes && mockSolution.accessModes.length > 0 && (
        <section className="bg-[#F8FAFC] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold text-[#0F172A] text-center">{t('accessModesTitle')}</h2>
            <p className="mb-10 text-center text-[#64748B]">{t('accessModesSubtitle')}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
              {mockSolution.accessModes.includes('cloud') && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm">
                  <div className="text-4xl mb-4">☁️</div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{t('accessCloud')}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{t('accessCloudDesc')}</p>
                </div>
              )}
              {mockSolution.accessModes.includes('gateway') && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm">
                  <div className="text-4xl mb-4">🔗</div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{t('accessGateway')}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{t('accessGatewayDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{recommendedProducts}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {relatedProducts.map((product) => {
                const pTitle = getProductMessage(locale, product.slug, 'title') ?? product.title;
                const pTagline = getProductMessage(locale, product.slug, 'tagline') ?? product.tagline;
                return (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{product.category === 'hardware' ? '⚡' : '☁️'}</span>
                      <span className="inline-block rounded-full bg-[#38C4E8]/10 px-2 py-0.5 text-xs text-[#38C4E8] font-medium">
                        {product.category === 'hardware' ? hardwareLabel : softwareLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
                      {pTitle}
                    </h3>
                    <p className="mt-2 text-sm text-[#64748B]">{pTagline}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                      {viewProduct} →
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
            {interpolate(getSolutionLabel(locale, 'ctaReady'), { title })}
          </h2>
          <p className="mt-4 text-gray-300">{getSolutionLabel(locale, 'ctaDesc')}</p>
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
