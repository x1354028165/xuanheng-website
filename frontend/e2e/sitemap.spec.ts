import { test, expect } from "@playwright/test";

test.describe("Sitemap", () => {
  test("returns 200 and contains <url> tags", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("<url>");
    expect(body).toContain("<loc>");
    expect(body).toContain("alwayscontrol");
  });

  test("sitemap includes key pages", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(body).toContain("/products");
    expect(body).toContain("/solutions");
    expect(body).toContain("/contact");
    expect(body).toContain("/help");
  });
});
