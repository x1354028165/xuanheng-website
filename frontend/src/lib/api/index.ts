import { fetchStrapi, fetchWithFallback } from '@/lib/strapi';
import type {
  StrapiResponse,
  StrapiSingleResponse,
  StrapiArticle,
  StrapiProduct,
  StrapiSolution,
  StrapiFAQ,
  StrapiCompatibleBrand,
  StrapiJobPosting,
} from '@/types/strapi';

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function getProducts(locale = 'zh-CN'): Promise<StrapiProduct[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiProduct>>('/products', {
      locale,
      populate: '*',
      sort: ['createdAt:desc'],
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getProducts failed, returning empty array');
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
  locale = 'zh-CN'
): Promise<StrapiProduct | null> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiProduct>>('/products', {
      locale,
      populate: '*',
      filters: { slug: { $eq: slug } },
    });
    return res.data?.[0] ?? null;
  } catch {
    console.warn(`[API] getProductBySlug(${slug}) failed, returning null`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Solutions
// ---------------------------------------------------------------------------

export async function getSolutions(locale = 'zh-CN'): Promise<StrapiSolution[]> {
  // fallback链：locale → en（国际通用）→ zh-CN（兜底）
  const tryLocales = locale === 'zh-CN' ? ['zh-CN']
    : locale === 'en' || locale === 'en-US' ? ['en', 'zh-CN']
    : [locale, 'en', 'zh-CN'];
  for (const l of tryLocales) {
    try {
      const strapiLocale = l === 'en-US' ? 'en' : l;
      const res = await fetchWithFallback<StrapiResponse<StrapiSolution>>('/solutions', {
        locale: strapiLocale,
        populate: '*',
        sort: ['createdAt:desc'],
      });
      const data = res.data ?? [];
      if (data.length > 0) return data;
    } catch {
      // 继续下一个fallback
    }
  }
  console.warn('[API] getSolutions failed for all locales');
  return [];
}

export async function getSolutionBySlug(
  slug: string,
  locale = 'zh-CN'
): Promise<StrapiSolution | null> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiSolution>>('/solutions', {
      locale,
      populate: '*',
      filters: { slug: { $eq: slug } },
    });
    return res.data?.[0] ?? null;
  } catch {
    console.warn(`[API] getSolutionBySlug(${slug}) failed, returning null`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export async function getArticles(
  locale = 'zh-CN',
  page = 1,
  pageSize = 12
): Promise<StrapiResponse<StrapiArticle>> {
  // Strapi locale mapping: en-US→en，其他非zh-CN→en fallback
  const strapiLocale = locale === 'en-US' ? 'en' : locale;
  const emptyResponse: StrapiResponse<StrapiArticle> = {
    data: [],
    meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } },
  };

  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiArticle>>('/articles', {
      locale: strapiLocale,
      populate: '*',
      sort: 'publishedAt:desc',
      pagination: { page, pageSize },
    });
    // 如果非zh-CN拿到空结果，fallback到zh-CN
    if ((res.data?.length ?? 0) === 0 && strapiLocale !== 'zh-CN') {
      return fetchWithFallback<StrapiResponse<StrapiArticle>>('/articles', {
        locale: 'zh-CN',
        populate: '*',
        sort: 'publishedAt:desc',
        pagination: { page, pageSize },
      });
    }
    return res;
  } catch {
    console.warn('[API] getArticles failed, returning empty response');
    return emptyResponse;
  }
}

export async function getArticleBySlug(
  slug: string,
  locale = 'zh-CN'
): Promise<StrapiArticle | null> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiArticle>>('/articles', {
      locale,
      populate: '*',
      filters: { slug: { $eq: slug } },
    });
    return res.data?.[0] ?? null;
  } catch {
    console.warn(`[API] getArticleBySlug(${slug}) failed, returning null`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function getFAQs(locale = 'zh-CN'): Promise<StrapiFAQ[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiFAQ>>('/faqs', {
      locale,
      sort: ['createdAt:asc'],
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getFAQs failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Compatible Brands
// ---------------------------------------------------------------------------

export async function getCompatibleBrands(options?: { showOnHomepage?: boolean }): Promise<StrapiCompatibleBrand[]> {
  try {
    const params: Record<string, unknown> = {
      populate: '*',
      sort: ['name:asc'],
      'pagination[limit]': -1,
    };
    if (options?.showOnHomepage === true) {
      params['filters[showOnHomepage][$eq]'] = true;
    }
    const res = await fetchStrapi<StrapiResponse<StrapiCompatibleBrand>>(
      '/compatible-brands',
      params,
    );
    return res.data ?? [];
  } catch {
    console.warn('[API] getCompatibleBrands failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Job Postings
// ---------------------------------------------------------------------------

export async function getJobPostings(locale = 'zh-CN'): Promise<StrapiJobPosting[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiJobPosting>>('/job-postings', {
      locale,
      filters: { isActive: { $eq: true } },
      sort: 'createdAt:desc',
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getJobPostings failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Doc Resources
// ---------------------------------------------------------------------------

export async function getDocResources(): Promise<any[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<any>>('/doc-resources', {
      sort: ['sortOrder:asc'],
      pagination: { limit: 100 },
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getDocResources failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Software Downloads
// ---------------------------------------------------------------------------

export async function getSoftwareDownloads(): Promise<any[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<any>>('/software-downloads', {
      sort: ['sortOrder:asc'],
      pagination: { limit: 50 },
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getSoftwareDownloads failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Firmware Versions
// ---------------------------------------------------------------------------

export async function getFirmwareVersions(): Promise<any[]> {
  try {
    const res = await fetchWithFallback<StrapiResponse<any>>('/firmware-versions', {
      sort: ['sortOrder:asc'],
      pagination: { limit: 100 },
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getFirmwareVersions failed, returning empty array');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Product Relations
// ---------------------------------------------------------------------------

export async function getProductRelations(productSlug: string): Promise<{ productSlug: string; solutionSlug: string; showOnProduct: boolean; showOnSolution: boolean; sortOrder: number }[]> {
  try {
    // 用原生 fetch + cache:'no-store' 避免 SSG build 时 dedup 缓存污染
    const STRAPI_INTERNAL = process.env.STRAPI_INTERNAL_URL || 'http://localhost:1337';
    const url = `${STRAPI_INTERNAL}/api/product-relations?filters[productSlug][$eq]=${encodeURIComponent(productSlug)}&sort=sortOrder:asc&pagination[limit]=20`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return [];
    const res: StrapiResponse<any> = await resp.json();
    return (res.data ?? []).map((item: any) => ({
      productSlug: item.productSlug,
      solutionSlug: item.solutionSlug,
      showOnProduct: item.showOnProduct ?? true,
      showOnSolution: item.showOnSolution ?? true,
      sortOrder: item.sortOrder ?? 0,
    }));
  } catch {
    console.warn(`[API] getProductRelations(${productSlug}) failed`);
    return [];
  }
}
