import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("search dialog opens and shows results (mocked API)", async ({ page }) => {
    // Mock search API
    await page.route("**/api/search*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          products: [{ type: "product", title: "AC-GW1000", slug: "ac-gw1000", summary: "Gateway" }],
          solutions: [],
          articles: [],
          faqs: [],
        }),
      })
    );

    await page.goto("/zh-CN");

    // Click search button in header
    const searchBtn = page.locator("header").getByRole("button", { name: /search/i });
    await searchBtn.click();

    // Search dialog should open — type a query
    const searchInput = page.locator("input[type='text']").last();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("GW1000");

    // Wait for debounced result
    await expect(page.getByText("AC-GW1000")).toBeVisible({ timeout: 5000 });
  });

  test("search dialog closes on ESC", async ({ page }) => {
    await page.goto("/zh-CN");

    const searchBtn = page.locator("header").getByRole("button", { name: /search/i });
    await searchBtn.click();

    const dialog = page.locator(".fixed.inset-0");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
