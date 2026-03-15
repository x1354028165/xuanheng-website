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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Company Introduction */}
        <div className="mb-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <h2 className="mb-4 text-xl font-bold text-foreground">{t('companyIntro')}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t('companyIntroText')}
            </p>
          </div>
        </div>

        {/* Development Milestones Timeline */}
        <div className="mb-20">
          <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
            {t('historyTitle')}
          </h2>
          <p className="mb-12 text-center text-muted-foreground">{t('historySubtitle')}</p>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-[#1A3FAD]/20 md:left-1/2 md:-translate-x-px" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="absolute left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#1A3FAD] bg-white md:left-1/2" />
                  <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <span className="inline-block rounded-full bg-[#1A3FAD] px-3 py-1 text-sm font-bold text-white">
                      {milestone.year}
                    </span>
                    <p className="mt-2 text-muted-foreground">{milestone.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links to News and Careers */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/about/news"
            className="group rounded-xl border border-foreground/10 bg-card p-8 text-center transition-shadow hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-foreground group-hover:text-[#1A3FAD]">
              {t('newsTitle')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('newsSubtitle')}</p>
          </Link>
          <Link
            href="/about/careers"
            className="group rounded-xl border border-foreground/10 bg-card p-8 text-center transition-shadow hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-foreground group-hover:text-[#1A3FAD]">
              {t('careersTitle')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('careersSubtitle')}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
