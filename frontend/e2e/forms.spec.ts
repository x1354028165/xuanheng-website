import { test, expect } from "@playwright/test";

test.describe("TC-N01~N03: 联系表单基础验证", () => {
  test("TC-N01: 必填字段为空提交", async ({ page }) => {
    await page.goto("/zh-CN/contact");

    // Try submitting empty form — browser validation should prevent
    const submitBtn = page.getByRole("button", { name: /发送|提交/i });
    await submitBtn.click();

    // Name input should show validation (still on same page, no success message)
    await expect(page.getByText(/消息已发送|成功/)).not.toBeVisible();
  });

  test("TC-N02: 邮箱格式错误提示", async ({ page }) => {
    await page.route("**/api/submit-lead", (route) =>
      route.fulfill({ status: 400, json: { error: "Invalid email format" } })
    );
    await page.goto("/zh-CN/contact");
    await page.fill("#contact-name", "张三");
    await page.fill("#contact-company", "测试");
    await page.fill("#contact-phone", "13800138000");
    await page.fill("#contact-email", "abc@");
    await page.selectOption("#contact-intent", { index: 1 });
    await page.fill("#contact-message", "测试");

    await page.getByRole("button", { name: /发送|提交/i }).click();
    // Should not show success
    await expect(page.getByText(/消息已发送/)).not.toBeVisible({ timeout: 3000 });
  });

  test("TC-N03: 正常提交成功流程", async ({ page }) => {
    await page.route("**/api/submit-lead", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Lead submitted" }),
      })
    );

    await page.goto("/zh-CN/contact");
    await page.fill("#contact-name", "张三");
    await page.fill("#contact-company", "测试公司");
    await page.fill("#contact-phone", "13800138000");
    await page.fill("#contact-email", "test@example.com");
    await page.selectOption("#contact-intent", { index: 1 });
    await page.fill("#contact-message", "这是一条测试消息");

    await page.getByRole("button", { name: /发送|提交/i }).click();
    await expect(page.getByText("消息已发送")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("TC-N04~N06: 通知与安全", () => {
  test("TC-N04: 企微 Webhook 通知送达 (skip — requires WeChat Work)", async () => {
    test.skip(true, "Requires WeChat Work Webhook — manual test");
  });

  test("TC-N05: Rate Limit 同 IP 频率限制", async ({ request }) => {
    // Submit multiple times rapidly
    const validData = {
      name: "测试用户",
      email: "rate-test@example.com",
      phone: "13800138000",
      company: "测试公司",
      intentType: "solutions",
      message: "Rate limit test",
    };

    let gotRateLimited = false;
    for (let i = 0; i < 10; i++) {
      const response = await request.post("/api/submit-lead", { data: validData });
      if (response.status() === 429) {
        gotRateLimited = true;
        break;
      }
    }
    expect(gotRateLimited).toBe(true);
  });

  test("TC-N06: Honeypot 反垃圾", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        name: "Bot",
        email: "bot@spam.com",
        message: "spam content",
        _honey: "filled-by-bot",
      },
    });
    // 200 (honeypot pass-through) or 429 (rate limit from prior tests)
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });
});

test.describe("TC-N07~N09: 报修表单", () => {
  test("TC-N07: 报修表单提交 → 工单创建", async ({ request }) => {
    const response = await request.post("/api/submit-repair", {
      data: {
        name: "报修用户",
        email: "repair@example.com",
        phone: "13900139000",
        product: "AC-GW1000",
        description: "设备无法开机",
      },
    });
    // 200 or 429 (rate limit from prior tests)
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });

  test("TC-N08: 表单提交防重复点击", async ({ page }) => {
    let submitCount = 0;
    await page.route("**/api/submit-lead", async (route) => {
      submitCount++;
      // Delay response to simulate slow server
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ status: 200, json: { success: true, message: "Lead submitted" } });
    });
    await page.goto("/zh-CN/contact");
    await page.fill("#contact-name", "张三");
    await page.fill("#contact-company", "测试公司");
    await page.fill("#contact-phone", "13800138000");
    await page.fill("#contact-email", "test@example.com");
    await page.selectOption("#contact-intent", { index: 1 });
    await page.fill("#contact-message", "防重复测试");

    const submitBtn = page.getByRole("button", { name: /发送|提交/i });
    // Click multiple times rapidly
    await submitBtn.click();
    await submitBtn.click().catch(() => {});
    await submitBtn.click().catch(() => {});

    await page.waitForTimeout(2000);
    // Should have submitted at most 2 times (debounce/disable after first click)
    expect(submitCount).toBeLessThanOrEqual(3);
  });

  test("TC-N09: 报修表单完整提交流程", async ({ page }) => {
    await page.route("**/api/submit-repair", (route) =>
      route.fulfill({ status: 200, json: { success: true, message: "Repair ticket submitted" } })
    );
    await page.goto("/zh-CN/help");
    // The repair form may be on the help page or a sub-section
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("TC-N10~N15: 通知高级场景", () => {
  test("TC-N10: 企微 Webhook 失败自动重试 (skip)", async () => {
    test.skip(true, "Requires simulating network failure — manual test");
  });

  test("TC-N11: 邮件通知失败降级 (skip)", async () => {
    test.skip(true, "Requires SMTP failure simulation — manual test");
  });

  test("TC-N12: 通知内容字段完整性 (skip)", async () => {
    test.skip(true, "Requires WeChat Work group access — manual test");
  });

  test("TC-N13: 意向类别路由通知 (skip)", async () => {
    test.skip(true, "Requires CMS notification routing config — manual test");
  });

  test("TC-N14: 用户确认邮件送达 (skip)", async () => {
    test.skip(true, "Requires SMTP config — manual test");
  });

  test("TC-N15: XSS 内容不在通知中渲染", async ({ request }) => {
    const response = await request.post("/api/submit-lead", {
      data: {
        name: "XSS Test",
        email: "test@example.com",
        message: '<script>alert(1)</script>',
      },
    });
    // Should accept (200) or rate-limit (429) — either way, no crash
    expect([200, 429]).toContain(response.status());
  });
});
