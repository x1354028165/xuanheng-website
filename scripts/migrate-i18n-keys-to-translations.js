#!/usr/bin/env node

/**
 * Migration script: convert i18n_keys from individual locale columns
 * (zh_CN, en_US, etc.) to a single `translations` JSON field.
 *
 * Usage:
 *   node scripts/migrate-i18n-keys-to-translations.js
 *
 * Requires Strapi running at localhost:1337.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Admin1234!';

const CM_BASE = `${STRAPI_URL}/content-manager/collection-types/api::i18n-key.i18n-key`;

const OLD_FIELD_MAP = {
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
  en_US: 'en-US',
  de: 'de',
  fr: 'fr',
  pt: 'pt',
  es: 'es',
  ru: 'ru',
};

async function adminLogin() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
  const body = await res.json();
  return body.data.token;
}

async function main() {
  console.log('Logging in...');
  const token = await adminLogin();

  let page = 1;
  const pageSize = 100;
  let migrated = 0;
  let skipped = 0;

  while (true) {
    const url = `${CM_BASE}?page=${page}&pageSize=${pageSize}&sort=key:asc`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const body = await res.json();
    const items = body.results ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      // If translations field already has data, skip
      if (item.translations && typeof item.translations === 'object' && Object.keys(item.translations).length > 0) {
        skipped++;
        continue;
      }

      // Build translations from old columns
      const translations = {};
      for (const [oldField, localeCode] of Object.entries(OLD_FIELD_MAP)) {
        const val = item[oldField];
        if (typeof val === 'string' && val.trim()) {
          translations[localeCode] = val;
        }
      }

      if (Object.keys(translations).length === 0) {
        skipped++;
        continue;
      }

      // Update entry
      const updateRes = await fetch(`${CM_BASE}/${item.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ translations }),
      });

      if (!updateRes.ok) {
        console.error(`Failed to update "${item.key}": ${updateRes.status}`);
      } else {
        migrated++;
        if (migrated % 50 === 0) console.log(`  Migrated ${migrated}...`);
      }
    }

    const total = body.pagination?.total ?? 0;
    if (page * pageSize >= total) break;
    page++;
  }

  console.log('');
  console.log('===================================');
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log('===================================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
