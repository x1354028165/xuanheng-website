import Link from 'next/link';
import { getFAQs } from '@/lib/api';
import { MOCK_FAQS } from '@/lib/mock-data';
import FAQClientFilter from './FAQClientFilter';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

const SITE_NAME: Record<string, string> = {
  'zh-CN': '旭衡电子', 'zh-TW': '旭衡電子',
  'en-US': 'AlwaysControl', 'de': 'AlwaysControl', 'fr': 'AlwaysControl',
  'es': 'AlwaysControl', 'pt': 'AlwaysControl', 'ru': 'AlwaysControl',
};
const FAQ_TITLES: Record<string, string> = {
  'zh-CN': '常见问题', 'zh-TW': '常見問題',
  'en-US': 'FAQ', 'de': 'FAQ', 'fr': 'FAQ',
  'es': 'Preguntas Frecuentes', 'pt': 'Perguntas Frequentes', 'ru': 'Часто задаваемые вопросы',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${FAQ_TITLES[locale] ?? 'FAQ'} | ${SITE_NAME[locale] ?? 'AlwaysControl'}` };
}

export const revalidate = 60;

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'help' });

  // Fetch from Strapi, fall back to mock data
  const strapiFaqs = await getFAQs(locale);
  const faqs = strapiFaqs.length > 0
    ? strapiFaqs.map((f) => ({
        documentId: f.documentId,
        question: f.question,
        answer: f.answer,
        category: f.category,
        sortOrder: f.sortOrder,
      }))
    : MOCK_FAQS.map((f) => ({
        documentId: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        sortOrder: 0,
      }));

  return (
    <>
      <section className="bg-[#F8FAFC] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/support" className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#38C4E8] transition-colors">
            &larr; {t('backToHelpCenter')}
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">{t('faqPageTitle')}</h1>
          <p className="mt-2 text-[#64748B]">{t('faqPageSubtitle')}</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FAQClientFilter faqs={faqs} />
        </div>
      </section>
    </>
  );
}
