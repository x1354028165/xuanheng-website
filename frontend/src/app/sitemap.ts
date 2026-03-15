import type { MetadataRoute } from "next";
import { fetchStrapi } from "@/lib/strapi";
import type { StrapiResponse, StrapiProduct, StrapiSolution, StrapiArticle } from "@/types/strapi";
import { locales, defaultLocale } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alwayscontrol.com.cn";

function buildAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`;
  }
  return languages;
}

function sitemapEntry(path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/${defaultLocale}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: "weekly",
    priority,
    alternates: { languages: buildAlternates(path) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    sitemapEntry("", undefined, 1.0),
    sitemapEntry("/products", undefined, 0.9),
    sitemapEntry("/solutions", undefined, 0.9),
    sitemapEntry("/ecosystem", undefined, 0.7),
    sitemapEntry("/support", undefined, 0.6),
    sitemapEntry("/about", undefined, 0.7),
    sitemapEntry("/about/news", undefined, 0.7),
    sitemapEntry("/about/careers", undefined, 0.5),
    sitemapEntry("/contact", undefined, 0.8),
    sitemapEntry("/privacy", undefined, 0.3),
  ];

  // Dynamic pages from Strapi
  let productEntries: MetadataRoute.Sitemap = [];
  let solutionEntries: MetadataRoute.Sitemap = [];
  let articleEntries: MetadataRoute.Sitemap = [];

  try {
    const [products, solutions, articles] = await Promise.allSettled([
      fetchStrapi<StrapiResponse<StrapiProduct>>("/products", {
        fields: ["slug", "updatedAt"],
        pagination: { pageSize: 100 },
      }),
      fetchStrapi<StrapiResponse<StrapiSolution>>("/solutions", {
        fields: ["slug", "updatedAt"],
        pagination: { pageSize: 100 },
      }),
      fetchStrapi<StrapiResponse<StrapiArticle>>("/articles", {
        fields: ["slug", "updatedAt"],
        pagination: { pageSize: 100 },
      }),
    ]);

    if (products.status === "fulfilled" && products.value.data) {
      productEntries = products.value.data.map((p) =>
        sitemapEntry(`/products/${p.slug}`, p.updatedAt, 0.8)
      );
    }

    if (solutions.status === "fulfilled" && solutions.value.data) {
      solutionEntries = solutions.value.data.map((s) =>
        sitemapEntry(`/solutions/${s.slug}`, s.updatedAt, 0.8)
      );
    }

    if (articles.status === "fulfilled" && articles.value.data) {
      articleEntries = articles.value.data.map((a) =>
        sitemapEntry(`/about/news/${a.slug}`, a.updatedAt, 0.6)
      );
    }
  } catch {
    // If Strapi is unavailable, return static pages only
  }

  return [...staticPages, ...productEntries, ...solutionEntries, ...articleEntries];
}
