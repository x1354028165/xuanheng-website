"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

// Fallback hardcoded data
const MOCK_DOCS = [
  { title: 'Neuron II 用户手册', version: 'v2.1', product: 'Neuron II', fileType: 'PDF' },
  { title: 'Neuron II 安装指南', version: 'v2.0', product: 'Neuron II', fileType: 'PDF' },
  { title: 'Neuron III 用户手册', version: 'v1.2', product: 'Neuron III', fileType: 'PDF' },
  { title: 'Neuron III 快速安装指南', version: 'v1.0', product: 'Neuron III', fileType: 'PDF' },
  { title: 'Neuron III Lite 用户手册', version: 'v1.0', product: 'Neuron III Lite', fileType: 'PDF' },
  { title: 'HEMS 云平台使用指南', version: 'v3.0', product: 'HEMS', fileType: 'PDF' },
  { title: 'ESS 运维手册', version: 'v1.5', product: 'ESS', fileType: 'PDF' },
  { title: 'EVCMS API 接口文档', version: 'v2.1', product: 'EVCMS', fileType: 'PDF' },
  { title: 'PQMS 电能质量监测手册', version: 'v1.0', product: 'PQMS', fileType: 'PDF' },
  { title: 'VPP 虚拟电厂接入指南', version: 'v1.0', product: 'VPP', fileType: 'PDF' },
];

const MOCK_SOFTWARE = [
  { name: 'Neuron 配置工具', description: '网关参数配置、固件升级、设备诊断', version: 'v3.0.2', platform: 'Windows/macOS/Linux' },
  { name: 'AlwaysControl HEMS App', description: '家庭能源管理移动应用', version: 'v2.5.0', platform: 'Android/iOS' },
  { name: 'AlwaysControl ESS App', description: '储能系统监控移动应用', version: 'v1.2.0', platform: 'Android/iOS' },
];

const MOCK_FIRMWARE = [
  { model: 'Neuron II', version: 'v2.1.3', releaseDate: '2026-03-10', changelog: '修复 Modbus TCP 连接稳定性问题' },
  { model: 'Neuron III', version: 'v1.2.0', releaseDate: '2026-03-01', changelog: 'DLB 响应速度优化至 80ms' },
  { model: 'Neuron III Lite', version: 'v1.0.2', releaseDate: '2026-02-28', changelog: '首个稳定版本' },
];

type Tab = 'docs' | 'software' | 'firmware';

interface Props {
  cmsDocResources: any[];
  cmsSoftware: any[];
  cmsFirmware: any[];
  docsTitle: string;
  docsSubtitle: string;
}

export default function DocsClient({ cmsDocResources, cmsSoftware, cmsFirmware, docsTitle, docsSubtitle }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('docs');
  const [docFilter, setDocFilter] = useState('全部');
  const [fwFilter, setFwFilter] = useState('全部');

  // 使用CMS数据，fallback到硬编码
  const docs = cmsDocResources.length > 0 ? cmsDocResources : MOCK_DOCS;
  const software = cmsSoftware.length > 0 ? cmsSoftware : MOCK_SOFTWARE;
  const firmware = cmsFirmware.length > 0 ? cmsFirmware : MOCK_FIRMWARE;

  const allProducts = ['全部', ...Array.from(new Set(docs.map((d: any) => d.product)))];
  const allModels = ['全部', ...Array.from(new Set(firmware.map((f: any) => f.model)))];

  const filteredDocs = docFilter === '全部' ? docs : docs.filter((d: any) => d.product === docFilter);
  const filteredFw = fwFilter === '全部' ? firmware : firmware.filter((f: any) => f.model === fwFilter);

  return (
    <main className="bg-[#F8FAFC] min-h-screen pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0F172A]">{docsTitle}</h1>
          <p className="mt-2 text-[#64748B]">{docsSubtitle}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {(['docs', 'software', 'firmware'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#38C4E8] text-[#38C4E8]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab === 'docs' ? '技术文档' : tab === 'software' ? '软件下载' : '固件版本'}
            </button>
          ))}
        </div>

        {/* 技术文档 */}
        {activeTab === 'docs' && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {allProducts.map((p) => (
                <button
                  key={p}
                  onClick={() => setDocFilter(p)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    docFilter === p ? 'bg-[#38C4E8] text-white' : 'bg-white text-[#64748B] border border-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[#64748B]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">文档名称</th>
                    <th className="px-4 py-3 text-left font-medium">产品</th>
                    <th className="px-4 py-3 text-left font-medium">版本</th>
                    <th className="px-4 py-3 text-left font-medium">格式</th>
                    <th className="px-4 py-3 text-left font-medium">下载</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.map((doc: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{doc.title || doc.name}</td>
                      <td className="px-4 py-3 text-[#64748B]">{doc.product}</td>
                      <td className="px-4 py-3 text-[#64748B]">{doc.version}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">
                          {doc.fileType || 'PDF'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.fileUrl ? (
                          <a href={doc.fileUrl} className="text-[#38C4E8] hover:underline">下载</a>
                        ) : (
                          <span className="text-gray-400">暂未上传</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 软件下载 */}
        {activeTab === 'software' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {software.map((sw: any, i: number) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-[#0F172A]">{sw.name}</h3>
                <p className="mt-1 text-sm text-[#64748B]">{sw.description || sw.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{sw.version}</span>
                  <span className="text-xs text-[#94A3B8]">{sw.platform}</span>
                </div>
                {sw.fileUrl ? (
                  <a href={sw.fileUrl} className="mt-4 block text-center rounded-lg bg-[#38C4E8] px-4 py-2 text-sm text-white hover:bg-[#2bb0d4]">
                    下载
                  </a>
                ) : (
                  <div className="mt-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg py-2">
                    文件待上传
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 固件版本 */}
        {activeTab === 'firmware' && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {allModels.map((m) => (
                <button
                  key={m}
                  onClick={() => setFwFilter(m)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    fwFilter === m ? 'bg-[#38C4E8] text-white' : 'bg-white text-[#64748B] border border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredFw.map((fw: any, i: number) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0F172A]">{fw.model}</span>
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-600">{fw.version}</span>
                    </div>
                    <span className="text-sm text-[#94A3B8]">{fw.releaseDate}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#64748B]">{fw.changelog}</p>
                  {fw.fileUrl ? (
                    <a href={fw.fileUrl} className="mt-3 inline-flex text-sm text-[#38C4E8] hover:underline">
                      下载固件 →
                    </a>
                  ) : (
                    <span className="mt-3 inline-flex text-sm text-gray-400">文件待上传</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
