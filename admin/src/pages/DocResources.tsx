import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/api/doc-resources';

function normalize(item: Record<string, unknown>): Record<string, unknown> {
  const attrs = (item.attributes as Record<string, unknown>) ?? {};
  return { id: item.id, ...attrs };
}

export default function DocResources() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${API_URL}?pagination[page]=${page}&pagination[pageSize]=10&sort=sortOrder:asc`
      );
      const raw: Record<string, unknown>[] = res.data?.data ?? [];
      setData(raw.map(normalize));
      setTotal(res.data?.meta?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingId(null); form.resetFields(); setDrawerOpen(true); };
  const openEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as number);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, { data: values });
      } else {
        await api.post(API_URL, { data: values });
      }
      message.success('OK');
      setDrawerOpen(false);
      fetchData();
    } catch { message.error('Failed'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      message.success('OK');
      fetchData();
    } catch { message.error('Failed'); }
  };

  const columns = [
    { title: t('docResources.title'), dataIndex: 'title', ellipsis: true },
    { title: t('docResources.product'), dataIndex: 'product', width: 120 },
    { title: t('docResources.version'), dataIndex: 'version', width: 100 },
    { title: t('docResources.fileType'), dataIndex: 'fileType', width: 100 },
    { title: t('docResources.language'), dataIndex: 'language', width: 80 },
    { title: t('docResources.sortOrder'), dataIndex: 'sortOrder', width: 80 },
    {
      title: t('common.operations'), width: 160,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
          <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete(record.id as number)}>
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.docResources')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: setPage,
          showTotal: (tot) => t('common.total', { total: tot }),
        }}
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
          <Form.Item name="title" label={t('docResources.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product" label={t('docResources.product')}>
            <Input />
          </Form.Item>
          <Form.Item name="version" label={t('docResources.version')}>
            <Input />
          </Form.Item>
          <Form.Item name="fileType" label={t('docResources.fileType')}>
            <Input placeholder="PDF / Word / Excel" />
          </Form.Item>
          <Form.Item name="language" label={t('docResources.language')}>
            <Input placeholder="zh-CN / en-US" />
          </Form.Item>
          <Form.Item name="fileUrl" label={t('docResources.fileUrl')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('docResources.sortOrder')}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
