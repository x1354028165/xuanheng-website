# CLAUDE.md — AlwaysControl Website (旭衡电子官网重构)

## 项目概览
- 企业：旭衡电子（AlwaysControl Technology）
- 域名：alwayscontrol.com.cn
- 技术栈：Next.js 14 App Router + Tailwind CSS + Strapi v4 + PostgreSQL
- 前端目录：`frontend/`，CMS 目录：`cms/`

## 启动命令
```bash
# 前端
cd frontend && npm run dev          # http://localhost:3000
cd frontend && npm run build        # 生产构建
cd frontend && npx playwright test  # 运行所有测试

# CMS
cd cms && npm run develop           # http://localhost:1337/admin
```

## 核心规则（必须遵守）

### 代码规则
- TypeScript strict 模式，禁止 `any`
- 禁止 JSX 中硬编码中文，所有文案通过 `next-intl` 的 `t()` 函数
- 禁止裸 `<img>` 标签，使用 `next/image` 的 `<Image>` 并附非空 `alt`
- API 调用统一封装在 `src/lib/api/`，页面组件禁止直接 `fetch()`
- SSR 强制：所有页面必须服务端渲染，禁止纯客户端 SPA

### 颜色规则
- 主色（品牌青）：`#38C4E8` → CSS var: `--brand`
- 辅色（深蓝）：`#1A3FAD` → CSS var: `--accent`
- 深背景：`#0C1829`
- 禁止在同一视图使用两种品牌色
- `#38C4E8` 禁止用作大面积背景色（只用于CTA/强调）

### 施工规则
- 完成每个模块 → 立即跑对应 Playwright spec → 通过后继续下一个
- Phase 结束 → 跑完整测试用例集 → 全部通过 → 进入下一 Phase
- 测试失败 = 停止，原地修复，禁止带着失败继续

### 测试规则
- 测试文件路径：`frontend/tests/`
- 视觉回归基准图：`frontend/tests/snapshots/`
- 截图对比失败时输出 diff，禁止直接更新基准图跳过问题
- 必须覆盖三个 viewport：375px（手机）/ 768px（平板）/ 1280px（桌面）

## 设计参考
视觉基准文件：`docs/preview.html`（本地打开）或 https://x1354028165.github.io/xuanheng-website/docs/preview.html
- 实现效果应达到或超越预览页
- 设计规范：`docs/视觉规范.html`

## 文档索引
| 文档 | 路径 | 用途 |
|------|------|------|
| 需求文档 | `docs/需求文档.html` | 前台页面清单、CMS模块清单 |
| 执行文件 | `docs/执行文件.html` | 各页面详细功能需求 |
| 视觉规范 | `docs/视觉规范.html` | 颜色/字体/间距/组件规范 |
| 前端技术规范 | `docs/前端技术规范.html` | Next.js/Tailwind/测试规范 |
| 后端技术规范 | `docs/后端技术规范.html` | Strapi Content Type/API/DDL |
| 测试用例 | `docs/测试用例.html` | TC-A~TC-T 215条测试用例 |
| 施工计划 | `docs/施工计划.html` | Phase 0-7 任务清单 |

## 环境变量
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=https://alwayscontrol.com.cn
STRAPI_WEBHOOK_SECRET=<生成随机字符串>

# cms/.env
DATABASE_CLIENT=postgres
DATABASE_URL=<PostgreSQL连接串>
APP_KEYS=<生成>
JWT_SECRET=<生成>
```

## 当前进度
- [x] 文档套件完整（需求/执行/视觉/前端规范/后端规范/测试用例/施工计划）
- [x] 视觉预览页 `docs/preview.html` 确认
- [ ] Phase 0 — 项目初始化（待开始）
