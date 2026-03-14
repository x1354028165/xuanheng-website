import { defineRouting } from 'next-intl/routing';

export const locales = ['zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'pt', 'es', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

export const routing = defineRouting({
  locales,
  defaultLocale,
});
