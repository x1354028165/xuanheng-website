#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const DEEPSEEK_API_KEY = 'sk-9e4295fcdab94387879d9db9d1d07dcd';
const MESSAGES_DIR = path.join(__dirname, '../frontend/src/messages');
const TARGET_LOCALES = ['en-US', 'zh-TW', 'de', 'fr', 'es', 'pt', 'ru'];
const LANG_NAMES = { 'en-US': 'English', 'zh-TW': 'Traditional Chinese', 'de': 'German', 'fr': 'French', 'es': 'Spanish', 'pt': 'Portuguese', 'ru': 'Russian' };

function flatten(obj, prefix = '') {
  const r = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(r, flatten(v, key));
    else r[key] = v;
  }
  return r;
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function hasChinese(text) {
  return typeof text === 'string' && /[\u4e00-\u9fff]/.test(text);
}

async function callDeepSeek(text, targetLang) {
  const body = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: `Translate the JSON values from Chinese to ${targetLang}. Keep JSON keys unchanged. Keep technical terms (Neuron, HEMS, ESS, EVCMS, VPP, PQMS, DLB, OCPP, Modbus, MQTT, SOC, API, PDF, SVG, APF, OTA) unchanged. Return ONLY valid JSON, no markdown.` },
      { role: 'user', content: text }
    ],
    temperature: 0.1, max_tokens: 4000,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.deepseek.com', port: 443, path: '/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.choices?.[0]) resolve(j.choices[0].message.content);
          else reject(new Error(data.substring(0, 200)));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const zhCN = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'zh-CN.json'), 'utf8'));
  const zhFlat = flatten(zhCN);

  for (const locale of TARGET_LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const target = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const targetFlat = flatten(target);

    // Find keys that still have Chinese text (same as zh-CN source)
    const untranslated = {};
    for (const [key, val] of Object.entries(targetFlat)) {
      if (typeof val === 'string' && val === zhFlat[key] && hasChinese(val)) {
        untranslated[key] = val;
      }
    }

    const count = Object.keys(untranslated).length;
    if (count === 0) {
      console.log(`[${locale}] All keys translated.`);
      continue;
    }

    console.log(`[${locale}] ${count} untranslated keys, translating...`);

    // Translate in batches of 10
    const entries = Object.entries(untranslated);
    for (let i = 0; i < entries.length; i += 10) {
      const batch = Object.fromEntries(entries.slice(i, i + 10));
      try {
        let response = await callDeepSeek(JSON.stringify(batch, null, 2), LANG_NAMES[locale]);
        // Extract JSON from possible markdown
        const m = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (m) response = m[1].trim();
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) response = jsonMatch[0];
        const translated = JSON.parse(response);
        for (const [k, v] of Object.entries(translated)) {
          if (typeof v === 'string' && v !== batch[k]) {
            setNested(target, k, v);
          }
        }
        console.log(`  Batch ${Math.floor(i/10)+1}: OK`);
      } catch (err) {
        console.error(`  Batch ${Math.floor(i/10)+1}: Error - ${err.message}`);
      }
      if (i + 10 < entries.length) await new Promise(r => setTimeout(r, 1500));
    }

    fs.writeFileSync(filePath, JSON.stringify(target, null, 2) + '\n', 'utf8');
    console.log(`[${locale}] Written.`);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('Done!');
}

main().catch(console.error);
