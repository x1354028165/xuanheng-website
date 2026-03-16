import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDocResources, getSoftwareDownloads, getFirmwareVersions } from '@/lib/api';
import DocsClient from './DocsClient';
import type { Metadata } from 'next';

const SITE_NAME: Record<string, string> = {
  'zh-CN': '旭衡电子', 'zh-TW': '旭衡電子',
  'en-US': 'AlwaysControl', 'de': 'AlwaysControl', 'fr': 'AlwaysControl',
  'es': 'AlwaysControl', 'pt': 'AlwaysControl', 'ru': 'AlwaysControl',
};
const DOCS_TITLES: Record<string, string> = {
  'zh-CN': '技术文档', 'zh-TW': '技術文件',
  'en-US': 'Technical Docs', 'de': 'Technische Dokumente', 'fr': 'Documentation Technique',
  'es': 'Documentación Técnica', 'pt': 'Documentação Técnica', 'ru': 'Техническая документация',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${DOCS_TITLES[locale] ?? 'Technical Docs'} | ${SITE_NAME[locale] ?? 'AlwaysControl'}` };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'help' });

  const [cmsDocResources, cmsSoftware, cmsFirmware] = await Promise.all([
    getDocResources(),
    getSoftwareDownloads(),
    getFirmwareVersions(),
  ]);

  return (
    <DocsClient
      cmsDocResources={cmsDocResources}
      cmsSoftware={cmsSoftware}
      cmsFirmware={cmsFirmware}
      docsTitle={t('docsTitle')}
      docsSubtitle={t('docsSubtitle')}
    />
  );
}
