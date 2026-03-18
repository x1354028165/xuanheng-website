import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, Select, Radio, Checkbox, Switch, InputNumber, Tag } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::compatible-brand.compatible-brand';

export default function Brands() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=${page}&pageSize=10&sort=sortOrder:asc,createdAt:desc`);
      setData(res.data?.results ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('files', file);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const media = res.data[0];
      setLogoId(media.id);
      setLogoPreview(media.url.startsWith('/uploads/') ? `/strapi${media.url}` : media.url);
    } catch {
      message.error('上传失败');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setLogoPreview(null);
    setLogoId(null);
    setDrawerOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as number);
    const caps = typeof record.capabilities === 'string'
      ? JSON.parse(record.capabilities)
      : (record.capabilities ?? []);
    const cats = typeof record.category === 'string'
      ? JSON.parse(record.category || '[]')
      : (record.category ?? []);
    form.setFieldsValue({ ...record, capabilities: caps, category: cats });
    const logo = record.logo as { url?: string; id?: number } | null;
    if (logo?.url) {
      setLogoPreview(logo.url.startsWith('/uploads/') ? `/strapi${logo.url}` : logo.url);
      setLogoId(logo.id ?? null);
    } else {
      setLogoPreview(null);
      setLogoId(null);
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload: Record<string, unknown> = { ...values };
    if (logoId) payload.logo = logoId;
    if (Array.isArray(values.capabilities)) {
      payload.capabilities = values.capabilities;
    }
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, payload);
      } else {
        await api.post(API_URL, payload);
      }
      message.success('保存成功');
      setDrawerOpen(false);
      fetchData();
    } catch {
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      message.success('OK');
      fetchData();
    } catch { message.error('Failed'); }
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      width: 80,
      render: (logo: { url?: string } | null) => {
        const url = logo?.url;
        if (!url) return '—';
        const src = url.startsWith('/uploads/') ? `/strapi${url}` : url;
        return <img src={src} alt="logo" style={{ height: 32, objectFit: 'contain' }} />;
      },
    },
    { title: t('brands.brandName'), dataIndex: 'name', ellipsis: true },
    {
      title: '设备类型',
      dataIndex: 'category',
      width: 140,
      render: (v: unknown) => {
        const arr: string[] = Array.isArray(v) ? v : (v ? [String(v)] : []);
        return arr.map(c => <Tag key={c}>{c}</Tag>);
      },
    },
    {
      title: '接入方式',
      dataIndex: 'accessMethod',
      width: 100,
      render: (v: string) => {
        const map: Record<string, string> = { cloud: '云端', gateway: '网关', both: '双路' };
        return <Tag>{map[v] ?? v ?? '—'}</Tag>;
      },
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      ellipsis: true,
      render: (caps: unknown) => {
        const arr: string[] = Array.isArray(caps) ? caps : (typeof caps === 'string' ? JSON.parse(caps || '[]') : []);
        const MAP: Record<string, string> = { telemetry: '遥测', control: '控制', history: '历史' };
        return arr.map(c => <Tag key={c}>{MAP[c] ?? c}</Tag>);
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => {
        const statusMap: Record<string, string> = { connected: '已接入', adapting: '适配中' };
        return <Tag color={v === 'connected' ? 'green' : 'orange'}>{statusMap[v] ?? v ?? '—'}</Tag>;
      },
    },
    {
      title: '首页可见',
      dataIndex: 'showOnHomepage',
      width: 90,
      render: (val: boolean, record: Record<string, unknown>) => (
        <Switch
          checked={!!val}
          size="small"
          onChange={async (checked) => {
            try {
              await api.put(`${API_URL}/${record.id}`, { showOnHomepage: checked });
              fetchData();
            } catch {
              message.error('更新失败');
            }
          }}
        />
      ),
    },
    {
      title: '生态页可见',
      dataIndex: 'isVisible',
      width: 90,
      render: (val: boolean, record: Record<string, unknown>) => (
        <Switch
          checked={!!val}
          size="small"
          onChange={async (checked) => {
            try {
              await api.put(`${API_URL}/${record.id}`, { isVisible: checked });
              fetchData();
            } catch {
              message.error('更新失败');
            }
          }}
        />
      ),
    },
    {
      title: t('common.operations'), width: 140,
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.brands')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
        scroll={{ x: 1100 }} />
      <Drawer title={editingId ? t('common.edit') : t('common.create')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Space><Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button><Button type="primary" onClick={handleSave}>{t('common.save')}</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="设备类型">
            <Select mode="multiple" allowClear options={[
              { label: '储能电池', value: '储能电池' },
              { label: '光伏逆变器', value: '光伏逆变器' },
              { label: '充电桩', value: '充电桩' },
              { label: '智能电表', value: '智能电表' },
              { label: '其他', value: '其他' },
            ]} />
          </Form.Item>
          <Form.Item label="品牌 Logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {logoPreview && <img src={logoPreview} alt="logo" style={{ height: 48, objectFit: 'contain', border: '1px solid #f0f0f0', padding: 4, borderRadius: 4 }} />}
              <Button onClick={() => logoInputRef.current?.click()} icon={<UploadOutlined />}>
                {logoPreview ? '更换' : '上传'} Logo
              </Button>
              {logoPreview && (
                <Button danger size="small" onClick={() => { setLogoPreview(null); setLogoId(null); }}>移除</Button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
          </Form.Item>
          <Form.Item name="accessMethod" label="接入方式">
            <Radio.Group>
              <Radio value="cloud">云端直连</Radio>
              <Radio value="gateway">网关接入</Radio>
              <Radio value="both">两者均支持</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="capabilities" label="支持能力">
            <Checkbox.Group options={[
              { label: '实时数据读取（遥测）', value: 'telemetry' },
              { label: '充放电控制（调度）', value: 'control' },
              { label: '历史数据导出', value: 'history' },
            ]} />
          </Form.Item>
          <Form.Item name="status" label="接入状态">
            <Radio.Group>
              <Radio value="connected">已接入</Radio>
              <Radio value="adapting">适配中</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="showOnHomepage" label="首页可见" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isVisible" label="生态页可见" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序（小值在前）">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
