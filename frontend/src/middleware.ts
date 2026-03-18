import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';
const DEFAULT_LOCALE = 'zh-CN';

// In-memory cache for enabled locales (middleware runs at edge)
let cachedLocales: string[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 60 seconds

async function getEnabledLocales(): Promise<string[]> {
  if (cachedLocales && Date.now() - cacheTime < CACHE_TTL) return cachedLocales;
  try {
    // Use internal Next.js API proxy (avoids Strapi auth issues)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/locales`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error('failed');
    const data: Array<{ code: string }> = await res.json();
    cachedLocales = data.map((l) => l.code).filter((c) => c !== 'en');
    cacheTime = Date.now();
    return cachedLocales;
  } catch {
    // Fallback: use the core 8 locales
    return ['zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'pt', 'es', 'ru'];
  }
}

// Base next-intl middleware (handles locale negotiation, redirects, etc.)
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract first path segment to check if it's a locale
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment) {
    // Check if the locale prefix is in Strapi's enabled list
    const enabledLocales = await getEnabledLocales();
    const isInSuperset = (routing.locales as readonly string[]).includes(firstSegment);
    const isEnabled = enabledLocales.includes(firstSegment);

    // If it looks like a locale in our superset but is NOT enabled in Strapi,
    // redirect to default locale (prevents accessing disabled languages)
    if (isInSuperset && !isEnabled) {
      const rest = segments.slice(1).join('/');
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${rest ? `/${rest}` : ''}`;
      return NextResponse.redirect(url);
    }
  }

  // Delegate to next-intl for standard locale handling (negotiation, redirects)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except _next, api, and static files
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
