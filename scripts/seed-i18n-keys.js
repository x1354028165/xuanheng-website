#!/usr/bin/env node

/**
 * Seed script: import frontend/src/messages/*.json into Strapi i18n_keys collection.
 * Uses the new `translations` JSON field format.
 *
 * Usage:
 *   node scripts/seed-i18n-keys.js
 *
 * Requires Strapi running at localhost:1337.
 * Uses content-manager API with admin credentials.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '..', 'frontend', 'src', 'messages');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Admin1234!';

const CM_BASE = `${STRAPI_URL}/content-manager/collection-types/api::i18n-key.i18n-key`;

// Locale codes that match message file names
const LOCALE_CODES = ['zh-CN', 'zh-TW', 'en-US', 'de', 'fr', 'pt', 'es', 'ru'];

// ── Flatten nested JSON to dot-notation key-value pairs ──

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = Array.isArray(v) ? JSON.stringify(v) : String(v);
    }
  }
  return result;
}

// ── HTTP helpers ──

async function adminLogin() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Admin login failed: ${res.status} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data.token;
}

async function fetchAllExistingKeys(token) {
  const existing = new Map();
  let page = 1;
  const pageSize = 100;
  while (true) {
    const url = `${CM_BASE}?page=${page}&pageSize=${pageSize}&sort=key:asc`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Fetch keys failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    const items = body.results ?? [];
    if (items.length === 0) break;
    for (const item of items) {
      existing.set(item.key, item.documentId);
    }
    const total = body.pagination?.total ?? 0;
    if (page * pageSize >= total) break;
    page++;
  }
  return existing;
}

async function createEntry(token, data) {
  const res = await fetch(CM_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create failed for "${data.key}": ${res.status} ${text}`);
  }
  return res.json();
}

// ── Main ──

async function main() {
  console.log('Logging in to Strapi admin...');
  const token = await adminLogin();
  console.log('Logged in');

  // Load all locale files
  console.log('Loading message files...');
  const localeData = {};
  for (const locale of LOCALE_CODES) {
    const filePath = join(MESSAGES_DIR, `${locale}.json`);
    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
      localeData[locale] = flatten(raw);
    } catch (err) {
      console.warn(`  Could not load ${locale}.json: ${err.message}`);
      localeData[locale] = {};
    }
  }

  // Use zh-CN as the master key list
  const zhCN = localeData['zh-CN'];
  const allKeys = Object.keys(zhCN);
  console.log(`Found ${allKeys.length} keys in zh-CN.json`);

  // Fetch existing keys for idempotency
  console.log('Checking existing keys in Strapi...');
  const existingKeys = await fetchAllExistingKeys(token);
  console.log(`${existingKeys.size} keys already in database`);

  // Seed
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const key of allKeys) {
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    const namespace = key.includes('.') ? key.split('.')[0] : '_root';

    // Build translations object with all locales
    const translations = {};
    for (const locale of LOCALE_CODES) {
      const val = localeData[locale]?.[key];
      if (val) {
        translations[locale] = val;
      }
    }

    const entry = {
      key,
      namespace,
      translations,
      sourceText: zhCN[key] ?? '',
      translationStatus: Object.fromEntries(
        LOCALE_CODES.map((locale) => [
          locale,
          locale === 'zh-CN' ? 'manual' :
          locale === 'en-US' ? (localeData[locale]?.[key] ? 'manual' : 'outdated') :
          (localeData[locale]?.[key] ? 'auto' : 'outdated'),
        ])
      ),
    };

    try {
      await createEntry(token, entry);
      created++;
      if (created % 50 === 0) {
        console.log(`  Created ${created} keys...`);
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
      errors++;
      if (errors > 20) {
        console.error('Too many errors, stopping.');
        break;
      }
    }
  }

  console.log('');
  console.log('===================================');
  console.log(`Created: ${created}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total keys in zh-CN: ${allKeys.length}`);
  console.log('===================================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
