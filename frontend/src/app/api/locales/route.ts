/**
 * Public API route: GET /api/locales
 * Returns the list of enabled locales from Strapi SQLite database.
 * Reads directly from the database for reliability (Strapi i18n API requires auth).
 */
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

const DB_PATH = process.env.STRAPI_DB_PATH || '/home/ec2-user/xuanheng-website/cms/.tmp/data.db';
const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';
const STRAPI_ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
const STRAPI_ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Admin1234!';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: STRAPI_ADMIN_EMAIL, password: STRAPI_ADMIN_PASSWORD }),
  });
  const data = await res.json();
  cachedToken = data?.data?.token ?? null;
  tokenExpiry = Date.now() + 25 * 60 * 1000; // 25min
  return cachedToken!;
}

function readLocalesFromDB(): { code: string; name: string; isDefault: boolean }[] {
  try {
    const output = execSync(
      `python3 -c "
import sqlite3, json
conn = sqlite3.connect('${DB_PATH}')
rows = conn.execute('SELECT code, name FROM i18n_locale WHERE code != \\'en\\' ORDER BY id').fetchall()
result = [{'code': r[0], 'name': r[1], 'isDefault': r[0]=='zh-CN'} for r in rows]
print(json.dumps(result))
conn.close()
"`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return JSON.parse(output.trim());
  } catch {
    return [];
  }
}

export async function GET() {
  // Method 1: Read directly from SQLite (most reliable)
  const dbLocales = readLocalesFromDB();
  if (dbLocales.length > 0) {
    return NextResponse.json(dbLocales, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  }

  // Method 2: Try Strapi admin API
  try {
    const token = await getAdminToken();
    if (token) {
      const res = await fetch(`${STRAPI_URL}/admin/i18n/locales`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const raw = await res.text();
        const parsed = JSON.parse(raw);
        const locales = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
        const filtered = locales
          .filter((l: {code:string}) => l.code !== 'en')
          .map((l: {code:string;name:string;isDefault?:boolean}) => ({
            code: l.code, name: l.name, isDefault: l.isDefault ?? false,
          }));
        if (filtered.length > 0) return NextResponse.json(filtered);
      }
    }
  } catch (err) {
    console.error('[api/locales] admin API error:', err);
  }

  // Final fallback
  return NextResponse.json([
    { code: 'zh-CN', name: 'Chinese (Simplified)', isDefault: true },
    { code: 'en-US', name: 'English (US)', isDefault: false },
    { code: 'zh-TW', name: 'Chinese (Traditional)', isDefault: false },
    { code: 'de', name: 'German', isDefault: false },
    { code: 'fr', name: 'French', isDefault: false },
    { code: 'es', name: 'Spanish', isDefault: false },
    { code: 'pt', name: 'Portuguese', isDefault: false },
    { code: 'ru', name: 'Russian', isDefault: false },
  ]);
}
