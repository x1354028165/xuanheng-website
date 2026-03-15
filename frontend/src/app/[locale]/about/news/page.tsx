import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getArticles } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import type { StrapiArticle } from '@/types/strapi';

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const { data: fetchedArticles } = await getArticles(locale, 1, 12);
  const articles = fetchedArticles.length > 0 ? fetchedArticles : MOCK_ARTICLES as unknown as StrapiArticle[];

  return (
    <>
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t('newsTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-400">{t('newsSubtitle')}</p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.documentId}
                  href={`/about/news/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center">
                    <div className="text-3xl text-gray-600">📰</div>
                  </div>
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-semibold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">
                      {article.title}
                    </h2>
                    {article.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-[#475569]">
                        {article.summary}
                      </p>
                    )}
                    {article.publishedDate && (
                      <time className="mt-3 block text-xs text-[#64748B]">
                        {article.publishedDate}
                      </time>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#475569]">{tc('noResults')}</p>
          )}
        </div>
      </section>
    </>
  );
}
