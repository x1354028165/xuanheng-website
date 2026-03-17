import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getProducts, getProductBySlug } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';
import { MOCK_PRODUCTS, MOCK_SOLUTIONS, getMockProduct } from '@/lib/mock-data';
import { getProductMessage, getProductLabel, getSpecLabel, getSolutionMessage, getSolutionLabel, interpolate } from '@/lib/i18n-helpers';
import type { Metadata } from 'next';

const SITE_NAME: Record<string, string> = {
  'zh-CN': '旭衡电子', 'zh-TW': '旭衡電子',
  'en-US': 'AlwaysControl', 'de': 'AlwaysControl', 'fr': 'AlwaysControl',
  'es': 'AlwaysControl', 'pt': 'AlwaysControl', 'ru': 'AlwaysControl',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const strapiProduct = await getProductBySlug(slug, locale);
  const mockProduct = getMockProduct(slug);
  const productTitle = strapiProduct?.title ?? getProductMessage(locale, slug, 'title') ?? mockProduct?.title ?? slug;
  const site = SITE_NAME[locale] ?? 'AlwaysControl';
  return { title: `${productTitle} | ${site}` };
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const strapiProducts = await getProducts();
  const strapiSlugs = strapiProducts.map((p) => ({ slug: p.slug }));
  const mockSlugs = MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
  // Merge, deduplicate
  const seen = new Set<string>();
  const result: { slug: string }[] = [];
  for (const item of [...strapiSlugs, ...mockSlugs]) {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      result.push(item);
    }
  }
  return result;
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
  const tn = await getTranslations({ locale, namespace: 'nav' });

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
      {/* ===== PRODUCT HERO BANNER ===== */}
      <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-[#0C1829] via-[#0F2347] to-[#1A3FAD] pt-24 pb-0">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large circle top-right */}
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#38C4E8]/5" />
          {/* Small circle bottom-left */}
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#1A3FAD]/40" />
          {/* Grid lines */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Glow accent top-left */}
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[#38C4E8]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[45fr_55fr] lg:items-center pb-16">
            {/* Left: Title + CTA only */}
            <div className="flex flex-col">
              {/* Product title */}
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="w-[220px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[15px] transition-colors duration-200 hover:bg-white"
                >
                  {contactSales}
                </Link>
                <a
                  href="#specs"
                  className="w-[220px] py-3.5 text-center rounded border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-white/20 backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,.12)' }}
                >
                  {viewSpecs} ↓
                </a>
              </div>
            </div>

            {/* Right: Product Image — full-size hero */}
            <div className="flex items-center justify-center lg:justify-end lg:-mr-8">
              <div className="relative w-full">
                {/* Radial glow behind image */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#38C4E8]/15 blur-[100px]" />
                {/* Second smaller hot-spot glow */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[240px] w-[240px] rounded-full bg-[#38C4E8]/20 blur-[50px]" />
                <div className="relative h-[480px] sm:h-[580px] lg:h-[620px]">
                  {strapiProduct?.cover?.url ? (
                    <Image
                      src={getStrapiMedia(strapiProduct.cover.url)}
                      alt={strapiProduct.cover.alternativeText || title}
                      fill
                      className="object-contain drop-shadow-[0_0_80px_rgba(56,196,232,0.4)]"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : mockProduct?.cover ? (
                    <Image
                      src={mockProduct.cover}
                      alt={title}
                      fill
                      className="object-contain drop-shadow-[0_0_80px_rgba(56,196,232,0.4)]"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-[12rem] opacity-40">{category === 'hardware' ? '⚡' : '☁️'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 w-full overflow-hidden">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* Specs Table */}
      {finalSpecs.length > 0 && (
        <section id="specs" className="bg-white py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">{t('specifications')}</h2>
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
              <table className="w-full">
                <tbody>
                  {finalSpecs.map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#0F172A] w-1/3 border-r border-[#E2E8F0]">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
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
        <section className="bg-[#F8FAFC] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">{applicableScenarios}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolutions.map((solution) => {
                const sTitle = getSolutionMessage(locale, solution.slug, 'title') ?? solution.title;
                const sTagline = getSolutionMessage(locale, solution.slug, 'tagline') ?? solution.tagline;
                return (
                  <Link
                    key={solution.slug}
                    href={`/solutions/${solution.slug}`}
                    className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
                      {sTitle}
                    </h3>
                    <p className="mt-2 text-sm text-[#64748B]">{sTagline}</p>
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
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">{resourceDownload}</h2>
          <div className="space-y-3">
            {[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), format: 'PDF', size: '3.2MB' },
              { name: interpolate(getProductLabel(locale, 'installGuide'), { title }), format: 'PDF', size: '1.5MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), format: 'PDF', size: '0.8MB' },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 transition-all hover:shadow-md hover:border-[#38C4E8]/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#38C4E8]/10 text-[#38C4E8]">
                    📄
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A]">{doc.name}</p>
                    <p className="text-xs text-[#64748B]">{doc.format} · {doc.size}</p>
                  </div>
                </div>
                <button className="rounded-md bg-[#38C4E8] px-4 py-2 text-sm font-medium text-white hover:bg-[#2BA8C8] transition-colors">
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
