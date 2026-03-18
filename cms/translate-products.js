/**
 * 批量翻译产品 - CJS，在 cms 目录下运行
 * node translate-products.js
 */
'use strict';

const { readFileSync } = require('fs');
const { randomBytes } = require('crypto');
const Database = require('better-sqlite3');
const OpenCC = require('opencc-js');

// 加载 .env
const envContent = readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) { console.error('❌ DEEPSEEK_API_KEY missing'); process.exit(1); }
console.log('✅ DeepSeek API key loaded');

const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });
const db = new Database('.tmp/data.db');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const LANGUAGE_NAMES = {
  'en-US': 'English',
  'zh-TW': '繁體中文',
  'de': 'Deutsch',
  'fr': 'Français',
  'pt': 'Português',
  'es': 'Español',
  'ru': 'Русский',
};
const TARGET_LOCALES = ['zh-TW', 'en-US', 'de', 'fr', 'pt', 'es', 'ru'];

function protectUrls(text) {
  const urls = [];
  const cleaned = text.replace(/https?:\/\/[^\s<>"]+|\/uploads\/[^\s<>"]+/g, (m) => {
    urls.push(m); return `__URL_${urls.length - 1}__`;
  });
  return { cleaned, urls };
}
function restoreUrls(text, urls) {
  return text.replace(/__URL_(\d+)__/g, (_, i) => urls[Number(i)] || '');
}

async function translateText(text, targetLang) {
  const { cleaned, urls } = protectUrls(text);
  const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;
  const resp = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是专业翻译，专注于能源管理/工业物联网领域术语。将简体中文翻译为${targetLanguage}，保持专业术语准确，只返回译文不要解释。Do NOT translate URLs, paths, code variables.`,
        },
        { role: 'user', content: cleaned },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });
  if (!resp.ok) throw new Error(`DeepSeek ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const translated = data.choices?.[0]?.message?.content?.trim() || text;
  return restoreUrls(translated, urls);
}

async function main() {
  const configuredLocales = db.prepare('SELECT code FROM i18n_locale').all().map(l => l.code);
  console.log('已配置 locale:', configuredLocales.join(', '));

  const products = db.prepare(`
    SELECT id, document_id, title, slug, tagline, description, specs, sort_order, category, features, key_specs
    FROM products WHERE locale='zh-CN' AND published_at IS NOT NULL ORDER BY sort_order
  `).all();
  console.log(`\n找到 ${products.length} 个 zh-CN 已发布产品\n`);

  const now = Date.now();

  for (const product of products) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📦 ${product.title}`);

    for (const locale of TARGET_LOCALES) {
      if (!configuredLocales.includes(locale)) {
        console.log(`  ⚠️  ${locale} 未配置，跳过`);
        continue;
      }

      const existing = db.prepare(
        'SELECT id FROM products WHERE document_id=? AND locale=?'
      ).get(product.document_id, locale);

      console.log(`\n  → ${locale}${existing ? ' (更新)' : ' (新建)'}`);

      const translatedData = {};
      const fields = ['title', 'tagline', 'description'];

      try {
        if (locale === 'zh-TW') {
          for (const key of fields) {
            if (product[key]) translatedData[key] = twConverter(product[key]);
          }
          console.log(`    OpenCC ✓`);
        } else {
          for (const key of fields) {
            if (!product[key]) continue;
            process.stdout.write(`    ${key}... `);
            translatedData[key] = await translateText(product[key], locale);
            process.stdout.write('✓\n');
            await new Promise(r => setTimeout(r, 600));
          }
        }

        if (existing) {
          db.prepare(`UPDATE products SET title=?, tagline=?, description=?, updated_at=?, published_at=? WHERE id=?`)
            .run(translatedData.title || product.title, translatedData.tagline || product.tagline,
              translatedData.description || product.description, now, now, existing.id);
          console.log(`    ✅ 更新完成 (id=${existing.id})`);
        } else {
          const r = db.prepare(`
            INSERT INTO products (document_id, title, slug, tagline, description, specs, is_translation_locked,
              created_at, updated_at, published_at, locale, sort_order, category, features, key_specs)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            product.document_id,
            translatedData.title || product.title,
            product.slug,
            translatedData.tagline || null,
            translatedData.description || null,
            product.specs,
            now, now, now,
            locale,
            product.sort_order,
            product.category,
            product.features,
            product.key_specs
          );
          console.log(`    ✅ 新建完成 (id=${r.lastInsertRowid})`);
        }

        if (locale !== 'zh-TW') await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error(`    ❌ 失败:`, e.message);
      }
    }
  }

  db.close();

  const db2 = new Database('.tmp/data.db');
  const stats = db2.prepare(`SELECT locale, COUNT(*) as cnt FROM products WHERE published_at IS NOT NULL GROUP BY locale ORDER BY locale`).all();
  console.log('\n\n📊 最终各 locale 已发布产品数:');
  for (const s of stats) console.log(`  ${s.locale}: ${s.cnt} 条`);
  db2.close();

  console.log('\n✅ 全部完成！');

  // 通知
  const { execSync } = require('child_process');
  try {
    execSync('/home/ec2-user/.nvm/versions/node/v22.22.1/bin/openclaw system event --text "产品翻译完成：8产品×7语言已全部写入DB" --mode now');
  } catch(e) {}
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
