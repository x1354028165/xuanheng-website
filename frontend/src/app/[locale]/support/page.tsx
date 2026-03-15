import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

const helpSections = [
  {
    icon: '📄',
    titleKey: 'docsTitle',
    descKey: 'docsSubtitle',
    href: '/support/docs',
  },
  {
    icon: '🔄',
    titleKey: 'compatibilityTitle',
    descKey: 'compatibilitySubtitle',
    href: '/support/compatibility',
  },
  {
    icon: '❓',
    titleKey: 'faqTitle',
    descKey: 'faqSubtitle',
    href: '/support/faq',
  },
  {
    icon: '🔧',
    titleKey: 'repairTitle',
    descKey: 'repairSubtitle',
    href: '/support/repair',
  },
];

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'help' });

  return (
    <>
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {helpSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{section.icon}</div>
                <h2 className="text-xl font-bold text-[#0F172A] group-hover:text-[#1A3FAD] transition-colors">
                  {t(section.titleKey)}
                </h2>
                <p className="mt-2 text-[#475569]">{t(section.descKey)}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                  查看详情 →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
