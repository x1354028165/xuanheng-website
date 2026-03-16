import { useState } from 'react';
import { Table, Button, Typography, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const URLS = [
  '/', '/zh-CN', '/zh-CN/products', '/zh-CN/solutions', '/zh-CN/cases',
  '/zh-CN/news', '/zh-CN/about', '/zh-CN/contact', '/zh-CN/support',
  '/zh-CN/downloads', '/en-US', '/en-US/products', '/en-US/solutions',
  '/en-US/cases', '/en-US/news', '/en-US/about', '/en-US/contact',
  '/en-US/support', '/en-US/downloads', '/zh-CN/faq',
];

const BASE = 'http://localhost:3000';

interface UrlStatus {
  url: string;
  status: number | string;
  ok: boolean;
  time: number;
}

export default function HealthCheck() {
  const { t } = useTranslation();
  const [results, setResults] = useState<UrlStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    const checks: UrlStatus[] = [];
    for (const url of URLS) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE}${url}`, { method: 'HEAD', mode: 'no-cors' });
        checks.push({ url, status: res.status || 0, ok: res.ok || res.type === 'opaque', time: Date.now() - start });
      } catch {
        checks.push({ url, status: 'ERR', ok: false, time: Date.now() - start });
      }
    }
    setResults(checks);
    setLoading(false);
  };

  const columns = [
    { title: 'URL', dataIndex: 'url', ellipsis: true },
    {
      title: t('health.status'),
      dataIndex: 'status',
      width: 100,
      render: (v: number | string, record: UrlStatus) =>
        record.ok ? <Tag color="green">{v || 'OK'}</Tag> : <Tag color="red">{v}</Tag>,
    },
    { title: t('health.responseTime'), dataIndex: 'time', width: 120, render: (v: number) => `${v}ms` },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.healthCheck')}</Typography.Title>
        <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={runCheck}>
          {t('health.runCheck')}
        </Button>
      </div>
      <Table dataSource={results} columns={columns} rowKey="url" loading={loading} pagination={false} />
    </div>
  );
}
