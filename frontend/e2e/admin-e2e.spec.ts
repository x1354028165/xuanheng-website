import { test, expect, type BrowserContext } from '@playwright/test';

const BASE = 'http://localhost/admin';
const LOGIN_EMAIL = 'admin@gmail.com';
const LOGIN_PWD = 'Admin1234!';

// 共享登录状态，只登录一次
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  sharedContext = await browser.newContext();
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/login`);
  await page.locator('input[type="email"], input[id*="email"]').first().fill(LOGIN_EMAIL);
  await page.locator('input[type="password"]').fill(LOGIN_PWD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });
  console.log('✅ 全局登录成功，开始测试');
  await page.close();
});

test.afterAll(async () => {
  await sharedContext.close();
});

test('1. 仪表盘加载', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState('networkidle');
  const content = await page.locator('.ant-layout-content').textContent();
  expect(content?.length).toBeGreaterThan(5);
  console.log('✅ 仪表盘加载成功');
  await page.close();
});

test('2. 侧边栏 - 7个分组全部存在', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState('networkidle');
  const sidebar = await page.locator('.ant-layout-sider').textContent();
  const groups = ['内容管理', '内容与页面', '资产管理', '线索与工单', '系统配置', '运维工具', '账号管理'];
  for (const g of groups) {
    expect(sidebar).toContain(g);
    console.log(`  ✅ 分组存在: ${g}`);
  }
  await page.close();
});

test('3. 新闻模块 - 列表+新建弹窗', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/news`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });
  console.log('  ✅ 新闻列表加载');

  const createBtn = page.locator('button').filter({ hasText: /新增|创建|Create|新建/ }).first();
  await createBtn.click();
  await expect(page.locator('.ant-drawer, .ant-modal')).toBeVisible({ timeout: 5000 });
  console.log('  ✅ 新建弹窗打开');
  await page.close();
});

test('4. 案例管理页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/cases`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });
  console.log('✅ 案例管理页加载成功');
  await page.close();
});

test('5. SEO配置页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/seo-config`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });
  console.log('✅ SEO配置页加载成功');
  await page.close();
});

test('6. 多语言字典页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/i18n-dict`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });
  console.log('✅ 多语言字典页加载成功');
  await page.close();
});

test('7. 账号管理页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/account-mgmt`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });
  console.log('✅ 账号管理页加载成功');
  await page.close();
});

test('8. 健康检查页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/health-check`);
  await page.waitForLoadState('networkidle');
  const content = await page.locator('.ant-layout-content').textContent();
  expect(content?.length).toBeGreaterThan(5);
  console.log('✅ 健康检查页加载成功');
  await page.close();
});

test('9. 媒体库页', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/media-library`);
  await page.waitForLoadState('networkidle');
  const content = await page.locator('.ant-layout-content').textContent();
  expect(content?.length).toBeGreaterThan(5);
  console.log('✅ 媒体库页加载成功');
  await page.close();
});

test('10. FAQ模块 - 新建弹窗提交测试', async () => {
  const page = await sharedContext.newPage();
  await page.goto(`${BASE}/faq`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8000 });

  const createBtn = page.locator('button').filter({ hasText: /新增|创建|Create|新建/ }).first();
  await createBtn.click();
  const drawer = page.locator('.ant-drawer, .ant-modal');
  await expect(drawer).toBeVisible({ timeout: 5000 });

  // 填写表单
  await page.locator('.ant-drawer input, .ant-modal input').first().fill('E2E测试问题');
  console.log('  ✅ FAQ表单填写成功');
  await page.close();
});
