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

// Map shared mock data to Strapi-compatible shapes
const MOCK_SOLUTIONS = _MS.map(s => ({ documentId: s.documentId, title: s.title, slug: s.slug, tagline: s.tagline, cover: s.cover }));
const MOCK_PRODUCTS_LIST = _MP.map(p => ({ documentId: p.documentId, title: p.title, slug: p.slug, tagline: p.tagline, cover: p.cover }));
const MOCK_ARTICLES_LIST = _MA;
const MOCK_BRANDS_LIST = _MB;

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

  const trustItems = [0, 1, 2].map((i) => ({
    title: t(`trustItems.${i}.title`),
    description: t(`trustItems.${i}.description`),
  }));

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0C1829]">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&auto=format&fit=crop"
          alt="Solar energy background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0C1829]/70" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-gray-200 sm:text-lg md:text-xl">
            {t('heroSubtitle')}
          </p>
          {/* Three-way CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/solutions"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#2BADD0] hover:shadow-xl sm:text-lg"
            >
              {t('viewSolutions')}
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl sm:text-lg"
            >
              {t('developerCenter')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:text-lg"
            >
              {t('contactSales')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ACCESS MODE DIFFERENTIATION SECTION ===== */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#0F172A] sm:text-3xl">
            {t('accessTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Cloud Direct */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#0F172A] mb-4">{t('accessCloudTitle')}</h3>
              <ul className="space-y-3 text-[#475569]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38C4E8]" />
                  {t('accessCloudDesc1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38C4E8]" />
                  {t('accessCloudDesc2')}
                </li>
              </ul>
              <p className="mt-4 text-sm font-medium text-[#1A3FAD]">{t('accessCloudFit')}</p>
            </div>
            {/* Gateway LAN */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#0F172A] mb-4">{t('accessGatewayTitle')}</h3>
              <ul className="space-y-3 text-[#475569]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38C4E8]" />
                  {t('accessGatewayDesc1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#38C4E8]" />
                  {t('accessGatewayDesc2')}
                </li>
              </ul>
              <p className="mt-4 text-sm font-medium text-[#1A3FAD]">{t('accessGatewayFit')}</p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/ecosystem"
              className="inline-flex items-center rounded-lg bg-[#0F172A] px-6 py-3 text-base font-semibold text-white shadow transition-all duration-300 hover:bg-[#1E293B] hover:shadow-lg"
            >
              {t('accessCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#0F172A] sm:text-3xl">
            {t('statsTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { value: t('statsBrands'), label: t('statsBrandsLabel') },
              { value: t('statsCountries'), label: t('statsCountriesLabel') },
              { value: t('statsProjects'), label: t('statsProjectsLabel') },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="text-4xl font-bold text-[#38C4E8] sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-base text-[#0F172A] sm:text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION — 5 scenario cards ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{t('solutionsTitle')}</h2>
            <p className="mt-3 text-[#475569]">{t('solutionsSubtitle')}</p>
          </div>
          {/* Accordion-style horizontal cards for desktop */}
          <div className="hidden lg:flex h-[500px] gap-2">
            {solutions.slice(0, 5).map((solution) => {
              const sTitle = getSolutionMessage(locale, solution.slug, 'title') ?? solution.title;
              const sTagline = getSolutionMessage(locale, solution.slug, 'tagline') ?? solution.tagline;
              return (
                <Link
                  key={solution.documentId}
                  href={`/solutions/${solution.slug}`}
                  className="group relative flex-1 overflow-hidden rounded-2xl transition-all duration-500 hover:flex-[4]"
                >
                  <Image
                    src={getStrapiMedia(solution.cover?.url)}
                    alt={sTitle}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  {/* Vertical label (shown when collapsed) */}
                  <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                    <span className="text-lg font-bold text-white [writing-mode:vertical-lr]">{sTitle}</span>
                  </div>
                  {/* Expanded content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <h3 className="text-xl font-bold text-white">{sTitle}</h3>
                    {sTagline && <p className="mt-2 text-sm text-gray-200 line-clamp-2">{sTagline}</p>}
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                      {tc('learnMore')} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Grid fallback for mobile/tablet */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
            {solutions.slice(0, 5).map((solution) => {
              const sTitle = getSolutionMessage(locale, solution.slug, 'title') ?? solution.title;
              const sTagline = getSolutionMessage(locale, solution.slug, 'tagline') ?? solution.tagline;
              return (
                <Link
                  key={solution.documentId}
                  href={`/solutions/${solution.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={getStrapiMedia(solution.cover?.url)}
                      alt={sTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors duration-300">
                      {sTitle}
                    </h3>
                    {sTagline && (
                      <p className="mt-2 text-sm text-[#475569] line-clamp-2">{sTagline}</p>
                    )}
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                      {tc('learnMore')} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/solutions"
              className="inline-flex items-center text-[#38C4E8] font-medium hover:underline"
            >
              {tc('viewAll')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== COMPATIBLE BRANDS LOGO WALL ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{t('brandsTitle')}</h2>
            <p className="mt-3 text-[#475569]">{t('brandsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.slice(0, 12).map((brand) => (
              <div
                key={brand.documentId}
                className="flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 py-6 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <span className="text-sm font-medium text-[#0F172A]">{brand.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/ecosystem"
              className="inline-flex items-center text-[#38C4E8] font-medium hover:underline"
            >
              {tc('viewAll')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#0F172A] sm:text-3xl">
            {t('trustTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {trustItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  {idx === 0 && (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#475569]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST NEWS ===== */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{t('newsTitle')}</h2>
            <p className="mt-3 text-[#475569]">{t('newsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.documentId}
                href={`/about/news/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={getStrapiMedia(article.cover?.url)}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  {article.publishedDate && (
                    <time className="text-xs text-[#64748B]">{article.publishedDate}</time>
                  )}
                  <h3 className="mt-2 text-base font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2">{article.summary}</p>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                    {tc('readMore')} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA — Three entries ===== */}
      <section className="relative overflow-hidden bg-[#0C1829] py-24">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('ctaTitle')}</h2>
          <p className="mt-4 text-lg text-gray-300">{t('ctaSubtitle')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#2BADD0] hover:shadow-xl sm:text-lg"
            >
              {t('ctaApplyDemo')}
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl sm:text-lg"
            >
              {t('ctaApiDocs')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:text-lg"
            >
              {t('ctaContactSales')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
