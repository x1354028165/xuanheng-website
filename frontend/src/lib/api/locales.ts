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
    // Read directly from SQLite — reliable, no auth needed, no circular fetch
    const { execSync } = await import('child_process');
    const output = execSync(
      `python3 -c "import sqlite3,json; conn=sqlite3.connect('/home/ec2-user/xuanheng-website/cms/.tmp/data.db'); rows=conn.execute('SELECT code,name FROM i18n_locale WHERE code != \\'en\\' ORDER BY id').fetchall(); print(json.dumps([{'code':r[0],'name':r[1],'isDefault':r[0]==\"zh-CN\"} for r in rows])); conn.close()"`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    const allLocales: StrapiLocale[] = JSON.parse(output.trim());

    // Fetch disabled locales from page-content settings (via Strapi API with token)
    let disabledLocales: string[] = [];
    try {
      // Use admin token to access page-content
      const adminLoginRes = await fetch(`${STRAPI_INTERNAL_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gmail.com', password: 'Admin1234!' }),
        signal: AbortSignal.timeout(3000),
      });
      const adminData = await adminLoginRes.json();
      const adminToken = adminData?.data?.token;
      const settingsRes = await fetch(
        `${STRAPI_INTERNAL_URL}/api/page-content?filters[pageKey][$eq]=language-settings&pagination[limit]=1`,
        {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 60 },
        }
      );
      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        const entries = settingsJson.data ?? [];
        if (entries.length > 0) {
          const content = entries[0].content as Record<string, unknown> | null;
          if (Array.isArray(content?.disabledLocales)) {
            disabledLocales = content.disabledLocales as string[];
          }
        }
      }
    } catch {
      // Settings may not exist yet — all locales enabled by default
    }

    // Filter and map to EnabledLocale
    const enabledLocales = allLocales
      .filter((l) => !disabledLocales.includes(l.code))
      .map((l) => {
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
    // Read directly from SQLite for build-time reliability
    const { execSync } = await import('child_process');
    const output = execSync(
      `python3 -c "import sqlite3,json; conn=sqlite3.connect('/home/ec2-user/xuanheng-website/cms/.tmp/data.db'); rows=conn.execute('SELECT code FROM i18n_locale WHERE code != \\'en\\' ORDER BY id').fetchall(); print(json.dumps([r[0] for r in rows])); conn.close()"`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    const codes: string[] = JSON.parse(output.trim());
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
