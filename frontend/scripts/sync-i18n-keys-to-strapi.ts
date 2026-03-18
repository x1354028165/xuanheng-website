/**
 * sync-i18n-keys-to-strapi.ts
 *
 * Reads all messages/*.json files and syncs leaf keys to Strapi's i18n_keys collection.
 * Each leaf key (e.g. "home.heroLine1") becomes one i18n-key document with:
 *   - key: "home.heroLine1"
 *   - namespace: "home"
 *   - sourceText: zh-CN value
 *   - zh_CN / en_US / zh_TW / de / fr / es / pt / ru: individual locale fields
 *
 * Usage:
 *   npx tsx scripts/sync-i18n-keys-to-strapi.ts
 *
 * Env:
 *   STRAPI_URL   – default http://localhost:1337
 *   STRAPI_TOKEN – API token (falls back to STRAPI_WRITE_TOKEN from .env.local)
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load .env.local for tokens
config({ path: path.resolve(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN ?? process.env.STRAPI_WRITE_TOKEN ?? '';

const MESSAGES_DIR = path.resolve(__dirname, '..', 'src', 'messages');

// File names -> Strapi field names (hyphens to underscores)
const LANG_FILE_TO_FIELD: Record<string, string> = {
  'zh-CN': 'zh_CN',
  'en-US': 'en_US',
  'zh-TW': 'zh_TW',
  'de': 'de',
  'fr': 'fr',
  'es': 'es',
  'pt': 'pt',
  'ru': 'ru',
};
const LANGUAGES = Object.keys(LANG_FILE_TO_FIELD);

/* ── Flatten nested JSON into dot-separated keys ── */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(result, flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(v);
    }
  }
  return result;
}

/* ── Load all language files ── */
function loadAllTranslations(): {
  allKeys: string[];
  translationsByKey: Record<string, Record<string, string>>;
} {
  const langData: Record<string, Record<string, string>> = {};

  for (const lang of LANGUAGES) {
    const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Missing ${lang}.json — skipping`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    langData[lang] = flattenKeys(raw);
  }

  const allKeys = Object.keys(langData['zh-CN'] ?? {}).sort();

  const translationsByKey: Record<string, Record<string, string>> = {};
  for (const key of allKeys) {
    const translations: Record<string, string> = {};
    for (const lang of LANGUAGES) {
      const field = LANG_FILE_TO_FIELD[lang];
      if (langData[lang]?.[key]) {
        translations[field] = langData[lang][key];
      }
    }
    translationsByKey[key] = translations;
  }

  return { allKeys, translationsByKey };
}

/* ── Strapi API helpers ── */
const apiHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};
if (STRAPI_TOKEN) {
  apiHeaders['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

async function fetchExistingKeys(): Promise<Map<string, string>> {
  const map = new Map<string, string>(); // key -> documentId
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const url = `${STRAPI_URL}/api/i18n-keys?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields[0]=key`;
    const res = await fetch(url, { headers: apiHeaders });
    if (!res.ok) {
      console.error(`Failed to fetch existing keys: ${res.status} ${res.statusText}`);
      break;
    }
    const json = await res.json();
    const items = json.data ?? [];
    for (const item of items) {
      map.set(item.key, item.documentId);
    }
    const pagination = json.meta?.pagination;
    if (!pagination || page >= pagination.pageCount) break;
    page++;
  }
  return map;
}

async function createKey(
  key: string,
  namespace: string,
  sourceText: string,
  localeFields: Record<string, string>,
): Promise<boolean> {
  const translationStatus: Record<string, string> = {};
  for (const field of Object.keys(localeFields)) {
    translationStatus[field] = field === 'zh_CN' ? 'manual' : 'auto';
  }

  const res = await fetch(`${STRAPI_URL}/api/i18n-keys`, {
    method: 'POST',
    headers: apiHeaders,
    body: JSON.stringify({
      data: {
        key,
        namespace,
        sourceText,
        translationStatus,
        ...localeFields,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`  create ${key}: ${res.status} ${body.substring(0, 120)}`);
  }
  return res.ok;
}

async function updateKey(
  documentId: string,
  namespace: string,
  sourceText: string,
  localeFields: Record<string, string>,
): Promise<boolean> {
  const translationStatus: Record<string, string> = {};
  for (const field of Object.keys(localeFields)) {
    translationStatus[field] = field === 'zh_CN' ? 'manual' : 'auto';
  }

  const res = await fetch(`${STRAPI_URL}/api/i18n-keys/${documentId}`, {
    method: 'PUT',
    headers: apiHeaders,
    body: JSON.stringify({
      data: {
        namespace,
        sourceText,
        translationStatus,
        ...localeFields,
      },
    }),
  });
  return res.ok;
}

/* ── Main ── */
async function main() {
  console.log(`\nSyncing i18n keys to Strapi at ${STRAPI_URL}\n`);

  const { allKeys, translationsByKey } = loadAllTranslations();
  console.log(`Found ${allKeys.length} keys in messages/zh-CN.json`);

  // Check if Strapi is reachable
  try {
    const healthRes = await fetch(`${STRAPI_URL}/api/i18n-keys?pagination[pageSize]=1`, {
      headers: apiHeaders,
    });
    if (!healthRes.ok) {
      console.error(`Cannot reach Strapi API (${healthRes.status}). Is the CMS running?`);
      generateOfflineDump(allKeys, translationsByKey);
      return;
    }
  } catch {
    console.error('Cannot connect to Strapi. Generating offline JSON dump...\n');
    generateOfflineDump(allKeys, translationsByKey);
    return;
  }

  const existing = await fetchExistingKeys();
  console.log(`Strapi has ${existing.size} existing keys\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming Strapi
  const BATCH_SIZE = 10;
  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    const batch = allKeys.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (key) => {
      const namespace = key.split('.')[0];
      const sourceText = translationsByKey[key]['zh_CN'] ?? '';
      const localeFields = translationsByKey[key];

      if (existing.has(key)) {
        const docId = existing.get(key)!;
        const ok = await updateKey(docId, namespace, sourceText, localeFields);
        return ok ? 'updated' : 'error';
      } else {
        const ok = await createKey(key, namespace, sourceText, localeFields);
        return ok ? 'created' : 'error';
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r === 'created') created++;
      else if (r === 'updated') updated++;
      else errors++;
    }

    // Progress
    if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= allKeys.length) {
      const done = Math.min(i + BATCH_SIZE, allKeys.length);
      process.stdout.write(`  ${done}/${allKeys.length} processed\r`);
    }
  }

  console.log(`\nSync complete: ${created} created, ${updated} updated, ${errors} errors`);
  console.log(`Strapi should now have ${existing.size + created} i18n keys`);
}

/* ── Offline dump (when Strapi is not running) ── */
function generateOfflineDump(
  allKeys: string[],
  translationsByKey: Record<string, Record<string, string>>,
) {
  const records = allKeys.map((key) => ({
    key,
    namespace: key.split('.')[0],
    sourceText: translationsByKey[key]['zh_CN'] ?? '',
    ...translationsByKey[key],
  }));

  const outPath = path.resolve(__dirname, '..', 'i18n-keys-dump.json');
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`Wrote ${records.length} keys to ${outPath}`);
  console.log('Import this file when Strapi is available.\n');
}

main().catch(console.error);
