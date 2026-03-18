import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Typography, message, Space, Tag, Switch, Popconfirm, Alert, Progress,
} from 'antd';
import { PlusOutlined, TranslationOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

interface LocaleItem {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
  isEnabled: boolean;
}

const LANGUAGE_LABELS: Record<string, string> = {
  'zh-CN': '简体中文 / Chinese (Simplified)',
  'en-US': 'English (US)',
  'en': 'English',
  'zh-TW': '繁體中文 / Chinese (Traditional)',
  'de': 'Deutsch / German',
  'fr': 'Français / French',
  'pt': 'Português / Portuguese',
  'es': 'Español / Spanish',
  'ru': 'Русский / Russian',
};

// Store enabled state in a page-config entry keyed "language-settings"
const SETTINGS_API = '/content-manager/collection-types/api::page-content.page-content';

export default function LanguagesPage() {
  const { t } = useTranslation();
  const [locales, setLocales] = useState<LocaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [batchTranslating, setBatchTranslating] = useState(false);
  const [disabledLocales, setDisabledLocales] = useState<string[]>([]);
  const [settingsDocId, setSettingsDocId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch language settings (disabled locales stored in page-content)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get(`${SETTINGS_API}?filters[pageKey][$eq]=language-settings&pageSize=1`);
      const results = res.data?.results ?? [];
      if (results.length > 0) {
        const entry = results[0] as Record<string, unknown>;
        setSettingsDocId(entry.documentId as string);
        const content = entry.content as Record<string, unknown> | null;
        setDisabledLocales(Array.isArray(content?.disabledLocales) ? content.disabledLocales as string[] : []);
      }
    } catch { /* settings may not exist yet */ }
  }, []);

  // Fetch locales from Strapi i18n plugin
  const fetchLocales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/i18n/locales');
      const data = Array.isArray(res.data) ? res.data : [];
      const mapped: LocaleItem[] = data.map((l: Record<string, unknown>) => ({
        id: l.id as number,
        code: l.code as string,
        name: (l.name as string) || LANGUAGE_LABELS[l.code as string] || (l.code as string),
        isDefault: l.isDefault as boolean,
        isEnabled: !disabledLocales.includes(l.code as string),
      }));
      setLocales(mapped);
    } catch {
      message.error(t('common.error') || 'Failed to load locales');
    } finally {
      setLoading(false);
    }
  }, [disabledLocales, t]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchLocales(); }, [fetchLocales]);

  const saveDisabledLocales = async (newDisabled: string[]) => {
    try {
      if (settingsDocId) {
        await api.put(`${SETTINGS_API}/${settingsDocId}`, {
          content: { disabledLocales: newDisabled },
        });
      } else {
        const res = await api.post(SETTINGS_API, {
          pageKey: 'language-settings',
          blockKey: 'disabled-locales',
          content: { disabledLocales: newDisabled },
          description: 'Language enable/disable settings',
        });
        setSettingsDocId((res.data as Record<string, unknown>).documentId as string);
      }
      setDisabledLocales(newDisabled);
      message.success(t('languages.settingsSaved') || 'Settings saved');
    } catch {
      message.error(t('languages.settingsFailed') || 'Failed to save settings');
    }
  };

  const handleToggleEnabled = async (code: string, enabled: boolean) => {
    if (code === 'zh-CN') {
      message.warning(t('languages.cannotDisableDefault') || 'Cannot disable default language');
      return;
    }
    const newDisabled = enabled
      ? disabledLocales.filter((c) => c !== code)
      : [...disabledLocales, code];
    await saveDisabledLocales(newDisabled);
  };

  const handleAddLocale = async () => {
    const values = await form.validateFields();
    const code = (values.code as string).trim();
    const name = (values.name as string)?.trim() || code;

    try {
      await api.post('/i18n/locales', { code, name, isDefault: false });
      message.success(`${t('languages.addSuccess') || 'Language added'}: ${code}`);
      setModalOpen(false);
      form.resetFields();

      // Trigger batch translation for the new locale
      setBatchTranslating(true);
      try {
        await api.post('/strapi/api/translate/batch', {
          targetLocales: [code],
        });
        message.info(t('languages.batchStarted') || 'Batch translation started in background');
      } catch {
        message.warning(t('languages.batchFailed') || 'Batch translation failed to start');
      } finally {
        setBatchTranslating(false);
      }

      fetchLocales();
    } catch {
      message.error(t('languages.addFailed') || 'Failed to add language');
    }
  };

  const handleDeleteLocale = async (id: number, code: string) => {
    try {
      await api.delete(`/i18n/locales/${id}`);
      message.success(`${t('languages.deleteSuccess') || 'Language deleted'}: ${code}`);
      fetchLocales();
    } catch {
      message.error(t('languages.deleteFailed') || 'Failed to delete language');
    }
  };

  const handleBatchTranslateAll = async () => {
    const enabledLocales = locales
      .filter((l) => !l.isDefault && !disabledLocales.includes(l.code))
      .map((l) => l.code);

    if (enabledLocales.length === 0) {
      message.warning(t('languages.noTargetLocales') || 'No target locales to translate');
      return;
    }

    setBatchTranslating(true);
    try {
      await api.post('/strapi/api/translate/batch', {
        targetLocales: enabledLocales,
      });
      message.success(t('languages.batchStarted') || 'Batch translation started in background');
    } catch {
      message.error(t('languages.batchFailed') || 'Batch translation failed');
    } finally {
      setBatchTranslating(false);
    }
  };

  const columns = [
    {
      title: t('languages.code') || 'Code',
      dataIndex: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: t('languages.name') || 'Name',
      dataIndex: 'name',
      render: (name: string, record: LocaleItem) => (
        <span>
          {LANGUAGE_LABELS[record.code] || name}
          {record.isDefault && <Tag color="gold" style={{ marginLeft: 8 }}>{t('languages.default') || 'Default'}</Tag>}
        </span>
      ),
    },
    {
      title: t('languages.enabled') || 'Enabled',
      width: 100,
      render: (_: unknown, record: LocaleItem) => (
        <Switch
          checked={!disabledLocales.includes(record.code)}
          disabled={record.code === 'zh-CN'}
          onChange={(checked) => handleToggleEnabled(record.code, checked)}
        />
      ),
    },
    {
      title: t('common.operations') || 'Actions',
      width: 120,
      render: (_: unknown, record: LocaleItem) => (
        <Space>
          {!record.isDefault && record.code !== 'zh-CN' && record.code !== 'en' && (
            <Popconfirm
              title={t('languages.confirmDelete') || 'Delete this language? All its translations will be lost.'}
              onConfirm={() => handleDeleteLocale(record.id, record.code)}
            >
              <Button size="small" danger>{t('common.delete') || 'Delete'}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('languages.title') || 'Language Management'}
        </Typography.Title>
        <Space>
          <Button
            icon={<TranslationOutlined />}
            loading={batchTranslating}
            onClick={handleBatchTranslateAll}
          >
            {t('languages.batchTranslateAll') || 'Batch Translate All'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchLocales}>
            {t('common.refresh') || 'Refresh'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t('languages.addLanguage') || 'Add Language'}
          </Button>
        </Space>
      </div>

      {batchTranslating && (
        <Alert
          type="info"
          message={t('languages.batchInProgress') || 'Batch translation is running in the background...'}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      <Table
        dataSource={locales}
        columns={columns}
        rowKey="code"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={t('languages.addLanguage') || 'Add Language'}
        open={modalOpen}
        onOk={handleAddLocale}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t('languages.addAndTranslate') || 'Add & Start Translation'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label={t('languages.code') || 'Language Code'}
            rules={[{ required: true, message: 'e.g. ja, ko, ar, it' }]}
          >
            <Input placeholder="e.g. ja, ko, ar" />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('languages.name') || 'Display Name'}
          >
            <Input placeholder="e.g. 日本語 / Japanese" />
          </Form.Item>
        </Form>
        <Alert
          type="info"
          message={t('languages.addNote') || 'After adding, batch translation will automatically start for all existing content.'}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}
