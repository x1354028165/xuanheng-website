import { test, expect } from "@playwright/test";

test.describe("Cookie banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored consent before each test
    await page.goto("/zh-CN");
    await page.evaluate(() => localStorage.removeItem("cookie-consent"));
    await page.reload();
  });

  test("banner appears on first visit", async ({ page }) => {
    await expect(page.getByText("接受全部")).toBeVisible();
    await expect(page.getByText("仅必要")).toBeVisible();
  });

  test("clicking Accept All hides banner and persists", async ({ page }) => {
    await page.getByText("接受全部").click();
    await expect(page.getByText("接受全部")).not.toBeVisible();

    // Verify localStorage
    const consent = await page.evaluate(() => {
      const stored = localStorage.getItem("cookie-consent");
      return stored ? JSON.parse(stored).value : null;
    });
    expect(consent).toBe("accepted");

    // Banner should stay hidden after reload
    await page.reload();
    await page.waitForTimeout(500);
    await expect(page.getByText("接受全部")).not.toBeVisible();
  });

  test("clicking Essential Only hides banner", async ({ page }) => {
    await page.getByText("仅必要").click();
    await expect(page.getByText("仅必要")).not.toBeVisible();

    const consent = await page.evaluate(() => {
      const stored = localStorage.getItem("cookie-consent");
      return stored ? JSON.parse(stored).value : null;
    });
    expect(consent).toBe("essential");
  });

  test("learn more link points to privacy page", async ({ page }) => {
    // Scope to the fixed bottom cookie banner
    const banner = page.locator(".fixed.bottom-0");
    const learnMore = banner.getByRole("link", { name: "了解更多" });
    await expect(learnMore).toHaveAttribute("href", /\/privacy/);
  });
});
