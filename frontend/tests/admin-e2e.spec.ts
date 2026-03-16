import { test, expect } from '@playwright/test';

const BASE = 'http://localhost/admin';
const LOGIN_EMAIL = 'admin@gmail.com';
const LOGIN_PWD = 'Admin1234!';

test.describe('后台管理 E2E 测试', () => {

  test('1. 登录流程', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="email"], input[id*="email"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    console.log('✅ 登录成功');
  });

  test('2. 侧边栏导航 - 所有分组可见', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // 检查侧边栏分组
    const sidebar = page.locator('.ant-layout-sider, aside');
    await expect(sidebar).toBeVisible();
    const text = await sidebar.textContent();
    console.log('侧边栏内容片段:', text?.slice(0, 200));
    expect(text).toContain('仪表盘');
  });

  test('3. 新闻模块 - 列表加载', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/news`);
    await page.waitForLoadState('networkidle');
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible({ timeout: 8000 });
    console.log('✅ 新闻列表加载成功');
  });

  test('4. 案例管理页面 - 可访问', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/cases`);
    await page.waitForLoadState('networkidle');
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible({ timeout: 8000 });
    console.log('✅ 案例管理页加载成功');
  });

  test('5. 新闻 - 新建表单弹窗', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/news`);
    await page.waitForLoadState('networkidle');

    // 点击新增按钮
    const createBtn = page.locator('button').filter({ hasText: /新增|创建|Create|新建/ }).first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    await createBtn.click();

    // 等待 Drawer 打开
    const drawer = page.locator('.ant-drawer, .ant-modal');
    await expect(drawer).toBeVisible({ timeout: 5000 });
    console.log('✅ 新建弹窗打开成功');
  });

  test('6. SEO配置页面 - 可访问', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/seo-config`);
    await page.waitForLoadState('networkidle');
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible({ timeout: 8000 });
    console.log('✅ SEO配置页加载成功');
  });

  test('7. 健康检查 - 扫描执行', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
    await page.locator('input[type="password"]').fill(LOGIN_PWD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto(`${BASE}/health-check`);
    await page.waitForLoadState('networkidle');
    // 页面应该有内容（表格或按钮）
    const content = await page.locator('main, .ant-layout-content').textContent();
    expect(content?.length).toBeGreaterThan(10);
    console.log('✅ 健康检查页加载成功');
  });

});
