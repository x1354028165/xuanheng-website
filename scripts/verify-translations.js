#!/usr/bin/env node
/**
 * Verify translations + image associations for all products × all locales.
 *
 * Checks:
 * 1. title exists and is non-empty
 * 2. title is in the correct language (not Chinese for non-zh locales)
 * 3. cover image exists
 * 4. features exists and is non-empty
 * 5. description exists
 *
 * Usage: node scripts/verify-translations.js
 * Requires: Strapi running at localhost:1337
 */

const STRAPI_URL = 'http://localhost:1337';
const ALL_LOCALES = ['zh-CN', 'en-US', 'de', 'fr', 'es', 'pt', 'ru', 'zh-TW'];

// Simple CJK detection
function hasChinese(text) {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

async function getAdminToken() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: process.env.STRAPI_ADMIN_PASSWORD || 'Admin1234!' }),
  });
  const data = await res.json();
  return data?.data?.token;
}

async function main() {
  const token = await getAdminToken();
  if (!token) {
    console.error('Failed to get admin token');
    process.exit(1);
  }

  const uid = 'api::product.product';

  // List all zh-CN products
  const listRes = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/${uid}?locale=zh-CN&page=1&pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  const products = listData.results ?? listData.data ?? [];

  console.log(`=== Translation Verification Report ===`);
  console.log(`Products: ${products.length}, Locales: ${ALL_LOCALES.length}\n`);

  let totalPass = 0;
  let totalFail = 0;
  const failures = [];

  for (const product of products) {
    const documentId = product.documentId ?? product.id;
    const slug = product.slug ?? documentId;
    console.log(`\n📦 ${slug}`);

    for (const locale of ALL_LOCALES) {
      const checks = [];
      let entry = null;

      try {
        const res = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}?locale=${locale}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const json = await res.json();
          entry = json.data ?? json;
        }
      } catch { /* ignore */ }

      if (!entry) {
        checks.push({ field: 'entry', ok: false, detail: 'NOT FOUND' });
        totalFail++;
        failures.push(`${slug}/${locale}: entry not found`);
        console.log(`  ${locale}: ❌ NOT FOUND`);
        continue;
      }

      // Check title
      const title = entry.title;
      if (title && title.trim()) {
        checks.push({ field: 'title', ok: true, detail: title.substring(0, 40) });
        // Check language match (non-zh locales should not have Chinese title)
        if (!locale.startsWith('zh') && hasChinese(title)) {
          checks.push({ field: 'title_lang', ok: false, detail: 'Contains Chinese!' });
        } else {
          checks.push({ field: 'title_lang', ok: true });
        }
      } else {
        checks.push({ field: 'title', ok: false, detail: 'EMPTY' });
      }

      // Check cover
      const cover = entry.cover;
      if (cover && cover.id) {
        checks.push({ field: 'cover', ok: true, detail: cover.name ?? `id:${cover.id}` });
      } else {
        checks.push({ field: 'cover', ok: false, detail: 'MISSING' });
      }

      // Check description
      const desc = entry.description;
      if (desc && desc.trim()) {
        checks.push({ field: 'desc', ok: true, detail: desc.substring(0, 30) });
      } else {
        checks.push({ field: 'desc', ok: false, detail: 'EMPTY' });
      }

      // Check features
      const features = entry.features;
      if (features && ((Array.isArray(features) && features.length > 0) || (typeof features === 'string' && features.trim()))) {
        const count = Array.isArray(features) ? features.length : 'json';
        checks.push({ field: 'features', ok: true, detail: `${count} items` });
      } else {
        checks.push({ field: 'features', ok: false, detail: 'EMPTY' });
      }

      const allOk = checks.every(c => c.ok);
      const failChecks = checks.filter(c => !c.ok);

      if (allOk) {
        totalPass++;
        console.log(`  ${locale}: ✅ title="${(title ?? '').substring(0, 25)}" cover=${cover?.name ?? 'ok'}`);
      } else {
        totalFail++;
        const failFields = failChecks.map(c => `${c.field}:${c.detail}`).join(', ');
        failures.push(`${slug}/${locale}: ${failFields}`);
        console.log(`  ${locale}: ❌ ${failFields}`);
      }

      await new Promise(r => setTimeout(r, 20));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${totalPass} passed, ${totalFail} failed (${products.length} products × ${ALL_LOCALES.length} locales = ${products.length * ALL_LOCALES.length} checks)`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  ❌ ${f}`);
    }
  }

  // Also check public API for a sample
  console.log(`\n--- Public API spot check ---`);
  for (const locale of ['en-US', 'de', 'fr']) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/products?locale=${locale}&populate=cover&pagination[limit]=3`);
      const json = await res.json();
      const items = json.data ?? [];
      console.log(`  ${locale}: ${items.length} products via public API`);
      for (const item of items.slice(0, 2)) {
        const coverUrl = item.cover?.url ?? 'none';
        console.log(`    - ${item.title?.substring(0, 30)} | cover: ${coverUrl ? '✅' : '❌'}`);
      }
    } catch {
      console.log(`  ${locale}: ❌ public API failed`);
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
