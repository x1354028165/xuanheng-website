#!/usr/bin/env node
/**
 * Batch fix: re-associate cover/gallery images on draft rows for all products × all locales.
 *
 * Root cause: Cover relations exist on published rows but NOT on draft rows.
 * Content-manager (admin panel) queries drafts by default, so covers appear missing.
 *
 * Fix approach:
 * 1. Get cover file IDs from the PUBLIC API (which shows published data)
 * 2. PUT via content-manager to set covers on draft rows for ALL locales (including zh-CN)
 * 3. Publish to sync
 *
 * Usage:
 *   node scripts/batch-fix-translations.js              # fix images only
 *   node scripts/batch-fix-translations.js --retranslate # fix images + re-translate all
 *
 * Requires: Strapi running at localhost:1337
 */

const STRAPI_URL = 'http://localhost:1337';
const ALL_LOCALES = ['zh-CN', 'en-US', 'de', 'fr', 'es', 'pt', 'ru', 'zh-TW'];

const doRetranslate = process.argv.includes('--retranslate');

async function getAdminToken() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'Admin1234!' }),
  });
  const data = await res.json();
  if (!data?.data?.token) throw new Error('Failed to get admin token');
  return data.data.token;
}

async function main() {
  console.log('=== Batch Fix: Image Associations (Draft Row Fix) ===');
  console.log(`Mode: ${doRetranslate ? 'Fix images + Re-translate' : 'Fix images only'}\n`);

  const token = await getAdminToken();
  console.log('Admin token acquired.\n');

  // Step 1: Get all products from PUBLIC API (shows published data with cover)
  // Strapi v5 requires array-style populate params
  const pubRes = await fetch(`${STRAPI_URL}/api/products?locale=zh-CN&populate[0]=cover&populate[1]=gallery&pagination[limit]=100`);
  if (!pubRes.ok) {
    console.error('Failed to fetch products from public API');
    process.exit(1);
  }
  const pubData = await pubRes.json();
  const products = pubData.data ?? [];
  console.log(`Found ${products.length} products via public API.\n`);

  let totalFixed = 0;
  let totalFailed = 0;
  const uid = 'api::product.product';

  for (const product of products) {
    const documentId = product.documentId;
    const slug = product.slug;
    const zhCoverId = product.cover?.id ?? null;
    const zhGalleryIds = (product.gallery ?? []).map(g => g.id).filter(Boolean);

    console.log(`📦 ${slug} (docId: ${documentId})`);
    console.log(`   zh-CN cover: ${zhCoverId ? `id=${zhCoverId} (${product.cover?.name})` : 'NONE'}`);
    console.log(`   zh-CN gallery: ${zhGalleryIds.length} items`);

    if (!zhCoverId && zhGalleryIds.length === 0) {
      console.log('   ⏭️  No images to fix, skipping.\n');
      continue;
    }

    // Step 2: For each locale, PUT cover/gallery via content-manager (fixes draft row)
    for (const locale of ALL_LOCALES) {
      try {
        // Check if this locale already has cover on draft
        const cmRes = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}?locale=${locale}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!cmRes.ok) {
          // Locale entry might not exist yet for non-zh locales
          if (locale !== 'zh-CN') {
            console.log(`   ${locale}: no entry yet, skip`);
            continue;
          }
          throw new Error(`content-manager GET failed: ${cmRes.status}`);
        }

        const cmData = await cmRes.json();
        const entry = cmData.data ?? cmData;
        const existingCoverId = entry.cover?.id ?? null;

        if (existingCoverId === zhCoverId) {
          console.log(`   ${locale}: ✅ cover already correct (id=${existingCoverId})`);
          continue;
        }

        // Build payload with image IDs
        const payload = {};
        if (zhCoverId) payload.cover = zhCoverId;
        if (zhGalleryIds.length > 0) payload.gallery = zhGalleryIds;

        // PUT to set images on draft row
        const putRes = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}?locale=${locale}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );

        if (!putRes.ok) {
          const err = await putRes.text();
          throw new Error(`PUT failed (${putRes.status}): ${err.substring(0, 150)}`);
        }

        // Publish
        const pubOk = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}/actions/publish?locale=${locale}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: '{}',
          }
        ).then(r => r.ok);

        console.log(`   ${locale}: ${pubOk ? '✅' : '⚠️'} fixed cover=${zhCoverId}`);
        totalFixed++;

        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.log(`   ${locale}: ❌ ${err.message}`);
        totalFailed++;
      }
    }

    // Step 3: Optionally trigger re-translation
    if (doRetranslate) {
      console.log(`   🔄 Triggering re-translation...`);
      try {
        const trRes = await fetch(`${STRAPI_URL}/api/translate/entry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ documentId, uid }),
        });
        if (trRes.ok) {
          console.log(`   ✅ Translation triggered (background)`);
          // Wait for translation to finish before proceeding to next product
          console.log(`   ⏳ Waiting 45s for translations to complete...`);
          await new Promise(r => setTimeout(r, 45000));
        } else {
          console.log(`   ⚠️ Translation trigger failed: ${trRes.status}`);
        }
      } catch (err) {
        console.log(`   ⚠️ ${err.message}`);
      }
    }

    console.log('');
  }

  console.log('=== Done ===');
  console.log(`Fixed: ${totalFixed}, Failed: ${totalFailed}`);

  if (doRetranslate) {
    console.log('\n⏳ Waiting 60s for any remaining background translations...');
    await new Promise(r => setTimeout(r, 60000));
    console.log('Done waiting. Run verify-translations.js to check results.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
