// Strapi v5 flat structure types — NO .attributes nesting
// All fields are accessed directly: item.title, NOT item.attributes.title
// Always use documentId (NOT numeric id)

// ---------------------------------------------------------------------------
// Generic response wrappers
// ---------------------------------------------------------------------------

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: StrapiPagination;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  name: string;
  hash: string;
  ext: string;
  mime: string;
}

export interface StrapiMedia {
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  url: string;
  mime: string;
  ext: string;
  size: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

export interface StrapiSEO {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogImage: StrapiMedia | null;
  canonicalURL: string | null;
}

// ---------------------------------------------------------------------------
// Content types — field names match schema.json exactly
// ---------------------------------------------------------------------------

export interface StrapiArticle {
  documentId: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  cover: StrapiMedia | null;
  publishedDate: string | null;
  viewCount: number | null;
  is_translation_locked: boolean;
  seo: StrapiSEO | null;
  publishedAt: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiProduct {
  documentId: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cover: StrapiMedia | null;
  gallery: StrapiMedia[] | null;
  specs: Record<string, string> | null;
  is_translation_locked: boolean;
  seo: StrapiSEO | null;
  publishedAt: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiSolution {
  documentId: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cover: StrapiMedia | null;
  sortOrder: number;
  is_translation_locked: boolean;
  seo: StrapiSEO | null;
  publishedAt: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiFAQ {
  documentId: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  is_translation_locked: boolean;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiCompatibleBrand {
  documentId: string;
  name: string;
  logo: StrapiMedia | null;
  category: string | null;
  accessMethod?: string | null;
  capabilities?: string[] | null;
  status?: string | null;
  websiteUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiJobPosting {
  documentId: string;
  title: string;
  department: string | null;
  location: string | null;
  type: 'full-time' | 'part-time' | 'contract' | null;
  description: string | null;
  requirements: string | null;
  isActive: boolean;
  locale: string;
  createdAt: string;
  updatedAt: string;
}
