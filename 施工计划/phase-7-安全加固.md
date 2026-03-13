# Phase 7 — 安全加固

> 前置条件：Phase 6 所有测试用例通过
> 对应测试用例：TC-T01~T15（共15条）

## 任务清单

- [ ] **T-01** HTTP 安全响应头（CSP / X-Frame-Options / HSTS）
- [ ] **T-02** Strapi API 权限收紧（仅公开必要端点，关闭 find-all 无限制查询）
- [ ] **T-03** API Token 权限最小化（前台只读 token，CMS 写 token 不暴露前端）
- [ ] **T-04** 表单输入过滤（XSS / SQL injection 防护）
- [ ] **T-05** 文件上传类型限制（Strapi 媒体库只允许 jpg/png/webp/pdf/mp4）
- [ ] **T-06** Rate limiting（API 端点，防刷单）
- [ ] **T-07** 依赖漏洞扫描（`npm audit`，高危漏洞必须修复）
- [ ] **T-08** 环境变量审计（所有 secret 不允许 commit 到仓库）

## 通过条件

TC-T01~T15 全部通过（测试用例详见 `docs/测试用例.html` §七）

## 测试用例验收

参考：docs/测试用例.html 对应章节
