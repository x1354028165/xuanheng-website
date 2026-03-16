import { useState, useEffect } from 'react';
import { Button, Card, Typography, message, Descriptions, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const SITEMAP_URL = 'http://localhost:3000/sitemap.xml';

export default function SitemapMgmt() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sitemapInfo, setSitemapInfo] = useState<{ exists: boolean; lastModified: string; size: string } | null>(null);

  const checkSitemap = async () => {
    setLoading(true);
    try {
      const res = await fetch(SITEMAP_URL, { method: 'HEAD', mode: 'no-cors' });
      setSitemapInfo({
        exists: res.ok || res.type === 'opaque',
        lastModified: res.headers.get('last-modified') || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        size: res.headers.get('content-length') || '-',
      });
    } catch {
      setSitemapInfo({ exists: false, lastModified: '-', size: '-' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkSitemap(); }, []);

  const refreshSitemap = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/sitemap.xml' }),
      });
      message.success(t('sitemap.refreshSuccess'));
      await checkSitemap();
    } catch {
      message.error(t('sitemap.refreshFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>{t('menu.sitemapMgmt')}</Typography.Title>
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label={t('sitemap.url')}>{SITEMAP_URL}</Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>
            {sitemapInfo ? (
              sitemapInfo.exists ? <Tag color="green">{t('sitemap.available')}</Tag> : <Tag color="red">{t('sitemap.unavailable')}</Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('sitemap.lastModified')}>{sitemapInfo?.lastModified ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('sitemap.fileSize')}>{sitemapInfo?.size ?? '-'}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={refreshSitemap}>
            {t('sitemap.refresh')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
