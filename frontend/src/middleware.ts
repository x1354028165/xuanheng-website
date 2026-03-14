import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(zh-CN|en-US|zh-TW|de|fr|pt|es|ru)/:path*'],
};
