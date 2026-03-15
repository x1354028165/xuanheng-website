"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const MOCK_DOCS = [
  { name: 'Neuron II 用户手册', version: 'v2.1', date: '2026-02-10', size: '3.2MB', format: 'PDF', product: 'Neuron II' },
  { name: 'Neuron II 安装指南', version: 'v2.0', date: '2026-01-15', size: '1.5MB', format: 'PDF', product: 'Neuron II' },
  { name: 'Neuron III 用户手册', version: 'v1.2', date: '2026-03-01', size: '4.1MB', format: 'PDF', product: 'Neuron III' },
  { name: 'Neuron III 快速安装指南', version: 'v1.0', date: '2026-02-20', size: '0.9MB', format: 'PDF', product: 'Neuron III' },
  { name: 'Neuron III Lite 用户手册', version: 'v1.0', date: '2026-02-28', size: '2.8MB', format: 'PDF', product: 'Neuron III Lite' },
  { name: 'HEMS 云平台使用指南', version: 'v3.0', date: '2026-03-05', size: '5.2MB', format: 'PDF', product: 'HEMS' },
  { name: 'ESS 运维手册', version: 'v1.5', date: '2026-01-20', size: '3.8MB', format: 'PDF', product: 'ESS' },
  { name: 'EVCMS API 接口文档', version: 'v2.1', date: '2026-02-15', size: '2.1MB', format: 'PDF', product: 'EVCMS' },
  { name: 'PQMS 电能质量监测手册', version: 'v1.0', date: '2026-02-01', size: '1.8MB', format: 'PDF', product: 'PQMS' },
  { name: 'VPP 虚拟电厂接入指南', version: 'v1.0', date: '2026-03-10', size: '2.5MB', format: 'PDF', product: 'VPP' },
];

const MOCK_SOFTWARE = [
  {
    name: 'Neuron 配置工具',
    desc: '网关参数配置、固件升级、设备诊断',
    version: 'v3.0.2',
    date: '2026-03-10',
    downloads: [
      { label: 'Windows x64', ext: '.exe', size: '45MB' },
      { label: 'macOS Intel', ext: '.dmg', size: '52MB' },
      { label: 'macOS ARM', ext: '.dmg', size: '48MB' },
      { label: 'Linux x64', ext: '.AppImage', size: '50MB' },
    ],
  },
  {
    name: 'AlwaysControl HEMS App',
    desc: '家庭能源管理移动应用',
    version: 'v2.5.0',
    date: '2026-03-08',
    downloads: [
      { label: 'Google Play', ext: '', size: '' },
      { label: 'App Store', ext: '', size: '' },
      { label: 'Android APK 直装', ext: '.apk', size: '38MB' },
    ],
  },
  {
    name: 'AlwaysControl ESS App',
    desc: '储能系统监控移动应用',
    version: 'v1.2.0',
    date: '2026-02-20',
    downloads: [
      { label: 'Google Play', ext: '', size: '' },
      { label: 'App Store', ext: '', size: '' },
    ],
  },
];

const MOCK_FIRMWARE = [
  { model: 'Neuron II', version: 'v2.1.3', date: '2026-03-10', changelog: '修复 Modbus TCP 连接稳定性问题', size: '12MB' },
  { model: 'Neuron II', version: 'v2.0.8', date: '2026-01-15', changelog: '新增 MQTT 5.0 支持', size: '11MB' },
  { model: 'Neuron II', version: 'v1.9.5', date: '2025-11-20', changelog: 'OTA 升级机制优化', size: '10MB' },
  { model: 'Neuron III', version: 'v1.2.0', date: '2026-03-01', changelog: 'DLB 响应速度优化至 80ms', size: '15MB' },
  { model: 'Neuron III', version: 'v1.1.5', date: '2026-02-01', changelog: '修复 OCPP 2.0.1 兼容性问题', size: '14MB' },
  { model: 'Neuron III', version: 'v1.0.0', date: '2025-12-15', changelog: '首个正式版本', size: '13MB' },
  { model: 'Neuron III Lite', version: 'v1.0.2', date: '2026-02-28', changelog: '首个稳定版本', size: '8MB' },
  { model: 'Neuron III Lite', version: 'v1.0.0', date: '2026-01-10', changelog: '初始发布', size: '7MB' },
];

const PRODUCTS = ['全部', 'Neuron II', 'Neuron III', 'Neuron III Lite', 'HEMS', 'ESS', 'EVCMS', 'PQMS', 'VPP'];
const FW_MODELS = ['全部', 'Neuron II', 'Neuron III', 'Neuron III Lite'];

type Tab = 'docs' | 'software' | 'firmware';

export default function DocsPage() {
  const t = useTranslations("help");
  const [activeTab, setActiveTab] = useState<Tab>('docs');
  const [docFilter, setDocFilter] = useState('全部');
  const [fwFilter, setFwFilter] = useState('全部');

  const filteredDocs = docFilter === '全部' ? MOCK_DOCS : MOCK_DOCS.filter(d => d.product === docFilter);
  const filteredFw = fwFilter === '全部' ? MOCK_FIRMWARE : MOCK_FIRMWARE.filter(f => f.model === fwFilter);

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'docs', icon: '📄', label: '产品文档' },
    { key: 'software', icon: '💾', label: '软件下载' },
    { key: 'firmware', icon: '🔧', label: '固件更新' },
  ];

  return (
    <>
      <section className="bg-[#0C1829] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/support" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors">
            &larr; {t('backToHelp')}
          </Link>
          <h1 className="text-3xl font-bold text-white">{t('docsTitle')}</h1>
          <p className="mt-2 text-gray-400">{t('docsSubtitle')}</p>
        </div>
      </section>

      {/* Tab Bar */}
      <section className="bg-white border-b border-[#E2E8F0] sticky top-16 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#38C4E8] text-[#38C4E8]'
                    : 'border-transparent text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === 'docs' && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Product filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {PRODUCTS.map(p => (
                <button
                  key={p}
                  onClick={() => setDocFilter(p)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    docFilter === p
                      ? 'bg-[#38C4E8] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="px-6 py-3 text-left font-medium text-[#475569]">文件名</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">产品</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">版本</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">更新日期</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">大小</th>
                    <th className="px-4 py-3 text-right font-medium text-[#475569]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                      <td className="px-6 py-3 text-[#0F172A]">{doc.name}</td>
                      <td className="px-4 py-3"><span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#475569]">{doc.product}</span></td>
                      <td className="px-4 py-3 text-[#475569]">{doc.version}</td>
                      <td className="px-4 py-3 text-[#475569]">{doc.date}</td>
                      <td className="px-4 py-3 text-[#475569]">{doc.size}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-[#38C4E8] hover:underline text-xs font-medium">📥 下载</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'software' && (
        <section className="bg-[#F8FAFC] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {MOCK_SOFTWARE.map((sw, idx) => (
                <div key={idx} className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-[#0F172A]">{sw.name}</h3>
                    <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#475569]">{sw.version}</span>
                  </div>
                  <p className="text-sm text-[#475569] mb-1">{sw.desc}</p>
                  <p className="text-xs text-[#94A3B8] mb-4">更新于 {sw.date}</p>
                  <div className="space-y-2">
                    {sw.downloads.map((dl, i) => (
                      <button
                        key={i}
                        className="flex w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] hover:border-[#38C4E8]/30 hover:bg-[#38C4E8]/5 transition-colors"
                      >
                        <span>📦 {dl.label} {dl.ext}</span>
                        {dl.size && <span className="text-xs text-[#475569]">{dl.size}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'firmware' && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Model filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {FW_MODELS.map(m => (
                <button
                  key={m}
                  onClick={() => setFwFilter(m)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    fwFilter === m
                      ? 'bg-[#38C4E8] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="px-6 py-3 text-left font-medium text-[#475569]">型号</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">固件版本</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">发布日期</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">更新日志</th>
                    <th className="px-4 py-3 text-left font-medium text-[#475569]">大小</th>
                    <th className="px-4 py-3 text-right font-medium text-[#475569]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFw.map((fw, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                      <td className="px-6 py-3 text-[#0F172A] font-medium">{fw.model}</td>
                      <td className="px-4 py-3"><span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-xs text-[#059669]">{fw.version}</span></td>
                      <td className="px-4 py-3 text-[#475569]">{fw.date}</td>
                      <td className="px-4 py-3 text-[#475569] max-w-xs">{fw.changelog}</td>
                      <td className="px-4 py-3 text-[#475569]">{fw.size}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-[#38C4E8] hover:underline text-xs font-medium">📥 下载</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
