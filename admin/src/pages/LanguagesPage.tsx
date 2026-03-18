import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Select, Typography, message, Space, Tag, Switch, Popconfirm, Alert,
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

interface WorldLanguage {
  code: string;
  zh: string;
  en: string;
  flag: string;
}

const WORLD_LANGUAGES: WorldLanguage[] = [
  { code: 'af', zh: '南非荷兰语', en: 'Afrikaans', flag: '🇿🇦' },
  { code: 'ar', zh: '阿拉伯语', en: 'Arabic', flag: '🇸🇦' },
  { code: 'az', zh: '阿塞拜疆语', en: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'be', zh: '白俄罗斯语', en: 'Belarusian', flag: '🇧🇾' },
  { code: 'bg', zh: '保加利亚语', en: 'Bulgarian', flag: '🇧🇬' },
  { code: 'bn', zh: '孟加拉语', en: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', zh: '波斯尼亚语', en: 'Bosnian', flag: '🇧🇦' },
  { code: 'ca', zh: '加泰罗尼亚语', en: 'Catalan', flag: '🇪🇸' },
  { code: 'cs', zh: '捷克语', en: 'Czech', flag: '🇨🇿' },
  { code: 'cy', zh: '威尔士语', en: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'da', zh: '丹麦语', en: 'Danish', flag: '🇩🇰' },
  { code: 'de', zh: '德语', en: 'German', flag: '🇩🇪' },
  { code: 'el', zh: '希腊语', en: 'Greek', flag: '🇬🇷' },
  { code: 'en', zh: '英语', en: 'English', flag: '🇬🇧' },
  { code: 'en-US', zh: '美式英语', en: 'English (US)', flag: '🇺🇸' },
  { code: 'es', zh: '西班牙语', en: 'Spanish', flag: '🇪🇸' },
  { code: 'et', zh: '爱沙尼亚语', en: 'Estonian', flag: '🇪🇪' },
  { code: 'fa', zh: '波斯语', en: 'Persian', flag: '🇮🇷' },
  { code: 'fi', zh: '芬兰语', en: 'Finnish', flag: '🇫🇮' },
  { code: 'fil', zh: '菲律宾语', en: 'Filipino', flag: '🇵🇭' },
  { code: 'fr', zh: '法语', en: 'French', flag: '🇫🇷' },
  { code: 'ga', zh: '爱尔兰语', en: 'Irish', flag: '🇮🇪' },
  { code: 'he', zh: '希伯来语', en: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', zh: '印地语', en: 'Hindi', flag: '🇮🇳' },
  { code: 'hr', zh: '克罗地亚语', en: 'Croatian', flag: '🇭🇷' },
  { code: 'hu', zh: '匈牙利语', en: 'Hungarian', flag: '🇭🇺' },
  { code: 'id', zh: '印度尼西亚语', en: 'Indonesian', flag: '🇮🇩' },
  { code: 'is', zh: '冰岛语', en: 'Icelandic', flag: '🇮🇸' },
  { code: 'it', zh: '意大利语', en: 'Italian', flag: '🇮🇹' },
  { code: 'ja', zh: '日语', en: 'Japanese', flag: '🇯🇵' },
  { code: 'ka', zh: '格鲁吉亚语', en: 'Georgian', flag: '🇬🇪' },
  { code: 'kk', zh: '哈萨克语', en: 'Kazakh', flag: '🇰🇿' },
  { code: 'km', zh: '高棉语', en: 'Khmer', flag: '🇰🇭' },
  { code: 'ko', zh: '韩语', en: 'Korean', flag: '🇰🇷' },
  { code: 'lt', zh: '立陶宛语', en: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lv', zh: '拉脱维亚语', en: 'Latvian', flag: '🇱🇻' },
  { code: 'mk', zh: '马其顿语', en: 'Macedonian', flag: '🇲🇰' },
  { code: 'mn', zh: '蒙古语', en: 'Mongolian', flag: '🇲🇳' },
  { code: 'ms', zh: '马来语', en: 'Malay', flag: '🇲🇾' },
  { code: 'my', zh: '缅甸语', en: 'Burmese', flag: '🇲🇲' },
  { code: 'nb', zh: '挪威语', en: 'Norwegian', flag: '🇳🇴' },
  { code: 'nl', zh: '荷兰语', en: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', zh: '波兰语', en: 'Polish', flag: '🇵🇱' },
  { code: 'pt', zh: '葡萄牙语', en: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-BR', zh: '巴西葡萄牙语', en: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'ro', zh: '罗马尼亚语', en: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', zh: '俄语', en: 'Russian', flag: '🇷🇺' },
  { code: 'sk', zh: '斯洛伐克语', en: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', zh: '斯洛文尼亚语', en: 'Slovenian', flag: '🇸🇮' },
  { code: 'sq', zh: '阿尔巴尼亚语', en: 'Albanian', flag: '🇦🇱' },
  { code: 'sr', zh: '塞尔维亚语', en: 'Serbian', flag: '🇷🇸' },
  { code: 'sv', zh: '瑞典语', en: 'Swedish', flag: '🇸🇪' },
  { code: 'sw', zh: '斯瓦希里语', en: 'Swahili', flag: '🇹🇿' },
  { code: 'ta', zh: '泰米尔语', en: 'Tamil', flag: '🇮🇳' },
  { code: 'th', zh: '泰语', en: 'Thai', flag: '🇹🇭' },
  { code: 'tr', zh: '土耳其语', en: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', zh: '乌克兰语', en: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', zh: '乌尔都语', en: 'Urdu', flag: '🇵🇰' },
  { code: 'uz', zh: '乌兹别克语', en: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', zh: '越南语', en: 'Vietnamese', flag: '🇻🇳' },
  { code: 'zh-CN', zh: '简体中文', en: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', zh: '繁体中文', en: 'Chinese (Traditional)', flag: '🇹🇼' },
];

// Store enabled state in a page-config entry keyed "language-settings"
// Strapi v5: use /api/page-content (public API with admin token via axios interceptor)
const SETTINGS_API = '/api/page-content';

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
      // Strapi v5: filters use bracket notation, response has data array
      const res = await api.get(`${SETTINGS_API}?filters[pageKey][$eq]=language-settings&pagination[limit]=1`);
      const results = res.data?.data ?? res.data?.results ?? [];
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
        // Strapi v5: PUT /api/page-content/:documentId
        await api.put(`${SETTINGS_API}/${settingsDocId}`, {
          data: { content: { disabledLocales: newDisabled } },
        });
      } else {
        const res = await api.post(SETTINGS_API, {
          data: {
            pageKey: 'language-settings',
            blockKey: 'disabled-locales',
            content: { disabledLocales: newDisabled },
            description: 'Language enable/disable settings',
          },
        });
        // Strapi v5 response: { data: { documentId, ... } }
        const entry = (res.data?.data ?? res.data) as Record<string, unknown>;
        setSettingsDocId(entry.documentId as string);
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

  const existingCodes = locales.map((l) => l.code);

  const handleAddLocale = async () => {
    const values = await form.validateFields();
    const code = (values.code as string).trim();
    const lang = WORLD_LANGUAGES.find((l) => l.code === code);
    const name = lang ? `${lang.zh} / ${lang.en}` : code;

    try {
      await api.post('/i18n/locales', { code, name, isDefault: false });
      message.success(`${t('languages.addSuccess') || 'Language added'}: ${code}`);
      setModalOpen(false);
      form.resetFields();

      // Trigger batch translation for the new locale (content + UI keys)
      setBatchTranslating(true);
      try {
        // Translate content (products, articles, solutions, etc.)
        await api.post('/strapi/api/translate/batch', {
          targetLocales: [code],
        });
        // Translate UI dictionary keys
        await api.post('/strapi/api/translate/batch-ui-keys', {
          targetLocale: code,
        });
        message.info(t('languages.batchStarted') || 'Batch translation started in background (content + UI keys)');
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
      // Translate content
      await api.post('/strapi/api/translate/batch', {
        targetLocales: enabledLocales,
      });
      // Translate UI keys for each locale
      for (const locale of enabledLocales) {
        await api.post('/strapi/api/translate/batch-ui-keys', {
          targetLocale: locale,
        });
      }
      message.success(t('languages.batchStarted') || 'Batch translation started in background (content + UI keys)');
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
            rules={[{ required: true, message: t('common.required') || 'Required' }]}
          >
            <Select
              showSearch
              placeholder={t('languages.code') || 'Select a language'}
              filterOption={(input, option) => {
                const lang = WORLD_LANGUAGES.find((l) => l.code === option?.value);
                if (!lang) return false;
                const lower = input.toLowerCase();
                return (
                  lang.code.toLowerCase().includes(lower) ||
                  lang.zh.includes(input) ||
                  lang.en.toLowerCase().includes(lower)
                );
              }}
              options={WORLD_LANGUAGES.map((lang) => ({
                value: lang.code,
                label: `${lang.flag} ${lang.zh} (${lang.en}) — ${lang.code}`,
                disabled: existingCodes.includes(lang.code),
              }))}
            />
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
