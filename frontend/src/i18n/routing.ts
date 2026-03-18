import { defineRouting } from 'next-intl/routing';

/**
 * Superset of all possible locale codes.
 * This list is intentionally exhaustive so that next-intl's routing layer
 * accepts any language added via the Strapi admin panel — no redeployment needed.
 * The actual set of *enabled* locales is determined dynamically at runtime
 * from Strapi's /api/i18n/locales endpoint.
 */
export const locales = [
  // Core languages
  'zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'pt', 'es', 'ru',
  // Extended — mirrors admin WORLD_LANGUAGES list
  'af', 'ar', 'az', 'be', 'bg', 'bn', 'bs', 'ca', 'cs', 'cy',
  'da', 'el', 'en', 'et', 'fa', 'fi', 'fil', 'ga', 'he', 'hi',
  'hr', 'hu', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'ko',
  'lt', 'lv', 'mk', 'mn', 'ms', 'my', 'nb', 'nl', 'pl', 'pt-BR',
  'ro', 'sk', 'sl', 'sq', 'sr', 'sv', 'sw', 'ta', 'th', 'tr',
  'uk', 'ur', 'uz', 'vi',
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // 强制所有语言带前缀，确保 SEO URL 树绝对对称
});
