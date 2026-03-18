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

      // Run in background (includes UI keys translation)
      (async () => {
        // 1. Translate content types
        const results: Record<string, { success: number; failed: number }> = {};
        for (const uid of contentTypes) {
          results[uid] = await translateService.batchTranslateContentType(uid, targetLocales);
        }
        console.log('[translate:batch] Content complete:', JSON.stringify(results));

        // 2. Translate UI i18n keys (merged here to avoid separate route issues)
        for (const locale of targetLocales) {
          try {
            await translateService.batchTranslateUiKeys(locale);
            console.log(`[translate:batch] UI keys complete for ${locale}`);
          } catch (err) {
            console.error(`[translate:batch] UI keys failed for ${locale}:`, err);
          }
        }
      })().catch((err) => console.error('[translate:batch] error:', err));

      (ctx as Record<string, unknown>).body = {
        message: 'Batch translation started (content + UI keys)',
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
   * Body: { documentId }
   */
  async translateI18nKeys(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { documentId?: string }
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
      const translations = (rec.translations ?? {}) as Record<string, string>;
      const zhCN = translations['zh-CN'];

      if (!zhCN) {
        (ctx as Record<string, unknown>).status = 400;
        (ctx as Record<string, unknown>).body = { error: 'zh-CN translation is empty' };
        return;
      }

      // Get all enabled locales from Strapi i18n plugin
      const enabledLocales = await translateService.getEnabledLocales();

      const OpenCC = (await import('opencc-js')).default;
      const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });

      const updatedTranslations = { ...translations };

      for (const locale of enabledLocales) {
        if (locale === 'zh-CN') continue;
        try {
          if (locale === 'zh-TW') {
            updatedTranslations['zh-TW'] = twConverter(zhCN);
          } else {
            updatedTranslations[locale] = await translateService.translateText(zhCN, locale);
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (err) {
          console.error(`[translate:i18n-keys] Failed to translate ${locale}:`, err);
        }
      }

      await strapi.documents('api::i18n-key.i18n-key' as Parameters<typeof strapi.documents>[0]).update({
        documentId,
        data: { translations: updatedTranslations },
      });

      (ctx as Record<string, unknown>).body = {
        message: 'Translation complete',
        translated: Object.keys(updatedTranslations),
      };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },

  /**
   * Batch translate all UI keys to a target locale
   * POST /translate/batch-ui-keys
   * Body: { targetLocale: "ja" }
   */
  async batchTranslateUiKeys(ctx: Record<string, unknown>) {
    const body = (ctx as Record<string, Record<string, unknown>>).request?.body as
      | { targetLocale?: string }
      | undefined;

    const targetLocale = body?.targetLocale;

    if (!targetLocale) {
      (ctx as Record<string, unknown>).status = 400;
      (ctx as Record<string, unknown>).body = { error: 'targetLocale is required' };
      return;
    }

    try {
      const { default: translateService } = await import('../../../extensions/translate/services/translate');

      // Return immediately, run in background
      (async () => {
        const OpenCC = (await import('opencc-js')).default;
        const twConverter = targetLocale === 'zh-TW'
          ? OpenCC.Converter({ from: 'cn', to: 'twp' })
          : null;

        // Fetch all i18n keys
        let page = 1;
        const pageSize = 100;
        let totalTranslated = 0;
        let totalFailed = 0;

        while (true) {
          const entries = await strapi.documents('api::i18n-key.i18n-key' as Parameters<typeof strapi.documents>[0]).findMany({
            limit: pageSize,
            start: (page - 1) * pageSize,
          });

          if (!entries || !Array.isArray(entries) || entries.length === 0) break;

          for (const entry of entries) {
            const rec = entry as Record<string, unknown>;
            const translations = (rec.translations ?? {}) as Record<string, string>;
            const zhCN = translations['zh-CN'];

            if (!zhCN) continue;

            // Skip if translation already exists for this locale
            if (translations[targetLocale]) continue;

            try {
              let translated: string;
              if (twConverter) {
                translated = twConverter(zhCN);
              } else {
                translated = await translateService.translateText(zhCN, targetLocale);
                await new Promise((r) => setTimeout(r, 500)); // Rate limit
              }

              const updatedTranslations = { ...translations, [targetLocale]: translated };

              await strapi.documents('api::i18n-key.i18n-key' as Parameters<typeof strapi.documents>[0]).update({
                documentId: rec.documentId as string,
                data: { translations: updatedTranslations },
              });

              totalTranslated++;
            } catch (err) {
              console.error(`[translate:batch-ui-keys] Failed for key "${rec.key}":`, err);
              totalFailed++;
            }
          }

          if (entries.length < pageSize) break;
          page++;
        }

        console.log(`[translate:batch-ui-keys] Complete for ${targetLocale}: ${totalTranslated} translated, ${totalFailed} failed`);
      })().catch((err) => console.error('[translate:batch-ui-keys] error:', err));

      (ctx as Record<string, unknown>).body = {
        message: 'Batch UI key translation started',
        targetLocale,
      };
    } catch (err) {
      (ctx as Record<string, unknown>).status = 500;
      (ctx as Record<string, unknown>).body = { error: String(err) };
    }
  },
});
