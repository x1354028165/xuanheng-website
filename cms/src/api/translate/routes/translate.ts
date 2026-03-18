export default {
  routes: [
    {
      method: 'POST',
      path: '/translate/entry',
      handler: 'translate.translateEntry',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/translate/batch',
      handler: 'translate.batchTranslate',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/translate/meta/:uid/:documentId',
      handler: 'translate.getMeta',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/translate/set-manual',
      handler: 'translate.setManual',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/translate/i18n-keys',
      handler: 'translate.translateI18nKeys',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
