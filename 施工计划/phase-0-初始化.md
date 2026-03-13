# Phase 0 — 项目初始化 + 基础架构

> 前置条件：无（首个阶段）
> 对应测试用例：无独立测试用例（基础架构验证）

## 任务清单

- [ ] **P0-1** 初始化 Next.js 14 项目（App Router）
  - `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir`
  - 确认 `src/app/` 结构存在

- [ ] **P0-2** 配置 Tailwind CSS + 字体
  - 引入 Google Fonts：Plus Jakarta Sans + Inter
  - 配置 `tailwind.config.ts` 字体变量

- [ ] **P0-3** 配置 next-intl 多语言
  - 支持 locale：`zh-CN`（默认）、`en-US`
  - 目录：`src/messages/zh-CN.json`、`src/messages/en-US.json`
  - 路由：`/[locale]/...`

- [ ] **P0-4** 配置 Strapi v4
  - 初始化 Strapi 项目至 `cms/`
  - 数据库：PostgreSQL（本地开发用 SQLite）
  - 创建 API Token，配置 `frontend/.env.local`

- [ ] **P0-5** 基础布局组件
  - `src/components/layout/Header.tsx` — 导航（透明浮层，白色文字）
  - `src/components/layout/Footer.tsx` — 页脚
  - `src/app/[locale]/layout.tsx` — 根布局，引入 Header + Footer

- [ ] **P0-6** 视觉基础变量
  - 主色：#16A34A（翠绿，待主人最终确认）
  - 深色区：Navy #07090D
  - 参考：`docs/视觉规范.html`

- [ ] **P0-7** Git 结构确认
  - `frontend/` + `cms/` 均有 `.gitignore`
  - 初始 commit 推送到 main

## 通过条件

`npm run dev` 启动无报错，首页可访问，导航 + Footer 渲染正常，多语言路由 `/zh-CN/` `/en-US/` 均响应。

## 测试用例验收

参考：docs/测试用例.html 对应章节
