import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getProducts, getProductBySlug } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';
import { MOCK_PRODUCTS, MOCK_SOLUTIONS, getMockProduct } from '@/lib/mock-data';
import { getProductMessage, getProductLabel, getSpecLabel, getSolutionMessage, getSolutionLabel, interpolate } from '@/lib/i18n-helpers';
import FeatureTabs from '@/components/solutions/FeatureTabs';
import DownloadSection from '@/components/products/DownloadSection';
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
  // For cover image: if current locale has no Strapi data, fallback to zh-CN (which has the real product photo)
  const strapiProductFallback = strapiProduct ?? (locale !== 'zh-CN' ? await getProductBySlug(slug, 'zh-CN') : null);
  const mockProduct = getMockProduct(slug);

  const title = strapiProduct?.title ?? getProductMessage(locale, slug, 'title') ?? mockProduct?.title ?? slug;
  // Banner 大标题：只用纯型号（Neuron II / III / Lite），不带中文描述
  const bannerModelName = mockProduct?.title ?? slug;
  const bannerTitle = mockProduct?.displayTitle ?? title; // 保留备用（暂未用于 h1）
  const positioning = getProductMessage(locale, slug, 'positioning') ?? mockProduct?.positioning ?? '';
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

  // Priority: Strapi keySpecs → i18n translation specs → mock specs
  const strapiKeySpecs = strapiProduct?.keySpecs;
  const finalSpecs: [string, string][] = (strapiKeySpecs && strapiKeySpecs.length > 0)
    ? strapiKeySpecs.map((s) => [s.key, s.value] as [string, string])
    : specs.length > 0
      ? specs
      : Object.entries(mockProduct?.specs ?? {}) as [string, string][];

  const scenarioSlugs = mockProduct?.scenarios ?? [];
  const relatedSolutions = MOCK_SOLUTIONS.filter(s => scenarioSlugs.includes(s.slug));
  const category = strapiProduct?.category ?? mockProduct?.category ?? 'hardware';

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
      {category === 'software' ? (
        /* 软件产品 Banner — 浅蓝白渐变背景，深色文字 */
        <section className="relative min-h-[600px] overflow-hidden pt-24 pb-0"
          style={{ backgroundImage: "url('/images/sw-banner-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[45fr_55fr] lg:items-center pb-16">
              <div className="flex flex-col">
                <h1 className="text-5xl font-bold leading-tight text-[#0F172A] sm:text-6xl lg:text-7xl whitespace-nowrap">
                  {bannerModelName}
                </h1>
                {positioning && (
                  <div className="mt-4 inline-flex w-fit items-center gap-2 border-l-2 border-[#0F172A]/50 pl-3">
                    <span className="text-base font-medium text-[#0F172A]/70 tracking-wide">{positioning}</span>
                  </div>
                )}
                <div className="mt-10">
                  <Link href="/contact"
                    className="inline-flex items-center justify-center w-[220px] py-3.5 text-center rounded bg-[#0F172A] text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-[#1A3FAD]">
                    {t('consultNow')}
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-end lg:-mr-8">
                <div className="relative h-[480px] sm:h-[580px] lg:h-[620px] w-full">
                  {strapiProductFallback?.cover?.url ? (
                    <Image
                      src={getStrapiMedia(strapiProductFallback.cover.url)}
                      alt={title}
                      fill
                      className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-[12rem] opacity-20">☁️</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-16 w-full overflow-hidden">
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#F8FAFC"/>
            </svg>
          </div>
        </section>
      ) : (
        /* 硬件产品 Banner — 深色大图 */
        <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-[#0C1829] via-[#0F2347] to-[#1A3FAD] pt-24 pb-0">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#38C4E8]/5" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#1A3FAD]/40" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[#38C4E8]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[45fr_55fr] lg:items-center pb-16">
              <div className="flex flex-col">
                <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl whitespace-nowrap">
                  {bannerModelName}
                </h1>
                {positioning && (
                  <div className="mt-4 inline-flex w-fit items-center gap-2 border-l-2 border-white/60 pl-3">
                    <span className="text-base font-medium text-white/80 tracking-wide">{positioning}</span>
                  </div>
                )}
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/contact" className="w-[220px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[15px] transition-colors duration-200 hover:bg-white">
                    {contactSales}
                  </Link>
                  <a href="#specs" className="w-[220px] py-3.5 text-center rounded border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-white/20 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,.12)' }}>
                    {viewSpecs} ↓
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end lg:-mr-8">
                <div className="relative w-full">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#38C4E8]/15 blur-[100px]" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[240px] w-[240px] rounded-full bg-[#38C4E8]/20 blur-[50px]" />
                  <div className="relative h-[480px] sm:h-[580px] lg:h-[620px]">
                    {strapiProductFallback?.cover?.url ? (
                      <Image
                        src={getStrapiMedia(strapiProductFallback.cover.url)}
                        alt={strapiProductFallback.cover.alternativeText || title}
                        fill
                        className="object-contain drop-shadow-[0_0_80px_rgba(56,196,232,0.4)]"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-[12rem] opacity-40">⚡</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-16 w-full overflow-hidden">
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#F8FAFC"/>
            </svg>
          </div>
        </section>
      )}

      {/* ===== GALLERY SECTION (from Strapi) ===== */}
      {strapiProduct?.gallery && strapiProduct.gallery.length > 0 && (
        <section className="bg-[#F8FAFC] py-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('gallery') ?? '产品图库'}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {strapiProduct.gallery.map((img, idx) => (
                <div key={img.documentId ?? idx} className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white" style={{ aspectRatio: '4/3' }}>
                  <Image
                    src={getStrapiMedia(img.url)}
                    alt={img.alternativeText || `${title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== SOFTWARE PRODUCT LAYOUT ========== */}
      {category === 'software' ? (
        <>
          {/* ① 产品定位 — 已移除，内容已在 banner 定位文字体现 */}

          {/* Banner 下方：描述文字 + 大图 */}
          {(() => {
            const SW_SCENARIOS: Record<string, { text: string; img: string }> = {
              hems:  { text: '支持光伏、储能等新能源电站的数据采集、电站监控、运维运营全套管理业务。通过云端大数据分析平台，帮助用户实现旗下所有新能源电站的透明化管理、自动化运维、智能化诊断和辅助决策等核心功能。全面满足用户在新能源电站生命周期中的各层次需求，最大化提升电站价值，保护用户核心资产。', img: 'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg' },
              ess:   { text: '可用于工厂、商业楼宇、园区等多站点储能资产统一监控与调度，实现跨品牌设备接入、峰谷自动套利与需量管控，降低综合用电成本 20~40%。', img: 'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg' },
              evcms: { text: '可用于停车场、办公楼、园区等多桩充电站的动态负载均衡与运营管理，在不扩容主线的前提下实现多桩协同充电与智能计费。', img: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg' },
              vpp:   { text: '可用于 VPP 运营商聚合多品牌分布式储能设备，通过云端 API 实现批量调度与实时状态监控，参与电网辅助服务市场获取收益。', img: 'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg' },
              pqms:  { text: '可用于工业园区、数据中心、医院等场所的电能质量远程监测与治理，实现谐波分析、补偿参数在线调优与合规报告自动生成。', img: 'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg' },
            };
            const s = SW_SCENARIOS[slug];
            return s ? (
              <section className="bg-[#F8FAFC] py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                  <p className="text-[#64748B] text-lg leading-relaxed mb-8 text-center">{s.text}</p>
                  <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
                    <Image src={s.img} alt={title} fill className="object-cover object-center" />
                  </div>
                </div>
              </section>
            ) : null;
          })()}

          {/* ② 核心功能 — FeatureTabs（Tab切换 + 左文字右图，与解决方案页一致） */}
          {(() => {
            const SW_FEATURES: Record<string, Array<{label: string; desc: string; points?: string[]}>> = {
              hems: [
                {
                  label: '安全稳定',
                  desc: '基于网络攻击防御与数据隐私保护双重架构，实现能源管理系统的可信运行环境与资产安全闭环。',
                  points: ['金融级安全防护与权限管控', '灾备恢复 + 加密双备份', '国内外合规认证'],
                },
                {
                  label: '省心运维',
                  desc: '组件级—站级—批量诊断全覆盖，运维意见精准指导，简化运维工作，提升运维效率。',
                  points: ['AI 智能运维助手', '实时故障告警 & 自动诊断', '全周期可追溯运维保障'],
                },
                {
                  label: '智能体验',
                  desc: '先进算法智能调度，多种能源模式随心选择，绿电管理掌上轻松实现。',
                  points: ['极简配置，一步到位', 'AI 能源管理，智能高效', '自定义仪表盘，随心掌控'],
                },
              ],
              ess: [
                { label: '多站点统一监控', desc: '一个平台管理所有储能站点，实时查看各站 SOC、功率、健康状态，运维效率提升 80%，告警分级推送。', points: ['多站点一屏总览', '告警分级智能推送', '健康状态实时追踪'] },
                { label: '智能峰谷套利', desc: '自动识别最优充放电时机，低充高放，最大化电价差收益，策略引擎动态响应实时电价波动。', points: ['实时电价动态响应', '最优充放策略自动执行', '收益报表自动生成'] },
                { label: '需量管理', desc: '实时监控功率需量，智能削峰填谷，避免高额需量费超限，无需高额变压器扩容费。', points: ['功率需量实时监控', '削峰填谷自动调度', '扩容费用大幅降低'] },
                { label: '能效报告', desc: '日报/周报/月报自动生成，支持导出 Excel/PDF，完整的能源消耗与收益分析，辅助运营决策。', points: ['日/周/月报自动生成', '支持 Excel/PDF 导出', '完整能源收益分析'] },
              ],
              evcms: [
                { label: 'DLB 动态负载均衡', desc: '毫秒级实时检测主线总负载，动态分配各桩可用功率，在不扩容主线的前提下支持更多充电桩同时运行，彻底杜绝跳闸。', points: ['毫秒级功率动态分配', '零扩容支持多桩并充', '彻底杜绝跳闸风险'] },
                { label: 'OCPP 协议兼容', desc: '支持 OCPP 1.6J / 2.0.1，兼容市场主流充电桩品牌，无需替换现有硬件，快速接入统一管理。', points: ['OCPP 1.6J / 2.0.1 全兼容', '主流品牌无缝接入', '无需替换现有设备'] },
                { label: '智能计费系统', desc: '支持按时计费、按电量计费、会员优惠等多种计费策略，一键结算，支持 VIP 优先模式与排队模式。', points: ['多维计费策略灵活配置', 'VIP 优先 + 排队模式', '一键结算，快速收款'] },
                { label: '运营数据分析', desc: '充电记录、故障告警、功率曲线实时可视化，全站运营数据一站式掌握，助力站点效益最大化。', points: ['充电记录全量追溯', '功率曲线实时可视化', '站点收益一站式分析'] },
              ],
              vpp: [
                { label: '万级设备聚合', desc: '统一调度分布式储能、光伏、充电桩，聚合规模不受限，支持异构品牌混合部署，已打通主流储能品牌云端 API。', points: ['万级设备统一调度', '异构品牌混合部署', '主流云端 API 已打通'] },
                { label: '500ms 指令下发', desc: '调度响应速度达电网辅助服务最高要求，支持秒级批量指令下发，实时状态订阅：SOC、功率、告警状态毫秒级推送。', points: ['500ms 调度响应', '秒级批量指令下发', 'SOC/功率毫秒级推送'] },
                { label: '多品牌 API 适配', desc: 'VPP 运营商无需自研接入层，旭衡统一调度接口支持充放电指令、SOC 查询、告警订阅，完整调度记录与审计。', points: ['统一接口免自研', '充放电 + 告警订阅全覆盖', '完整调度记录与审计'] },
                { label: '自定义调度策略', desc: '支持对接上游电网信号或自定义调度策略，满足不同电力市场交易模式，灵活适配各地监管要求。', points: ['电网信号直连对接', '自定义策略引擎', '灵活适配各地监管'] },
              ],
              pqms: [
                { label: '50次谐波全面监测', desc: '实时采集电压、电流、功率因数、谐波至第50次，精准捕捉各次谐波分量，快速定位问题设备与污染源。', points: ['全参数实时采集', '50次谐波精准捕捉', '问题设备快速定位'] },
                { label: '多站点地图可视化', desc: '站点健康状态地图化展示，一眼掌握全网电能质量分布，多监测点数据统一分析中心。', points: ['站点健康地图总览', '全网电能质量分布', '多点数据统一分析'] },
                { label: '远程参数调优', desc: '在线调整 SVG/APF 补偿参数，减少 90% 以上现场巡检频次，支持远程 OTA 升级现场设备固件。', points: ['SVG/APF 参数在线调整', '现场巡检减少 90%+', '远程 OTA 固件升级'] },
                { label: '合规报告自动生成', desc: '日报/周报/月报一键导出，满足电网公司合规检查要求，历史分析报告帮助定位电能质量劣化根因。', points: ['合规报告一键导出', '满足电网公司检查要求', '历史劣化根因分析'] },
              ],
            };
            const SOLUTION_BG: Record<string, string> = {
              hems:  'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg',
              ess:   'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
              evcms: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
              vpp:   'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
              pqms:  'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
            };
            const features = (strapiProduct?.features && strapiProduct.features.length > 0)
              ? strapiProduct.features
              : (SW_FEATURES[slug] ?? []);
            return features.length > 0 ? (
              <FeatureTabs
                title={t('coreFeatures')}
                features={features}
                bgImage={SOLUTION_BG[slug] ?? ''}
              />
            ) : null;
          })()}

          {/* ③ 接入方式 */}
          {relatedSolutions.length > 0 && (() => {
            const accessModes = relatedSolutions[0] ? (['hems','ess'].includes(slug) ? ['cloud','gateway'] : slug === 'evcms' ? ['gateway'] : slug === 'vpp' ? ['cloud'] : ['gateway','cloud']) : [];
            const cards = [
              accessModes.includes('cloud') && {
                icon: '☁️', title: t('cloudDirectTitle'),
                desc: t('cloudDirectDesc'),
              },
              accessModes.includes('gateway') && {
                icon: '🔗', title: t('gatewayLanTitle'),
                desc: t('gatewayLanDesc'),
              },
            ].filter(Boolean) as { icon: string; title: string; desc: string }[];

            return cards.length > 0 ? (
              <section className="bg-white py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                  <h2 className="mb-3 text-3xl font-bold text-[#0F172A] text-center">{t('accessMethodsTitle')}</h2>
                  <p className="mb-10 text-center text-[#64748B]">{t('accessMethodsSubtitle')}</p>

                  {/* 大背景卡片 — 浅蓝灰渐变，参考阳光云风格 */}
                  <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #EBF4FF 0%, #E0EFFE 50%, #EBF4FF 100%)', minHeight: '280px' }}>
                    {cards.length === 1 ? (
                      /* 单种接入 — 居中 */
                      <div className="flex flex-col items-center justify-center h-full py-16 px-10 text-center gap-4">
                        <div className="text-5xl">{cards[0].icon}</div>
                        <h3 className="text-2xl font-bold text-[#0F172A]">{cards[0].title}</h3>
                        <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">{cards[0].desc}</p>
                      </div>
                    ) : (
                      /* 两种接入 — 左右划分 */
                      <div className="grid grid-cols-2 h-full">
                        {cards.map((card, i) => (
                          <div
                            key={card.title}
                            className={`flex flex-col justify-center px-12 py-14 gap-4 ${i === 0 ? 'border-r border-white/50' : ''}`}
                          >
                            <div className="text-4xl">{card.icon}</div>
                            <h3 className="text-xl font-bold text-[#0F172A]">{card.title}</h3>
                            <p className="text-sm text-[#64748B] leading-relaxed">{card.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : null;
          })()}

          {/* ④ 技术规格 — 与硬件产品同款样式 */}
          {finalSpecs.length > 0 && (
            <section id="specs" className="bg-white py-24">
              <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('specifications')}</h2>
                <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                  <table className="w-full">
                    <tbody>
                      {finalSpecs.map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                          <td className="px-6 py-4 text-sm font-medium text-[#0F172A] w-1/3 border-r border-[#E2E8F0] text-center">{key}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B] text-center">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ⑤ 适用场景 — 已移至 banner 下方 */}

          {/* ⑥ 资源下载 */}
          <DownloadSection
            title={title}
            coverImg="/images/mockup-laptop.svg"
            files={[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), category: '用户手册', format: 'PDF', size: '3.2 MB' },
              { name: `${title} 快速上手指南`, category: '用户手册', format: 'PDF', size: '1.0 MB' },
              { name: `${title} API 集成文档`, category: 'API 文档', format: 'PDF', size: '2.5 MB' },
              { name: `${title} OpenAPI 规范`, category: 'API 文档', format: 'YAML', size: '0.3 MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), category: '数据手册', format: 'PDF', size: '0.8 MB' },
            ]}
          />
        </>
      ) : (
        <>
          {/* ========== HARDWARE PRODUCT LAYOUT (原有) ========== */}
          {/* 硬件产品：若Strapi有features，渲染功能Tab */}
          {strapiProduct?.features && strapiProduct.features.length > 0 && (
            <FeatureTabs
              title="核心功能"
              features={strapiProduct.features}
              bgImage=""
            />
          )}

          {finalSpecs.length > 0 && (
            <section id="specs" className="bg-white py-24">
              <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('specifications')}</h2>
                <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                  <table className="w-full">
                    <tbody>
                      {finalSpecs.map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                          <td className="px-6 py-4 text-sm font-medium text-[#0F172A] w-1/3 border-r border-[#E2E8F0] text-center">{key}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B] text-center">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {relatedSolutions.length > 0 && (
            <section className="bg-[#F8FAFC] py-24">
              <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <h2 className="mb-12 text-3xl font-bold text-[#0F172A] text-center">{applicableScenarios}</h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedSolutions.map((solution) => {
                    const sTitle = getSolutionMessage(locale, solution.slug, 'title') ?? solution.title;
                    const sTagline = getSolutionMessage(locale, solution.slug, 'tagline') ?? solution.tagline;
                    const SOLUTION_IMGS: Record<string, string> = {
                      hems:  'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg',
                      ess:   'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
                      evcms: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
                      vpp:   'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
                      pqms:  'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
                    };
                    const img = SOLUTION_IMGS[solution.slug] ?? '';
                    return (
                      <Link key={solution.slug} href={`/solutions/${solution.slug}`}
                        className="group rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        {/* 顶部图片 */}
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                          <Image src={img} alt={sTitle} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        {/* 底部文字区 */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#38C4E8] transition-colors">{sTitle}</h3>
                          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{sTagline}</p>
                          <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">{viewSolution} →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
          <DownloadSection
            title={title}
            coverImg={(() => {
              const HW_IMGS: Record<string, string> = {
                'neuron-ii': '/images/neuron-ii-clean.png',
                'neuron-iii': '/images/neuron-iii-clean.png',
                'neuron-iii-lite': '/images/neuron-iii-lite-clean.png',
              };
              return HW_IMGS[slug] ?? `/images/${slug}.jpg`;
            })()}
            files={[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), category: '用户手册', format: 'PDF', size: '3.2 MB' },
              { name: interpolate(getProductLabel(locale, 'installGuide'), { title }), category: '安装指南', format: 'PDF', size: '1.5 MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), category: '数据手册', format: 'PDF', size: '0.8 MB' },
              { name: `${title} 固件 v2.3.1`, category: '固件', format: 'BIN', size: '12.4 MB' },
              { name: `${title} 配置工具 v1.2`, category: '工具软件', format: 'EXE', size: '45 MB' },
            ]}
          />
        </>
      )}

      {/* ⑦ CTA — 软硬件通用 */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {interpolate(getProductLabel(locale, 'ctaInterested'), { title })}
          </h2>
          <p className="mt-4 text-gray-300">{getProductLabel(locale, 'ctaDesc')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl">
              {category === 'software' ? t('applyDemoExperience') : contactSales}
            </Link>
            <Link href="/contact"
              className="inline-flex items-center rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10">
              {t('contactBusiness')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
