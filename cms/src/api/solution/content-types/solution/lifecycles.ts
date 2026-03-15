export default {
  async afterUpdate(event: { result: Record<string, unknown>; params: Record<string, unknown> }) {
    const { result } = event;
    // 只在 zh-CN 发布时触发翻译（publishedAt 存在代表刚发布）
    if (!result.publishedAt) return;
    if (result.locale !== 'zh-CN') return;
    if (result.is_translation_locked) return;
    try {
      const { default: translateService } = await import('../../../../extensions/translate/services/translate');
      translateService
        .translateEntry(result.documentId as string, 'api::CONTENT_TYPE.CONTENT_TYPE')
        .catch((err: unknown) => console.error('[lifecycle] translate error:', err));
    } catch (_e) {
      // translate service optional
    }
  },
};
