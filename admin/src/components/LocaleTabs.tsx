import { useEffect, useState, useCallback } from 'react';
import { Segmented, Tag, Tooltip, Space, Button, message } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import api from '../lib/axios';

interface TranslationMeta {
  status: Record<string, 'auto' | 'manual' | 'outdated'>;
  sourceTexts: Record<string, Record<string, string>>;
}

const STATUS_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  auto: { icon: '🤖', label: 'Auto translated', color: 'blue' },
  manual: { icon: '✏️', label: 'Manually edited', color: 'green' },
  outdated: { icon: '⚠️', label: 'Source updated, needs re-translation', color: 'orange' },
};

const LOCALE_LABELS: Record<string, string> = {
  'zh-CN': '中文',
  'en-US': 'EN',
  'zh-TW': '繁中',
  'de': 'DE',
  'fr': 'FR',
  'pt': 'PT',
  'es': 'ES',
  'ru': 'RU',
  'ar': 'AR',
  'ja': 'JA',
  'ko': 'KO',
  'it': 'IT',
  'nl': 'NL',
  'tr': 'TR',
};

// Fallback list — dynamically fetched from Strapi at runtime
const FALLBACK_LOCALES = ['zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'es', 'pt', 'ru'];

interface LocaleTabsProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  documentId?: string | null;
  uid?: string;
  showTranslateButton?: boolean;
}

export function useTranslationMeta(documentId: string | null, uid: string) {
  const [meta, setMeta] = useState<TranslationMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMeta = useCallback(async () => {
    if (!documentId || !uid) return;
    setLoading(true);
    try {
      // uid uses ~ instead of . for URL safety
      const safeUid = uid.replace(/\./g, '~');
      const res = await api.get(`/strapi/api/translate/meta/${safeUid}/${documentId}`);
      setMeta(res.data as TranslationMeta);
    } catch {
      // Meta may not exist yet
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [documentId, uid]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  return { meta, loading, refetchMeta: fetchMeta };
}

export function markAsManual(documentId: string, uid: string, locale: string) {
  return api.post('/strapi/api/translate/set-manual', { documentId, uid, locale })
    .catch(() => { /* silent */ });
}

export function triggerTranslateEntry(documentId: string, uid: string, targetLocales?: string[]) {
  return api.post('/strapi/api/translate/entry', { documentId, uid, targetLocales });
}

export default function LocaleTabs({
  currentLocale,
  onLocaleChange,
  documentId,
  uid,
  showTranslateButton = true,
}: LocaleTabsProps) {
  const { meta } = useTranslationMeta(documentId ?? null, uid ?? '');
  const [translating, setTranslating] = useState(false);
  const [allLocales, setAllLocales] = useState<string[]>(FALLBACK_LOCALES);

  // 动态从 Strapi 获取启用的语言列表
  useEffect(() => {
    api.get('/i18n/locales').then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      const codes: string[] = data
        .filter((l: Record<string, unknown>) => l.code !== 'en')
        .map((l: Record<string, unknown>) => l.code as string);
      if (codes.length > 0) setAllLocales(codes);
    }).catch(() => { /* 保持 fallback */ });
  }, []);

  const handleTranslate = async () => {
    if (!documentId || !uid) return;
    setTranslating(true);
    try {
      await triggerTranslateEntry(documentId, uid);
      message.success('Translation started in background');
    } catch {
      message.error('Translation failed to start');
    } finally {
      setTranslating(false);
    }
  };

  const options = allLocales.map((locale) => {
    const statusInfo = meta?.status[locale] ? STATUS_ICONS[meta.status[locale]] : null;
    const label = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {LOCALE_LABELS[locale] || locale}
        {locale !== 'zh-CN' && statusInfo && (
          <Tooltip title={statusInfo.label}>
            <span style={{ fontSize: 12 }}>{statusInfo.icon}</span>
          </Tooltip>
        )}
      </span>
    );
    return { label, value: locale };
  });

  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
      <Segmented
        value={currentLocale}
        onChange={(val) => onLocaleChange(val as string)}
        options={options}
        size="small"
      />
      {showTranslateButton && documentId && uid && (
        <Button
          size="small"
          icon={<TranslationOutlined />}
          loading={translating}
          onClick={handleTranslate}
        >
          Translate
        </Button>
      )}
    </Space>
  );
}

export function FieldStatusTag({ meta, locale, field: _field }: {
  meta: TranslationMeta | null;
  locale: string;
  field: string;
}) {
  if (!meta || locale === 'zh-CN') return null;
  const status = meta.status[locale];
  if (!status) return null;
  const info = STATUS_ICONS[status];
  return (
    <Tooltip title={info.label}>
      <Tag color={info.color} style={{ marginLeft: 4, fontSize: 11, padding: '0 4px' }}>
        {info.icon}
      </Tag>
    </Tooltip>
  );
}
