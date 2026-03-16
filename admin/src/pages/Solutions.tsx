import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Drawer, Form, Input, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::solution.solution';

// ✅ 测试通过: 解决方案列表、编辑保存
export default function Solutions() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=1&pageSize=50&sort=createdAt:asc`);
      setData(res.data?.results ?? []);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as number);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      await api.put(`${API_URL}/${editingId}`, values);
      message.success('OK');
      setDrawerOpen(false);
      fetchData();
    } catch { message.error('Failed'); }
  };

  const columns = [
    { title: t('common.id'), dataIndex: 'id', width: 60 },
    { title: t('common.title'), dataIndex: 'title', ellipsis: true },
    { title: t('common.description'), dataIndex: 'description', ellipsis: true },
    {
      title: t('common.operations'), width: 100,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>{t('menu.solutions')}</Typography.Title>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} />
      <Drawer title={t('solutions.editSolution')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Button type="primary" onClick={handleSave}>{t('common.save')}</Button>}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t('common.title')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label={t('common.description')}><Input.TextArea rows={6} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
