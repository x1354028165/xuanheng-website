import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/lib/api';
import { MOCK_PRODUCTS, MOCK_SOLUTIONS, getMockProduct } from '@/lib/mock-data';
import { getProductMessage, getProductLabel, getSpecLabel, getSolutionMessage, getSolutionLabel, interpolate } from '@/lib/i18n-helpers';

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((product) => ({ slug: product.slug }));
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

  // Try Strapi first, fall back to direct message access, then mock
  const strapiProduct = await getProductBySlug(slug, locale);
  const mockProduct = getMockProduct(slug);

  const title = strapiProduct?.title ?? getProductMessage(locale, slug, 'title') ?? mockProduct?.title ?? slug;
  const tagline = strapiProduct?.tagline ?? getProductMessage(locale, slug, 'tagline') ?? mockProduct?.tagline ?? '';
  const description = strapiProduct?.description ?? getProductMessage(locale, slug, 'description') ?? mockProduct?.description ?? '';

  // Build specs from direct message access
  const specKeys = ['comms', 'protocols', 'cpu', 'memory', 'temp', 'ip', 'power', 'size', 'meter', 'dlb'];
  const specs: [string, string][] = [];
  for (const key of specKeys) {
    const specValue = getProductMessage(locale, slug, `spec_${key}`);
    if (specValue) {
      const label = getSpecLabel(locale, key);
      specs.push([label, specValue]);
    }
  }

  // Fallback to mock specs if no translation specs found
  const finalSpecs = specs.length > 0 ? specs : Object.entries(mockProduct?.specs ?? {});

  const scenarioSlugs = mockProduct?.scenarios ?? [];
  const relatedSolutions = MOCK_SOLUTIONS.filter(s => scenarioSlugs.includes(s.slug));
  const category = mockProduct?.category ?? 'hardware';

  // Direct message access for labels
  const hardwareLabel = getProductLabel(locale, 'hardwareLabel');
  const softwareLabel = getProductLabel(locale, 'softwareLabel');
  const contactSales = getProductLabel(locale, 'contactSales');
  const viewSpecs = getProductLabel(locale, 'viewSpecs');
  const applicableScenarios = getProductLabel(locale, 'applicableScenarios');
  const viewSolution = getProductLabel(locale, 'viewSolution');
  const resourceDownload = getProductLabel(locale, 'resourceDownload');
  const downloadBtn = getProductLabel(locale, 'downloadBtn');
  const viewBrands = getProductLabel(locale, 'viewBrands');

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
            {/* Product Image Placeholder */}
            <div className="relative h-72 overflow-hidden rounded-xl bg-[#0f1b2e] flex items-center justify-center sm:h-96 border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">{category === 'hardware' ? '⚡' : '☁️'}</div>
                <p className="text-gray-500 text-sm">{title}</p>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="inline-block rounded-full bg-[#1A3FAD]/20 px-3 py-1 text-xs font-medium text-[#38C4E8] mb-4">
                {category === 'hardware' ? hardwareLabel : softwareLabel}
              </span>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {title}
              </h1>
              {tagline && (
                <p className="mt-4 text-lg text-[#38C4E8]">{tagline}</p>
              )}
              {description && (
                <div className="mt-6 text-gray-300 leading-relaxed">
                  {description.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="mt-3 first:mt-0">{paragraph}</p>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1A3FAD]/90 hover:shadow-xl hover:shadow-[#1A3FAD]/20"
                >
                  {contactSales}
                </Link>
                <a
                  href="#specs"
                  className="inline-flex items-center rounded-lg border border-[#38C4E8]/30 px-6 py-3 text-base font-semibold text-[#38C4E8] transition-all duration-300 hover:bg-[#38C4E8]/10"
                >
                  {viewSpecs} ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Table */}
      {finalSpecs.length > 0 && (
        <section id="specs" className="bg-[#0f1b2e] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{t('specifications')}</h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full">
                <tbody>
                  {finalSpecs.map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-300 w-1/3 border-r border-white/10">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Related Solutions */}
      {relatedSolutions.length > 0 && (
        <section className="bg-[#0C1829] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{applicableScenarios}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolutions.map((solution) => {
                const sTitle = getSolutionMessage(locale, solution.slug, 'title') ?? solution.title;
                const sTagline = getSolutionMessage(locale, solution.slug, 'tagline') ?? solution.tagline;
                return (
                  <Link
                    key={solution.slug}
                    href={`/solutions/${solution.slug}`}
                    className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#38C4E8]/30 hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#38C4E8] transition-colors">
                      {sTitle}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">{sTagline}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                      {viewSolution} →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Downloads */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white">{resourceDownload}</h2>
          <div className="space-y-3">
            {[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), format: 'PDF', size: '3.2MB' },
              { name: interpolate(getProductLabel(locale, 'installGuide'), { title }), format: 'PDF', size: '1.5MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), format: 'PDF', size: '0.8MB' },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-6 py-4 transition-all hover:border-[#38C4E8]/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    📄
                  </div>
                  <div>
                    <p className="font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.format} · {doc.size}</p>
                  </div>
                </div>
                <button className="rounded-md bg-[#38C4E8]/10 px-4 py-2 text-sm font-medium text-[#38C4E8] hover:bg-[#38C4E8]/20 transition-colors">
                  {downloadBtn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {interpolate(getProductLabel(locale, 'ctaInterested'), { title })}
          </h2>
          <p className="mt-4 text-gray-300">{getProductLabel(locale, 'ctaDesc')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl"
            >
              {contactSales}
            </Link>
            <Link
              href="/ecosystem"
              className="inline-flex items-center rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              {viewBrands}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
