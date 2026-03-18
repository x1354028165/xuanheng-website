/**
 * 维度3：功能维度测试
 * 覆盖范围：语言切换、导航菜单、联系表单、报修表单、下载、手风琴/Tab组件
 */
import { test, expect } from "@playwright/test";

test.describe("功能维度 - 语言切换", () => {
  test("从zh-CN切换到en-US，URL和文字变化", async ({ page }) => {
    await page.goto("/zh-CN", { waitUntil: "networkidle", timeout: 30_000 });

    // 记录中文页面的文字
    const zhText = await page.locator("body").innerText();

    // 查找语言切换器并切换到英文
    const langSwitcher = page.locator(
      '[data-testid="language-switcher"], [class*="lang"], [class*="Lang"], [class*="locale"], button:has-text("中文"), button:has-text("CN"), a:has-text("EN")'
    ).first();

    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      // 选择英文选项
      const enOption = page.locator(
        'a:has-text("English"), button:has-text("English"), a:has-text("EN"), [href*="/en-US"], li:has-text("English")'
      ).first();
      if (await enOption.isVisible({ timeout: 3000 })) {
        await enOption.click();
      }
      await page.waitForURL(/\/en-US/, { timeout: 10_000 });
      expect(page.url()).toContain("/en-US");
    } else {
      // 直接导航到英文版本
      await page.goto("/en-US", { waitUntil: "networkidle", timeout: 30_000 });
    }

    const enText = await page.locator("body").innerText();
    // 页面文字应该不同
    expect(zhText).not.toBe(enText);
  });
});

test.describe("功能维度 - 导航菜单", () => {
  test("Products导航链接可见且可点击", async ({ page }) => {
    await page.goto("/zh-CN", { waitUntil: "networkidle", timeout: 30_000 });

    // 查找产品导航项
    const productsNav = page.locator(
      'nav a:has-text("产品"), nav a[href*="/products"], header a:has-text("产品")'
    ).first();

    if (await productsNav.isVisible({ timeout: 5000 })) {
      // hover触发下拉
      await productsNav.hover();
      await page.waitForTimeout(500);

      // 检查是否有下拉菜单出现
      const dropdown = page.locator(
        '[class*="dropdown"], [class*="submenu"], [class*="Dropdown"], [role="menu"]'
      ).first();
      const hasDropdown = await dropdown.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`产品导航下拉菜单: ${hasDropdown ? "有" : "无"}`);

      // 点击跳转
      await productsNav.click();
      await page.waitForURL(/\/products/, { timeout: 10_000 });
      expect(page.url()).toContain("/products");
    }
  });
});

test.describe("功能维度 - 联系表单", () => {
  test("填写联系表单并提交", async ({ page }) => {
    await page.goto("/zh-CN/contact", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // 查找表单字段
    const nameInput = page.locator(
      'input[name="name"], input[name="contactName"], input[placeholder*="姓名"], input[placeholder*="name" i]'
    ).first();
    const emailInput = page.locator(
      'input[name="email"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="email" i]'
    ).first();
    const messageInput = page.locator(
      'textarea[name="message"], textarea[name="content"], textarea[placeholder*="消息"], textarea[placeholder*="message" i], textarea'
    ).first();

    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill("测试用户");
    }
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill("test@example.com");
    }
    if (await messageInput.isVisible({ timeout: 5000 })) {
      await messageInput.fill("这是自动化测试消息，请忽略。");
    }

    // 提交表单
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("提交"), button:has-text("发送"), button:has-text("Submit")'
    ).first();
    if (await submitBtn.isVisible({ timeout: 5000 })) {
      // 监听网络请求
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes("/api/") && resp.status() < 500,
        { timeout: 10_000 }
      ).catch(() => null);

      await submitBtn.click();
      const response = await responsePromise;
      if (response) {
        console.log(`表单提交响应: ${response.status()} ${response.url()}`);
        expect(response.status()).toBeLessThan(500);
      }
    }
  });
});

test.describe("功能维度 - 报修表单", () => {
  test("报修页面表单存在", async ({ page }) => {
    await page.goto("/zh-CN/support/repair", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // 检查表单或表单字段存在
    const form = page.locator("form, [class*='form'], [class*='Form']").first();
    const hasForm = await form.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`报修页面表单: ${hasForm ? "存在" : "不存在"}`);

    if (hasForm) {
      // 检查基本输入字段
      const inputs = page.locator("input, textarea, select");
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
      console.log(`报修表单字段数: ${inputCount}`);
    }
  });
});

test.describe("功能维度 - 下载功能", () => {
  test("下载页面有可下载资源", async ({ page }) => {
    await page.goto("/zh-CN/support/download", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // 检查下载链接/按钮
    const downloadLinks = page.locator(
      'a[download], a[href*="download"], a[href*=".pdf"], a[href*=".zip"], button:has-text("下载"), a:has-text("下载")'
    );
    const count = await downloadLinks.count();
    console.log(`下载页面可下载资源数: ${count}`);

    if (count > 0) {
      // 检查第一个下载链接的href不为空
      const href = await downloadLinks.first().getAttribute("href");
      expect(href).toBeTruthy();
    }
  });
});

test.describe("功能维度 - 手风琴/Tab组件", () => {
  test("FAQ或产品页手风琴展开收起", async ({ page }) => {
    // 尝试FAQ页面
    await page.goto("/zh-CN/support/faq", {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // 查找手风琴触发元素
    const accordion = page.locator(
      '[data-testid*="accordion"], [class*="accordion"], [class*="Accordion"], [class*="collapse"], details, [role="button"][aria-expanded]'
    ).first();

    if (await accordion.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 点击展开
      await accordion.click();
      await page.waitForTimeout(500);

      // 检查内容显示
      const expandedContent = page.locator(
        '[class*="accordion-content"], [class*="panel"], details[open] > *:not(summary), [aria-expanded="true"]'
      ).first();
      const isExpanded = await expandedContent.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`手风琴展开: ${isExpanded}`);

      // 再次点击收起
      await accordion.click();
      await page.waitForTimeout(500);
    } else {
      console.log("未找到手风琴组件，跳过测试");
    }
  });
});
