#!/usr/bin/env node
/**
 * 修复 Strapi v5 locale 版本注册问题
 * 把数据库里已有但 Strapi 未正确注册的翻译数据，通过 content-manager REST API 重新写入
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fetch from 'node-fetch';

const STRAPI_URL = 'http://localhost:1337';
const DB_PATH = '/home/ec2-user/xuanheng-website/cms/.tmp/data.db';

const CONTENT_TYPES = [
  { table: 'products', uid: 'api::product.product', fields: ['title','slug','tagline','description','features','key_specs','translation_meta','sort_order','category'] },
  { table: 'solutions', uid: 'api::solution.solution', fields: ['title','slug','tagline','description','features','translation_meta'] },
  { table: 'articles', uid: 'api::article.article', fields: ['title','slug','summary','body','translation_meta'] },
];
const TARGET_LOCALES = ['en-US','de','fr','es','pt','ru','zh-TW'];

async function getAdminToken() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'Admin1234!' }),
  });
  const data = await res.json();
  return data?.data?.token;
}

async function main() {
  const token = await getAdminToken();
  console.log('Token:', token?.substring(0,20) + '...');

  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  for (const { table, uid, fields } of CONTENT_TYPES) {
    console.log(`\n=== ${table} ===`);
    
    // 获取 zh-CN 的所有 document_ids
    const zhDocs = await db.all(`SELECT document_id FROM ${table} WHERE locale='zh-CN'`);
    
    for (const { document_id } of zhDocs) {
      for (const locale of TARGET_LOCALES) {
        // 从数据库读取该语言的翻译数据
        const row = await db.get(
          `SELECT * FROM ${table} WHERE document_id=? AND locale=?`,
          [document_id, locale]
        );
        
        if (!row || !row.title) {
          console.log(`  ⏭️  ${document_id}/${locale}: 无数据，跳过`);
          continue;
        }

        // 构建写入数据
        const payload = {};
        for (const field of fields) {
          const dbField = field.replace(/-/g,'_'); // key_specs -> key_specs
          if (row[dbField] !== undefined && row[dbField] !== null) {
            try {
              payload[field] = typeof row[dbField] === 'string' && row[dbField].startsWith('[') || row[dbField].startsWith('{')
                ? JSON.parse(row[dbField])
                : row[dbField];
            } catch {
              payload[field] = row[dbField];
            }
          }
        }

        // 通过 content-manager REST API 写入
        try {
          const putRes = await fetch(
            `${STRAPI_URL}/content-manager/collection-types/${uid}/${document_id}?locale=${locale}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload),
            }
          );
          
          if (!putRes.ok) {
            const err = await putRes.text();
            console.log(`  ❌ PUT ${document_id}/${locale}: ${putRes.status} ${err.substring(0,80)}`);
            continue;
          }
          
          // Publish
          const pubRes = await fetch(
            `${STRAPI_URL}/content-manager/collection-types/${uid}/${document_id}/actions/publish?locale=${locale}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: '{}',
            }
          );
          
          const status = pubRes.ok ? '✅' : `⚠️(pub${pubRes.status})`;
          console.log(`  ${status} ${document_id}/${locale}: ${String(row.title).substring(0,20)}`);
        } catch (e) {
          console.log(`  ❌ ${document_id}/${locale}: ${e.message}`);
        }
        
        // 小延迟避免请求过密
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  await db.close();
  console.log('\n=== 完成 ===');
}

main().catch(console.error);
