import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

const API_URL = '/content-manager/collection-types/api::article.article';

// ✅ 测试通过: 新闻CRUD、发布/下架、搜索、分页
export default function News() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Strapi v5: use documentId
  const [form] = Form.useForm();

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

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditingId((record.documentId ?? record.id) as string);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, values);
      } else {
        await api.post(API_URL, values);
      }
      message.success('OK');
      setDrawerOpen(false);
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const togglePublish = async (record: Record<string, unknown>) => {
    try {
      const isPublished = !!record.publishedAt;
      const docId = (record.documentId ?? record.id) as string;
      if (isPublished) {
        await api.post(`${API_URL}/${docId}/actions/unpublish`);
      } else {
        await api.post(`${API_URL}/${docId}/actions/publish`);
      }
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const columns = [
    { title: t('common.title'), dataIndex: 'title', ellipsis: true },
    {
      title: t('common.status'),
      dataIndex: 'publishedAt',
      width: 100,
      render: (v: string | null) => v ? <Tag color="green">{t('common.published')}</Tag> : <Tag>{t('common.draft')}</Tag>,
    },
    { title: t('common.createdAt'), dataIndex: 'createdAt', width: 160, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: t('common.operations'),
      width: 220,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button size="small" onClick={(e) => { e.stopPropagation(); openEdit(record); }}>{t('common.edit')}</Button>
          <Button size="small" onClick={(e) => { e.stopPropagation(); togglePublish(record); }}>
            {record.publishedAt ? t('common.unpublish') : t('common.publish')}
          </Button>
          <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete((record.documentId ?? record.id) as string)}>
            <Button size="small" danger onClick={(e) => e.stopPropagation()}>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.news')}</Typography.Title>
        <Space>
          <Input.Search placeholder={t('common.search')} style={{ width: 250 }} onSearch={(v) => { setSearch(v); setPage(1); }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
      />
      <Drawer
        title={editingId ? t('common.edit') : t('common.create')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" onClick={handleSave}>{t('common.save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t('common.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label={t('news.summary')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="content" label={t('news.content')}>
            <Input.TextArea rows={8} />
          </Form.Item>
          <Form.Item name="coverUrl" label={t('news.coverUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label={t('news.slug')}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
