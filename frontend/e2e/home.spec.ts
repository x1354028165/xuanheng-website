import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads zh-CN home page with hero section", async ({ page }) => {
    await page.goto("/zh-CN");
    await expect(page).toHaveTitle(/旭衡|AlwaysControl/);
    await expect(page.locator("h1")).toContainText("智慧能源");
  });

  test("loads en-US home page with English hero", async ({ page }) => {
    await page.goto("/en-US");
    await expect(page.locator("h1")).toContainText("Smart Energy");
  });

  test("zh-CN to en-US language switch via URL", async ({ page }) => {
    await page.goto("/zh-CN");
    await expect(page.locator("h1")).toContainText("智慧能源");

    await page.goto("/en-US");
    await expect(page.locator("h1")).toContainText("Smart Energy");
  });

  test("navigation links are visible and clickable on desktop", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop nav only");
    await page.goto("/zh-CN");

    const nav = page.locator("header nav, header");
    await expect(nav.getByRole("link", { name: "解决方案" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "产品中心" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "联系我们" })).toBeVisible();
  });

  test("stats section shows 200+, 50+, 500+", async ({ page }) => {
    await page.goto("/zh-CN");
    await expect(page.getByText("200+", { exact: true })).toBeVisible();
    await expect(page.getByText("50+", { exact: true })).toBeVisible();
    await expect(page.getByText("500+", { exact: true })).toBeVisible();
  });

  test("hero CTA buttons link correctly", async ({ page }) => {
    await page.goto("/zh-CN");
    const solutionsLink = page.getByRole("link", { name: "了解解决方案" });
    await expect(solutionsLink).toBeVisible();
    await expect(solutionsLink).toHaveAttribute("href", /\/solutions/);

    const contactLink = page.locator("section").first().getByRole("link", { name: "联系我们" });
    await expect(contactLink).toHaveAttribute("href", /\/contact/);
  });
});
