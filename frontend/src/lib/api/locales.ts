/**
 * Fetch enabled locales from Strapi + language-settings config.
 * Returns the list of locale codes that should be shown on the frontend.
 *
 * Logic:
 * 1. Fetch all locales from Strapi i18n plugin
 * 2. Fetch disabled locales from page-content "language-settings"
 * 3. Filter out disabled locales
 * 4. Fallback to ['zh-CN', 'en-US'] if API unavailable
 */

const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';

interface StrapiLocale {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

const FALLBACK_LOCALES = ['zh-CN', 'en-US'];

// Language metadata for display
export const LANGUAGE_META: Record<string, { label: string; native: string; flag: string; short: string }> = {
  'zh-CN': { label: '简体中文', native: 'Chinese (Simplified)', flag: '🇨🇳', short: '中文' },
  'en-US': { label: 'English', native: 'English (US)', flag: '🇺🇸', short: 'EN' },
  'en': { label: 'English', native: 'English', flag: '🇺🇸', short: 'EN' },
  'zh-TW': { label: '繁體中文', native: 'Chinese (Traditional)', flag: '🇹🇼', short: '繁中' },
  'de': { label: 'Deutsch', native: 'German', flag: '🇩🇪', short: 'DE' },
  'fr': { label: 'Français', native: 'French', flag: '🇫🇷', short: 'FR' },
  'es': { label: 'Español', native: 'Spanish', flag: '🇪🇸', short: 'ES' },
  'pt': { label: 'Português', native: 'Portuguese', flag: '🇵🇹', short: 'PT' },
  'ru': { label: 'Русский', native: 'Russian', flag: '🇷🇺', short: 'RU' },
  'ja': { label: '日本語', native: 'Japanese', flag: '🇯🇵', short: 'JA' },
  'ko': { label: '한국어', native: 'Korean', flag: '🇰🇷', short: 'KO' },
  'ar': { label: 'العربية', native: 'Arabic', flag: '🇸🇦', short: 'AR' },
  'it': { label: 'Italiano', native: 'Italian', flag: '🇮🇹', short: 'IT' },
};

export interface EnabledLocale {
  code: string;
  label: string;
  native: string;
  flag: string;
  short: string;
}

export async function fetchEnabledLocales(): Promise<EnabledLocale[]> {
  try {
    // Fetch from internal /api/locales proxy (reads SQLite, no auth needed)
    // Use absolute URL to avoid circular references in Server Components
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${SITE_URL}/api/locales`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('locales API failed');
    const allLocales: StrapiLocale[] = await res.json();
    if (!allLocales.length) throw new Error('empty locales');

    // Map to EnabledLocale (no disabled filtering needed — handled in /api/locales)
    const enabledLocales = allLocales.map((l) => {
        const meta = LANGUAGE_META[l.code];
        return {
          code: l.code,
          label: meta?.label ?? l.name ?? l.code,
          native: meta?.native ?? l.name ?? l.code,
          flag: meta?.flag ?? '🌐',
          short: meta?.short ?? l.code.toUpperCase(),
        };
      });

    // Ensure zh-CN is always first
    enabledLocales.sort((a, b) => {
      if (a.code === 'zh-CN') return -1;
      if (b.code === 'zh-CN') return 1;
      if (a.code === 'en-US') return -1;
      if (b.code === 'en-US') return 1;
      return a.code.localeCompare(b.code);
    });

    return enabledLocales.length > 0 ? enabledLocales : getFallbackLocales();
  } catch (err) {
    console.warn('[locales] Failed to fetch enabled locales, using fallback:', err);
    return getFallbackLocales();
  }
}

/**
 * Fetch locale codes for build-time generateStaticParams.
 * Returns just the code strings (not full EnabledLocale objects).
 * Falls back to core 8 locales if Strapi is unreachable.
 */
export async function getLocalesForBuild(): Promise<string[]> {
  try {
    const { execSync } = await import('child_process');
    const scriptPath = '/home/ec2-user/xuanheng-website/frontend/scripts/get-locales.py';
    const output = execSync(`python3 ${scriptPath}`, { encoding: 'utf-8', timeout: 5000 });
    const locales: StrapiLocale[] = JSON.parse(output.trim());
    const codes = locales.map((l) => l.code);
    return codes.length > 0 ? codes : FALLBACK_LOCALES;
  } catch {
    return FALLBACK_LOCALES;
  }
}

function getFallbackLocales(): EnabledLocale[] {
  return FALLBACK_LOCALES.map((code) => {
    const meta = LANGUAGE_META[code];
    return {
      code,
      label: meta?.label ?? code,
      native: meta?.native ?? code,
      flag: meta?.flag ?? '🌐',
      short: meta?.short ?? code,
    };
  });
}
