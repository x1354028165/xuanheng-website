import OpenCC from 'opencc-js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'zh-TW': '繁體中文',
  'de': 'Deutsch',
  'fr': 'Français',
  'pt': 'Português',
  'es': 'Español',
  'ru': 'Русский',
};

const TARGET_LOCALES = ['zh-TW', 'en-US', 'de', 'fr', 'pt', 'es', 'ru'];

const TRANSLATABLE_FIELDS = [
  'title', 'content', 'description', 'summary', 'tagline',
  'excerpt', 'question', 'answer', 'value',
];

const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });

// URL protection: extract → placeholder → translate → restore
const URL_REGEX = /https?:\/\/[^\s<>"\])+]+|\/uploads\/[^\s<>"\])+]+/g;

function protectUrls(text: string): { cleaned: string; urls: string[] } {
  const urls: string[] = [];
  const cleaned = text.replace(URL_REGEX, (match) => {
    urls.push(match);
    return `__URL_PLACEHOLDER_${urls.length - 1}__`;
  });
  return { cleaned, urls };
}

function restoreUrls(text: string, urls: string[]): string {
  return text.replace(/__URL_PLACEHOLDER_(\d+)__/g, (_, index) => {
    return urls[Number(index)] || '';
  });
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'zh-CN'
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }

  const { cleaned, urls } = protectUrls(text);

  const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
  const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是专业翻译，专注于能源管理/工业物联网领域术语。将${sourceLanguage}翻译为${targetLanguage}，保持专业术语准确，保留Markdown/HTML格式，只返回译文不要解释。Do NOT translate any URLs, image paths, file names, code variables, or HTML/markdown syntax.`,
        },
        {
          role: 'user',
          content: cleaned,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let translated = data.choices?.[0]?.message?.content?.trim();

  if (!translated) {
    throw new Error('DeepSeek API returned empty translation');
  }

  // Strip markdown code block wrappers DeepSeek may add
  translated = translated.replace(/^```[\w]*\n?/i, '').replace(/\n?```$/i, '').trim();

  return restoreUrls(translated, urls);
}

function convertToTW(text: string): string {
  return twConverter(text);
}

/**
 * Translation metadata structure stored on zh-CN locale entry:
 * {
 *   status: { [locale]: "auto" | "manual" | "outdated" },
 *   sourceTexts: { [locale]: { [field]: string } }
 * }
 */
interface TranslationMeta {
  status: Record<string, 'auto' | 'manual' | 'outdated'>;
  sourceTexts: Record<string, Record<string, string>>;
}

function getEmptyMeta(): TranslationMeta {
  return { status: {}, sourceTexts: {} };
}

function parseMeta(raw: unknown): TranslationMeta {
  if (raw && typeof raw === 'object' && 'status' in (raw as Record<string, unknown>)) {
    return raw as TranslationMeta;
  }
  return getEmptyMeta();
}

/**
 * Get translatable text fields from an entry
 */
function getTranslatableFields(entry: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const key of TRANSLATABLE_FIELDS) {
    const val = entry[key];
    if (typeof val === 'string' && val.trim()) {
      fields[key] = val;
    }
  }
  return fields;
}

/**
 * Check if source text changed for a locale by comparing current fields with stored sourceTexts
 */
function hasSourceChanged(
  currentFields: Record<string, string>,
  storedSourceTexts: Record<string, string> | undefined
): boolean {
  if (!storedSourceTexts) return true;
  for (const [key, value] of Object.entries(currentFields)) {
    if (storedSourceTexts[key] !== value) return true;
  }
  return false;
}

/**
 * Get enabled locales from Strapi i18n plugin
 */
async function getEnabledLocales(): Promise<string[]> {
  try {
    const locales = await strapi.plugin('i18n').service('locales').find();
    return (locales as Array<{ code: string }>)
      .map((l) => l.code)
      .filter((code) => code !== 'zh-CN');
  } catch {
    return TARGET_LOCALES;
  }
}

/**
 * Translate a single entry to all target languages with Strategy A:
 * 1. Save zh-CN → auto-translate all enabled languages
 * 2. Each translation stores sourceText (zh-CN original at translation time)
 * 3. Source unchanged → skip manual status entries
 * 4. Source changed → re-translate everything regardless of status
 * 5. Failure → keep old translation, log error
 *
 * Serial execution + 1s delay for DeepSeek (no Promise.all)
 */
async function translateEntry(
  documentId: string,
  uid: string,
  targetLocales?: string[],
): Promise<void> {
  // Fetch zh-CN source entry
  const sourceEntry = await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).findOne({
    documentId,
    locale: 'zh-CN',
  });

  if (!sourceEntry) {
    console.error(`[translate] Source entry not found: ${uid} / ${documentId}`);
    return;
  }

  const currentFields = getTranslatableFields(sourceEntry as Record<string, unknown>);
  if (Object.keys(currentFields).length === 0) {
    console.log(`[translate] No translatable fields found for ${uid} / ${documentId}`);
    return;
  }

  // Load existing translation metadata
  const meta = parseMeta((sourceEntry as Record<string, unknown>).translationMeta);

  // Determine target locales
  const locales = targetLocales ?? await getEnabledLocales();

  for (const locale of locales) {
    try {
      const localeStatus = meta.status[locale];
      const sourceChanged = hasSourceChanged(currentFields, meta.sourceTexts[locale]);

      // Strategy A rule 3: source unchanged + manual → skip
      if (!sourceChanged && localeStatus === 'manual') {
        console.log(`[translate] ⏭️ Skipping ${locale} (manual, source unchanged)`);
        continue;
      }

      const translatedData: Record<string, unknown> = {};

      if (locale === 'zh-TW') {
        // OpenCC local conversion, no API call
        for (const [key, value] of Object.entries(currentFields)) {
          translatedData[key] = convertToTW(value);
        }
      } else {
        // DeepSeek API: serial field-by-field translation
        for (const [key, value] of Object.entries(currentFields)) {
          translatedData[key] = await translateText(value, locale);
        }
      }

      // Write translated content via Strapi v5 Document Service
      await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).update({
        documentId,
        locale,
        data: translatedData,
      });

      // Update meta: mark as auto, store sourceTexts
      meta.status[locale] = 'auto';
      meta.sourceTexts[locale] = { ...currentFields };

      console.log(`[translate] ✅ ${uid} / ${documentId} → ${locale}`);

      // Rate limit: 1s delay for DeepSeek calls (not needed for zh-TW/OpenCC)
      if (locale !== 'zh-TW') {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error(`[translate] ❌ Translation failed [${locale}]:`, err);
      // Strategy A rule 5: keep old translation on failure
    }
  }

  // Persist updated translationMeta on zh-CN entry
  try {
    await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).update({
      documentId,
      locale: 'zh-CN',
      data: { translationMeta: meta } as Record<string, unknown>,
    });
  } catch (err) {
    console.error(`[translate] Failed to save translationMeta:`, err);
  }

  console.log(`[translate] Translation complete: ${uid} / ${documentId}`);
}

/**
 * Mark a locale's translation status as manual (called when user edits a translation directly)
 */
async function setManualStatus(
  documentId: string,
  uid: string,
  locale: string,
): Promise<void> {
  const sourceEntry = await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).findOne({
    documentId,
    locale: 'zh-CN',
  });
  if (!sourceEntry) return;

  const meta = parseMeta((sourceEntry as Record<string, unknown>).translationMeta);
  meta.status[locale] = 'manual';

  await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).update({
    documentId,
    locale: 'zh-CN',
    data: { translationMeta: meta } as Record<string, unknown>,
  });
}

/**
 * Get translation metadata for an entry
 */
async function getTranslationMeta(
  documentId: string,
  uid: string,
): Promise<TranslationMeta> {
  const sourceEntry = await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).findOne({
    documentId,
    locale: 'zh-CN',
  });
  if (!sourceEntry) return getEmptyMeta();
  return parseMeta((sourceEntry as Record<string, unknown>).translationMeta);
}

/**
 * Batch translate all entries of a content type to specific locales
 * Used when adding a new language
 */
async function batchTranslateContentType(
  uid: string,
  targetLocales: string[],
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  const entries = await strapi.documents(uid as Parameters<typeof strapi.documents>[0]).findMany({
    locale: 'zh-CN',
    limit: 500,
  });

  if (!entries || !Array.isArray(entries)) return { success: 0, failed: 0 };

  for (const entry of entries) {
    try {
      await translateEntry(
        (entry as Record<string, unknown>).documentId as string,
        uid,
        targetLocales,
      );
      success++;
    } catch (err) {
      console.error(`[translate] Batch translate failed for ${uid}:`, err);
      failed++;
    }
  }

  return { success, failed };
}

export default {
  translateText,
  translateEntry,
  setManualStatus,
  getTranslationMeta,
  batchTranslateContentType,
  getEnabledLocales,
  TARGET_LOCALES,
  TRANSLATABLE_FIELDS,
};
