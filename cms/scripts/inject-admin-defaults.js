#!/usr/bin/env node
/**
 * Post-build script: injects localStorage defaults into Strapi admin index.html
 * - strapi-admin-language = zh-Hans (default to Simplified Chinese)
 * - STRAPI_THEME = light (default to light theme)
 * Only sets if user hasn't explicitly chosen a preference.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/build/index.html');

if (!fs.existsSync(indexPath)) {
  console.log('⚠️  dist/build/index.html not found, skipping injection');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Avoid double-injection
if (html.includes('strapi-admin-language')) {
  console.log('✅ Admin defaults already injected, skipping');
  process.exit(0);
}

const script = `<script>try{if(!localStorage.getItem('strapi-admin-language'))localStorage.setItem('strapi-admin-language','zh-Hans');if(!localStorage.getItem('STRAPI_THEME'))localStorage.setItem('STRAPI_THEME','light');}catch(e){}</script>`;

html = html.replace('<meta charSet="utf-8"/>', '<meta charSet="utf-8"/>' + script);
fs.writeFileSync(indexPath, html);
console.log('✅ Injected admin language (zh-Hans) + theme (light) defaults into index.html');
