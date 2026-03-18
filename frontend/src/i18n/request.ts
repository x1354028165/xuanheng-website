import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { hasLocale } from 'next-intl';
import { fetchI18nKeys, deepMerge } from '@/lib/api/i18n-keys';

/** Locale codes that have a local messages/*.json file */
const LOCALES_WITH_JSON = new Set([
  'zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'es', 'pt', 'ru',
]);

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Accept any locale in the superset; fall back to default only if truly unknown
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Static messages from JSON files (fallback)
  // For locales without a local file, use zh-CN as base template
  const jsonLocale = LOCALES_WITH_JSON.has(locale) ? locale : 'zh-CN';
  const staticMessages = (await import(`../messages/${jsonLocale}.json`)).default;

  // Dynamic messages from Strapi i18n-keys (override)
  let dynamicMessages: Record<string, unknown> = {};
  try {
    dynamicMessages = await fetchI18nKeys(locale);
  } catch {
    // Strapi unavailable — use static messages only
  }

  // Merge: dynamic keys override static keys
  const messages = Object.keys(dynamicMessages).length > 0
    ? deepMerge(staticMessages, dynamicMessages) as typeof staticMessages
    : staticMessages;

  return {
    locale,
    messages,
  };
});
