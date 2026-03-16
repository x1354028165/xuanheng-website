import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Tag, Typography, message, Select, InputNumber, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::file-asset.file-asset';

export default function FileAssets() {
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
  const openEdit = (record: Record<string, unknown>) => { setEditingId(record.documentId as string); form.setFieldsValue(record); setDrawerOpen(true); };

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

  const columns = [
    { title: t('fileAssets.name'), dataIndex: 'name', ellipsis: true },
    { title: t('fileAssets.fileType'), dataIndex: 'fileType', width: 100, render: (v: string) => v ? <Tag>{v}</Tag> : '-' },
    { title: t('fileAssets.productModel'), dataIndex: 'productModel', width: 120 },
    { title: t('fileAssets.version'), dataIndex: 'version', width: 80 },
    { title: t('fileAssets.isActive'), dataIndex: 'isActive', width: 80, render: (v: boolean) => v ? <Tag color="green">{t('fileAssets.active')}</Tag> : <Tag color="red">{t('fileAssets.inactive')}</Tag> },
    { title: t('fileAssets.downloadCount'), dataIndex: 'downloadCount', width: 80 },
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.fileAssets')}</Typography.Title>
        <Space>
          <Input.Search placeholder={t('common.search')} allowClear onSearch={(v) => { setPage(1); setSearch(v); }} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
        </Space>
      </div>
      <Table dataSource={data} columns={columns} rowKey="documentId" loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }} />
      <Drawer title={editingId ? t('common.edit') : t('common.create')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button><Button type="primary" onClick={handleSave}>{t('common.save')}</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('fileAssets.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="fileType" label={t('fileAssets.fileType')} rules={[{ required: true }]}>
            <Select options={[
              { label: 'doc', value: 'doc' },
              { label: 'software', value: 'software' },
              { label: 'firmware', value: 'firmware' },
              { label: 'app', value: 'app' },
            ]} />
          </Form.Item>
          <Form.Item name="productModel" label={t('fileAssets.productModel')}><Input /></Form.Item>
          <Form.Item name="version" label={t('fileAssets.version')}><Input /></Form.Item>
          <Form.Item name="fileUrl" label={t('fileAssets.fileUrl')}><Input /></Form.Item>
          <Form.Item name="fileSize" label={t('fileAssets.fileSize')}><Input /></Form.Item>
          <Form.Item name="downloadCount" label={t('fileAssets.downloadCount')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label={t('common.description')}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="isActive" label={t('fileAssets.isActive')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
