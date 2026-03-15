'use client';

import { useState } from 'react';
import Link from 'next/link';

const DEVICE_MODELS = [
  'Neuron II',
  'Neuron III',
  'Neuron III Lite',
  'HEMS 云平台',
  'ESS 云平台',
  'EVCMS 云平台',
  'PQMS 云平台',
  'VPP 云平台',
  '其他',
];

export default function RepairPage() {
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
        <section className="bg-[#0C1829] pb-8 pt-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link href="/help" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors">
              &larr; 返回帮助中心
            </Link>
            <h1 className="text-3xl font-bold text-white">在线报修</h1>
          </div>
        </section>
        <section className="bg-[#0f1b2e] py-16">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">报修工单已提交</h2>
              <p className="text-gray-400">我们的技术支持团队会在 24 小时内联系您，请保持电话畅通。</p>
              <Link
                href="/help"
                className="mt-6 inline-flex items-center rounded-lg bg-[#38C4E8] px-6 py-2.5 text-sm font-semibold text-[#0C1829] transition-colors hover:bg-[#38C4E8]/90"
              >
                返回帮助中心
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-[#0C1829] pb-8 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/help" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors">
            &larr; 返回帮助中心
          </Link>
          <h1 className="text-3xl font-bold text-white">在线报修</h1>
          <p className="mt-2 text-gray-400">提交报修工单，我们的技术支持团队会尽快处理</p>
        </div>
      </section>

      <section className="bg-[#0f1b2e] py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/5 p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#38C4E8]/50 focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/50"
                placeholder="请输入您的姓名"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                联系电话 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#38C4E8]/50 focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/50"
                placeholder="请输入您的电话号码"
              />
            </div>

            {/* Device Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                设备型号 <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-[#0C1829] px-4 py-3 text-white focus:border-[#38C4E8]/50 focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/50"
              >
                <option value="">请选择设备型号</option>
                {DEVICE_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故障描述 <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#38C4E8]/50 focus:outline-none focus:ring-1 focus:ring-[#38C4E8]/50 resize-none"
                placeholder="请详细描述故障现象"
              />
            </div>

            {/* Screenshots placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故障截图（可选，最多5张）
              </label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/10 px-6 py-8 text-center">
                <p className="text-sm text-gray-500">点击或拖拽上传截图</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#1A3FAD] py-3 text-base font-semibold text-white transition-all hover:bg-[#1A3FAD]/90 hover:shadow-lg"
            >
              提交报修
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
