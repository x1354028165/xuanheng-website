/**
 * 维度1：页面维度测试
 * 覆盖范围：所有主要路由 × 8种语言，验证HTTP 200状态码，无404
 */
import { test, expect } from "@playwright/test";

const locales = ["zh-CN", "en-US", "zh-TW", "de", "fr", "es", "pt", "ru"];

const routes: { name: string; path: string }[] = [
  { name: "首页", path: "/" },
  { name: "产品列表", path: "/products" },
  { name: "产品-Neuron II", path: "/products/neuron-ii" },
  { name: "产品-Neuron III", path: "/products/neuron-iii" },
  { name: "产品-Neuron III Lite", path: "/products/neuron-iii-lite" },
  { name: "产品-HEMS", path: "/products/hems" },
  { name: "产品-ESS", path: "/products/ess" },
  { name: "产品-EVCMS", path: "/products/evcms" },
  { name: "产品-PQMS", path: "/products/pqms" },
  { name: "产品-VPP", path: "/products/vpp" },
  { name: "解决方案列表", path: "/solutions" },
  { name: "解决方案-HEMS", path: "/solutions/hems" },
  { name: "解决方案-ESS", path: "/solutions/ess" },
  { name: "解决方案-EVCMS", path: "/solutions/evcms" },
  { name: "解决方案-VPP", path: "/solutions/vpp" },
  { name: "解决方案-PQMS", path: "/solutions/pqms" },
  { name: "关于", path: "/about" },
  { name: "联系", path: "/contact" },
  { name: "下载", path: "/support/download" },
  { name: "报修", path: "/support/repair" },
  { name: "生态", path: "/ecosystem" },
  { name: "开发者", path: "/developers" },
];

test.describe("页面维度 - 所有路由×8语言HTTP状态检查", () => {
  for (const locale of locales) {
    for (const route of routes) {
      test(`[${locale}] ${route.name} (${route.path}) → 200`, async ({
        page,
      }) => {
        const url = `/${locale}${route.path}`;
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        expect(response).not.toBeNull();
        expect(response!.status()).toBe(200);
      });
    }
  }
});
