import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getSolutions } from '@/lib/api';
import type { StrapiSolution } from '@/types/strapi';

const MOCK_SOLUTIONS: Pick<StrapiSolution, 'documentId' | 'title' | 'slug' | 'tagline' | 'cover' | 'description'>[] = [
  {
    documentId: '1',
    title: '光伏电站管理',
    slug: 'solar-plant',
    tagline: '智能光伏电站监控与管理系统',
    description: '面向集中式与分布式光伏电站，提供全生命周期的智慧管理解决方案。',
    cover: null,
  },
  {
    documentId: '2',
    title: '储能系统管理',
    slug: 'energy-storage',
    tagline: '高效储能系统监控与调度方案',
    description: '为工商业储能和户用储能提供智能化的监控与调度解决方案。',
    cover: null,
  },
  {
    documentId: '3',
    title: '充电桩管理',
    slug: 'ev-charging',
    tagline: '新能源汽车充电网络管理方案',
    description: '从单站到网络，全面覆盖充电基础设施的运营管理需求。',
    cover: null,
  },
  {
    documentId: '4',
    title: '微电网管理',
    slug: 'microgrid',
    tagline: '分布式微电网智慧管理系统',
    description: '实现源-网-荷-储协调优化，构建高效可靠的微电网系统。',
    cover: null,
  },
  {
    documentId: '5',
    title: '能源数据平台',
    slug: 'data-platform',
    tagline: '企业级能源数据分析与管理平台',
    description: '汇聚多维能源数据，提供深度分析与智能决策支持。',
    cover: null,
  },
];

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
    solutions = MOCK_SOLUTIONS as StrapiSolution[];
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
            {solutions.map((solution) => (
              <Link
                key={solution.documentId}
                href={`/solutions/${solution.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:shadow-[#1A3FAD]/10 hover:-translate-y-1"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={getStrapiMedia(solution.cover?.url)}
                    alt={solution.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1829] via-[#0C1829]/30 to-transparent" />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white group-hover:text-[#38C4E8] transition-colors duration-300">
                    {solution.title}
                  </h2>
                  {solution.tagline && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{solution.tagline}</p>
                  )}
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                    {t('viewDetail')} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
