import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

const COMPATIBILITY_DATA = {
  'Neuron II': [
    { firmware: 'v2.1', cloud: 'HEMS v3.0+ / ESS v2.0+ / PQMS v1.5+', tool: '配置工具 v3.0+', note: '当前推荐' },
    { firmware: 'v2.0', cloud: 'HEMS v2.5+ / ESS v1.8+ / PQMS v1.3+', tool: '配置工具 v2.8+', note: '' },
    { firmware: 'v1.9', cloud: 'HEMS v2.0+ / ESS v1.5+', tool: '配置工具 v2.5+', note: '即将停止维护' },
    { firmware: 'v1.8', cloud: 'HEMS v1.5+', tool: '配置工具 v2.0+', note: '已停止维护' },
  ],
  'Neuron III': [
    { firmware: 'v1.2', cloud: 'EVCMS v1.5+', tool: '配置工具 v3.0+', note: '当前推荐' },
    { firmware: 'v1.1', cloud: 'EVCMS v1.4+', tool: '配置工具 v2.8+', note: '' },
    { firmware: 'v1.0', cloud: 'EVCMS v1.3+', tool: '配置工具 v2.5+', note: '基础版本' },
  ],
  'Neuron III Lite': [
    { firmware: 'v1.0', cloud: 'EVCMS v1.5+', tool: '配置工具 v3.0+', note: '当前版本' },
  ],
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
      <section className="bg-[#0C1829] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/help" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors">
            &larr; 返回帮助中心
          </Link>
          <h1 className="text-3xl font-bold text-white">版本兼容矩阵</h1>
          <p className="mt-2 text-gray-400">查询固件版本与云平台、配置工具的兼容关系</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {Object.entries(COMPATIBILITY_DATA).map(([model, rows]) => (
            <div key={model}>
              <h2 className="mb-4 text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <span className="text-[#38C4E8]">⚡</span> {model}
              </h2>
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC]">
                      <th className="px-6 py-3 text-left font-medium text-[#475569]">固件版本</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">云平台最低版本</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">配置工具最低版本</th>
                      <th className="px-4 py-3 text-left font-medium text-[#475569]">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                        <td className="px-6 py-3 text-[#0F172A] font-mono">{row.firmware}</td>
                        <td className="px-4 py-3 text-[#475569]">{row.cloud}</td>
                        <td className="px-4 py-3 text-[#475569]">{row.tool}</td>
                        <td className="px-4 py-3">
                          {row.note === '当前推荐' && (
                            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                              {row.note}
                            </span>
                          )}
                          {row.note === '即将停止维护' && (
                            <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                              {row.note}
                            </span>
                          )}
                          {row.note === '已停止维护' && (
                            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600">
                              {row.note}
                            </span>
                          )}
                          {row.note && !['当前推荐', '即将停止维护', '已停止维护'].includes(row.note) && (
                            <span className="text-[#475569] text-xs">{row.note}</span>
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
