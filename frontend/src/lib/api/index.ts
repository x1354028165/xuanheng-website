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
      sort: ['sortOrder:asc', 'createdAt:desc'],
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
  try {
    const res = await fetchWithFallback<StrapiResponse<StrapiSolution>>('/solutions', {
      locale,
      populate: '*',
      sort: ['sortOrder:asc', 'createdAt:desc'],
    });
    return res.data ?? [];
  } catch {
    console.warn('[API] getSolutions failed, returning empty array');
    return [];
  }
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
      sort: ['sortOrder:asc', 'createdAt:asc'],
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
        sort: ['sortOrder:asc', 'name:asc'],
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
