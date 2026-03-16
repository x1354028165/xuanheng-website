import { useState } from 'react';
import { Button, Input, Card, Space, Typography, message, Divider } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

export default function CacheMgmt() {
  const { t } = useTranslation();
  const [path, setPath] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingPath, setLoadingPath] = useState(false);

  const clearAll = async () => {
    setLoadingAll(true);
    try {
      await api.post('/api/revalidate', { all: true });
      message.success(t('cache.clearAllSuccess'));
    } catch {
      message.error(t('cache.clearFailed'));
    } finally {
      setLoadingAll(false);
    }
  };

  const clearByPath = async () => {
    if (!path.trim()) { message.warning(t('cache.enterPath')); return; }
    setLoadingPath(true);
    try {
      await api.post('/api/revalidate', { path: path.trim() });
      message.success(t('cache.clearPathSuccess'));
      setPath('');
    } catch {
      message.error(t('cache.clearFailed'));
    } finally {
      setLoadingPath(false);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>{t('menu.cacheMgmt')}</Typography.Title>
      <Card>
        <Typography.Title level={5}>{t('cache.clearAllTitle')}</Typography.Title>
        <Typography.Paragraph type="secondary">{t('cache.clearAllDesc')}</Typography.Paragraph>
        <Button type="primary" danger icon={<ClearOutlined />} loading={loadingAll} onClick={clearAll}>
          {t('cache.clearAll')}
        </Button>
        <Divider />
        <Typography.Title level={5}>{t('cache.clearByPathTitle')}</Typography.Title>
        <Typography.Paragraph type="secondary">{t('cache.clearByPathDesc')}</Typography.Paragraph>
        <Space>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/zh-CN/products"
            style={{ width: 400 }}
          />
          <Button type="primary" icon={<ClearOutlined />} loading={loadingPath} onClick={clearByPath}>
            {t('cache.clearPath')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
