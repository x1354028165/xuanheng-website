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

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'zh-CN'
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }

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
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text. No explanations. No extra content. No markdown formatting. No code blocks. CRITICAL: Do NOT translate any URLs, image paths, file names, code variables, or HTML/markdown syntax. For example in `![alt](/uploads/img.png)`, translate the alt text but keep `/uploads/img.png` exactly unchanged.`,
        },
        {
          role: 'user',
          content: text,
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

  const data = await response.json();
  let translated = data.choices?.[0]?.message?.content?.trim();

  if (!translated) {
    throw new Error('DeepSeek API returned empty translation');
  }

  // 强制剥离 DeepSeek 可能手动包裹的 markdown 代码块标记
  translated = translated.replace(/^```[\w]*\n?/i, '').replace(/\n?```$/i, '').trim();

  return translated;
}
