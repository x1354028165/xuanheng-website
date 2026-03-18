#!/bin/bash
# 旭衡电子官网 - 5维度测试一键运行脚本
# 用法: bash e2e/run-all.sh

set -e
cd /home/ec2-user/xuanheng-website/frontend
mkdir -p /home/ec2-user/.openclaw/workspace/e2e-shots

echo "=========================================="
echo "  旭衡电子官网 5维度E2E测试"
echo "=========================================="
echo ""

echo "=== 维度1：页面（所有路由×8语言HTTP状态） ==="
npx playwright test e2e/01-pages.spec.ts --reporter=line || true
echo ""

echo "=== 维度2：视觉（关键区块+截图+破图检查） ==="
npx playwright test e2e/02-visual.spec.ts --reporter=line || true
echo ""

echo "=== 维度3：功能（语言切换+导航+表单+下载） ==="
npx playwright test e2e/03-functional.spec.ts --reporter=line || true
echo ""

echo "=== 维度4：接口（Strapi API×8语言） ==="
npx playwright test e2e/04-api.spec.ts --reporter=line || true
echo ""

echo "=== 维度5：代码（硬编码中文+翻译key+裸img） ==="
npx playwright test e2e/05-code.spec.ts --reporter=line || true
echo ""

echo "=== TypeScript类型检查 ==="
npx tsc --noEmit || true
echo ""

echo "=========================================="
echo "  全部测试完成"
echo "  截图目录: /home/ec2-user/.openclaw/workspace/e2e-shots/"
echo "=========================================="
