import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';

import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  return { title: '联系我们 | 旭衡电子' };
}


export const revalidate = 3600;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <>
      <section className="bg-[#F8FAFC] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]">{t('info.address')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                    📞
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]">{t('info.phone')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                    ✉️
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]">{t('info.email')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">
                    🕐
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]">{t('info.hours')}</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 flex h-64 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <p className="text-sm text-[#64748B]">{tc('loading')}</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <ContactForm
                labels={{
                  name: t('form.name'),
                  company: t('form.company'),
                  phone: t('form.phone'),
                  email: t('form.email'),
                  intent: t('form.intent'),
                  intentOptions: {
                    integrator: t('form.intentOptions.integrator'),
                    api: t('form.intentOptions.api'),
                    hardware: t('form.intentOptions.hardware'),
                    custom: t('form.intentOptions.custom'),
                    other: t('form.intentOptions.other'),
                  },
                  message: t('form.message'),
                  submit: t('form.submit'),
                  success: t('success'),
                  error: t('error'),
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
