import type { Core } from '@strapi/strapi';

const TRANSLATABLE_CONTENT_TYPES = [
  'api::product.product',
  'api::article.article',
  'api::solution.solution',
  'api::faq.faq',
];

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Translate a single entry to all or specific target locales
   * POST /translate/entry
   * Body: { documentId, uid, targetLocales? }
   */
  async translateEntry(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { documentId?: string; uid?: string; targetLocales?: string[] }
      | undefined;

    const documentId = body?.documentId;
    const uid = body?.uid;
    const targetLocales = body?.targetLocales;

    if (!documentId || !uid) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'documentId and uid are required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');
      // Run translation in background, return immediately
      translateService.translateEntry(documentId, uid, targetLocales).catch((err: unknown) => {
        console.error('[translate:controller] error:', err);
      });

      (ctx as Record<string, unknown>).body = { message: 'Translation started', documentId, uid };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },

  /**
   * Batch translate all entries of specified content types to target locales
   * POST /translate/batch
   * Body: { targetLocales, contentTypes? }
   */
  async batchTranslate(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { targetLocales?: string[]; contentTypes?: string[] }
      | undefined;

    const targetLocales = body?.targetLocales;
    const contentTypes = body?.contentTypes ?? TRANSLATABLE_CONTENT_TYPES;

    if (!targetLocales || targetLocales.length === 0) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'targetLocales is required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');

      // Run in background
      (async () => {
        const results: Record<string, { success: number; failed: number }> = {};
        for (const uid of contentTypes) {
          results[uid] = await translateService.batchTranslateContentType(uid, targetLocales);
        }
        console.log('[translate:batch] Complete:', JSON.stringify(results));
      })().catch((err) => console.error('[translate:batch] error:', err));

      (ctx as Record<string, unknown>).body = {
        message: 'Batch translation started',
        contentTypes,
        targetLocales,
      };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },

  /**
   * Get translation metadata for an entry
   * GET /translate/meta/:uid/:documentId
   */
  async getMeta(ctx: Record<string, unknown>) {
    const params = (ctx as Record<string, Record<string, string>>).params;
    const uid = params?.uid;
    const documentId = params?.documentId;

    if (!uid || !documentId) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'uid and documentId are required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');
      const meta = await translateService.getTranslationMeta(documentId, uid.replace(/~/g, '.'));
      (ctx as Record<string, unknown>).body = meta;
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },

  /**
   * Mark a locale as manually edited
   * POST /translate/set-manual
   * Body: { documentId, uid, locale }
   */
  async setManual(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { documentId?: string; uid?: string; locale?: string }
      | undefined;

    const documentId = body?.documentId;
    const uid = body?.uid;
    const locale = body?.locale;

    if (!documentId || !uid || !locale) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'documentId, uid, and locale are required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');
      await translateService.setManualStatus(documentId, uid, locale);
      (ctx as Record<string, unknown>).body = { message: 'Status set to manual', documentId, uid, locale };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },

  /**
   * Translate i18n dictionary keys (zh-CN → all languages)
   * POST /translate/i18n-keys
   * Body: { documentId, fields?: string[] }
   */
  async translateI18nKeys(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { documentId?: string; fields?: string[] }
      | undefined;

    const documentId = body?.documentId;

    if (!documentId) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'documentId is required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');

      const entry = await strapi.documents('api::i18n-key.i18n-key' as Parameters<typeof strapi.documents>[0]).findOne({
        documentId,
      });

      if (!entry) {
        (ctx as Record<string, unknown>).status = 404;
        (ctx as Record<string, unknown>).body = { error: 'Entry not found' };
        return;
      }

      const rec = entry as Record<string, unknown>;
      const zhCN = rec.zh_CN as string;

      if (!zhCN) {
        (ctx as Record<string, unknown>).status = 400;
        (ctx as Record<string, unknown>).body = { error: 'zh_CN field is empty' };
        return;
      }

      const OpenCC = (await import('opencc-js')).default;
      const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });

      const updateData: Record<string, string> = {};

      // zh-TW via OpenCC
      updateData.zh_TW = twConverter(zhCN);

      // Other languages via DeepSeek
      const otherLocales = ['en_US', 'de', 'fr', 'pt', 'es', 'ru'];
      const localeMap: Record<string, string> = {
        en_US: 'en-US', de: 'de', fr: 'fr', pt: 'pt', es: 'es', ru: 'ru',
      };

      for (const field of otherLocales) {
        try {
          updateData[field] = await translateService.translateText(zhCN, localeMap[field]);
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          console.error(`[translate:i18n-keys] Failed to translate ${field}:`, err);
        }
      }

      await strapi.documents('api::i18n-key.i18n-key' as Parameters<typeof strapi.documents>[0]).update({
        documentId,
        data: updateData,
      });

      (ctx as Record<string, unknown>).body = { message: 'Translation complete', translated: Object.keys(updateData) };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },
});
