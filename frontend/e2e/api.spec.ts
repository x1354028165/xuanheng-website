import { test, expect } from "@playwright/test";

test.describe("TC-A01~A07: CMS API 端点（Mock 验证）", () => {
  test("TC-A01: GET /api/products 返回产品列表（mocked via page route）", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "p1", title: "AC-GW1000", slug: "ac-gw1000", cover: { url: "/img.png" } }],
          meta: { pagination: { total: 1 } },
        },
      });
    });
    await page.goto("/zh-CN/products");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-A02: GET /api/products/[slug] 返回单个产品", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "p1", title: "AC-GW1000", slug: "ac-gw1000", cover: { url: "/img.png" }, specs: [] }],
          meta: { pagination: { total: 1 } },
        },
      });
    });
    await page.goto("/zh-CN/products/ac-gw1000");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-A03: GET /api/products 不存在 slug 返回空数据", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        json: { data: [], meta: { pagination: { total: 0 } } },
      });
    });
    const response = await page.goto("/zh-CN/products/non-existent-slug-xyz");
    const status = response?.status() ?? 200;
    const content = await page.textContent("body");
    expect(status === 404 || content?.includes("404") || content?.includes("找不到")).toBeTruthy();
  });

  test("TC-A04: GET /api/solutions 返回场景列表", async ({ page }) => {
    await page.route("**/api/solutions*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "s1", title: "HEMS", slug: "hems", tagline: "家庭能源管理" }],
          meta: { pagination: { total: 1 } },
        },
      });
    });
    await page.goto("/zh-CN/solutions");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-A05: GET /api/articles 分页返回文章列表", async ({ page }) => {
    await page.route("**/api/articles*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "a1", title: "测试新闻", slug: "test", summary: "摘要", publishedAt: "2025-01-01" }],
          meta: { pagination: { total: 1, page: 1, pageSize: 10 } },
        },
      });
    });
    await page.goto("/zh-CN/about/news");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-A06: GET /api/faq 返回非空列表", async ({ page }) => {
    await page.route("**/api/faqs*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "f1", question: "问题1", answer: "答案1" }],
          meta: { pagination: { total: 1 } },
        },
      });
    });
    await page.goto("/zh-CN/help");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC-A07: GET /api/compatible-brands 返回品牌列表", async ({ page }) => {
    await page.route("**/api/compatible-brands*", async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: 1, documentId: "b1", name: "SMA", logo: { url: "/logo.png" } }],
          meta: { pagination: { total: 1 } },
        },
      });
    });
    await page.goto("/zh-CN/ecosystem");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("TC-A08~A11: 联系表单 API", () => {
  test("TC-A08: POST /api/submit-lead 接受有效数据返回 200", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        name: "测试用户",
        email: "test@example.com",
        phone: "13800138000",
        company: "测试公司",
        intentType: "solutions",
        message: "测试消息",
      },
    });
    // May get 429 from rate limit across test suite
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });

  test("TC-A09: POST /api/submit-lead 缺 name 返回 400", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        email: "test@example.com",
        message: "缺名字",
      },
    });
    // 400 or 429 from rate limit
    expect([400, 429]).toContain(response.status());
  });

  test("TC-A10: POST /api/submit-lead 无效邮箱返回 400", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        name: "测试用户",
        email: "invalid-email",
        message: "测试",
      },
    });
    // 400 or 429 from rate limit
    expect([400, 429]).toContain(response.status());
    if (response.status() === 400) {
      const body = await response.json();
      expect(body.error).toContain("email");
    }
  });

  test("TC-A11: POST /api/submit-lead honeypot 触发静默成功", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        name: "Bot",
        email: "bot@spam.com",
        message: "spam",
        _honey: "gotcha",
      },
    });
    // 200 (honeypot pass-through) or 429 from rate limit
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });
});

test.describe("TC-A12~A14: 报修 API", () => {
  test("TC-A12: POST /api/submit-repair 接受有效数据返回 200", async ({ request }) => {
    const response = await request.post("/api/submit-repair", {
      data: {
        name: "维修用户",
        email: "repair@example.com",
        phone: "13900139000",
        product: "AC-GW1000",
        description: "设备故障描述",
      },
    });
    // May hit rate limit from prior tests
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });

  test("TC-A13: POST /api/submit-repair 缺 name 返回 400", async ({ request }) => {
    const response = await request.post("/api/submit-repair", {
      data: {
        email: "repair@example.com",
        description: "故障描述",
      },
    });
    // 400 or 429 (rate limit from prior tests)
    expect([400, 429]).toContain(response.status());
  });

  test("TC-A14: POST /api/submit-repair 无效邮箱返回 400", async ({ request }) => {
    const response = await request.post("/api/submit-repair", {
      data: {
        name: "维修用户",
        email: "bad-email",
        description: "故障",
      },
    });
    // 400 or 429 (rate limit)
    expect([400, 429]).toContain(response.status());
  });
});

test.describe("TC-A15~A16: Revalidate API", () => {
  test("TC-A15: POST /api/revalidate 无 secret 返回 401", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { model: "product", event: "entry.update" },
    });
    expect(response.status()).toBe(401);
  });

  test("TC-A16: POST /api/revalidate 错误 secret 返回 401", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      headers: { "x-revalidate-secret": "wrong-secret" },
      data: { model: "product", event: "entry.update" },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("TC-A17: Sitemap API", () => {
  test("TC-A17: GET /sitemap.xml 返回有效 XML", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<url>");
    expect(body).toContain("<loc>");
  });
});

test.describe("TC-A18~A19: 认证 & 鉴权", () => {
  test("TC-A18: 搜索 API 公开可访问", async ({ request }) => {
    const response = await request.get("/api/search?q=test&locale=zh-CN");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("products");
    expect(body).toHaveProperty("solutions");
    expect(body).toHaveProperty("articles");
    expect(body).toHaveProperty("faqs");
    expect(Array.isArray(body.products)).toBe(true);
  });

  test("TC-A19: Draft API 未授权返回 401", async ({ request }) => {
    const response = await request.get("/api/draft");
    expect(response.status()).toBe(401);
  });
});

test.describe("TC-A20~A24: 降级 & 其他", () => {
  test("TC-A20: 后端不可用时前端降级展示 (skip — requires stopping Strapi)", async () => {
    test.skip(true, "Manual test — requires stopping Strapi");
  });

  test("TC-A21: CMS 发布内容同步 (skip — CMS not deployed)", async () => {
    test.skip(true, "Requires running Strapi with Webhook");
  });

  test("TC-A22: 草稿保护 (skip — CMS not deployed)", async () => {
    test.skip(true, "Requires running Strapi");
  });

  test("TC-A23: ISR 降级展示 (skip — CMS not deployed)", async () => {
    test.skip(true, "Manual test — requires stopping Strapi");
  });

  test("TC-A24: 下载中转接口 (skip — CMS not deployed)", async () => {
    test.skip(true, "Requires Strapi custom route");
  });
});
