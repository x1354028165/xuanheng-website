# AlwaysControl Website / 旭衡电子官网

B2B 企业官网，面向全球新能源行业客户，提供智慧能源管理解决方案、产品展示、技术支持等功能。

**技术栈：** Next.js 16 (App Router) + Tailwind CSS 4 + Strapi 5 + PostgreSQL

**域名：** alwayscontrol.com.cn

## 目录结构

```
frontend/    — 官网前端（Next.js 16 + React 19 + TypeScript）
cms/         — CMS 后台（Strapi 5 + Ant Design v5）
docs/        — 需求文档、视觉规范、测试用例
```

## 本地开发

### 环境要求

- Node.js 20+
- PostgreSQL（CMS 生产环境）

### 环境变量

**frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=https://alwayscontrol.com.cn
STRAPI_PUBLIC_TOKEN=<Strapi只读API Token>
STRAPI_WRITE_TOKEN=<限权写Token，仅leads/repair-tickets>
STRAPI_WEBHOOK_SECRET=<随机字符串>
```

**cms/.env**

```env
DATABASE_CLIENT=postgres
DATABASE_URL=<PostgreSQL连接串>
APP_KEYS=<随机生成>
JWT_SECRET=<随机生成>
```

### 启动命令

```bash
# 前端开发
cd frontend && npm install && npm run dev    # http://localhost:3000

# CMS 开发
cd cms && npm install && npm run develop     # http://localhost:1337/admin

# 前端生产构建
cd frontend && npm run build

# E2E 测试
cd frontend && npx playwright test
```

## 部署

### 生产环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_URL` | Strapi API 地址 |
| `NEXT_PUBLIC_SITE_URL` | 站点公开 URL |
| `STRAPI_PUBLIC_TOKEN` | Strapi 只读 Token (ISR 拉取) |
| `STRAPI_WRITE_TOKEN` | Strapi 写 Token (表单提交) |
| `STRAPI_WEBHOOK_SECRET` | Webhook 验签密钥 |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `APP_KEYS` | Strapi 应用密钥 |
| `JWT_SECRET` | Strapi JWT 密钥 |

### 构建与部署

```bash
# 前端
cd frontend && npm run build && npm start

# CMS
cd cms && npm run build && npm start
```

## 功能清单

### Phase 1 — 前台页面（24页）

- 首页（Hero / 统计 / 解决方案 / 产品 / 兼容品牌 / 新闻 / CTA）
- 解决方案列表 + 详情页
- 产品中心列表 + 详情页
- 兼容生态页
- 帮助中心（FAQ / 技术文档 / 维修申请）
- 关于我们（公司介绍 / 发展历程 / 新闻动态 / 招聘）
- 联系我们（询盘表单）
- 隐私政策

### Phase 2 — 全局功能

- 全站搜索（Cmd+K / 搜索按钮，支持产品/方案/文章/FAQ）
- Cookie 同意横幅（接受全部 / 仅必要 / 隐私链接）
- Sitemap.xml（静态页 + 动态 CMS 内容）
- SEO 元数据（Open Graph / Twitter Card / 结构化数据）
- 404 / 500 错误页
- 8 语言国际化（zh-CN / en-US / zh-TW / de / fr / pt / es / ru）

### Phase 3 — CMS 后台定制

- 品牌化管理后台（Logo / 配色 / 仪表盘）
- 22 个内容模块（文章 / 产品 / 方案 / FAQ / 品牌 / 职位 / 询盘 / 维修工单等）
- Ant Design v5 管理界面

### Phase 4 — 自动化与集成

- 翻译 Hook（发布触发 → OpenCC zh-TW + DeepSeek 5语言）
- 表单通知（询盘 / 维修工单 → 管理后台通知）
- ISR 增量静态再生成（Strapi Webhook 触发）
- Draft Mode 预览

### Phase 5 — 质量保证

- TypeScript 严格模式零报错
- Next.js 生产构建零报错
- Playwright E2E 测试（首页 / 搜索 / Cookie / 表单 / Sitemap）

## 多语言支持

| 语言 | 代码 | 维护方式 |
|------|------|---------|
| 简体中文 | zh-CN | 人工维护（原文） |
| English | en-US | 人工维护 |
| 繁體中文 | zh-TW | OpenCC 自动转换 |
| Deutsch | de | DeepSeek 自动翻译 |
| Francais | fr | DeepSeek 自动翻译 |
| Portugues | pt | DeepSeek 自动翻译 |
| Espanol | es | DeepSeek 自动翻译 |
| Русский | ru | DeepSeek 自动翻译 |

## 文档索引

| 文档 | 路径 |
|------|------|
| 需求文档 | `docs/需求文档.html` |
| 执行文件 | `docs/执行文件.html` |
| 视觉规范 | `docs/视觉规范.html` |
| 前端技术规范 | `docs/前端技术规范.html` |
| 后端技术规范 | `docs/后端技术规范.html` |
| 测试用例 | `docs/测试用例.html` |
| 施工计划 | `施工计划.md` |
