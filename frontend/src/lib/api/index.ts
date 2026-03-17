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
  const emptyResponse: StrapiResponse<StrapiArticle> = {
    data: [],
    meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } },
  };

  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiArticle>>('/articles', {
      locale,
      populate: '*',
      sort: 'publishedAt:desc',
      pagination: { page, pageSize },
    });
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

export async function getCompatibleBrands(): Promise<StrapiCompatibleBrand[]> {
  try {
    const res = await fetchStrapi<StrapiResponse<StrapiCompatibleBrand>>(
      '/compatible-brands',
      {
        populate: '*',
        sort: ['name:asc'],
      }
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
