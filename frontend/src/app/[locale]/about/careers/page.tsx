import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getJobPostings } from '@/lib/api';

export const revalidate = 3600;

const TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-800',
  'part-time': 'bg-blue-100 text-blue-800',
  contract: 'bg-orange-100 text-orange-800',
};

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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {t('careersTitle')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('careersSubtitle')}</p>
        </div>

        {/* Job Listings */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.documentId}
                className="rounded-xl border border-foreground/10 bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {job.type && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.type === 'full-time' ? t('fullTime') : job.type === 'part-time' ? t('partTime') : t('contract')}
                    </span>
                  )}
                </div>
                {job.description && (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-foreground/10 bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">{t('noOpenings')}</p>

          </div>
        )}
      </div>
    </section>
  );
}
