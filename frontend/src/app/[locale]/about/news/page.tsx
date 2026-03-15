import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getArticles } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const { data: articles } = await getArticles(locale, 1, 12);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('newsTitle')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('newsSubtitle')}</p>
        </div>

        {/* Article Grid */}
        {articles.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.documentId}
                href={`/about/news/${article.slug}`}
                className="group overflow-hidden rounded-xl border border-foreground/10 bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={getStrapiMedia(article.cover?.url)}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-[#1A3FAD]">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {article.summary}
                    </p>
                  )}
                  {article.publishedDate && (
                    <time
                      dateTime={article.publishedDate}
                      className="mt-3 block text-xs text-muted-foreground"
                    >
                      {new Date(article.publishedDate).toLocaleDateString(locale)}
                    </time>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{tc('noResults')}</p>
        )}
      </div>
    </section>
  );
}
