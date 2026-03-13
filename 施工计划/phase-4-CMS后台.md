# Phase 4 — CMS 后台

> 前置条件：Phase 3 所有测试用例通过
> 对应测试用例：TC-C01~C40（共40条）

**参考文档：** `docs/架构设计文档.html`（CMS 模块章节）、`docs/需求文档.html`

## 任务清单

- [ ] **C-01** 新闻动态（CMS-01）— title/slug/cover/content/publishedAt/locale
- [ ] **C-02** FAQ（CMS-02）— question/answer/category/sort/locale
- [ ] **C-03** 案例管理（CMS-03）— title/client/industry/cover/content/locale
- [ ] **C-04** 招聘岗位（CMS-04）— title/department/location/type/description/active
- [ ] **C-05** 媒体库配置（CMS-05）— 上传规范/尺寸限制（Strapi 内置 + 配置）
- [ ] **C-06** 页面内容（CMS-06）— key/value/locale（首页/关于我们等静态文本）
- [ ] **C-07** 产品内容（CMS-07）— name/slug/category/cover/specs/downloads/locale
- [ ] **C-08** 解决方案内容（CMS-08）— scene/title/description/products/locale
- [ ] **C-09** 文件资产（CMS-09）— name/file/category/version/public
- [ ] **C-10** 兼容品牌（CMS-10）— name/logo/category/sort
- [ ] **C-11** 产品关联配置（CMS-11）— product → compatibleBrands 多对多关系
- [ ] **C-12** 客户线索（CMS-12）— name/company/email/phone/message/source/status
- [ ] **C-13** 报修工单（CMS-13）— orderNo/product/issue/contact/status/assignee
- [ ] **C-14** 多语言字典（CMS-14）— key/zh-CN/en-US（覆盖 next-intl JSON 的动态词条）
- [ ] **C-15** 通知配置（CMS-15）— 企微Webhook URL / 通知邮件地址 / 用户回执模板
- [ ] **C-16** SEO 配置（CMS-16）— 各页面 title/description/og-image 覆盖项
- [ ] **C-17** 操作日志（CMS-17）— 自动记录增删改操作（Strapi 中间件实现）
- [ ] **C-18** 缓存管理（CMS-18）— 手动触发 ISR Revalidate Webhook
- [ ] **C-19** 页面健康检查（CMS-19）— 检测前台关键页面 HTTP 状态
- [ ] **C-20** Sitemap 触发（CMS-20）— 内容发布后自动触发 sitemap.xml 刷新

## 通过条件

TC-C01~C40 全部通过（测试用例详见 `docs/测试用例.html` §四）

## 测试用例验收

参考：docs/测试用例.html 对应章节
