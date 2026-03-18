"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Tab = 'docs' | 'software' | 'firmware';

interface Props {
  cmsDocResources: Array<Record<string, unknown>>;
  cmsSoftware: Array<Record<string, unknown>>;
  cmsFirmware: Array<Record<string, unknown>>;
  docsTitle: string;
  docsSubtitle: string;
}

export default function DocsClient({ cmsDocResources, cmsSoftware, cmsFirmware, docsTitle, docsSubtitle }: Props) {
  const t = useTranslations('help');
  const tc = useTranslations('common');
  const [activeTab, setActiveTab] = useState<Tab>('docs');
  const ALL_LABEL = t('all');
  const [docFilter, setDocFilter] = useState(ALL_LABEL);
  const [fwFilter, setFwFilter] = useState(ALL_LABEL);

  // Fallback hardcoded data with translated strings
  const MOCK_DOCS = [
    { title: t('mockDocNeuronIIManual'), version: 'v2.1', product: 'Neuron II', fileType: 'PDF' },
    { title: t('mockDocNeuronIIInstall'), version: 'v2.0', product: 'Neuron II', fileType: 'PDF' },
    { title: t('mockDocNeuronIIIManual'), version: 'v1.2', product: 'Neuron III', fileType: 'PDF' },
    { title: t('mockDocNeuronIIIInstall'), version: 'v1.0', product: 'Neuron III', fileType: 'PDF' },
    { title: t('mockDocNeuronIIILiteManual'), version: 'v1.0', product: 'Neuron III Lite', fileType: 'PDF' },
    { title: t('mockDocHemsGuide'), version: 'v3.0', product: 'HEMS', fileType: 'PDF' },
    { title: t('mockDocEssManual'), version: 'v1.5', product: 'ESS', fileType: 'PDF' },
    { title: t('mockDocEvcmsApi'), version: 'v2.1', product: 'EVCMS', fileType: 'PDF' },
    { title: t('mockDocPqmsManual'), version: 'v1.0', product: 'PQMS', fileType: 'PDF' },
    { title: t('mockDocVppGuide'), version: 'v1.0', product: 'VPP', fileType: 'PDF' },
  ];

  const MOCK_SOFTWARE = [
    { name: t('mockSwNeuronTool'), description: t('mockSwNeuronToolDesc'), version: 'v3.0.2', platform: 'Windows/macOS/Linux' },
    { name: 'AlwaysControl HEMS App', description: t('mockSwHemsAppDesc'), version: 'v2.5.0', platform: 'Android/iOS' },
    { name: 'AlwaysControl ESS App', description: t('mockSwEssAppDesc'), version: 'v1.2.0', platform: 'Android/iOS' },
  ];

  const MOCK_FIRMWARE = [
    { model: 'Neuron II', version: 'v2.1.3', releaseDate: '2026-03-10', changelog: t('mockFwNeuronIIChangelog') },
    { model: 'Neuron III', version: 'v1.2.0', releaseDate: '2026-03-01', changelog: t('mockFwNeuronIIIChangelog') },
    { model: 'Neuron III Lite', version: 'v1.0.2', releaseDate: '2026-02-28', changelog: t('mockFwNeuronIIILiteChangelog') },
  ];

  const docs = cmsDocResources.length > 0 ? cmsDocResources : MOCK_DOCS;
  const software = cmsSoftware.length > 0 ? cmsSoftware : MOCK_SOFTWARE;
  const firmware = cmsFirmware.length > 0 ? cmsFirmware : MOCK_FIRMWARE;

  const allProducts = [ALL_LABEL, ...Array.from(new Set(docs.map((d: Record<string, unknown>) => d.product as string)))];
  const allModels = [ALL_LABEL, ...Array.from(new Set(firmware.map((f: Record<string, unknown>) => f.model as string)))];

  const filteredDocs = docFilter === ALL_LABEL ? docs : docs.filter((d: Record<string, unknown>) => d.product === docFilter);
  const filteredFw = fwFilter === ALL_LABEL ? firmware : firmware.filter((f: Record<string, unknown>) => f.model === fwFilter);

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
              {tab === 'docs' ? t('tabDocs') : tab === 'software' ? t('tabSoftware') : t('tabFirmware')}
            </button>
          ))}
        </div>

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
                    <th className="px-4 py-3 text-left font-medium">{t('docName')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('product')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('version')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('format')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('downloadLink')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.map((doc: Record<string, unknown>, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{(doc.title || doc.name) as string}</td>
                      <td className="px-4 py-3 text-[#64748B]">{doc.product as string}</td>
                      <td className="px-4 py-3 text-[#64748B]">{doc.version as string}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">
                          {(doc.fileType || 'PDF') as string}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.fileUrl ? (
                          <a href={doc.fileUrl as string} className="text-[#38C4E8] hover:underline">{tc('download')}</a>
                        ) : (
                          <span className="text-gray-400">{t('notUploaded')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'software' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {software.map((sw: Record<string, unknown>, i: number) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-[#0F172A]">{sw.name as string}</h3>
                <p className="mt-1 text-sm text-[#64748B]">{(sw.description || sw.desc) as string}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{sw.version as string}</span>
                  <span className="text-xs text-[#94A3B8]">{sw.platform as string}</span>
                </div>
                {sw.fileUrl ? (
                  <a href={sw.fileUrl as string} className="mt-4 block text-center rounded-lg bg-[#38C4E8] px-4 py-2 text-sm text-white hover:bg-[#2bb0d4]">
                    {tc('download')}
                  </a>
                ) : (
                  <div className="mt-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg py-2">
                    {t('fileNotUploaded')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
              {filteredFw.map((fw: Record<string, unknown>, i: number) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0F172A]">{fw.model as string}</span>
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-600">{fw.version as string}</span>
                    </div>
                    <span className="text-sm text-[#94A3B8]">{fw.releaseDate as string}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#64748B]">{fw.changelog as string}</p>
                  {fw.fileUrl ? (
                    <a href={fw.fileUrl as string} className="mt-3 inline-flex text-sm text-[#38C4E8] hover:underline">
                      {t('downloadFirmware')}
                    </a>
                  ) : (
                    <span className="mt-3 inline-flex text-sm text-gray-400">{t('fileNotUploaded')}</span>
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
