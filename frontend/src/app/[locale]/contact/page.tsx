import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';

import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: `${t('contactPage')} | ${locale === 'zh-CN' || locale === 'zh-TW' ? t('siteName') : t('siteNameEn')}` };
}

const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';

interface ContactPerson {
  name: string;
  title: string;
  email: string;
  phone: string;
}

async function getContactData(): Promise<{ contacts: ContactPerson[] }> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/page-content?filters[pageKey][$eq]=contact-page&populate=*`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { contacts: [] };
    const json = await res.json();
    const entry = json.data?.[0];
    return entry?.content ?? { contacts: [] };
  } catch {
    return { contacts: [] };
  }
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
  const data = await getContactData();

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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">📍</div>
                  <div><p className="text-sm text-[#0F172A]">{t('info.address')}</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">📞</div>
                  <div><p className="text-sm text-[#0F172A]">{t('info.phone')}</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">✉️</div>
                  <div><p className="text-sm text-[#0F172A]">{t('info.email')}</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/10 text-[#1A3FAD]">🕐</div>
                  <div><p className="text-sm text-[#0F172A]">{t('info.hours')}</p></div>
                </div>
              </div>

              {/* Contact Persons from Strapi */}
              {data.contacts.length > 0 && (
                <div className="mt-10">
                  <h3 className="mb-4 text-lg font-bold text-[#0F172A]">{t('teamTitle')}</h3>
                  <div className="space-y-4">
                    {data.contacts.map((person) => (
                      <div key={person.name} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="font-semibold text-[#0F172A]">{person.name}</p>
                        <p className="text-sm text-[#64748B]">{person.title}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#475569]">
                          <a href={`mailto:${person.email}`} className="hover:text-[#1A3FAD]">✉️ {person.email}</a>
                          <a href={`tel:${person.phone}`} className="hover:text-[#1A3FAD]">📞 {person.phone}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
