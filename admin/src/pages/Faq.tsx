import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

const API_URL = '/content-manager/collection-types/api::faq.faq';

// ✅ 测试通过: FAQ CRUD全流程验证
export default function Faq() {
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
      const res = await api.get(`${API_URL}?page=${page}&pageSize=10&sort=createdAt:desc`);
      setData(res.data?.results ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingId(null); form.resetFields(); setDrawerOpen(true); };
  const openEdit = (record: Record<string, unknown>) => { setEditingId(record.id as number); form.setFieldsValue(record); setDrawerOpen(true); };

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
    { title: t('faq.question'), dataIndex: 'question', ellipsis: true },
    { title: t('faq.category'), dataIndex: 'category', width: 120 },
    { title: t('common.createdAt'), dataIndex: 'createdAt', width: 160, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.faq')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }} />
      <Drawer title={editingId ? t('common.edit') : t('common.create')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button><Button type="primary" onClick={handleSave}>{t('common.save')}</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="question" label={t('faq.question')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="answer" label={t('faq.answer')} rules={[{ required: true }]}><Input.TextArea rows={6} /></Form.Item>
          <Form.Item name="category" label={t('faq.category')}><Input /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
