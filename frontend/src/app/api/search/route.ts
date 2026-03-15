import { NextRequest, NextResponse } from "next/server";
import { fetchStrapi } from "@/lib/strapi";
import type { StrapiResponse, StrapiProduct, StrapiSolution, StrapiArticle, StrapiFAQ } from "@/types/strapi";

interface SearchResultItem {
  type: "product" | "solution" | "article" | "faq";
  title: string;
  slug: string;
  summary?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const locale = searchParams.get("locale") || "zh-CN";

  if (!q || q.length < 2) {
    return NextResponse.json(
      { products: [], solutions: [], articles: [], faqs: [] },
      { status: 200 }
    );
  }

  const filterContains = (field: string) => ({
    [field]: { $containsi: q },
  });

  // Parallel fetch all content types
  const [productsRes, solutionsRes, articlesRes, faqsRes] = await Promise.allSettled([
    fetchStrapi<StrapiResponse<StrapiProduct>>("/products", {
      locale,
      fields: ["title", "slug", "tagline"],
      filters: { $or: [filterContains("title"), filterContains("tagline")] },
      pagination: { pageSize: 5 },
    }),
    fetchStrapi<StrapiResponse<StrapiSolution>>("/solutions", {
      locale,
      fields: ["title", "slug", "tagline"],
      filters: { $or: [filterContains("title"), filterContains("tagline")] },
      pagination: { pageSize: 5 },
    }),
    fetchStrapi<StrapiResponse<StrapiArticle>>("/articles", {
      locale,
      fields: ["title", "slug", "summary"],
      filters: { $or: [filterContains("title"), filterContains("summary")] },
      pagination: { pageSize: 5 },
    }),
    fetchStrapi<StrapiResponse<StrapiFAQ>>("/faqs", {
      locale,
      fields: ["question", "answer"],
      filters: { $or: [filterContains("question"), filterContains("answer")] },
      pagination: { pageSize: 5 },
    }),
  ]);

  const products: SearchResultItem[] =
    productsRes.status === "fulfilled"
      ? (productsRes.value.data ?? []).map((p) => ({
          type: "product" as const,
          title: p.title,
          slug: p.slug,
          summary: p.tagline ?? undefined,
        }))
      : [];

  const solutions: SearchResultItem[] =
    solutionsRes.status === "fulfilled"
      ? (solutionsRes.value.data ?? []).map((s) => ({
          type: "solution" as const,
          title: s.title,
          slug: s.slug,
          summary: s.tagline ?? undefined,
        }))
      : [];

  const articles: SearchResultItem[] =
    articlesRes.status === "fulfilled"
      ? (articlesRes.value.data ?? []).map((a) => ({
          type: "article" as const,
          title: a.title,
          slug: a.slug,
          summary: a.summary ?? undefined,
        }))
      : [];

  const faqs: SearchResultItem[] =
    faqsRes.status === "fulfilled"
      ? (faqsRes.value.data ?? []).map((f) => ({
          type: "faq" as const,
          title: f.question,
          slug: "",
          summary: f.answer.slice(0, 100),
        }))
      : [];

  return NextResponse.json({ products, solutions, articles, faqs });
}
