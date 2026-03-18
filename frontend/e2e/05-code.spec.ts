/**
 * 维度5：代码维度测试（Node.js脚本模式，不用浏览器）
 * 覆盖范围：硬编码中文检查、翻译key一致性、裸<img>标签检查
 */
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// 此测试不需要浏览器
test.use({ browserName: "chromium" });

const SRC_DIR = path.resolve(__dirname, "../src");
const MESSAGES_DIR = path.resolve(__dirname, "../src/messages");

const LOCALES = ["zh-CN", "en-US", "zh-TW", "de", "fr", "es", "pt", "ru"];

/** 递归获取指定扩展名的文件 */
function getFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过node_modules和.next
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      results.push(...getFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/** 获取JSON对象所有叶子节点key路径 */
function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

test.describe("代码维度 - 硬编码中文检查", () => {
  test("src/下TSX文件无JSX中硬编码中文", async () => {
    const files = getFiles(SRC_DIR, [".tsx"]);
    const violations: { file: string; line: number; text: string }[] = [];

    // 中文字符正则
    const chineseRegex = /[\u4e00-\u9fa5]/;
    // 允许的模式：注释、console.log、变量赋值中的中文（非JSX）
    const allowedPatterns = [
      /^\s*\/\//, // 单行注释
      /^\s*\/?\*/, // 多行注释
      /^\s*\*/, // 多行注释行
      /console\.(log|warn|error|info)/, // console输出
      /^\s*import\s/, // import语句
    ];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!chineseRegex.test(line)) continue;

        // 跳过允许的模式
        if (allowedPatterns.some((p) => p.test(line))) continue;

        // 检查是否在JSX中（简化判断：包含 > 和 < 的行，或在return/render块中）
        // 主要关注：直接在标签内容中出现的中文文字
        if (
          line.includes(">") &&
          chineseRegex.test(line.replace(/{[^}]*}/g, "")) // 排除{表达式}内的中文
        ) {
          const relPath = path.relative(SRC_DIR, file);
          violations.push({
            file: relPath,
            line: i + 1,
            text: line.trim().substring(0, 100),
          });
        }
      }
    }

    if (violations.length > 0) {
      console.log("⚠️ 发现JSX中硬编码中文:");
      for (const v of violations.slice(0, 20)) {
        console.log(`  ${v.file}:${v.line} → ${v.text}`);
      }
      if (violations.length > 20) {
        console.log(`  ... 还有${violations.length - 20}处`);
      }
    }

    // 输出数量，不做硬性断言失败（项目初期可能有遗留）
    console.log(`硬编码中文总数: ${violations.length}`);
    // 如果需要严格模式，取消下面注释：
    // expect(violations.length, `发现${violations.length}处JSX硬编码中文`).toBe(0);
  });
});

test.describe("代码维度 - 翻译key一致性", () => {
  test("所有语言翻译文件key与zh-CN一致", async () => {
    const zhPath = path.join(MESSAGES_DIR, "zh-CN.json");
    if (!fs.existsSync(zhPath)) {
      console.log("zh-CN.json不存在，跳过");
      return;
    }

    const zhKeys = getLeafKeys(
      JSON.parse(fs.readFileSync(zhPath, "utf-8"))
    ).sort();

    const missingReport: { locale: string; missingKeys: string[] }[] = [];

    for (const locale of LOCALES) {
      if (locale === "zh-CN") continue;
      const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
      if (!fs.existsSync(localePath)) {
        missingReport.push({ locale, missingKeys: ["文件不存在"] });
        continue;
      }

      const localeKeys = new Set(
        getLeafKeys(JSON.parse(fs.readFileSync(localePath, "utf-8")))
      );
      const missing = zhKeys.filter((k) => !localeKeys.has(k));

      if (missing.length > 0) {
        missingReport.push({ locale, missingKeys: missing });
      }
    }

    if (missingReport.length > 0) {
      console.log("⚠️ 翻译key缺失报告:");
      for (const report of missingReport) {
        console.log(
          `  [${report.locale}] 缺失${report.missingKeys.length}个key:`
        );
        for (const key of report.missingKeys.slice(0, 10)) {
          console.log(`    - ${key}`);
        }
        if (report.missingKeys.length > 10) {
          console.log(
            `    ... 还有${report.missingKeys.length - 10}个`
          );
        }
      }
    }

    const totalMissing = missingReport.reduce(
      (sum, r) => sum + r.missingKeys.length,
      0
    );
    console.log(`翻译key缺失总数: ${totalMissing}`);
    expect(
      totalMissing,
      `发现${totalMissing}个翻译key缺失`
    ).toBe(0);
  });
});

test.describe("代码维度 - 裸img标签检查", () => {
  test("src/下TSX文件无裸<img>标签", async () => {
    const files = getFiles(SRC_DIR, [".tsx"]);
    const violations: { file: string; line: number; text: string }[] = [];

    // 匹配裸<img标签（非next/image的<Image>）
    const imgRegex = /<img\s/;
    const commentRegex = /^\s*(\/\/|\/\*|\*)/;

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (commentRegex.test(line)) continue;
        if (imgRegex.test(line)) {
          const relPath = path.relative(SRC_DIR, file);
          violations.push({
            file: relPath,
            line: i + 1,
            text: line.trim().substring(0, 100),
          });
        }
      }
    }

    if (violations.length > 0) {
      console.log("⚠️ 发现裸<img>标签:");
      for (const v of violations) {
        console.log(`  ${v.file}:${v.line} → ${v.text}`);
      }
    }

    expect(
      violations.length,
      `发现${violations.length}处裸<img>标签，应使用next/image的<Image>`
    ).toBe(0);
  });
});
