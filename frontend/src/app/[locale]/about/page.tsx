import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });

  const milestones = Array.from({ length: 8 }, (_, i) => ({
    year: t(`milestones.${i}.year`),
    text: t(`milestones.${i}.text`),
  }));

  return (
    <>
      {/* Header */}
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-white">{t('companyIntro')}</h2>
          <p className="text-lg leading-relaxed text-gray-300">
            {t('companyIntroText')}
          </p>
        </div>
      </section>

      {/* Development Milestones Timeline */}
      <section className="bg-[#0C1829] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-white">
            {t('historyTitle')}
          </h2>
          <p className="mb-12 text-center text-gray-400">{t('historySubtitle')}</p>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-[#1A3FAD]/30 md:left-1/2 md:-translate-x-px" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="absolute left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#38C4E8] bg-[#0C1829] md:left-1/2" />
                  <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <span className="inline-block rounded-full bg-[#1A3FAD] px-3 py-1 text-sm font-bold text-white">
                      {milestone.year}
                    </span>
                    <p className="mt-2 text-gray-400">{milestone.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Links to News and Careers */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/about/news"
              className="group rounded-xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-white group-hover:text-[#38C4E8] transition-colors">
                {t('newsTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{t('newsSubtitle')}</p>
            </Link>
            <Link
              href="/about/careers"
              className="group rounded-xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-white group-hover:text-[#38C4E8] transition-colors">
                {t('careersTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{t('careersSubtitle')}</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
