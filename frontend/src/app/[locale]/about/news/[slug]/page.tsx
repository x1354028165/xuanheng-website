import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getArticleBySlug } from '@/lib/api';
import { getStrapiMedia } from '@/lib/strapi';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  let title = slug;
  const article = await getArticleBySlug(slug, locale);
  if (article?.title) {
    title = article.title;
  } else {
    const mock = MOCK_ARTICLES.find((a) => a.slug === slug);
    if (mock?.title) title = mock.title;
  }
  return { title: `${title} | ${t('siteName')}` };
}

export function generateStaticParams() {
  return MOCK_ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  let article = await getArticleBySlug(slug, locale);

  // Fallback to mock data
  if (!article) {
    const mock = MOCK_ARTICLES.find((a) => a.slug === slug);
    if (mock) {
      article = {
        documentId: mock.documentId,
        title: mock.title,
        slug: mock.slug,
        summary: mock.summary,
        content: mock.summary,
        cover: null,
        publishedDate: mock.publishedDate,
      } as Awaited<ReturnType<typeof getArticleBySlug>>;
    }
  }

  if (!article) {
    notFound();
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/about/news"
          className="mb-8 inline-flex items-center gap-1 text-sm text-[#475569] transition-colors hover:text-[#0F172A]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('newsTitle')}
        </Link>

        {/* Article Header */}
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
          {article.title}
        </h1>

        {article.publishedDate && (
          <time
            dateTime={article.publishedDate}
            className="mt-4 block text-sm text-[#475569]"
          >
            {new Date(article.publishedDate).toLocaleDateString(locale)}
          </time>
        )}

        {/* Cover Image */}
        {article.cover && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={getStrapiMedia(article.cover.url)}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        {/* Content */}
        {article.content && (
          <div className="mt-10">
            <MarkdownRenderer
              content={article.content}
              className="prose prose-lg max-w-none text-[#475569]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
