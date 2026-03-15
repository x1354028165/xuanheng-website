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
    <>
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {t('lastUpdated', { date: '2026-03-15' })}
          </p>
        </div>
      </section>

      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>{t('content')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
