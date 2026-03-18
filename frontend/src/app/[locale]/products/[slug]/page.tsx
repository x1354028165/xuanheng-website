import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getProducts, getProductBySlug, getProductRelations } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';
import { MOCK_PRODUCTS, MOCK_SOLUTIONS, getMockProduct } from '@/lib/mock-data';
import { getProductMessage, getProductLabel, getProductData, getSpecLabel, getSolutionMessage, getSolutionLabel, interpolate } from '@/lib/i18n-helpers';
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
  // Banner 大标题：优先用 Strapi title，fallback mock（纯型号）
  const bannerModelName = strapiProduct?.title ?? mockProduct?.title ?? slug;
  const bannerTitle = bannerModelName;
  // tagline：优先 Strapi，fallback 翻译文件
  const tagline = strapiProduct?.tagline ?? getProductMessage(locale, slug, 'tagline') ?? mockProduct?.tagline ?? '';
  // positioning：优先用 tagline（含完整描述），fallback 翻译文件 positioning
  const positioning = tagline || (getProductMessage(locale, slug, 'positioning') ?? mockProduct?.positioning ?? '');
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

  // 产品关联：优先从 Strapi product-relations 读，fallback mock
  const strapiRelations = await getProductRelations(slug);
  const strapiRelationSlugs = strapiRelations.filter(r => r.showOnProduct).map(r => r.solutionSlug);
  const mockScenarioSlugs = mockProduct?.scenarios ?? [];
  // 合并（Strapi有数据就用Strapi，否则用mock）
  const finalRelationSlugs = strapiRelationSlugs.length > 0 ? strapiRelationSlugs : mockScenarioSlugs;
  const relatedSolutions = MOCK_SOLUTIONS.filter(s => finalRelationSlugs.includes(s.slug));
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
            <h2 className="mb-8 text-2xl font-bold text-[#0F172A] text-center">{t('gallery')}</h2>
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
            const scenarioText = getProductMessage(locale, slug, 'swScenarioText');
            const SW_SCENARIO_IMGS: Record<string, string> = {
              hems:  'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg',
              ess:   'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
              evcms: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
              vpp:   'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
              pqms:  'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
            };
            const scenarioImg = SW_SCENARIO_IMGS[slug];
            return (scenarioText && scenarioImg) ? (
              <section className="bg-[#F8FAFC] py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                  <p className="text-[#64748B] text-lg leading-relaxed mb-8 text-center">{scenarioText}</p>
                  <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
                    <Image src={scenarioImg} alt={title} fill className="object-cover object-center" />
                  </div>
                </div>
              </section>
            ) : null;
          })()}

          {/* ② 核心功能 — FeatureTabs（Tab切换 + 左文字右图，与解决方案页一致） */}
          {(() => {
            const SOLUTION_BG: Record<string, string> = {
              hems:  'http://32.236.16.227/strapi/uploads/solution_hems_real_e169716a7e.jpg',
              ess:   'http://32.236.16.227/strapi/uploads/solution_ess_real_8afb1e9d62.jpg',
              evcms: 'http://32.236.16.227/strapi/uploads/solution_evcms_real_d7c6169495.jpg',
              vpp:   'http://32.236.16.227/strapi/uploads/solution_vpp_real_48675dec3f.jpg',
              pqms:  'http://32.236.16.227/strapi/uploads/solution_pqms_real_eeb399956e.jpg',
            };
            // Build features from translation keys
            const featureCount = parseInt(getProductMessage(locale, slug, 'swFeatureCount') ?? '0');
            const i18nFeatures = Array.from({ length: featureCount }, (_, i) => {
              const pts: string[] = [];
              for (let j = 0; j < 5; j++) {
                const pt = getProductMessage(locale, slug, `swFeature${i}Point${j}`);
                if (pt) pts.push(pt);
                else break;
              }
              return {
                label: getProductMessage(locale, slug, `swFeature${i}Label`) ?? '',
                desc: getProductMessage(locale, slug, `swFeature${i}Desc`) ?? '',
                points: pts.length > 0 ? pts : undefined,
              };
            }).filter(f => f.label);
            const features = (strapiProduct?.features && strapiProduct.features.length > 0)
              ? strapiProduct.features
              : i18nFeatures.length > 0 ? i18nFeatures : [];
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

          {/* ④ 推荐硬件网关（软件产品专属，从 Strapi product-relations 读） */}
          {(() => {
            // 软件产品关联的硬件：solutionSlug = 硬件slug（反向查询）
            const hwSlugs = strapiRelations.filter(r => r.showOnProduct).map(r => r.solutionSlug)
              .filter(s => ['neuron-ii','neuron-iii','neuron-iii-lite'].includes(s));
            if (hwSlugs.length === 0) return null;
            const HW_IMG: Record<string, string> = {
              'neuron-ii': '/images/neuron-ii-clean.png',
              'neuron-iii': '/images/neuron-iii-clean.png',
              'neuron-iii-lite': '/images/neuron-iii-lite-clean.png',
            };
            return (
              <section className="bg-[#F8FAFC] py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                  <h2 className="mb-3 text-3xl font-bold text-[#0F172A] text-center">{getProductLabel(locale, 'recommendHwTitle')}</h2>
                  <p className="mb-10 text-center text-[#64748B]">{getProductLabel(locale, 'recommendHwSubtitle')}</p>
                  <div className={`grid gap-6 ${hwSlugs.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {hwSlugs.map(hwSlug => {
                      const hwImg = HW_IMG[hwSlug];
                      if (!hwImg) return null;
                      const hwTitle = getProductMessage(locale, hwSlug, 'title') ?? hwSlug;
                      const hwDescText = (getProductData(locale, `hwDesc.${hwSlug}`) as string | undefined) ?? getProductMessage(locale, hwSlug, 'tagline') ?? '';
                      return (
                        <Link key={hwSlug} href={`/products/${hwSlug}`}
                          className="group flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                          <div className="relative h-32 w-full mb-4">
                            <Image src={hwImg} alt={hwTitle} fill className="object-contain" sizes="200px" />
                          </div>
                          <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">{hwTitle}</h3>
                          <p className="mt-1 text-sm text-[#64748B] text-center">{hwDescText}</p>
                          <span className="mt-4 text-sm font-medium text-[#38C4E8]">{getProductLabel(locale, 'viewDetailArrow')}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ⑤ 技术规格 — 与硬件产品同款样式 */}
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
            sectionTitle={resourceDownload}
            coverImg="/images/mockup-laptop.svg"
            files={[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), category: t('fileCatUserManual'), format: 'PDF', size: '3.2 MB' },
              { name: interpolate(t('quickStartGuide'), { title }), category: t('fileCatUserManual'), format: 'PDF', size: '1.0 MB' },
              { name: interpolate(t('apiIntegDoc'), { title }), category: t('fileCatApiDoc'), format: 'PDF', size: '2.5 MB' },
              { name: interpolate(t('openApiSpec'), { title }), category: t('fileCatApiDoc'), format: 'YAML', size: '0.3 MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), category: t('fileCatDatasheet'), format: 'PDF', size: '0.8 MB' },
            ]}
          />
        </>
      ) : (
        <>
          {/* ========== HARDWARE PRODUCT LAYOUT (原有) ========== */}
          {/* 硬件产品：若Strapi有features，渲染功能Tab */}
          {strapiProduct?.features && strapiProduct.features.length > 0 && (
            <FeatureTabs
              title={t('coreFeatures')}
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
            sectionTitle={resourceDownload}
            coverImg={(() => {
              const HW_IMGS: Record<string, string> = {
                'neuron-ii': '/images/neuron-ii-clean.png',
                'neuron-iii': '/images/neuron-iii-clean.png',
                'neuron-iii-lite': '/images/neuron-iii-lite-clean.png',
              };
              return HW_IMGS[slug] ?? `/images/${slug}.jpg`;
            })()}
            files={[
              { name: interpolate(getProductLabel(locale, 'userManual'), { title }), category: t('fileCatUserManual'), format: 'PDF', size: '3.2 MB' },
              { name: interpolate(getProductLabel(locale, 'installGuide'), { title }), category: t('fileCatInstallGuide'), format: 'PDF', size: '1.5 MB' },
              { name: interpolate(getProductLabel(locale, 'datasheet'), { title }), category: t('fileCatDatasheet'), format: 'PDF', size: '0.8 MB' },
              { name: interpolate(t('firmwareFile'), { title }), category: t('fileCatFirmware'), format: 'BIN', size: '12.4 MB' },
              { name: interpolate(t('configToolFile'), { title }), category: t('fileCatTool'), format: 'EXE', size: '45 MB' },
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
