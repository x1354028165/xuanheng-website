/**
 * Fetch UI dictionary keys from Strapi i18n-keys collection.
 * Returns a flat Record<string, string> for a given locale.
 * Used to dynamically override static messages/*.json entries.
 */

const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';

// Mapping from routing locale codes to Strapi i18n_key column names
const LOCALE_TO_FIELD: Record<string, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'en-US': 'en_US',
  'de': 'de',
  'fr': 'fr',
  'pt': 'pt',
  'es': 'es',
  'ru': 'ru',
};

interface I18nKeyEntry {
  key: string;
  zh_CN: string | null;
  zh_TW: string | null;
  en_US: string | null;
  de: string | null;
  fr: string | null;
  pt: string | null;
  es: string | null;
  ru: string | null;
  status: string;
}

/**
 * Fetch all approved i18n keys from Strapi and return as nested object
 * for the given locale (matching next-intl message structure).
 *
 * Keys like "nav.home" become { nav: { home: "value" } }
 */
export async function fetchI18nKeys(locale: string): Promise<Record<string, unknown>> {
  const field = LOCALE_TO_FIELD[locale];
  if (!field) return {};

  try {
    const url = `${STRAPI_INTERNAL_URL}/api/i18n-keys?pagination[limit]=500&filters[status][$eq]=approved`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) return {};

    const json = await res.json();
    const entries: I18nKeyEntry[] = json.data ?? [];

    const result: Record<string, unknown> = {};

    for (const entry of entries) {
      const value = entry[field as keyof I18nKeyEntry] as string | null;
      if (!value || !value.trim()) continue;

      // Convert dot-notation key to nested object
      const parts = entry.key.split('.');
      let current: Record<string, unknown> = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
    }

    return result;
  } catch (err) {
    console.warn('[i18n-keys] Failed to fetch dynamic keys:', err);
    return {};
  }
}

/**
 * Deep merge two objects. `override` values take precedence.
 */
export function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      key in result &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      typeof override[key] === 'object' &&
      override[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        override[key] as Record<string, unknown>
      );
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
