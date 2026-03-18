import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

// Note values use semantic keys for i18n; mapped to t() at render time
type NoteKey = 'recommended' | 'endingSoon' | 'ended' | 'basic' | 'current' | '';
const COMPATIBILITY_DATA: Record<string, Array<{ firmware: string; cloud: string; tool: string; noteKey: NoteKey }>> = {
  'Neuron II': [
    { firmware: 'v2.1', cloud: 'HEMS v3.0+ / ESS v2.0+ / PQMS v1.5+', tool: 'Config Tool v3.0+', noteKey: 'recommended' },
    { firmware: 'v2.0', cloud: 'HEMS v2.5+ / ESS v1.8+ / PQMS v1.3+', tool: 'Config Tool v2.8+', noteKey: '' },
    { firmware: 'v1.9', cloud: 'HEMS v2.0+ / ESS v1.5+', tool: 'Config Tool v2.5+', noteKey: 'endingSoon' },
    { firmware: 'v1.8', cloud: 'HEMS v1.5+', tool: 'Config Tool v2.0+', noteKey: 'ended' },
  ],
  'Neuron III': [
    { firmware: 'v1.2', cloud: 'EVCMS v1.5+', tool: 'Config Tool v3.0+', noteKey: 'recommended' },
    { firmware: 'v1.1', cloud: 'EVCMS v1.4+', tool: 'Config Tool v2.8+', noteKey: '' },
    { firmware: 'v1.0', cloud: 'EVCMS v1.3+', tool: 'Config Tool v2.5+', noteKey: 'basic' },
  ],
  'Neuron III Lite': [
    { firmware: 'v1.0', cloud: 'EVCMS v1.5+', tool: 'Config Tool v3.0+', noteKey: 'current' },
  ],
};

const NOTE_STYLES: Record<string, string> = {
  recommended: 'bg-green-500/10 text-green-600',
  endingSoon: 'bg-yellow-500/10 text-yellow-600',
  ended: 'bg-red-500/10 text-red-600',
  basic: 'text-[#475569]',
  current: 'text-[#475569]',
};

const NOTE_KEYS: Record<string, string> = {
  recommended: 'currentRecommended',
  endingSoon: 'endingSoonMaintenance',
  ended: 'endedMaintenance',
  basic: 'basicVersion',
  current: 'currentVersion',
};

export default async function CompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'help' });

  return (
    <>
      <section className="bg-[#F8FAFC] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/support" className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#38C4E8] transition-colors">
            &larr; {t('backToHelp')}
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">{t('compatibilityTitle')}</h1>
          <p className="mt-2 text-[#64748B]">{t('compatibilitySubtitle')}</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {Object.entries(COMPATIBILITY_DATA).map(([model, rows]) => (
            <div key={model}>
              <h2 className="mb-4 text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <span className="text-[#38C4E8]">⚡</span> {model}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC]">
                      <th className="px-6 py-3 text-left font-medium text-[#475569]">{t('firmwareVersion')}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">{t('cloudMinVersion')}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">{t('toolMinVersion')}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">{t('remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                        <td className="px-6 py-3 text-[#0F172A] font-mono">{row.firmware}</td>
                        <td className="px-4 py-3 text-[#475569]">{row.cloud}</td>
                        <td className="px-4 py-3 text-[#475569]">{row.tool}</td>
                        <td className="px-4 py-3">
                          {row.noteKey && (
                            <span className={`${['recommended', 'endingSoon', 'ended'].includes(row.noteKey) ? 'rounded-full px-2.5 py-0.5 font-medium' : ''} text-xs ${NOTE_STYLES[row.noteKey] ?? ''}`}>
                              {t(NOTE_KEYS[row.noteKey])}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
