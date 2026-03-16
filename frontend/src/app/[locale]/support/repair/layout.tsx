import type { Metadata } from 'next';

const SITE_NAME: Record<string, string> = {
  'zh-CN': '旭衡电子', 'zh-TW': '旭衡電子',
  'en-US': 'AlwaysControl', 'de': 'AlwaysControl', 'fr': 'AlwaysControl',
  'es': 'AlwaysControl', 'pt': 'AlwaysControl', 'ru': 'AlwaysControl',
};
const REPAIR_TITLES: Record<string, string> = {
  'zh-CN': '在线报修', 'zh-TW': '線上報修',
  'en-US': 'Online Repair', 'de': 'Online-Reparatur', 'fr': 'Réparation en ligne',
  'es': 'Reparación en línea', 'pt': 'Reparo online', 'ru': 'Онлайн-ремонт',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${REPAIR_TITLES[locale] ?? 'Online Repair'} | ${SITE_NAME[locale] ?? 'AlwaysControl'}` };
}

export default function RepairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
