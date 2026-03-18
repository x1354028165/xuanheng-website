import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getJobPostings } from '@/lib/api';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const tAbout = await getTranslations({ locale, namespace: 'about' });
  return { title: `${tAbout('careersTitle')} | ${tMeta('siteName')}` };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const jobs = await getJobPostings(locale);

  return (
    <>
      <section className="bg-[#F8FAFC] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl md:text-5xl">
            {t('careersTitle')}
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">{t('careersSubtitle')}</p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.documentId}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[#0F172A]">{job.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#475569]">
                        {job.department && <span>🏢 {job.department}</span>}
                        {job.location && <span>📍 {job.location}</span>}
                      </div>
                    </div>
                    {job.type && (
                      <span className="rounded-full bg-[#38C4E8]/10 px-3 py-1 text-xs font-medium text-[#38C4E8]">
                        {job.type === 'full-time' ? t('fullTime') : job.type === 'part-time' ? t('partTime') : t('contract')}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="mt-4 text-sm text-[#475569] line-clamp-3">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-12 text-center">
              <p className="text-lg text-[#475569]">{t('noOpenings')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
