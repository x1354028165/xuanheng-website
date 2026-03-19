import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, Button, Drawer, Form, Space, Popconfirm, Typography, message,
  Radio, Switch, InputNumber, Tag, Checkbox,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::compatible-brand.compatible-brand';

const CATEGORY_OPTIONS = [
  { label: '储能电池', value: '储能电池' },
  { label: '光伏逆变器', value: '光伏逆变器' },
  { label: '充电桩', value: '充电桩' },
  { label: '智能电表', value: '智能电表' },
  { label: '其他', value: '其他' },
];

const ACCESS_METHOD_OPTIONS = [
  { label: '云端直联', value: 'cloud' },
  { label: '网关接入', value: 'gateway' },
  { label: '两者均支持', value: 'both' },
];

const INTEGRATION_LEVEL_OPTIONS = [
  { label: '基础接入（实时数据读取）', value: 'read' },
  { label: '标准接入（实时 + 历史数据）', value: 'read_history' },
  { label: '完整接入（实时 + 历史 + 充放电控制）', value: 'full_control' },
];

const INTEGRATION_LEVEL_TAG: Record<string, { label: string; color: string }> = {
  read:          { label: '基础接入', color: 'default' },
  read_history:  { label: '标准接入', color: 'blue' },
  full_control:  { label: '完整接入', color: 'green' },
};

const ACCESS_METHOD_TAG: Record<string, string> = {
  cloud: '云端直联', gateway: '网关接入', both: '两者均支持',
};

const STATUS_TAG: Record<string, { label: string; color: string }> = {
  connected: { label: '已支持', color: 'success' },
  adapting:  { label: '开发中', color: 'warning' },
};

export default function Brands() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=${page}&pageSize=10&sort=sortOrder:asc,createdAt:desc&populate=logo`);
      setData(res.data?.results ?? []);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /**/ } finally {
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
      setLogoPreview(media.url);
    } catch {
      message.error('上传失败');
    }
  };

  const openCreate = () => {
    setEditingDocId(null);
    // 新增默认值
    form.setFieldsValue({
      name: '',
      category: [],
      accessMethod: 'both',
      integrationLevel: 'full_control',
      status: 'connected',
      showOnHomepage: true,
      isVisible: true,
      sortOrder: 0,
      websiteUrl: '',
    });
    setLogoPreview(null);
    setLogoId(null);
    setDrawerOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditingDocId(record.documentId as string);
    // category 可能是字符串或数组，统一转为数组
    const catValue = (() => {
      const c = record.category;
      if (!c) return [];
      if (Array.isArray(c)) return c;
      if (typeof c === 'string') {
        try { if (c.trim().startsWith('[')) return JSON.parse(c); } catch { /**/ }
        return c ? [c] : [];
      }
      return [];
    })();
    form.setFieldsValue({
      name: record.name,
      category: catValue,
      accessMethod: record.accessMethod,
      integrationLevel: record.integrationLevel,
      status: record.status,
      showOnHomepage: record.showOnHomepage,
      isVisible: record.isVisible,
      sortOrder: record.sortOrder,
      websiteUrl: record.websiteUrl,
    });
    const logo = record.logo as { url?: string; id?: number } | null;
    if (logo?.url) {
      setLogoPreview(logo.url);
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
    try {
      if (editingDocId) {
        await api.put(`${API_URL}/${editingDocId}`, payload);
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

  const handleDelete = async (documentId: string) => {
    try {
      await api.delete(`${API_URL}/${documentId}`);
      message.success('删除成功');
      fetchData();
    } catch { message.error('删除失败'); }
  };

  const handleToggle = async (documentId: string, field: string, checked: boolean) => {
    try {
      await api.put(`${API_URL}/${documentId}`, { [field]: checked });
      setData(prev => prev.map(item =>
        item.documentId === documentId ? { ...item, [field]: checked } : item
      ));
    } catch {
      message.error('更新失败');
      fetchData();
    }
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      width: 64,
      render: (logo: { url?: string } | null) => {
        if (!logo?.url) return <div style={{ width: 32, height: 32, background: '#f5f5f5', borderRadius: 4 }} />;
        return <img src={logo.url} alt="logo" style={{ height: 32, objectFit: 'contain' }} />;
      },
    },
    { title: '品牌名称', dataIndex: 'name', ellipsis: true },
    {
      title: '设备类型',
      dataIndex: 'category',
      width: 140,
      render: (v: unknown) => {
        const arr: string[] = Array.isArray(v) ? v : (v ? [String(v)] : []);
        if (!arr.length) return '—';
        return <>{arr.map(c => <Tag key={c}>{c}</Tag>)}</>;
      },
    },
    {
      title: '接入方式',
      dataIndex: 'accessMethod',
      width: 110,
      render: (v: string) => <Tag>{ACCESS_METHOD_TAG[v] ?? v ?? '—'}</Tag>,
    },
    {
      title: '对接进度',
      dataIndex: 'integrationLevel',
      width: 100,
      render: (v: string) => {
        const meta = INTEGRATION_LEVEL_TAG[v];
        return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '—';
      },
    },
    {
      title: '支持状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => {
        const meta = STATUS_TAG[v];
        return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '—';
      },
    },
    {
      title: '首页可见',
      dataIndex: 'showOnHomepage',
      width: 80,
      render: (val: boolean, record: Record<string, unknown>) => (
        <Switch checked={!!val} size="small"
          onChange={(checked) => handleToggle(record.documentId as string, 'showOnHomepage', checked)} />
      ),
    },
    {
      title: '生态页可见',
      dataIndex: 'isVisible',
      width: 90,
      render: (val: boolean, record: Record<string, unknown>) => (
        <Switch checked={!!val} size="small"
          onChange={(checked) => handleToggle(record.documentId as string, 'isVisible', checked)} />
      ),
    },
    {
      title: t('common.operations'), width: 130,
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.brands')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
      </div>

      <Table
        dataSource={data} columns={columns} rowKey="documentId" loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
        scroll={{ x: 1100 }}
      />

      <Drawer
        title={editingDocId ? t('common.edit') : t('common.create')}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" onClick={handleSave}>{t('common.save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}>
            <input className="ant-input" style={{ width: '100%', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="category" label="设备类型">
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Button size="small" onClick={() => form.setFieldValue('category', CATEGORY_OPTIONS.map(o => o.value))}>
                  全选
                </Button>
                <Button size="small" onClick={() => form.setFieldValue('category', [])}>
                  取消全选
                </Button>
              </Space>
              <Checkbox.Group
                options={CATEGORY_OPTIONS}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              />
            </div>
          </Form.Item>

          <Form.Item label="品牌 Logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {logoPreview && (
                <img src={logoPreview} alt="logo"
                  style={{ height: 48, objectFit: 'contain', border: '1px solid #f0f0f0', padding: 4, borderRadius: 4 }} />
              )}
              <Button onClick={() => logoInputRef.current?.click()} icon={<UploadOutlined />}>
                {logoPreview ? '更换' : '上传'} Logo
              </Button>
              {logoPreview && (
                <Button danger size="small" onClick={() => { setLogoPreview(null); setLogoId(null); }}>移除</Button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </Form.Item>

          <Form.Item name="accessMethod" label="接入方式">
            <Radio.Group>
              {ACCESS_METHOD_OPTIONS.map(opt => (
                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="integrationLevel" label="对接进度">
            <Radio.Group>
              {INTEGRATION_LEVEL_OPTIONS.map(opt => (
                <Radio key={opt.value} value={opt.value} style={{ display: 'block', marginBottom: 8 }}>
                  {opt.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="status" label="支持状态">
            <Radio.Group>
              <Radio value="connected">已支持</Radio>
              <Radio value="adapting">开发中</Radio>
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

          <Form.Item name="websiteUrl" label="官网链接">
            <input className="ant-input" style={{ width: '100%', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
