#!/usr/bin/env node
/**
 * Fix Strapi v5 locale version issue:
 * Translated locale entries (de/en-US/es/fr/pt/ru/zh-TW) have published rows
 * but no corresponding draft rows. The content-manager admin panel queries
 * drafts by default, so these locales appear as 0 results.
 *
 * This script uses the content-manager REST API to re-write each locale
 * version (PUT creates draft via document service) and then re-publish.
 *
 * Also cleans up stale 'en' locale entries that shouldn't exist.
 *
 * Usage: node scripts/fix-locale-versions.js
 * Requires: Strapi running at localhost:1337
 */

const path = require('path');
const Database = require(path.join(__dirname, '..', 'cms', 'node_modules', 'better-sqlite3'));

const STRAPI_URL = 'http://localhost:1337';
const DB_PATH = path.join(__dirname, '..', 'cms', '.tmp', 'data.db');

const CONTENT_TYPES = [
  {
    table: 'products',
    uid: 'api::product.product',
    fields: ['title', 'slug', 'tagline', 'description', 'sort_order', 'category', 'features', 'key_specs', 'specs'],
  },
  {
    table: 'solutions',
    uid: 'api::solution.solution',
    fields: ['title', 'slug', 'tagline', 'description'],
  },
  {
    table: 'articles',
    uid: 'api::article.article',
    fields: ['title', 'slug', 'summary', 'content'],
  },
];

const TARGET_LOCALES = ['en-US', 'de', 'fr', 'es', 'pt', 'ru', 'zh-TW', 'ar'];

async function getAdminToken() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: process.env.STRAPI_ADMIN_PASSWORD || 'Admin1234!' }),
  });
  const data = await res.json();
  if (!data?.data?.token) {
    throw new Error('Failed to get admin token: ' + JSON.stringify(data));
  }
  return data.data.token;
}

function tryParseJson(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try { return JSON.parse(trimmed); } catch { /* fall through */ }
  }
  return val;
}

async function main() {
  console.log('=== Strapi v5 Locale Version Fix ===\n');

  const token = await getAdminToken();
  console.log('Admin token acquired.\n');

  const db = new Database(DB_PATH, { readonly: true });

  let totalFixed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const { table, uid, fields } of CONTENT_TYPES) {
    console.log(`\n--- ${table} (${uid}) ---`);

    // Get all zh-CN document IDs
    const zhDocs = db.prepare(
      `SELECT DISTINCT document_id FROM ${table} WHERE locale = 'zh-CN'`
    ).all();

    if (zhDocs.length === 0) {
      console.log('  No zh-CN documents found, skipping.');
      continue;
    }

    console.log(`  Found ${zhDocs.length} zh-CN documents.`);

    for (const { document_id: documentId } of zhDocs) {
      for (const locale of TARGET_LOCALES) {
        // Check if draft already exists
        const hasDraft = db.prepare(
          `SELECT 1 FROM ${table} WHERE document_id = ? AND locale = ? AND published_at IS NULL LIMIT 1`
        ).get(documentId, locale);

        if (hasDraft) {
          // Draft exists, skip
          continue;
        }

        // Check if published entry exists (we need data from it)
        const pubRow = db.prepare(
          `SELECT * FROM ${table} WHERE document_id = ? AND locale = ? AND published_at IS NOT NULL LIMIT 1`
        ).get(documentId, locale);

        if (!pubRow) {
          // No data at all for this locale, skip
          continue;
        }

        if (!pubRow.title) {
          console.log(`  skip ${documentId}/${locale}: no title`);
          totalSkipped++;
          continue;
        }

        // Build payload from published data
        const payload = {};
        for (const field of fields) {
          const dbField = field; // column names match field names
          const val = pubRow[dbField];
          if (val !== undefined && val !== null) {
            payload[field] = tryParseJson(val);
          }
        }

        // PUT via content-manager (creates draft via document service)
        try {
          const putRes = await fetch(
            `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}?locale=${locale}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!putRes.ok) {
            const err = await putRes.text();
            console.log(`  FAIL PUT ${documentId}/${locale}: ${putRes.status} ${err.substring(0, 100)}`);
            totalFailed++;
            continue;
          }

          // Publish to ensure published version is also up to date
          const pubRes = await fetch(
            `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}/actions/publish?locale=${locale}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: '{}',
            }
          );

          const icon = pubRes.ok ? 'OK' : `WARN(pub ${pubRes.status})`;
          console.log(`  ${icon} ${documentId}/${locale}: ${String(pubRow.title).substring(0, 30)}`);
          totalFixed++;
        } catch (e) {
          console.log(`  FAIL ${documentId}/${locale}: ${e.message}`);
          totalFailed++;
        }

        // Small delay to avoid hammering the server
        await new Promise((r) => setTimeout(r, 50));
      }
    }
  }

  // --- Clean up stale 'en' locale entries ---
  console.log('\n--- Checking stale "en" locale entries ---');
  for (const { table } of CONTENT_TYPES) {
    const enCount = db.prepare(
      `SELECT COUNT(*) as cnt FROM ${table} WHERE locale = 'en'`
    ).get();
    if (enCount.cnt > 0) {
      console.log(`  ${table}: ${enCount.cnt} stale "en" entries found (should be "en-US")`);
      console.log(`  -> These need manual cleanup via: DELETE FROM ${table} WHERE locale = 'en'`);
    }
  }

  db.close();

  console.log(`\n=== Done ===`);
  console.log(`Fixed: ${totalFixed}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
