import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDocResources, getSoftwareDownloads, getFirmwareVersions } from '@/lib/api';
import DocsClient from './DocsClient';

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
