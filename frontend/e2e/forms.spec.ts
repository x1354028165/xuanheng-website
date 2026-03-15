import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("submits form successfully with mocked API", async ({ page }) => {
    // Mock submit-lead API
    await page.route("**/api/submit-lead", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Lead submitted" }),
      })
    );

    await page.goto("/zh-CN/contact");

    // Fill form fields
    await page.fill("#contact-name", "张三");
    await page.fill("#contact-company", "测试公司");
    await page.fill("#contact-phone", "13800138000");
    await page.fill("#contact-email", "test@example.com");
    await page.selectOption("#contact-intent", "solutions");
    await page.fill("#contact-message", "这是一条测试消息");

    // Submit
    await page.getByRole("button", { name: "发送消息" }).click();

    // Success message should appear
    await expect(page.getByText("消息已发送")).toBeVisible({ timeout: 5000 });
  });

  test("shows error on API failure", async ({ page }) => {
    await page.route("**/api/submit-lead", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );

    await page.goto("/zh-CN/contact");

    await page.fill("#contact-name", "张三");
    await page.fill("#contact-phone", "13800138000");
    await page.fill("#contact-email", "test@example.com");
    await page.selectOption("#contact-intent", "api");
    await page.fill("#contact-message", "测试错误处理");

    await page.getByRole("button", { name: "发送消息" }).click();

    await expect(page.getByText("发送失败")).toBeVisible({ timeout: 5000 });
  });

  test("required fields prevent submission", async ({ page }) => {
    await page.goto("/zh-CN/contact");

    // Try submitting empty form — browser validation should prevent
    const submitBtn = page.getByRole("button", { name: "发送消息" });
    await submitBtn.click();

    // Name input should show validation (still on same page, no success message)
    await expect(page.getByText("消息已发送")).not.toBeVisible();
  });
});
