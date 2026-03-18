#!/usr/bin/env node
/**
 * Translate missing keys from zh-CN.json to all target languages using DeepSeek API.
 * Usage: node scripts/translate-messages.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEEPSEEK_API_KEY = 'sk-9e4295fcdab94387879d9db9d1d07dcd';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

const MESSAGES_DIR = path.join(__dirname, '../frontend/src/messages');

const TARGET_LOCALES = ['en-US', 'zh-TW', 'de', 'fr', 'es', 'pt', 'ru'];

const LANG_NAMES = {
  'en-US': 'English',
  'zh-TW': 'Traditional Chinese',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'ru': 'Russian',
};

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function unflatten(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object') {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

async function callDeepSeek(text, targetLang) {
  const body = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator for an energy management technology company (AlwaysControl/旭衡电子). Translate the following JSON values from Chinese to ${targetLang}. Keep JSON structure, keys, and technical terms (product names like Neuron II, HEMS, ESS, EVCMS, VPP, PQMS, DLB, OCPP, Modbus, MQTT, SOC, API, PDF) unchanged. Only translate the string values. For arrays, translate each element. Return valid JSON only.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.1,
    max_tokens: 8000,
  });

  return new Promise((resolve, reject) => {
    const url = new URL(DEEPSEEK_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices[0]) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error(`DeepSeek error: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractJSON(text) {
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  // Otherwise try the whole text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

async function translateBatch(missingEntries, targetLang) {
  // Group into smaller batches to avoid token limits
  const BATCH_SIZE = 15;
  const results = {};
  const entries = Object.entries(missingEntries);

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = Object.fromEntries(entries.slice(i, i + BATCH_SIZE));
    const batchJson = JSON.stringify(batch, null, 2);

    console.log(`  Translating batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(entries.length/BATCH_SIZE)} (${Object.keys(batch).length} keys)...`);

    try {
      const response = await callDeepSeek(batchJson, targetLang);
      const jsonStr = extractJSON(response);
      const translated = JSON.parse(jsonStr);
      // Verify at least one value differs from source (Chinese)
      let hasTranslation = false;
      for (const [k, v] of Object.entries(translated)) {
        if (typeof v === 'string' && v !== batch[k]) { hasTranslation = true; break; }
      }
      if (hasTranslation) {
        Object.assign(results, translated);
      } else {
        console.log(`  WARNING: Translation returned same as source, keeping originals`);
        Object.assign(results, batch);
      }
    } catch (err) {
      console.error(`  Error translating batch: ${err.message}`);
      Object.assign(results, batch);
    }

    // Rate limiting
    if (i + BATCH_SIZE < entries.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return results;
}

// zh-TW conversion is handled by DeepSeek API

async function main() {
  const zhCN = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'zh-CN.json'), 'utf8'));
  const zhCNFlat = flatten(zhCN);

  let totalNewKeys = 0;

  for (const locale of TARGET_LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    const existingFlat = flatten(existing);

    // Find missing keys
    const missing = {};
    for (const [key, value] of Object.entries(zhCNFlat)) {
      if (!(key in existingFlat)) {
        missing[key] = value;
      }
    }

    const missingCount = Object.keys(missing).length;
    if (missingCount === 0) {
      console.log(`[${locale}] No missing keys, skipping.`);
      continue;
    }

    console.log(`[${locale}] Found ${missingCount} missing keys, translating...`);
    totalNewKeys += missingCount;

    let translated;
    if (locale === 'zh-TW') {
      // Use DeepSeek for zh-TW too since we don't have opencc installed
      try {
        translated = await translateBatch(missing, LANG_NAMES[locale]);
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        translated = missing; // fallback to zh-CN
      }
    } else {
      try {
        translated = await translateBatch(missing, LANG_NAMES[locale]);
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        translated = missing; // fallback
      }
    }

    // Merge translated keys into existing
    const translatedUnflat = unflatten(translated);
    const merged = deepMerge(JSON.parse(JSON.stringify(existing)), translatedUnflat);

    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log(`[${locale}] Written ${missingCount} new keys.`);

    // Rate limit between locales
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone! Total new keys translated: ${totalNewKeys}`);
}

main().catch(console.error);
