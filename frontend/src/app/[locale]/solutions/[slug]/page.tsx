import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getSolutionBySlug } from '@/lib/api';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const solution = await getSolutionBySlug(slug, locale);

  if (!solution) {
    notFound();
  }

  return (
    <>
      {/* Hero with cover image */}
      <section className="relative bg-[#0C1829] pb-16 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/solutions"
            className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors"
          >
            &larr; {t('backToList')}
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                {solution.title}
              </h1>
              {solution.tagline && (
                <p className="mt-4 text-lg text-[#38C4E8]">{solution.tagline}</p>
              )}
            </div>
            <div className="relative h-64 overflow-hidden rounded-xl sm:h-80 lg:h-96">
              <Image
                src={getStrapiMedia(solution.cover?.url)}
                alt={solution.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {solution.description && (
        <section className="bg-[#0f1b2e] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-invert prose-lg max-w-none text-gray-300">
              {solution.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {tc('contactUs')}
          </h2>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl"
          >
            {tc('getStarted')}
          </Link>
        </div>
      </section>
    </>
  );
}
