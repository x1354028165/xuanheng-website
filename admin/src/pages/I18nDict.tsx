import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::i18n-key.i18n-key';

export default function I18nDict() {
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
      if (search) {
        url += `&_q=${encodeURIComponent(search)}`;
      }
      const res = await api.get(url);
      setData(res.data?.results ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingId(null); form.resetFields(); setDrawerOpen(true); };
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
    } catch { message.error('Failed'); }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await api.delete(`${API_URL}/${documentId}`);
      message.success('OK');
      fetchData();
    } catch { message.error('Failed'); }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns = [
    { title: t('i18n.key'), dataIndex: 'key', ellipsis: true },
    { title: t('i18n.zhCN'), dataIndex: 'zh_CN', ellipsis: true, width: 150 },
    { title: t('i18n.enUS'), dataIndex: 'en_US', ellipsis: true, width: 150 },
    {
      title: t('i18n.statusField'), dataIndex: 'status', width: 80,
      render: (v: string) => {
        if (v === 'approved') return <Tag color="green">{t('i18n.approved')}</Tag>;
        return <Tag color="orange">{t('i18n.pending')}</Tag>;
      },
    },
    {
      title: t('common.operations'), width: 160,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
          <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete(record.documentId as string)}>
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.i18nDict')}</Typography.Title>
        <Space>
          <Input.Search placeholder={t('common.search')} allowClear onSearch={handleSearch} style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
        </Space>
      </div>
      <Table dataSource={data} columns={columns} rowKey="documentId" loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }} />
      <Drawer title={editingId ? t('common.edit') : t('common.create')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={600}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button><Button type="primary" onClick={handleSave}>{t('common.save')}</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="key" label={t('i18n.key')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="zh_CN" label={t('i18n.zhCN')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="zh_TW" label={t('i18n.zhTW')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="en_US" label={t('i18n.enUS')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="de" label={t('i18n.de')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="fr" label={t('i18n.fr')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="pt" label={t('i18n.pt')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="es" label={t('i18n.es')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="ru" label={t('i18n.ru')}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label={t('i18n.statusField')}>
            <Select>
              <Select.Option value="pending">{t('i18n.pending')}</Select.Option>
              <Select.Option value="approved">{t('i18n.approved')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
