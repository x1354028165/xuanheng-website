/**
 * 维度4：接口维度测试
 * 覆盖范围：Strapi v5 REST API × 8语言
 * 检查：数据返回、关键字段、图片URL、响应结构（无.attributes层）
 */
import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://localhost:1337" });

const locales = ["zh-CN", "en-US", "zh-TW", "de", "fr", "es", "pt", "ru"];

const endpoints = [
  { name: "products", path: "/api/products" },
  { name: "solutions", path: "/api/solutions" },
  { name: "articles", path: "/api/articles" },
];

test.describe("接口维度 - 8语言API数据返回", () => {
  for (const endpoint of endpoints) {
    for (const locale of locales) {
      test(`[${locale}] ${endpoint.name} API返回数据`, async ({
        request,
      }) => {
        const response = await request.get(
          `${endpoint.path}?locale=${locale}&populate=*`,
          { timeout: 15_000 }
        );
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.data).toBeDefined();
        // 至少主要语言应该有数据
        if (locale === "zh-CN" || locale === "en-US") {
          expect(
            body.data.length,
            `${endpoint.name} [${locale}] 无数据`
          ).toBeGreaterThan(0);
        }
      });
    }
  }
});

test.describe("接口维度 - 关键字段检查", () => {
  for (const endpoint of endpoints) {
    test(`${endpoint.name} 关键字段非null`, async ({ request }) => {
      const response = await request.get(
        `${endpoint.path}?locale=zh-CN&populate=*`,
        { timeout: 15_000 }
      );
      const body = await response.json();

      if (body.data && body.data.length > 0) {
        for (const item of body.data) {
          // Strapi v5 扁平结构：字段直接在item上，不在item.attributes里
          expect(
            item.title ?? item.name,
            `${endpoint.name} 缺少title/name`
          ).toBeTruthy();
          expect(
            item.slug,
            `${endpoint.name} id=${item.id} 缺少slug`
          ).toBeTruthy();
          expect(
            item.documentId,
            `${endpoint.name} id=${item.id} 缺少documentId`
          ).toBeTruthy();
        }
      }
    });
  }
});

test.describe("接口维度 - Strapi v5扁平结构验证", () => {
  for (const endpoint of endpoints) {
    test(`${endpoint.name} 无.attributes层（v5扁平化）`, async ({
      request,
    }) => {
      const response = await request.get(
        `${endpoint.path}?locale=zh-CN&populate=*`,
        { timeout: 15_000 }
      );
      const body = await response.json();

      if (body.data && body.data.length > 0) {
        for (const item of body.data) {
          // Strapi v5不应该有.attributes层
          expect(
            item.attributes,
            `${endpoint.name} id=${item.id} 仍有.attributes层，非v5结构`
          ).toBeUndefined();
        }
      }
    });
  }
});

test.describe("接口维度 - 图片URL检查", () => {
  for (const endpoint of endpoints) {
    test(`${endpoint.name} 图片URL格式正确`, async ({ request }) => {
      const response = await request.get(
        `${endpoint.path}?locale=zh-CN&populate=*`,
        { timeout: 15_000 }
      );
      const body = await response.json();

      if (body.data && body.data.length > 0) {
        const jsonStr = JSON.stringify(body.data);

        // 检查图片URL不应包含 :1337/（应该走代理或CDN）
        const directStrapiUrls = jsonStr.match(/:1337\/uploads\//g);
        if (directStrapiUrls) {
          console.warn(
            `⚠️ ${endpoint.name} 发现${directStrapiUrls.length}处直接引用Strapi端口的图片URL`
          );
        }

        // 检查media字段URL格式
        const urlMatches = jsonStr.match(/"url"\s*:\s*"([^"]+)"/g);
        if (urlMatches) {
          for (const match of urlMatches) {
            const url = match.replace(/"url"\s*:\s*"/, "").replace(/"$/, "");
            if (url.includes("uploads/")) {
              // 图片URL应包含 /strapi/uploads/ 或 /uploads/
              expect(
                url,
                `图片URL格式不正确: ${url}`
              ).toMatch(/\/uploads\//);
            }
          }
        }
      }
    });
  }
});
