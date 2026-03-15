import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSolutions } from '@/lib/api';
import type { StrapiSolution } from '@/types/strapi';
import { MOCK_SOLUTIONS } from '@/lib/mock-data';

export const revalidate = 3600;

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  let solutions = await getSolutions(locale);
  if (!solutions || solutions.length === 0) {
    solutions = MOCK_SOLUTIONS as unknown as StrapiSolution[];
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => {
              const mockMatch = MOCK_SOLUTIONS.find(s => s.slug === solution.slug);
              return (
                <Link
                  key={solution.documentId}
                  href={`/solutions/${solution.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:shadow-[#1A3FAD]/10 hover:-translate-y-1"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-[#0C1829] flex items-center justify-center">
                    <div className="text-5xl text-[#38C4E8]/20">🔋</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C1829] via-[#0C1829]/30 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white group-hover:text-[#38C4E8] transition-colors duration-300">
                      {solution.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {solution.tagline || mockMatch?.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                      {t('viewDetail')} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
