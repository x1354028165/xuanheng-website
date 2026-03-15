import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

const MOCK_DOCS = [
  { name: 'Neuron II 用户手册', version: 'v2.1', date: '2026-02-10', size: '3.2MB', format: 'PDF', product: 'Neuron II' },
  { name: 'Neuron II 安装指南', version: 'v2.0', date: '2026-01-15', size: '1.5MB', format: 'PDF', product: 'Neuron II' },
  { name: 'Neuron III 用户手册', version: 'v1.2', date: '2026-03-01', size: '4.1MB', format: 'PDF', product: 'Neuron III' },
  { name: 'Neuron III 快速安装指南', version: 'v1.0', date: '2026-02-20', size: '0.9MB', format: 'PDF', product: 'Neuron III' },
  { name: 'Neuron III Lite 用户手册', version: 'v1.0', date: '2026-02-28', size: '2.8MB', format: 'PDF', product: 'Neuron III Lite' },
  { name: 'HEMS 云平台使用指南', version: 'v3.0', date: '2026-03-05', size: '5.2MB', format: 'PDF', product: '云平台' },
  { name: 'EVCMS API 接口文档', version: 'v2.1', date: '2026-02-15', size: '2.1MB', format: 'PDF', product: '云平台' },
  { name: 'ESS 运维手册', version: 'v1.5', date: '2026-01-20', size: '3.8MB', format: 'PDF', product: '云平台' },
];

const MOCK_SOFTWARE = [
  {
    name: 'Neuron 配置工具',
    version: 'v3.0.2',
    downloads: [
      { label: 'Windows x64', ext: '.exe', size: '45MB' },
      { label: 'macOS Intel', ext: '.dmg', size: '52MB' },
      { label: 'macOS ARM', ext: '.dmg', size: '48MB' },
    ],
  },
  {
    name: 'Neuron HEMS App',
    version: 'v2.5.0',
    downloads: [
      { label: 'Google Play', ext: '', size: '' },
      { label: 'App Store', ext: '', size: '' },
    ],
  },
];

const MOCK_FIRMWARE = [
  { model: 'Neuron II', version: 'v2.1.3', date: '2026-03-10', changelog: '修复 Modbus TCP 连接稳定性问题', size: '12MB' },
  { model: 'Neuron II', version: 'v2.0.8', date: '2026-01-15', changelog: '新增 MQTT 5.0 支持', size: '11MB' },
  { model: 'Neuron III', version: 'v1.2.0', date: '2026-03-01', changelog: 'DLB 响应速度优化至 80ms', size: '15MB' },
  { model: 'Neuron III', version: 'v1.1.5', date: '2026-02-01', changelog: '修复 OCPP 2.0.1 兼容性问题', size: '14MB' },
  { model: 'Neuron III Lite', version: 'v1.0.2', date: '2026-02-28', changelog: '首个稳定版本', size: '8MB' },
];

export default async function DocsPage({
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
          <h1 className="text-3xl font-bold text-white">{t('docsTitle')}</h1>
          <p className="mt-2 text-gray-400">{t('docsSubtitle')}</p>
        </div>
      </section>

      {/* Documents Tab */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-[#0F172A]">📄 文档资料</h2>
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-3 text-left font-medium text-[#475569]">文件名</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">版本</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">更新日期</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">大小</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">格式</th>
                  <th className="px-4 py-3 text-right font-medium text-[#475569]">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DOCS.map((doc, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                    <td className="px-6 py-3 text-[#0F172A]">{doc.name}</td>
                    <td className="px-4 py-3 text-[#475569]">{doc.version}</td>
                    <td className="px-4 py-3 text-[#475569]">{doc.date}</td>
                    <td className="px-4 py-3 text-[#475569]">{doc.size}</td>
                    <td className="px-4 py-3 text-[#475569]">{doc.format}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[#38C4E8] hover:underline text-xs">下载</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Software */}
      <section className="bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-[#0F172A]">💾 软件下载</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {MOCK_SOFTWARE.map((sw, idx) => (
              <div key={idx} className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">{sw.name}</h3>
                <p className="text-sm text-[#475569] mb-4">{sw.version}</p>
                <div className="space-y-2">
                  {sw.downloads.map((dl, i) => (
                    <button
                      key={i}
                      className="flex w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] hover:border-[#38C4E8]/30 transition-colors"
                    >
                      <span>{dl.label} {dl.ext}</span>
                      {dl.size && <span className="text-xs text-[#475569]">{dl.size}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Firmware */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-[#0F172A]">🔧 固件下载</h2>
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-3 text-left font-medium text-[#475569]">型号</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">固件版本</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">发布日期</th>
                  <th className="px-4 py-3 text-left font-medium text-[#475569]">更新日志</th>
                  <th className="px-4 py-3 text-right font-medium text-[#475569]">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FIRMWARE.map((fw, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                    <td className="px-6 py-3 text-[#0F172A]">{fw.model}</td>
                    <td className="px-4 py-3 text-[#475569]">{fw.version}</td>
                    <td className="px-4 py-3 text-[#475569]">{fw.date}</td>
                    <td className="px-4 py-3 text-[#475569] max-w-xs truncate">{fw.changelog}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[#38C4E8] hover:underline text-xs">下载</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
