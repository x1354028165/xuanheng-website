import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getSolutions, getSolutionBySlug } from '@/lib/api';
import { MOCK_SOLUTIONS, MOCK_PRODUCTS, getMockSolution } from '@/lib/mock-data';
import { getSolutionMessage, getSolutionLabel, getProductMessage, interpolate } from '@/lib/i18n-helpers';
import FeatureTabs from '@/components/solutions/FeatureTabs';
import type { Metadata } from 'next';

const SITE_NAME: Record<string, string> = {
  'zh-CN': '旭衡电子', 'zh-TW': '旭衡電子',
  'en-US': 'AlwaysControl', 'de': 'AlwaysControl', 'fr': 'AlwaysControl',
  'es': 'AlwaysControl', 'pt': 'AlwaysControl', 'ru': 'AlwaysControl',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const strapiSolution = await getSolutionBySlug(slug, locale);
  const mockSolution = getMockSolution(slug);
  const solutionTitle = strapiSolution?.title ?? getSolutionMessage(locale, slug, 'title') ?? mockSolution?.title ?? slug;
  const site = SITE_NAME[locale] ?? 'AlwaysControl';
  return { title: `${solutionTitle} | ${site}` };
}

export const dynamicParams = true;
export const revalidate = 60;

const STRAPI_PUBLIC_URL = 'http://32.236.16.227:1337';

export async function generateStaticParams() {
  const strapiSolutions = await getSolutions();
  const strapiSlugs = strapiSolutions.map((s) => ({ slug: s.slug }));
  const mockSlugs = MOCK_SOLUTIONS.map((s) => ({ slug: s.slug }));
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

type CaseItemType = { area: string; scale: string; problem: string };

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

  // Scene background
  const sceneBackground = getSolutionMessage(locale, slug, 'background') ?? '';

  // Features/highlights from direct message access
  const features: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const val = getSolutionMessage(locale, slug, `feature${i}`);
    if (val) features.push(val);
  }
  const finalHighlights = features.length > 0 ? features : (mockSolution?.highlights ?? []);

  const relatedProductSlugs = mockSolution?.relatedProducts ?? [];
  const relatedProducts = MOCK_PRODUCTS.filter(p => relatedProductSlugs.includes(p.slug));

  // Build cases from translation keys (fallback for when Strapi has no data)
  const caseCount = parseInt(getSolutionMessage(locale, slug, 'caseCount') ?? '0');
  const i18nCases = Array.from({ length: caseCount }, (_, i) => ({
    area: getSolutionMessage(locale, slug, `case${i}Area`) ?? '',
    scale: getSolutionMessage(locale, slug, `case${i}Scale`) ?? '',
    problem: getSolutionMessage(locale, slug, `case${i}Problem`) ?? '',
  })).filter(c => c.area);
  const cases = (strapiSolution?.cases && strapiSolution.cases.length > 0)
    ? strapiSolution.cases
    : i18nCases;

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
      {/* ===== SOLUTION HERO BANNER ===== */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0C1829]">
        {/* Background image — plain img tag to avoid next/image remotePatterns issues */}
        {(() => {
          const SOLUTION_BG: Record<string, string> = {
            hems:  '/strapi/uploads/solution_hems_real_e169716a7e.jpg',
            ess:   '/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
            evcms: '/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
            vpp:   '/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
            pqms:  '/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
          };
          const bgSrc = SOLUTION_BG[slug];
          return bgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bgSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : null;
        })()}
        {/* Gradient overlay — dark enough to keep text readable */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(12,24,41,.55) 0%, rgba(12,24,41,.45) 50%, rgba(12,24,41,.70) 100%)',
        }} />
        {/* Cyan glow accent */}
        <div className="absolute pointer-events-none" style={{
          top: '-150px', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,196,232,.15) 0%, rgba(56,196,232,.04) 40%, transparent 65%)',
        }} />

        {/* Content — centered like homepage */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 max-w-4xl mx-auto">
          {/* Solution title — first */}
          <h1 className="text-[clamp(36px,4vw,72px)] font-bold text-white leading-[1.15] tracking-tight" style={{ textShadow: '0 1px 20px rgba(0,0,0,.4)', letterSpacing: '-0.5px' }}>
            {title}
          </h1>

          {/* Tagline — below title, #1A3FAD pill */}
          {tagline && (
            <div className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white tracking-wide"
              style={{ background: '#1A3FAD', backdropFilter: 'blur(8px)' }}>
              {tagline}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-[clamp(15px,1.1vw,20px)] text-white/80 max-w-[680px] leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex justify-center gap-4 flex-col sm:flex-row items-center w-full">
            <Link
              href="/contact"
              className="w-[280px] max-w-[340px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[15px] transition-colors duration-200 hover:bg-white"
            >
              {applyDemo}
            </Link>
            <a
              href="#highlights"
              className="w-[280px] max-w-[340px] py-3.5 text-center rounded border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-white/20 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,.12)' }}
            >
              {t('learnMoreDown')}
            </a>
          </div>
        </div>

      </section>

      {/* ===== §0 场景背景 ===== */}
      {sceneBackground && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-6 text-3xl font-bold text-[#0F172A]">{t('sceneBackground')}</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">{sceneBackground}</p>
          </div>
        </section>
      )}

      {/* ===== §1 核心痛点 ===== */}
      {finalPainPoints.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-3xl font-bold text-[#0F172A] text-center">{painPointsTitle}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {finalPainPoints.map((point, idx) => {
                const colonIdx = point.indexOf('：');
                const label = colonIdx > 0 ? point.slice(0, colonIdx) : `0${idx + 1}`;
                const desc = colonIdx > 0 ? point.slice(colonIdx + 1).trim() : point;
                return (
                  <div key={idx} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-7">
                    <div className="mb-3 text-3xl font-black text-[#E2E8F0]">{String(idx + 1).padStart(2, '0')}</div>
                    <h3 className="mb-2 text-base font-bold text-[#0F172A]">{label}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== §2a 方案描述 ===== */}
      {description && (
        <section className="bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-6 text-3xl font-bold text-[#0F172A]">{t('solutionDescription')}</h2>
            <p className="text-[#64748B] text-lg leading-relaxed">{description}</p>
          </div>
        </section>
      )}

      {/* ===== §2b 接入方式 ===== */}
      {mockSolution?.accessModes && mockSolution.accessModes.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-3 text-3xl font-bold text-[#0F172A] text-center">{t('accessModesTitle')}</h2>
            <p className="mb-10 text-center text-[#64748B]">{t('accessModesSubtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {mockSolution.accessModes.includes('cloud') && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
                  <div className="text-4xl mb-4">☁️</div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2">{t('accessCloud')}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{t('accessCloudDesc')}</p>
                </div>
              )}
              {mockSolution.accessModes.includes('gateway') && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
                  <div className="text-4xl mb-4">🔗</div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2">{t('accessGateway')}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{t('accessGatewayDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== §3 核心能力 Tab（左文字右图） ===== */}
      {(() => {
        const SOLUTION_BG: Record<string, string> = {
          hems:  'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg',
          ess:   'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
          evcms: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
          vpp:   'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
          pqms:  'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
        };
        // Prefer Strapi features (rich structure with label/desc/points) over i18n highlights
        const strapiFeatures = strapiSolution?.features;
        if (strapiFeatures && strapiFeatures.length > 0) {
          return (
            <FeatureTabs
              title={highlightsTitle ?? t('coreFeaturesList')}
              features={strapiFeatures}
              bgImage={SOLUTION_BG[slug] ?? ''}
            />
          );
        }
        // Fallback to i18n highlights
        if (finalHighlights.length > 0) {
          const featureItems = finalHighlights.map((h) => {
            const colonIdx = h.indexOf('：');
            if (colonIdx > 0) return { label: h.slice(0, colonIdx), desc: h.slice(colonIdx + 1).trim() };
            return { label: h.slice(0, 14), desc: h };
          });
          return (
            <FeatureTabs
              title={highlightsTitle ?? t('coreFeaturesList')}
              features={featureItems}
              bgImage={SOLUTION_BG[slug] ?? ''}
            />
          );
        }
        return null;
      })()}

      {/* ===== §4 应用案例 ===== */}
      {cases.length > 0 && (
        <section id="cases" className="bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-10 text-center">{t('applicationCases')}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((c, i) => (
                <div key={i} className="rounded-2xl border border-[#E2E8F0] bg-white p-7 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-[#38C4E8]">{c.area}</div>
                  <div className="text-base font-bold text-[#0F172A]">{c.scale}</div>
                  <div className="mt-auto text-sm text-[#64748B] bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                    ✅ {c.problem}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== §5 本方案使用的产品 ===== */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0F172A] text-center">{recommendedProducts}</h2>
            <p className="mb-10 text-center text-[#64748B] text-sm">{t('relatedProductsDesc')}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {relatedProducts.map((product) => {
                const pTitle = getProductMessage(locale, product.slug, 'title') ?? product.title;
                const pTagline = getProductMessage(locale, product.slug, 'tagline') ?? product.tagline;
                return (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{product.category === 'hardware' ? '⚡' : '☁️'}</span>
                      <span className="inline-block rounded-full bg-[#38C4E8]/10 px-2 py-0.5 text-xs text-[#38C4E8] font-medium">
                        {product.category === 'hardware' ? hardwareLabel : softwareLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">
                      {pTitle}
                    </h3>
                    <p className="mt-2 text-sm text-[#64748B] line-clamp-2">{pTagline}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-semibold text-[#38C4E8]">
                      {viewProduct} →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
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
