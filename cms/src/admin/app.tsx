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
        // ── 首页欢迎 ──────────────────────────────────────────────
        'app.components.HomePage.welcome': '欢迎使用旭衡电子 CMS',
        'app.components.HomePage.welcome.again': '欢迎回来',

        // ── 全局 UI ───────────────────────────────────────────────
        'global.search': '搜索',
        'app.components.EmptyStateLayout.content-document': '暂无内容',
        'HomePage.widget.no-data': '暂无内容',

        // ── 左侧导航：集合类型 / 单一类型 ────────────────────────
        'app.components.LeftMenuLinkContainer.collectionTypes': '内容类型',
        'app.components.LeftMenuLinkContainer.singleTypes': '单页类型',
        'components.LeftMenu.collection-types': '内容类型',
        'components.LeftMenu.single-types': '单页类型',

        // ── 内容管理器操作按钮 ────────────────────────────────────
        'HeaderLayout.button.label-add-entry': '新建条目',
        'app.utils.add-entry': '新建条目',
        'content-manager.actions.create': '新建',
        'actions.clone.label': '复制',
        'actions.delete.label': '删除',
        'actions.edit.label': '编辑',
        'actions.discard.label': '放弃更改',
        'actions.discard.dialog.body': '确定放弃更改？此操作不可撤销。',
        'actions.delete.dialog.body': '确定删除此条目？此操作不可撤销。',
        'actions.unpublish.dialog.body': '确定取消发布？',
        'actions.unpublish.error': '取消发布时发生错误',
        'actions.unpublish.dialog.option.keep-draft': '取消发布并保留草稿',
        'actions.unpublish.dialog.option.replace-draft': '取消发布并替换草稿',

        // ── 列表视图 ──────────────────────────────────────────────
        'pages.ListView.header-subtitle': '共 {number, plural, =0 {0 条} one {1 条} other {{number} 条}} 记录',
        'models': '内容类型',
        'models.numbered': '内容类型（{number}）',
      },
    },
  },
  bootstrap(_app: StrapiApp) {
    // Force light theme and Chinese language as defaults
    // Only set if the user hasn't explicitly changed them
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('STRAPI_THEME')) {
        localStorage.setItem('STRAPI_THEME', 'light');
      }
      if (!localStorage.getItem('strapi-admin-language')) {
        localStorage.setItem('strapi-admin-language', 'zh-Hans');
      }
    }
  },
};
