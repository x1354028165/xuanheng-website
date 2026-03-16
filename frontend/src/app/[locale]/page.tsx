import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export const revalidate = 3600;
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

  // Accordion data
  const accordionItems = [
    {
      tag: '户用储能',
      titleKey: 'accordionHems',
      descKey: 'accordionHemsDesc',
      href: '/solutions/hems',
      bgImage: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&q=70',
    },
    {
      tag: '工商业储能',
      titleKey: 'accordionEss',
      descKey: 'accordionEssDesc',
      href: '/solutions/ess',
      bgImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=70',
    },
    {
      tag: '充电站管理',
      titleKey: 'accordionEvcms',
      descKey: 'accordionEvcmsDesc',
      href: '/solutions/evcms',
      bgImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=70',
    },
    {
      tag: '虚拟电厂',
      titleKey: 'accordionVpp',
      descKey: 'accordionVppDesc',
      href: '/solutions/vpp',
      bgImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=70',
    },
    {
      tag: '电能质量',
      titleKey: 'accordionPqms',
      descKey: 'accordionPqmsDesc',
      href: '/solutions/pqms',
      bgImage: 'https://images.unsplash.com/photo-1545259742-a0f2c1a2d2b5?w=800&q=70',
    },
  ];

  const accordionData = accordionItems.map((item) => ({
    tag: item.tag,
    title: t(item.titleKey),
    description: t(item.descKey),
    href: item.href,
    bgImage: item.bgImage,
    linkText: t('viewDetail'),
  }));

  // Hardware products
  const hwProducts = ['Neuron II', 'Neuron III', 'Neuron III Lite'];

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
              href="/support/docs"
              className="w-[280px] max-w-[340px] py-3.5 text-center rounded bg-white/92 text-[#0f172a] font-semibold text-[clamp(14px,0.9vw,16px)] transition-colors duration-200 hover:bg-white"
            >
              {t('viewDocs')}
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
      <section className="bg-white py-24 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {[
            { num: '80', suffix: '+', label: t('statsBrandsLabel') },
            { num: '30', suffix: '+', label: t('statsCountriesLabel') },
            { num: '500', suffix: '+', label: t('statsProjectsLabel') },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#E2E8F0] rounded-2xl py-10 px-6 text-center"
            >
              <div className="text-[clamp(44px,3.5vw,64px)] font-extrabold text-[#38C4E8] leading-none tracking-[-2px]">
                {stat.num}<span className="text-[clamp(22px,2vw,32px)]">{stat.suffix}</span>
              </div>
              <div className="mt-3 text-[clamp(14px,0.9vw,17px)] font-semibold text-[#0F172A]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2.5 接入方式 ===== */}
      <section className="bg-[#F8FAFC] py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-4">
              {t("accessTitle")}
            </h2>
            <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t("accessSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-10 border border-[#E2E8F0] hover:border-[#38C4E8] hover:shadow-[0_12px_40px_rgba(56,196,232,.12)] transition-all duration-300">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{t("accessCloudTitle")}</h3>
              <ul className="space-y-2 text-[#64748B] text-[15px] mb-6">
                <li>✓ {t("accessCloudPoint1")}</li>
                <li>✓ {t("accessCloudPoint2")}</li>
                <li>✓ {t("accessCloudPoint3")}</li>
              </ul>
              <div className="text-sm font-medium text-[#38C4E8]">{t("accessCloudUseCase")}</div>
            </div>
            <div className="bg-white rounded-2xl p-10 border border-[#E2E8F0] hover:border-[#1A3FAD] hover:shadow-[0_12px_40px_rgba(26,63,173,.12)] transition-all duration-300">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{t("accessGatewayTitle")}</h3>
              <ul className="space-y-2 text-[#64748B] text-[15px] mb-6">
                <li>✓ {t("accessGatewayPoint1")}</li>
                <li>✓ {t("accessGatewayPoint2")}</li>
                <li>✓ {t("accessGatewayPoint3")}</li>
              </ul>
              <div className="text-sm font-medium text-[#1A3FAD]">{t("accessGatewayUseCase")}</div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/ecosystem" className="inline-flex items-center gap-2 text-[#0F172A] font-semibold hover:text-[#38C4E8] transition-colors">
              {t("accessViewMore")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 3. SOLUTIONS (Accordion) ===== */}
      <section className="bg-white py-24 px-6">
        <h2 className="text-center text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-16">
          {t('solutionsSectionTitle')}
        </h2>
        <SolutionsAccordion items={accordionData} />
      </section>

      {/* ===== 4. PRODUCTS ===== */}
      <section className="bg-white pt-24 pb-20">
        {/* Section header */}
        <div className="text-center mb-14 px-6">
          <h2 className="text-[clamp(32px,2.5vw,48px)] font-extrabold text-[#0F172A] tracking-[-1.5px] mb-4">
            {t('productsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('productsSubtitle')}</p>
        </div>

        {/* HARDWARE label */}
        <div className="max-w-[1200px] mx-auto px-6 mb-8">
          <span className="text-[clamp(12px,0.75vw,14px)] font-bold tracking-[2px] uppercase text-[#38C4E8]">
            {t('hardwareLabel')}
          </span>
        </div>

        {/* Hardware cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[1200px] mx-auto px-6">
          {hwProducts.map((name) => (
            <div
              key={name}
              className="bg-[#F8FAFC] rounded-2xl pt-10 pb-7 px-6 text-center border-[1.5px] border-transparent cursor-pointer transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)] hover:-translate-y-[5px] hover:border-[rgba(56,196,232,.25)]"
            >
              <div className="flex items-center justify-center mb-6">
                <DeviceSVG />
              </div>
              <div className="text-[clamp(20px,1.5vw,28px)] font-extrabold text-[#0F172A] tracking-[-0.5px]">
                {name}
              </div>
            </div>
          ))}
        </div>

        {/* SOFTWARE label */}
        <div className="max-w-[1200px] mx-auto px-6 mt-[72px] pt-12 border-t border-[#E2E8F0]">
          <span className="text-[clamp(12px,0.75vw,14px)] font-bold tracking-[2px] uppercase text-[#38C4E8]">
            {t('softwareLabel')}
          </span>
        </div>

        {/* Software tabs */}
        <div className="mt-8">
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
      <section className="bg-white py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-extrabold text-[#0F172A] tracking-[-1px] mb-4">
            {t('brandsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('brandsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-[800px] mx-auto">
          {(brands.length > 0 ? brands.slice(0, 12) : fallbackBrands).map((brand, idx) => {
            const name = typeof brand === 'string' ? brand : brand.name;
            return (
              <div
                key={idx}
                className="flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[15px] font-bold tracking-[0.5px] cursor-pointer transition-all duration-200 hover:border-[#38C4E8] hover:shadow-[0_4px_12px_rgba(56,196,232,.15)] hover:-translate-y-0.5"
                style={{ aspectRatio: '2.2 / 1' }}
              >
                {name}
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/ecosystem" className="text-sm font-medium text-[#64748B] hover:text-[#38C4E8] transition-colors">
            {t('brandsMissing')} →
          </Link>
        </div>
      </section>

      {/* ===== 6. NEWS ===== */}
      <section className="bg-[#F8FAFC] py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-extrabold text-[#0F172A] tracking-[-1px] mb-4">
            {t('newsTitle')}
          </h2>
          <p className="text-[clamp(15px,1vw,18px)] text-[#64748B]">{t('newsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
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
      <section className="bg-[#0C1829] py-24 px-6">
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
