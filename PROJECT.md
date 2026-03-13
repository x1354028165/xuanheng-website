# PROJECT.md — 旭衡电子官网重构项目总纲

> **Coding Agent 必读。每次启动任务前，先读完本文件，再读对应阶段的施工计划。**

---

## 一、项目基本信息

| 字段 | 值 |
|------|-----|
| 项目名称 | 旭衡电子（AlwaysControl Technology）官网重构 |
| 仓库地址 | https://github.com/x1354028165/xuanheng-website.git |
| 主分支 | main |
| 在线文档 | https://x1354028165.github.io/xuanheng-website/docs/index.html |
| 官网域名 | alwayscontrol.com.cn |
| GitHub 用户 | x1354028165 |
| 工作目录 | /home/ec2-user/.openclaw/workspace |

---

## 二、技术栈（已锁定，不再讨论）

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14+（App Router） | SSR 必须，保证 SEO |
| 样式 | Tailwind CSS | 不用 CSS-in-JS |
| CMS | Strapi v4 | 开源自部署，不用 SaaS |
| 部署-前端 | Vercel | 自动 CI/CD |
| 部署-CMS | AWS ECS + Docker | 稳定托管 |
| 数据库 | PostgreSQL（Strapi 默认） | |
| 多语言 | next-intl | zh-CN/en-US 人工维护 |
| 字体 | Plus Jakarta Sans（标题）+ Inter（正文） | Google Fonts |

---

## 三、目录结构

```
/home/ec2-user/.openclaw/workspace/
├── PROJECT.md              ← 本文件（coding agent 锚点）
├── 施工计划/               ← Phase 0~7 分阶段施工文件
│   ├── phase-0-初始化.md
│   ├── phase-1-前台页面.md
│   ├── phase-2-全局功能.md
│   ├── phase-3-SEO.md
│   ├── phase-4-CMS后台.md
│   ├── phase-5-表单通知.md
│   ├── phase-6-性能优化.md
│   └── phase-7-安全加固.md
├── docs/                   ← 所有规格文档（只读参考）
│   ├── 架构设计文档.html
│   ├── 需求文档.html
│   ├── 视觉规范.html
│   ├── 前端技术规范.html
│   ├── 后端技术规范.html
│   ├── 测试用例.html
│   ├── 技术选型备忘.html
│   └── index.html
├── frontend/               ← Next.js 前端代码
│   └── src/
├── cms/                    ← Strapi CMS 代码
└── backend/                ← API / 工具层（如有）
```

---

## 四、文档导航（角色索引）

| 你要做的事 | 读哪个文档 |
|-----------|-----------|
| 理解业务全貌 | `docs/架构设计文档.html` |
| 前台页面功能细节 | `docs/需求文档.html` |
| 视觉/UI 规范 | `docs/视觉规范.html` |
| 前端编码规范 | `docs/前端技术规范.html` |
| API 设计 / 数据库 | `docs/后端技术规范.html` |
| 当前阶段任务 | `施工计划/` 对应阶段文件 |
| 验收标准 | `docs/测试用例.html` |

---

## 五、P0 核心约束（不可违背）

1. **SSR 必须** — 所有页面必须服务端渲染，禁止纯 SPA 客户端渲染，SEO 关键页面不允许有 `loading.tsx` 占位。
2. **内容与代码解耦** — 所有面向用户的文案、图片、产品数据通过 Strapi CMS 管理，禁止硬编码。
3. **多语言 i18n** — 所有前台文本通过 `next-intl` 提取为翻译 key，不允许直接写中文字符串在 JSX 里。
4. **P0 无登录** — 前台全部公开访问，不做 SSO / 用户认证（推至 P1）。
5. **响应式必须** — 所有页面适配 Mobile / Tablet / Desktop，断点参考前端技术规范。
6. **图片优化** — 统一使用 Next.js `<Image>` 组件，禁止裸 `<img>` 标签。
7. **TypeScript 强制** — 禁止 `any`，类型定义放 `src/types/`。

---

## 六、P0 范围（当前阶段）

### 前台页面（24个固定模板 + 动态新闻详情）
- EP-01 首页
- EP-02 解决方案（微电网/户用/充电站/工商储/光储一体，共5场景页）
- EP-03 兼容生态
- EP-04 帮助中心（文档资料/版本兼容矩阵/FAQ/在线报修）
- EP-05 开发者中心（Tooltip占位，无独立页面）
- EP-06 产品中心（8个产品页）
- EP-07 关于我们（公司介绍/新闻列表/加入我们）
- EP-08 联系我们
- EP-09 隐私政策页（框架先做，法务审核后上线内容）
- EP-10~14 全局功能（多语言切换/搜索/SEO Meta/Cookie横幅/SSO占位）

### CMS后台模块（20个，CMS-01~CMS-20）
- 📝 内容管理：新闻动态/FAQ/案例管理/招聘岗位
- 🖼️ 内容与页面：媒体库/页面内容/产品内容/解决方案内容
- 📦 资产管理：文件资产/兼容品牌/产品关联配置
- 📋 线索与工单：客户线索/报修工单
- ⚙️ 系统配置：多语言字典/通知配置/SEO配置/操作日志
- 🔧 运维工具：缓存管理/页面健康检查/Sitemap

---

## 七、施工原则

- **按阶段推进** — 严格按 `施工计划/` 的阶段顺序执行，不跨阶段开发。
- **测试用例驱动** — 每完成一个模块，必须跑对应测试用例，全部通过才进入下一模块。
- **完成即汇报** — 每个阶段完成后，立即输出：完成摘要 + 关键文件路径 + 测试通过情况。
- **遇阻即停** — 遇到 API 错误、依赖缺失、需求不清，立即停止并上报，不自行绕过。

---

## 八、当前施工阶段

| 字段 | 值 |
|------|-----|
| 当前阶段 | Phase 0 — 项目初始化 |
| 阶段文件 | 施工计划/phase-0-初始化.md |
| 状态 | ⬜ 未开始 |
| 上次更新 | 2026-03-14 |

> 每完成一个Phase，更新此表的「当前阶段」和「状态」字段。

### 所有阶段一览
| Phase | 名称 | 文件 | 状态 |
|-------|------|------|------|
| 0 | 项目初始化 | 施工计划/phase-0-初始化.md | ⬜ 未开始 |
| 1 | 前台页面开发 | 施工计划/phase-1-前台页面.md | ⬜ 未开始 |
| 2 | 全局功能 | 施工计划/phase-2-全局功能.md | ⬜ 未开始 |
| 3 | SEO/Metadata | 施工计划/phase-3-SEO.md | ⬜ 未开始 |
| 4 | CMS后台 | 施工计划/phase-4-CMS后台.md | ⬜ 未开始 |
| 5 | 表单与通知 | 施工计划/phase-5-表单通知.md | ⬜ 未开始 |
| 6 | 性能优化 | 施工计划/phase-6-性能优化.md | ⬜ 未开始 |
| 7 | 安全加固 | 施工计划/phase-7-安全加固.md | ⬜ 未开始 |

---

## 九、环境变量（开发阶段）

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=https://alwayscontrol.com.cn
STRAPI_API_TOKEN=<待配置>
NEXT_PUBLIC_DEFAULT_LOCALE=zh-CN
```

---

*最后更新：2026-03-14 | 维护人：MOSS*
