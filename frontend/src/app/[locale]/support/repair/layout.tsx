import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const tHelp = await getTranslations({ locale, namespace: 'help' });
  return { title: `${tHelp('repairTitle')} | ${tMeta('siteName')}` };
}

export default function RepairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
