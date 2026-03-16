import { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

export default function AuditLogs() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?sort=createdAt:desc&page=${page}&pageSize=20`);
      setData(res.data?.results ?? res.data?.data ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { title: t('audit.action'), dataIndex: 'action', width: 150, render: (v: string) => <Tag>{v}</Tag> },
    { title: t('audit.user'), dataIndex: 'user', width: 160, render: (v: Record<string, unknown>) => v ? `${v.firstname} ${v.lastname}` : '-' },
    { title: t('audit.model'), dataIndex: 'model', width: 200 },
    { title: t('audit.payload'), dataIndex: 'payload', ellipsis: true, render: (v: unknown) => v ? JSON.stringify(v) : '-' },
    { title: t('common.createdAt'), dataIndex: 'createdAt', width: 160, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.auditLogs')}</Typography.Title>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
      />
    </div>
  );
}
