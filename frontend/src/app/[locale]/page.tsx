import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export const revalidate = 60; // 1分钟缓存，CMS更新后60s内生效
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getProducts, getSolutions, getArticles, getCompatibleBrands } from '@/lib/api';
import type { StrapiSolution, StrapiProduct, StrapiArticle, StrapiCompatibleBrand } from '@/types/strapi';

import { MOCK_PRODUCTS as _MP, MOCK_SOLUTIONS as _MS, MOCK_ARTICLES as _MA, MOCK_BRANDS as _MB } from '@/lib/mock-data';
import { getProductMessage, getSolutionMessage } from '@/lib/i18n-helpers';

import SolutionsAccordion from '@/components/home/SolutionsAccordion';
import SoftwareTabs from '@/components/home/SoftwareTabs';

const MOCK_SOLUTIONS = _MS.map(s => ({ documentId: s.documentId, title: s.title, slug: s.slug, tagline: s.tagline, cover: s.cover }));
const MOCK_PRODUCTS_LIST = _MP.map(p => ({ documentId: p.documentId, title: p.title, slug: p.slug, tagline: p.tagline, cover: p.cover, category: p.category }));
const MOCK_ARTICLES_LIST = _MA;
const MOCK_BRANDS_LIST = _MB;

/* Hardware device SVG placeholder */
function DeviceSVG() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[85%] h-auto">
      <rect x="20" y="16" width="260" height="166" rx="18" fill="#E8EDF2" stroke="#C8D0DA" strokeWidth="1.5"/>
      <rect x="38" y="38" width="224" height="122" rx="10" fill="#F5F7FA" stroke="#DDE3EC" strokeWidth="1"/>
      <circle cx="150" cy="99" r="34" fill="#fff" stroke="#D0D7E3" strokeWidth="1.5"/>
      <circle cx="150" cy="99" r="15" fill="#38C4E8" opacity=".85"/>
      <circle cx="150" cy="99" r="6" fill="#fff"/>
      <circle cx="54" cy="54" r="5" fill="#38C4E8" opacity=".9"/>
      <circle cx="70" cy="54" r="5" fill="#38C4E8" opacity=".5"/>
      <circle cx="86" cy="54" r="5" fill="#C8D0DA"/>
      <rect x="38" y="192" width="46" height="9" rx="3" fill="#D0D7E3"/>
      <rect x="92" y="192" width="46" height="9" rx="3" fill="#D0D7E3"/>
      <rect x="146" y="192" width="46" height="9" rx="3" fill="#D0D7E3"/>
      <rect x="216" y="192" width="46" height="9" rx="3" fill="#38C4E8" opacity=".6"/>
      <line x1="254" y1="16" x2="254" y2="-2" stroke="#C8D0DA" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* News placeholder color blocks */
const NEWS_COLORS = ['#38C4E8', '#1A3FAD', '#0891B2'];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  // Fetch data with mock fallbacks
  // 按locale查CMS，fallback链：locale→en→zh-CN
  let solutions = await getSolutions(locale);
  if (!solutions || solutions.length === 0) {
    solutions = MOCK_SOLUTIONS as unknown as StrapiSolution[];
  }

  let products = await getProducts(locale);
  if (!products || products.length === 0) {
    products = MOCK_PRODUCTS_LIST as unknown as StrapiProduct[];
  }

  const articlesRes = await getArticles(locale, 1, 3);
  let articles = articlesRes.data;
  if (!articles || articles.length === 0) {
    articles = MOCK_ARTICLES_LIST as unknown as StrapiArticle[];
  }

  let brands = await getCompatibleBrands();
  if (!brands || brands.length === 0) {
    brands = MOCK_BRANDS_LIST as unknown as StrapiCompatibleBrand[];
  }

  // Fallback cover images per slug（CMS cover为空时使用）
  const SOLUTION_FALLBACK_COVER: Record<string, string> = {
    hems: `${process.env.NEXT_PUBLIC_API_URL?.replace(/:1337$/, '') ?? ''}/strapi/uploads/solution_hems_real_e169716a7e.jpg`,
    ess: `${process.env.NEXT_PUBLIC_API_URL?.replace(/:1337$/, '') ?? ''}/strapi/uploads/solution_ess_real_8afb1e9d62.jpg`,
    evcms: `${process.env.NEXT_PUBLIC_API_URL?.replace(/:1337$/, '') ?? ''}/strapi/uploads/solution_evcms_real_d7c6169495.jpg`,
    vpp: `${process.env.NEXT_PUBLIC_API_URL?.replace(/:1337$/, '') ?? ''}/strapi/uploads/solution_vpp_real_48675dec3f.jpg`,
    pqms: `${process.env.NEXT_PUBLIC_API_URL?.replace(/:1337$/, '') ?? ''}/strapi/uploads/solution_pqms_real_eeb399956e.jpg`,
  };
  const SOLUTION_TAG: Record<string, string> = {
    hems: t('tagHems'), ess: t('tagEss'), evcms: t('tagEvcms'), vpp: t('tagVpp'), pqms: t('tagPqms'),
  };

  // accordionData 从 CMS solutions 构建，cover 为空时使用 fallback
  const SOLUTION_ORDER = ['hems', 'ess', 'evcms', 'vpp', 'pqms'];
  const solutionMap = Object.fromEntries(solutions.map(s => [s.slug, s]));
  const accordionData = SOLUTION_ORDER.map(slug => {
    const s = solutionMap[slug];
    const rawCoverUrl = s?.cover
      ? (typeof s.cover === 'string' ? s.cover : (s.cover as { url?: string })?.url ?? SOLUTION_FALLBACK_COVER[slug])
      : SOLUTION_FALLBACK_COVER[slug];
    // 外部链接（Unsplash等）替换为本地服务器图片，避免国内访问失败
    const coverUrl = rawCoverUrl?.startsWith('/uploads/')
      ? getStrapiMedia(rawCoverUrl)
      : (rawCoverUrl?.startsWith('http') && !rawCoverUrl.includes('32.236.16.227'))
        ? SOLUTION_FALLBACK_COVER[slug]
        : rawCoverUrl;
    return {
      tag: SOLUTION_TAG[slug] ?? slug,
      title: s?.title || t(`accordion${slug.charAt(0).toUpperCase()+slug.slice(1)}`),
      description: s?.tagline || t(`accordion${slug.charAt(0).toUpperCase()+slug.slice(1)}Desc`),
      href: `/solutions/${slug}`,
      bgImage: coverUrl,
      linkText: t('viewDetail'),
    };
  });

  // Hardware products
  const hwProducts = [
    { name: 'Neuron II',       img: '/images/neuron-ii-clean.png' },
    { name: 'Neuron III',      img: '/images/neuron-iii-clean.png' },
    { name: 'Neuron III Lite', img: '/images/neuron-iii-lite-clean.png' },
  ];

  // Brand fallback names
  const fallbackBrands = ['BYD', 'CATL', 'Growatt', 'SolarEdge', 'Victron', 'Tesla', 'Deye', 'Sungrow', 'Fronius', 'SMA', 'GoodWe', 'Sofar'];

  return (
    <>
      {/* 首页标志：同步脚本，React 加载前立即设置 CSS attribute，消除白色闪现 */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-page','home');" }} />

      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0C1829]">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&auto=format&fit=crop"
          alt="Solar energy background"
          fill
          className="object-cover object-[center_60%]"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,.10) 0%, rgba(0,0,0,.05) 45%, rgba(0,0,0,.30) 100%)',
        }} />
        {/* Top glow */}
        <div className="absolute pointer-events-none" style={{
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,196,232,.2) 0%, rgba(56,196,232,.05) 40%, transparent 65%)',
        }} />

        {/* 标题 + 副标题 + CTA 作为整体居中组 */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-12">
          <div>
            <h1 className="text-[clamp(40px,4.2vw,80px)] font-bold text-white leading-[1.15] tracking-tight" style={{ textShadow: '0 1px 20px rgba(0,0,0,.3)', letterSpacing: '-1px' }}>
              {t('heroLine1')}<br />{t('heroLine2')}
            </h1>
            <p className="mt-5 text-[clamp(15px,1.1vw,20px)] text-white/80 max-w-[680px] mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>
          <div className="flex justify-center gap-4 flex-col sm:flex-row items-center w-full">
            <Link
              href="/solutions"
              className="w-[280px] max-w-[340px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[clamp(14px,0.9vw,16px)] transition-colors duration-200 hover:bg-white"
            >
              {t('viewSolutions')}
            </Link>
            <Link
              href="/contact"
              className="w-[280px] max-w-[340px] py-3.5 text-center rounded border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-colors duration-200 hover:bg-white/20 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,.12)' }}
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 2. STATS ===== */}
      <section className="bg-white py-20 px-[60px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 max-w-[1440px] mx-auto divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          {[
            { num: '80', suffix: '+', label: t('statsBrandsLabel') },
            { num: '30', suffix: '+', label: t('statsCountriesLabel') },
            { num: '500', suffix: '+', label: t('statsProjectsLabel') },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-14 px-8 text-center"
            >
              <div className="text-[clamp(64px,5.5vw,96px)] font-black text-[#0F172A] leading-none tracking-[-3px]">
                {stat.num}<sup className="text-[clamp(28px,2.2vw,40px)] font-black align-super ml-0.5">{stat.suffix}</sup>
              </div>
              <div className="mt-4 text-[13px] font-medium text-[#94A3B8] tracking-[2px] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2.5 接入方式 ===== */}
      <section className="bg-white py-24 px-[60px]">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-4">
              {t("accessTitle")}
            </h2>
            <p className="text-[clamp(15px,1vw,18px)] text-[#64748B] max-w-[600px] mx-auto">{t("accessSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 云端直连 */}
            {([
              { img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80&auto=format&fit=crop", title: t("accessCloudTitle"), points: [t("accessCloudPoint1"), t("accessCloudPoint2"), t("accessCloudPoint3")], iconPath: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" },
              { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop", title: t("accessGatewayTitle"), points: [t("accessGatewayPoint1"), t("accessGatewayPoint2"), t("accessGatewayPoint3")], iconPath: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" },
            ] as { img: string; title: string; points: string[]; iconPath: string }[]).map((card, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl group cursor-pointer" style={{ aspectRatio: '806/520' }}>
                {/* 背景图 — 无蒙版 */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.img}')` }}
                />
                {/* 毛玻璃卡片底部 */}
                <div className="absolute bottom-6 left-6 right-6 rounded-xl p-6 transition-all duration-300 bg-white/20 backdrop-blur-[14px] group-hover:bg-white group-hover:backdrop-blur-none">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white group-hover:text-[#0F172A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} />
                      </svg>
                    </div>
                    <h3 className="text-[17px] font-extrabold text-white group-hover:text-[#0F172A] transition-colors leading-tight">{card.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {card.points.map((p, j) => (
                      <li key={j} className="text-[13px] text-white/85 group-hover:text-[#475569] transition-colors py-0.5">{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/ecosystem" className="inline-flex items-center gap-2 text-[#0F172A] font-semibold hover:text-[#38C4E8] transition-colors text-[15px]">
              {t("accessViewMore")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 3. SOLUTIONS (Accordion) ===== */}
      <section className="bg-white py-24 px-[60px]">
        <div className="max-w-[1652px] mx-auto">
          <h2 className="text-center text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-16">
            {t('solutionsSectionTitle')}
          </h2>
        </div>
        <SolutionsAccordion items={accordionData} />
      </section>

      {/* ===== 4. PRODUCTS ===== */}
      <section className="bg-white pt-24 pb-20 px-[60px]">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-4">
            {t('productsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('productsSubtitle')}</p>
        </div>

        {/* Hardware cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1440px] mx-auto">
          {hwProducts.map((hw) => (
            <div
              key={hw.name}
              className="bg-white rounded-2xl px-8 text-center border border-[#E2E8F0] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)] hover:-translate-y-[5px] hover:border-[rgba(56,196,232,.4)] flex flex-col"
              style={{ height: '565px' }}
            >
              {/* 图片区域 — 固定320px高，object-contain统一视觉尺寸 */}
              <div className="flex items-center justify-center w-full" style={{ height: '360px' }}>
                {hw.img ? (
                  <Image
                    src={hw.img}
                    alt={hw.name}
                    width={340}
                    height={300}
                    className="object-contain"
                    style={{ maxWidth: '75%', maxHeight: '300px', width: 'auto', height: 'auto' }}
                  />
                ) : (
                  <DeviceSVG />
                )}
              </div>
              {/* 文字区域 — 底部对齐 */}
              <div className="pb-10 text-[clamp(18px,1.3vw,24px)] font-medium text-[#0F172A] tracking-[-0.5px]">
                {hw.name}
              </div>
            </div>
          ))}
        </div>

        {/* Software tabs */}
        <div className="mt-[72px] max-w-[1440px] mx-auto">
          <SoftwareTabs tabLabels={{
            HEMS: t("softwareHems"),
            ESS: t("softwareEss"),
            EVCMS: t("softwareEvcms"),
            PQMS: t("softwarePqms"),
            VPP: t("softwareVpp"),
          }} />
        </div>
      </section>

      {/* ===== 5. BRANDS ===== */}
      <section className="bg-white py-24 px-[60px]">
        <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-extrabold text-[#0F172A] tracking-[-1px] mb-4">
            {t('brandsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('brandsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(brands.length > 0 ? brands.slice(0, 12) : fallbackBrands).map((brand, idx) => {
            const name = typeof brand === 'string' ? brand : brand.name;
            const logoUrl = typeof brand !== 'string' && brand.logo?.url
              ? getStrapiMedia(brand.logo.url)
              : null;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center gap-2 bg-white border border-[#E2E8F0] rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-[#38C4E8] hover:shadow-[0_4px_12px_rgba(56,196,232,.15)] hover:-translate-y-0.5"
                style={{ aspectRatio: '2 / 1' }}
              >
                {logoUrl ? (
                  <Image src={logoUrl} alt={name} width={100} height={40}
                    className="object-contain max-h-[36px] w-auto" />
                ) : (
                  <span className="text-[14px] font-semibold text-[#475569] tracking-[0.5px]">{name}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/ecosystem" className="text-sm font-medium text-[#64748B] hover:text-[#38C4E8] transition-colors">
            {t('brandsMissing')} →
          </Link>
        </div>
        </div>{/* /max-w-[1440px] */}
      </section>

      {/* ===== 6. NEWS ===== */}
      <section className="bg-[#F8FAFC] py-24 px-[60px]">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-extrabold text-[#0F172A] tracking-[-1px] mb-4">
            {t('newsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('newsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1440px] mx-auto">
          {articles.slice(0, 3).map((article, idx) => {
            const coverUrl = article.cover?.url ? getStrapiMedia(article.cover.url) : null;
            return (
              <Link
                key={article.documentId}
                href={`/about/news/${article.slug}`}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,.06)] hover:-translate-y-0.5"
              >
                {coverUrl ? (
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <Image src={coverUrl} alt={article.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-[200px]" style={{ background: NEWS_COLORS[idx % 3], opacity: 0.15 }} />
                )}
                <div className="p-6">
                  {article.publishedDate && (
                    <div className="text-xs text-[#64748B] mb-2">{article.publishedDate}</div>
                  )}
                  <h3 className="text-[17px] font-bold text-[#0F172A] leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-[#64748B] leading-relaxed mb-4 line-clamp-2">{article.summary}</p>
                  )}
                  <span className="text-sm font-semibold text-[#38C4E8] group-hover:text-[#2BA8C8] transition-colors">
                    {tc('readMore')} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== 7. BOTTOM CTA ===== */}
      <section className="bg-[#0C1829] py-24 px-[60px]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-lg text-gray-300 mb-8">{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded bg-white/92 px-8 py-3.5 text-base font-semibold text-[#0C1829] transition-colors duration-200 hover:bg-white"
            >
              {t('ctaApplyDemo')}
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center rounded border-[1.5px] border-white/60 px-8 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,.12)' }}
            >
              {t('ctaApiDocs')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded border-[1.5px] border-white/60 px-8 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/20"
              style={{ background: 'rgba(255,255,255,.12)' }}
            >
              {t('ctaContactSales')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
