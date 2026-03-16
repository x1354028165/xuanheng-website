import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isExport = process.env.NEXT_EXPORT === 'true';
const basePath = isExport ? '/xuanheng-website' : '';

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  ...(isExport ? { output: 'export' } : {}),
  ...(basePath ? { basePath } : {}),
  trailingSlash: true,

  // Performance: enable gzip/brotli compression
  compress: true,

  // Performance: powered-by header removal (also a security measure)
  poweredByHeader: false,

  images: {
    ...(isExport ? { unoptimized: true } : {}),
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        // 阿里云 OSS / CDN（生产环境）
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || '**.aliyuncs.com',
      },
      {
        // Strapi 本地开发服务器
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        // Strapi 生产服务器（公网IP，走nginx代理）
        protocol: 'http',
        hostname: '32.236.16.227',
        pathname: '/strapi/uploads/**',
      },
      {
        // 占位图（开发/无CMS时的fallback）
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        // Unsplash（Hero背景图）
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  async headers(): Promise<import('next/dist/lib/load-custom-routes').Header[]> {
    if (isExport) return [];

    return [
      {
        // 静态资源长期缓存
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 图片优化缓存
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // 字体缓存
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 所有页面的安全响应头
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.aliyuncs.com https://placehold.co https://images.unsplash.com http://localhost:1337 http://32.236.16.227",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:1337 https://*.aliyuncs.com https://challenges.cloudflare.com",
              "frame-src https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
