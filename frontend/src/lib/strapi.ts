// 服务端(SSR/ISR)内部访问用 localhost，客户端用公网URL
const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

// nginx代理Strapi媒体文件的公网base URL（去掉:1337端口，加/strapi路径）
// e.g. http://32.236.16.227:1337 → http://32.236.16.227/strapi
const STRAPI_MEDIA_PUBLIC_BASE = STRAPI_URL.replace(/:1337$/, '').replace(/:1337\/.*$/, '') + '/strapi';

export function getStrapiURL(path = ''): string {
  return `${STRAPI_URL}${path}`;
}

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) return 'https://placehold.co/800x600/0C1829/38C4E8?text=AlwaysControl';
  // 相对路径 /uploads/... → 走 nginx 代理的公网绝对URL
  if (url.startsWith('/uploads/')) {
    return `${STRAPI_MEDIA_PUBLIC_BASE}${url}`;
  }
  // 绝对URL含 :1337/uploads/ → 替换为 nginx 代理公网URL
  if (url.startsWith('http://') && url.includes(':1337')) {
    return url.replace(/^http:\/\/([^/]+):1337(\/uploads\/)/, `http://$1/strapi$2`);
  }
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

interface FetchStrapiOptions {
  locale?: string;
  populate?: string | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: Record<string, number>;
  fields?: string[];
}

export async function fetchStrapi<T = unknown>(
  endpoint: string,
  options: FetchStrapiOptions = {}
): Promise<T> {
  const { locale, populate, filters, sort, pagination, fields } = options;

  // zh-TW intercept: rewrite to zh-CN (iron law)
  const actualLocale = locale === 'zh-TW' ? 'zh-CN' : locale;

  const params = new URLSearchParams();

  if (actualLocale) params.set('locale', actualLocale);

  if (populate) {
    if (typeof populate === 'string') {
      params.set('populate', populate);
    } else {
      // Deep populate
      const flattenPopulate = (obj: Record<string, unknown>, prefix = 'populate'): void => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            flattenPopulate(value as Record<string, unknown>, `${prefix}[${key}]`);
          } else {
            params.set(`${prefix}[${key}]`, String(value));
          }
        }
      };
      flattenPopulate(populate);
    }
  }

  if (filters) {
    const flattenFilters = (obj: Record<string, unknown>, prefix = 'filters'): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          value.forEach((item, i) => {
            if (typeof item === 'object' && item !== null) {
              flattenFilters(item as Record<string, unknown>, `${prefix}[${key}][${i}]`);
            } else {
              params.set(`${prefix}[${key}][${i}]`, String(item));
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          flattenFilters(value as Record<string, unknown>, `${prefix}[${key}]`);
        } else {
          params.set(`${prefix}[${key}]`, String(value));
        }
      }
    };
    flattenFilters(filters);
  }

  if (sort) {
    if (Array.isArray(sort)) {
      sort.forEach((s, i) => params.set(`sort[${i}]`, s));
    } else {
      params.set('sort', sort);
    }
  }

  if (pagination) {
    for (const [key, value] of Object.entries(pagination)) {
      params.set(`pagination[${key}]`, String(value));
    }
  }

  if (fields) {
    fields.forEach((f, i) => params.set(`fields[${i}]`, f));
  }

  // 服务端环境用内部URL（localhost），客户端用公网URL
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? STRAPI_INTERNAL_URL : STRAPI_URL;
  const url = `${baseUrl}/api${endpoint}?${params.toString()}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(8000),  // 防止构建期挂起
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} for ${url}`);
  }

  const json = await res.json();
  return json;
}

// Fetch with locale fallback cascade: requested locale -> zh-CN -> throw
export async function fetchWithFallback<T = unknown>(
  endpoint: string,
  options: FetchStrapiOptions = {}
): Promise<T> {
  try {
    return await fetchStrapi<T>(endpoint, options);
  } catch {
    if (options.locale && options.locale !== 'zh-CN') {
      return await fetchStrapi<T>(endpoint, { ...options, locale: 'zh-CN' });
    }
    throw new Error(`Failed to fetch ${endpoint} with fallback`);
  }
}
