import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getSolutions, getSolutionBySlug } from '@/lib/api';
import { MOCK_SOLUTIONS, MOCK_PRODUCTS, getMockSolution } from '@/lib/mock-data';
import { getSolutionMessage, getSolutionLabel, getProductMessage, interpolate } from '@/lib/i18n-helpers';
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

const SOLUTION_CASES: Record<string, Array<{area: string; scale: string; problem: string}>> = {
  hems: [
    { area: "🇹🇼 台湾台北", scale: "家庭 8kW 光伏 + 10kWh 储能", problem: "电费节省 35%，自发自用率提升至 72%" },
    { area: "🇦🇺 澳大利亚悉尼", scale: "3.5kW 光伏 + 5kWh 储能", problem: "月节省电费约 180 澳元" },
    { area: "🇩🇪 德国慕尼黑", scale: "12kW 光伏 + 20kWh 储能 + 双充电桩", problem: "综合能耗降低 42%" },
  ],
  ess: [
    { area: "🇨🇳 广东东莞某工厂", scale: "500kWh 工商储能柜", problem: "需量费削减 28%，年节电费 120 万元" },
    { area: "🇨🇳 上海某商业综合体", scale: "200kWh 多品牌混合储能", problem: "峰谷套利年收益 80 万元" },
    { area: "🇪🇸 西班牙某园区", scale: "1MWh 储能 + 光伏", problem: "参与辅助服务市场，年额外收益约 40 万元" },
  ],
  evcms: [
    { area: "🇨🇳 深圳某停车场", scale: "60 个充电桩，原配电 200kW", problem: "部署 DLB 后跳闸率降至 0，无需扩容" },
    { area: "🇳🇱 荷兰某物流中心", scale: "OCPP 2.0.1 多品牌 30 桩", problem: "运维成本降低 60%" },
    { area: "🇨🇳 北京某酒店", scale: "20 桩有序充电", problem: "年充电电费节省 25 万元" },
  ],
  vpp: [
    { area: "🇨🇳 某省级能源聚合商", scale: "聚合 500 个分布式储能站（50MWh）", problem: "首年创收 200 万元" },
    { area: "🇯🇵 日本某能源运营商", scale: "户用 + 工商储混合调度", problem: "平均响应时间 < 2s" },
  ],
  pqms: [
    { area: "🇨🇳 江苏某精密制造工厂", scale: "THD > 15%，设备频繁故障", problem: "设备故障率下降 78%" },
    { area: "🇨🇳 广西某医院", scale: "关键医疗设备电压波动", problem: "7×24 实时监测，提前预警 3 次潜在故障" },
  ],
};

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

  const cases = SOLUTION_CASES[slug] ?? [];

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
      <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-[#0C1829] via-[#0F2347] to-[#1A3FAD] pt-24 pb-0">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#38C4E8]/5" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#1A3FAD]/40" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-sol" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-sol)" />
          </svg>
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[#38C4E8]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[45fr_55fr] lg:items-center pb-16">
            {/* Left: Title + CTA */}
            <div className="flex flex-col">
              {/* Tagline badge */}
              {tagline && (
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#38C4E8]/40 bg-[#38C4E8]/10 px-3.5 py-1 text-sm font-medium text-[#38C4E8] tracking-wide backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38C4E8]" />
                  {tagline}
                </div>
              )}

              {/* Solution title */}
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p className="mt-5 text-base text-white/70 leading-relaxed max-w-lg">
                  {description}
                </p>
              )}

              {/* CTA button */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="w-[220px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[15px] transition-colors duration-200 hover:bg-white"
                >
                  {applyDemo}
                </Link>
                <a
                  href="#highlights"
                  className="w-[220px] py-3.5 text-center rounded border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-white/20 backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,.12)" }}
                >
                  了解更多 ↓
                </a>
              </div>
            </div>

            {/* Right: Solution cover image */}
            <div className="flex items-center justify-center lg:justify-end lg:-mr-8">
              <div className="relative w-full">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#38C4E8]/15 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[240px] w-[240px] rounded-full bg-[#38C4E8]/20 blur-[50px]" />
                <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
                  {strapiSolution?.cover?.url ? (
                    <Image
                      src={`${STRAPI_PUBLIC_URL}${strapiSolution.cover.url}`}
                      alt={strapiSolution.cover.alternativeText || title}
                      fill
                      className="object-contain drop-shadow-[0_0_80px_rgba(56,196,232,0.4)]"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : mockSolution?.cover ? (
                    <Image
                      src={mockSolution.cover}
                      alt={title}
                      fill
                      className="object-contain drop-shadow-[0_0_80px_rgba(56,196,232,0.4)]"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-8xl opacity-30">⚡</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      {finalPainPoints.length > 0 && (
        <section className="bg-white py-24">
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
        <section id="highlights" className="bg-[#F8FAFC] py-24">
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
        <section className="bg-white py-24">
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

      {/* Application Cases */}
      {cases.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-8">应用案例</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((c, i) => (
                <div key={i} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                  <div className="text-lg font-semibold text-[#0F172A] mb-2">{c.area}</div>
                  <div className="text-sm text-[#64748B] mb-3">{c.scale}</div>
                  <div className="text-sm text-[#0F172A] bg-[#38C4E8]/5 border border-[#38C4E8]/20 rounded-lg p-3">
                    ✅ {c.problem}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#F8FAFC] py-24">
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
