import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

const helpSections = [
  {
    icon: '📄',
    titleKey: 'docsTitle',
    descKey: 'docsSubtitle',
    href: '/help/docs',
  },
  {
    icon: '🔄',
    titleKey: 'compatibilityTitle',
    descKey: 'compatibilitySubtitle',
    href: '/help/compatibility',
  },
  {
    icon: '❓',
    titleKey: 'faqTitle',
    descKey: 'faqSubtitle',
    href: '/help/faq',
  },
  {
    icon: '🔧',
    titleKey: 'repairTitle',
    descKey: 'repairSubtitle',
    href: '/help/repair',
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

      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {helpSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{section.icon}</div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#38C4E8] transition-colors">
                  {t(section.titleKey)}
                </h2>
                <p className="mt-2 text-gray-400">{t(section.descKey)}</p>
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
