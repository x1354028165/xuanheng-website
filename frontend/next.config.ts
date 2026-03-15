import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
};

export default withNextIntl(nextConfig);
