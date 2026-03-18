import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { hasLocale } from 'next-intl';
import { fetchI18nKeys, deepMerge } from '@/lib/api/i18n-keys';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Static messages from JSON files (fallback)
  const staticMessages = (await import(`../messages/${locale}.json`)).default;

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
