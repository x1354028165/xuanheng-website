import { getTranslations, setRequestLocale } from 'next-intl/server';

export const revalidate = 3600;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacy' });

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {t('lastUpdated', { date: '2026-03-15' })}
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>{t('content')}</p>
        </div>
      </div>
    </section>
  );
}
