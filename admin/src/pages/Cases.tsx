import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Tag, Typography, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

const API_URL = '/content-manager/collection-types/api::case.case';

export default function Cases() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    setEditingId(record.documentId as string);
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

  const handleDelete = async (documentId: string) => {
    try {
      await api.delete(`${API_URL}/${documentId}`);
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const togglePublish = async (record: Record<string, unknown>) => {
    try {
      const isPublished = !!record.publishedAt;
      if (isPublished) {
        await api.post(`${API_URL}/${record.documentId}/actions/unpublish`);
      } else {
        await api.post(`${API_URL}/${record.documentId}/actions/publish`);
      }
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const columns = [
    { title: t('common.title'), dataIndex: 'title', ellipsis: true },
    { title: t('cases.client'), dataIndex: 'client', width: 120 },
    { title: t('cases.solutionType'), dataIndex: 'solutionType', width: 120 },
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
          <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete(record.documentId as string)}>
            <Button size="small" danger onClick={(e) => e.stopPropagation()}>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.cases')}</Typography.Title>
        <Space>
          <Input.Search placeholder={t('common.search')} style={{ width: 250 }} onSearch={(v) => { setSearch(v); setPage(1); }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="documentId"
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
          <Form.Item name="slug" label={t('cases.slug')}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label={t('cases.summary')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="content" label={t('cases.content')}>
            <Input.TextArea rows={8} />
          </Form.Item>
          <Form.Item name="client" label={t('cases.client')}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label={t('cases.location')}>
            <Input />
          </Form.Item>
          <Form.Item name="solutionType" label={t('cases.solutionType')}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('cases.sortOrder')}>
            <InputNumber />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
