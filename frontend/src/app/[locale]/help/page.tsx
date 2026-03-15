import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getFAQs } from '@/lib/api';
import { FAQAccordion } from '@/components/help/FAQAccordion';
import { RepairForm } from '@/components/help/RepairForm';

export const revalidate = 3600;

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'help' });
  const faqs = await getFAQs(locale);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="mb-8 text-2xl font-bold text-foreground">{t('faqTitle')}</h2>
          {faqs.length > 0 ? (
            <FAQAccordion faqs={faqs} />
          ) : (
            <p className="text-muted-foreground">{t('faqSubtitle')}</p>
          )}
        </div>

        {/* Documentation Downloads Section */}
        <div className="mb-20">
          <h2 className="mb-2 text-2xl font-bold text-foreground">{t('docsTitle')}</h2>
          <p className="mb-8 text-muted-foreground">{t('docsSubtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'AC-GW1000 User Manual', desc: 'PDF · 3.2MB' },
              { name: 'API Integration Guide', desc: 'PDF · 1.8MB' },
              { name: 'Quick Start Guide', desc: 'PDF · 0.9MB' },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-4 rounded-xl border border-foreground/10 bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Repair Section */}
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">{t('repairTitle')}</h2>
          <p className="mb-6 text-muted-foreground">{t('repairSubtitle')}</p>
          <div className="mx-auto max-w-2xl rounded-xl border border-foreground/10 bg-card p-6">
            <RepairForm
              labels={{
                name: t('repairForm.name'),
                phone: t('repairForm.phone'),
                email: t('repairForm.email'),
                product: t('repairForm.product'),
                description: t('repairForm.description'),
                submit: t('repairForm.submit'),
                success: t('repairSuccess'),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
