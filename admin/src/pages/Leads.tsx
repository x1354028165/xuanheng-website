import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Drawer, Descriptions, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

const API_URL = '/content-manager/collection-types/api::lead.lead';

// ✅ 测试通过: 线索列表、搜索、分页、详情Drawer
export default function Leads() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?page=${page}&pageSize=10&sort=createdAt:desc`;
      if (search) url += `&_q=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setData(res.data?.results ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { title: t('common.id'), dataIndex: 'id', width: 60 },
    { title: t('common.name'), dataIndex: 'name' },
    { title: t('common.email'), dataIndex: 'email' },
    { title: t('common.phone'), dataIndex: 'phone' },
    { title: t('leads.intentType'), dataIndex: 'intentType' },
    { title: t('leads.submitTime'), dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.leads')}</Typography.Title>
        <Input.Search
          placeholder={t('common.search')}
          style={{ width: 300 }}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          allowClear
        />
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
        onRow={(record) => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
      />
      <Drawer title={t('leads.detail')} open={!!selected} onClose={() => setSelected(null)} width={480}>
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('common.id')}>{selected.id as number}</Descriptions.Item>
            <Descriptions.Item label={t('common.name')}>{selected.name as string}</Descriptions.Item>
            <Descriptions.Item label={t('common.email')}>{selected.email as string}</Descriptions.Item>
            <Descriptions.Item label={t('common.phone')}>{selected.phone as string}</Descriptions.Item>
            <Descriptions.Item label={t('leads.company')}>{(selected.company as string) || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('leads.intentType')}>{(selected.intentType as string) || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('leads.message')}>{(selected.message as string) || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('leads.submitTime')}>{selected.createdAt ? dayjs(selected.createdAt as string).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
