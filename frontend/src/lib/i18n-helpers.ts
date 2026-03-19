// Direct message access for product/solution translations
// This bypasses next-intl's getTranslations which has issues with dynamically-constructed keys in production

import zhCN from '@/messages/zh-CN.json';
import enUS from '@/messages/en-US.json';
import zhTW from '@/messages/zh-TW.json';
import de from '@/messages/de.json';
import fr from '@/messages/fr.json';
import pt from '@/messages/pt.json';
import es from '@/messages/es.json';
import ru from '@/messages/ru.json';
import ar from '@/messages/ar.json';
import ja from '@/messages/ja.json';

type Messages = typeof zhCN;

const messageMap: Record<string, Messages> = {
  'zh-CN': zhCN as unknown as Messages,
  'en-US': enUS as unknown as Messages,
  'zh-TW': zhTW as unknown as Messages,
  'de': de as unknown as Messages,
  'fr': fr as unknown as Messages,
  'pt': pt as unknown as Messages,
  'es': es as unknown as Messages,
  'ru': ru as unknown as Messages,
  'ar': ar as unknown as Messages,
  'ja': ja as unknown as Messages,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function getProductMessage(locale: string, slug: string, field: string): string | undefined {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  return getNestedValue(messages.products as unknown as Record<string, unknown>, `${slug}.${field}`);
}

export function getProductLabel(locale: string, field: string): string {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  const value = getNestedValue(messages.products as unknown as Record<string, unknown>, field);
  return value ?? field;
}

export function getSpecLabel(locale: string, key: string): string {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  const value = getNestedValue(messages.products as unknown as Record<string, unknown>, `specLabels.${key}`);
  return value ?? key;
}

export function getSolutionMessage(locale: string, slug: string, field: string): string | undefined {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  return getNestedValue(messages.solutions as unknown as Record<string, unknown>, `${slug}.${field}`);
}

export function getSolutionLabel(locale: string, field: string): string {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  const value = getNestedValue(messages.solutions as unknown as Record<string, unknown>, field);
  return value ?? field;
}

// Get arbitrary JSON data from messages (for complex structures like arrays/objects)
export function getProductData(locale: string, path: string): unknown {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  return getNestedValue(messages.products as unknown as Record<string, unknown>, path) ??
    getNestedValue((messageMap['zh-CN']).products as unknown as Record<string, unknown>, path);
}

export function getSolutionData(locale: string, path: string): unknown {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  return getNestedValue(messages.solutions as unknown as Record<string, unknown>, path) ??
    getNestedValue((messageMap['zh-CN']).solutions as unknown as Record<string, unknown>, path);
}

export function getHelpMessage(locale: string, field: string): string {
  const messages = messageMap[locale] ?? messageMap['zh-CN'];
  const value = getNestedValue(messages as unknown as Record<string, unknown>, `help.${field}`);
  return value ?? getNestedValue(messageMap['zh-CN'] as unknown as Record<string, unknown>, `help.${field}`) ?? field;
}

// Interpolation helper for patterns like "{title} User Manual"
export function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  }
  return result;
}
