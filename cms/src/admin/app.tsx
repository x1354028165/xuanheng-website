import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Brand logos for auth (login) and sidebar menu
    auth: {
      logo: 'https://alwayscontrol.com.cn/logo.png',
    },
    menu: {
      logo: 'https://alwayscontrol.com.cn/logo.png',
    },
    // Enable Chinese locale in admin UI
    locales: ['zh-Hans', 'en'],
    // Disable release notifications and tutorials for cleaner UX
    notifications: {
      releases: false,
    },
    tutorials: false,
    translations: {
      'zh-Hans': {
        'app.components.HomePage.welcome': '欢迎使用旭衡电子 CMS',
        'app.components.HomePage.welcome.again': '欢迎回来',
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Custom routes disabled — app.router.addRoute not available in Strapi v5
    // Dashboard customization via content-manager instead
    void app;
  },
};
