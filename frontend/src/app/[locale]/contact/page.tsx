import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';

export const revalidate = 3600;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{t('info.address')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    📞
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{t('info.phone')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    ✉️
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{t('info.email')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    🕐
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{t('info.hours')}</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <p className="text-sm text-gray-500">地图加载中...</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <ContactForm
                labels={{
                  name: t('form.name'),
                  company: t('form.company'),
                  phone: t('form.phone'),
                  email: t('form.email'),
                  intent: t('form.intent'),
                  intentOptions: {
                    solutions: t('form.intentOptions.solutions'),
                    api: t('form.intentOptions.api'),
                    hardware: t('form.intentOptions.hardware'),
                    custom: t('form.intentOptions.custom'),
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
