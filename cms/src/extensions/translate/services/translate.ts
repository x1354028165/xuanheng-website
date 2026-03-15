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

const OPENCC_WHITELIST = [
  'title', 'content', 'description', 'summary', 'tagline',
  'excerpt', 'question', 'answer', 'value',
];

const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });

// URL 保护：提取 → 替换占位 → 翻译 → 还原
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

  // 强制剥离 DeepSeek 可能包裹的 markdown 代码块标记
  translated = translated.replace(/^```[\w]*\n?/i, '').replace(/\n?```$/i, '').trim();

  return restoreUrls(translated, urls);
}

function convertToTW(text: string): string {
  return twConverter(text);
}

/**
 * 获取 content type 中需要翻译的文本字段
 */
function getTranslatableFields(entry: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const key of OPENCC_WHITELIST) {
    const val = entry[key];
    if (typeof val === 'string' && val.trim()) {
      fields[key] = val;
    }
  }
  return fields;
}

/**
 * 翻译单条内容到所有目标语言
 * 铁律：串行翻译 + 1秒间隔，禁止 Promise.all
 */
async function translateEntry(
  documentId: string,
  uid: string,
  targetLocales: string[] = TARGET_LOCALES,
): Promise<void> {
  // 从 zh-CN 源获取完整数据
  const sourceEntry = await strapi.documents(uid as any).findOne({
    documentId,
    locale: 'zh-CN',
  });

  if (!sourceEntry) {
    console.error(`[translate] Source entry not found: ${uid} / ${documentId}`);
    return;
  }

  const translatableFields = getTranslatableFields(sourceEntry as Record<string, unknown>);
  if (Object.keys(translatableFields).length === 0) {
    console.log(`[translate] No translatable fields found for ${uid} / ${documentId}`);
    return;
  }

  for (const locale of targetLocales) {
    try {
      const translatedData: Record<string, string> = {};

      if (locale === 'zh-TW') {
        // OpenCC 本地转换，不调 DeepSeek
        for (const [key, value] of Object.entries(translatableFields)) {
          translatedData[key] = convertToTW(value);
        }
      } else {
        // DeepSeek API 串行翻译每个字段
        for (const [key, value] of Object.entries(translatableFields)) {
          translatedData[key] = await translateText(value, locale);
        }
      }

      // 使用 Strapi v5 Document Service 写入
      await strapi.documents(uid as any).update({
        documentId,
        locale,
        data: translatedData,
      });

      console.log(`[translate] ✅ ${uid} / ${documentId} → ${locale}`);

      // 非 zh-TW 翻译后等待 1 秒，避免触发 DeepSeek 速率限制
      if (locale !== 'zh-TW') {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error(`[translate] ❌ 翻译失败 [${locale}]:`, err);
      // 单个语言失败不影响其他语言继续翻译
    }
  }

  console.log(`[translate] 翻译完成: ${uid} / ${documentId}`);
}

export default {
  translateText,
  translateEntry,
};
