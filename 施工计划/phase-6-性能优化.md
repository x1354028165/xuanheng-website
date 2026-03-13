# Phase 6 — 性能优化

> 前置条件：Phase 5 所有测试用例通过
> 对应测试用例：TC-P01~P10（共10条）

## 任务清单

- [ ] **P-01** Lighthouse 评分 ≥ 90（Performance / Accessibility / SEO）
- [ ] **P-02** 图片全部使用 Next.js `<Image>` + WebP 格式
- [ ] **P-03** 首屏 LCP ≤ 2.5s（移动端 4G 网络）
- [ ] **P-04** ISR 缓存配置（静态页面 revalidate: 3600，动态内容按需）
- [ ] **P-05** 字体预加载（preload + display: swap）
- [ ] **P-06** Bundle 分析（`@next/bundle-analyzer`），移除无用依赖
- [ ] **P-07** CDN 配置（Vercel Edge Network，静态资源缓存头）

## 通过条件

TC-P01~P10 全部通过（测试用例详见 `docs/测试用例.html` §六）

## 测试用例验收

参考：docs/测试用例.html 对应章节
