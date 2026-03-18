import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Drawer, Form, Space, Popconfirm, Typography, message, Select, Tag, Tabs, Tooltip, Segmented,
} from 'antd';
import { PlusOutlined, TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::i18n-key.i18n-key';

const DEFAULT_LOCALE_LABELS: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文',
  'en-US': 'English',
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
  const [locales, setLocales] = useState<string[]>([]);
  const [localeLabels, setLocaleLabels] = useState<Record<string, string>>(DEFAULT_LOCALE_LABELS);
  const [form] = Form.useForm();

  // Fetch available locales from Strapi i18n plugin
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/i18n/locales');
        const items = Array.isArray(res.data) ? res.data : [];
        const codes = items.map((l: Record<string, unknown>) => l.code as string);
        setLocales(codes);
        const labels: Record<string, string> = { ...DEFAULT_LOCALE_LABELS };
        for (const item of items) {
          const rec = item as Record<string, unknown>;
          const code = rec.code as string;
          if (!labels[code]) {
            labels[code] = (rec.name as string) || code;
          }
        }
        setLocaleLabels(labels);
      } catch {
        setLocales(['zh-CN', 'zh-TW', 'en-US', 'de', 'fr', 'pt', 'es', 'ru']);
      }
    })();
  }, []);

  // Fetch namespace list once on mount
  useEffect(() => {
    (async () => {
      try {
        const allRes = await api.get(`${API_URL}?pageSize=1&sort=key:asc`);
        const totalCount = allRes.data?.pagination?.total ?? 0;
        if (totalCount > 0) {
          const fullRes = await api.get(`${API_URL}?pageSize=${totalCount}&sort=key:asc&fields[0]=key&fields[1]=namespace`);
          const allItems = (fullRes.data?.results ?? []) as Record<string, unknown>[];
          const nsSet = new Set(allItems.map((item) => (item.namespace as string) || getNamespace(item.key as string)));
          setNamespaces(Array.from(nsSet).sort());
        }
      } catch { /* */ }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?page=${page}&pageSize=20&sort=key:asc`;
      if (search) url += `&_q=${encodeURIComponent(search)}`;
      if (namespace) url += `&filters[$and][0][namespace][$eq]=${encodeURIComponent(namespace)}`;

      const res = await api.get(url);
      const results = (res.data?.results ?? []) as Record<string, unknown>[];

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
    // Flatten translations into form fields with "translations." prefix
    const translations = (record.translations ?? {}) as Record<string, string>;
    const formValues: Record<string, unknown> = {
      key: record.key,
      namespace: record.namespace,
    };
    for (const [locale, value] of Object.entries(translations)) {
      formValues[`translations.${locale}`] = value;
    }
    form.setFieldsValue(formValues);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    // Build translations object from form fields
    const translations: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (k.startsWith('translations.') && typeof v === 'string' && v.trim()) {
        const locale = k.replace('translations.', '');
        translations[locale] = v.trim();
      }
    }
    const payload = {
      key: values.key,
      namespace: values.namespace || (values.key as string).split('.')[0],
      translations,
      sourceText: translations['zh-CN'] || '',
    };
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, payload);
      } else {
        await api.post(API_URL, payload);
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
    const translations = (record.translations ?? {}) as Record<string, string>;
    return locales.filter((locale) => {
      const val = translations[locale];
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
    {
      title: t('i18n.zhCN'),
      width: 150,
      ellipsis: true,
      render: (_: unknown, record: Record<string, unknown>) => {
        const translations = (record.translations ?? {}) as Record<string, string>;
        return translations['zh-CN'] || '';
      },
    },
    {
      title: t('i18n.enUS'),
      width: 150,
      ellipsis: true,
      render: (_: unknown, record: Record<string, unknown>) => {
        const translations = (record.translations ?? {}) as Record<string, string>;
        return translations['en-US'] || '';
      },
    },
    {
      title: t('i18n.coverage') || 'Coverage',
      width: 90,
      render: (_: unknown, record: Record<string, unknown>) => {
        const count = getTranslatedCount(record);
        const totalLocales = locales.length;
        const color = count === totalLocales ? 'green' : count > totalLocales / 2 ? 'orange' : 'red';
        return <Tag color={color}>{count}/{totalLocales}</Tag>;
      },
    },
    {
      title: t('common.operations'),
      width: 200,
      render: (_: unknown, record: Record<string, unknown>) => {
        const translations = (record.translations ?? {}) as Record<string, string>;
        return (
          <Space>
            <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
            <Tooltip title={t('i18n.autoTranslateTooltip') || 'Auto-translate zh-CN to all languages'}>
              <Button
                size="small"
                icon={<TranslationOutlined />}
                loading={translating === record.documentId}
                onClick={() => handleAutoTranslate(record.documentId as string)}
                disabled={!translations['zh-CN']?.trim()}
              />
            </Tooltip>
            <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete(record.documentId as string)}>
              <Button size="small" danger>{t('common.delete')}</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.i18nDict')}</Typography.Title>
          <Space>
            <Input.Search
              placeholder={t('common.search')}
              allowClear
              onSearch={(v) => { setSearch(v); setPage(1); }}
              style={{ width: 240 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button>
          </Space>
        </div>
        {namespaces.length > 0 && (
          <Segmented
            value={namespace ?? '__all__'}
            onChange={(val) => { setNamespace(val === '__all__' ? null : val as string); setPage(1); }}
            options={[
              { label: t('i18n.filterNamespace') || '全部', value: '__all__' },
              ...namespaces.map((ns) => ({ label: ns, value: ns })),
            ]}
            style={{ overflowX: 'auto' }}
          />
        )}
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
                    <Form.Item name="translations.zh-CN" label={t('i18n.zhCN')}><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="translations.en-US" label={t('i18n.enUS')}><Input.TextArea rows={2} /></Form.Item>
                  </>
                ),
              },
              {
                key: 'others',
                label: t('i18n.otherLanguages') || 'Other Languages',
                children: (
                  <>
                    {locales
                      .filter((code) => code !== 'zh-CN' && code !== 'en-US')
                      .map((code) => (
                        <Form.Item key={code} name={`translations.${code}`} label={localeLabels[code] || code}>
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      ))}
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    </div>
  );
}
