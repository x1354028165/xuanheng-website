import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // 匹配所有带语言前缀的路径
    '/(zh-CN|en-US|zh-TW|de|fr|pt|es|ru)/:path*',
    // 捕获所有未加语言前缀的路径，强制重定向到默认语言（排除 api/_next/静态文件）
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
