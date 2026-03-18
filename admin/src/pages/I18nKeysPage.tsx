import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, Select, Tag, Tabs, Tooltip,
} from 'antd';
import { PlusOutlined, TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::i18n-key.i18n-key';

const LOCALE_FIELDS = ['zh_CN', 'zh_TW', 'en_US', 'de', 'fr', 'pt', 'es', 'ru'] as const;

const LOCALE_LABELS: Record<string, string> = {
  zh_CN: '简体中文',
  zh_TW: '繁体中文',
  en_US: 'English',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  es: 'Español',
  ru: 'Русский',
};

// Extract namespace from key (e.g. "nav.home" → "nav")
function getNamespace(key: string): string {
  const parts = key.split('.');
  return parts.length > 1 ? parts[0] : '_root';
}

export default function I18nKeysPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [namespace, setNamespace] = useState<string | null>(null);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [translating, setTranslating] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?page=${page}&pageSize=20&sort=key:asc`;
      if (search) url += `&_q=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      let results = (res.data?.results ?? []) as Record<string, unknown>[];

      // Extract namespaces from full dataset for the filter
      if (page === 1 && !search) {
        const allRes = await api.get(`${API_URL}?pageSize=500&sort=key:asc`);
        const allItems = (allRes.data?.results ?? []) as Record<string, unknown>[];
        const nsSet = new Set(allItems.map((item) => getNamespace(item.key as string)));
        setNamespaces(Array.from(nsSet).sort());
      }

      // Filter by namespace client-side
      if (namespace) {
        results = results.filter((item) => getNamespace(item.key as string) === namespace);
      }

      setData(results);
      setTotal(res.data?.pagination?.total ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page, search, namespace]);

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

  const handleAutoTranslate = async (documentId: string) => {
    setTranslating(documentId);
    try {
      await api.post('/strapi/api/translate/i18n-keys', { documentId });
      message.success(t('i18n.translateSuccess') || 'Translation complete');
      fetchData();
    } catch {
      message.error(t('i18n.translateFailed') || 'Translation failed');
    } finally {
      setTranslating(null);
    }
  };

  // Count how many locales have translations
  const getTranslatedCount = (record: Record<string, unknown>): number => {
    return LOCALE_FIELDS.filter((f) => {
      const val = record[f];
      return typeof val === 'string' && val.trim().length > 0;
    }).length;
  };

  const columns = [
    {
      title: t('i18n.key'),
      dataIndex: 'key',
      ellipsis: true,
      width: 200,
      render: (key: string) => {
        const ns = getNamespace(key);
        return (
          <span>
            <Tag color="blue" style={{ fontSize: 10, marginRight: 4 }}>{ns}</Tag>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{key}</span>
          </span>
        );
      },
    },
    { title: t('i18n.zhCN'), dataIndex: 'zh_CN', ellipsis: true, width: 150 },
    { title: t('i18n.enUS'), dataIndex: 'en_US', ellipsis: true, width: 150 },
    {
      title: t('i18n.coverage') || 'Coverage',
      width: 90,
      render: (_: unknown, record: Record<string, unknown>) => {
        const count = getTranslatedCount(record);
        const total = LOCALE_FIELDS.length;
        const color = count === total ? 'green' : count > total / 2 ? 'orange' : 'red';
        return <Tag color={color}>{count}/{total}</Tag>;
      },
    },
    {
      title: t('common.operations'),
      width: 200,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
          <Tooltip title={t('i18n.autoTranslateTooltip') || 'Auto-translate zh-CN to all languages'}>
            <Button
              size="small"
              icon={<TranslationOutlined />}
              loading={translating === record.documentId}
              onClick={() => handleAutoTranslate(record.documentId as string)}
              disabled={!(record.zh_CN as string)?.trim()}
            />
          </Tooltip>
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
          <Select
            value={namespace}
            onChange={setNamespace}
            allowClear
            placeholder={t('i18n.filterNamespace') || 'Filter namespace'}
            style={{ width: 160 }}
          >
            {namespaces.map((ns) => (
              <Select.Option key={ns} value={ns}>{ns}</Select.Option>
            ))}
          </Select>
          <Input.Search
            placeholder={t('common.search')}
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            style={{ width: 240 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="documentId"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: setPage,
          showTotal: (t2) => t('common.total', { total: t2 }),
        }}
      />

      <Drawer
        title={editingId ? t('common.edit') : t('common.create')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('common.cancel')}</Button>
            {editingId && (
              <Button
                icon={<TranslationOutlined />}
                loading={translating === editingId}
                onClick={async () => {
                  await handleSave();
                  if (editingId) await handleAutoTranslate(editingId);
                }}
              >
                {t('i18n.saveAndTranslate') || 'Save & Translate'}
              </Button>
            )}
            <Button type="primary" onClick={handleSave}>{t('common.save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="key" label={t('i18n.key')} rules={[{ required: true }]}>
            <Input placeholder="e.g. nav.home, common.save" style={{ fontFamily: 'monospace' }} />
          </Form.Item>

          <Tabs
            items={[
              {
                key: 'main',
                label: `${t('i18n.zhCN')} / ${t('i18n.enUS')}`,
                children: (
                  <>
                    <Form.Item name="zh_CN" label={t('i18n.zhCN')}><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="en_US" label={t('i18n.enUS')}><Input.TextArea rows={2} /></Form.Item>
                  </>
                ),
              },
              {
                key: 'others',
                label: t('i18n.otherLanguages') || 'Other Languages',
                children: (
                  <>
                    {LOCALE_FIELDS.filter((f) => f !== 'zh_CN' && f !== 'en_US').map((field) => (
                      <Form.Item key={field} name={field} label={LOCALE_LABELS[field]}>
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
          />

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
