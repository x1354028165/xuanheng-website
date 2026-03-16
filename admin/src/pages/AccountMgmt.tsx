import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

export default function AccountMgmt() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setData(res.data?.data?.results ?? res.data?.data ?? res.data ?? []);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, []);

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
        await api.put(`/admin/users/${editingId}`, values);
      } else {
        await api.post('/admin/users', values);
      }
      message.success('OK');
      setDrawerOpen(false);
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const columns = [
    { title: t('common.email'), dataIndex: 'email', ellipsis: true },
    { title: t('account.firstname'), dataIndex: 'firstname', width: 120 },
    { title: t('account.lastname'), dataIndex: 'lastname', width: 120 },
    {
      title: t('account.isActive'),
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean) => v ? <Tag color="green">{t('account.active')}</Tag> : <Tag color="red">{t('account.inactive')}</Tag>,
    },
    { title: t('common.createdAt'), dataIndex: 'createdAt', width: 160, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: t('common.operations'),
      width: 160,
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.accountMgmt')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} />
      <Drawer title={editingId ? t('common.edit') : t('common.create')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button><Button type="primary" onClick={handleSave}>{t('common.save')}</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="firstname" label={t('account.firstname')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="lastname" label={t('account.lastname')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label={t('common.email')} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          {!editingId && <Form.Item name="password" label={t('account.password')} rules={[{ required: true }]}><Input.Password /></Form.Item>}
        </Form>
      </Drawer>
    </div>
  );
}
