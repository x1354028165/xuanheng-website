'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const DEVICE_MODELS = [
  'Neuron II',
  'Neuron III',
  'Neuron III Lite',
  'HEMS',
  'ESS',
  'EVCMS',
  'PQMS',
  'VPP',
];

export default function RepairPage() {
  const t = useTranslations('help');
  const tc = useTranslations('common');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    model: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <section className="bg-[#F8FAFC] pb-8 pt-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link href="/support" className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#38C4E8] transition-colors">
              &larr; {t('backToHelp')}
            </Link>
            <h1 className="text-3xl font-bold text-[#0F172A]">{t('repairTitle')}</h1>
          </div>
        </section>
        <section className="bg-white py-24">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">{t('repairSuccess')}</h2>
              <Link
                href="/support"
                className="mt-6 inline-flex items-center rounded-lg bg-[#38C4E8] px-6 py-2.5 text-sm font-semibold text-[#0C1829] transition-colors hover:bg-[#38C4E8]/90"
              >
                {t('backToHelp')}
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-[#F8FAFC] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/support" className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#38C4E8] transition-colors">
            &larr; {t('backToHelp')}
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">{t('repairTitle')}</h1>
          <p className="mt-2 text-[#64748B]">{t('repairSubtitle')}</p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-8 space-y-6 shadow-sm">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                {t('repairForm.name')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#38C4E8] focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                {t('repairForm.phone')} <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#38C4E8] focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/20"
              />
            </div>

            {/* Device Model */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                {t('repairForm.product')} <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] focus:border-[#38C4E8] focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/20"
              >
                <option value="">—</option>
                {DEVICE_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                {t('repairForm.description')} <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#38C4E8] focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/20 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#38C4E8] py-3 text-base font-semibold text-[#0C1829] transition-all hover:bg-[#2BA8C8] hover:shadow-lg"
            >
              {t('repairForm.submit')}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
