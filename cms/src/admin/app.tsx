import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Available locales in admin UI
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
  bootstrap(_app: StrapiApp) {
    // Force light theme and Chinese language as defaults
    // Only set if the user hasn't explicitly changed them
    if (typeof window !== 'undefined') {
      // Set light theme (key: STRAPI_THEME, values: 'light' | 'dark' | 'system')
      if (!localStorage.getItem('STRAPI_THEME')) {
        localStorage.setItem('STRAPI_THEME', 'light');
      }
      // Set Chinese (Simplified) as default language (key: strapi-admin-language)
      if (!localStorage.getItem('strapi-admin-language')) {
        localStorage.setItem('strapi-admin-language', 'zh-Hans');
      }
    }
  },
};
