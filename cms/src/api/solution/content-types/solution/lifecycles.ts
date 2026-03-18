export default {
  async afterUpdate(event: { result: Record<string, unknown>; params: Record<string, unknown> }) {
    const { result, params } = event;
    const data = (params as Record<string, Record<string, unknown>>)?.data;

    const isPublishAction = data && data.publishedAt;
    if (!isPublishAction) return;
    if (!result.publishedAt) return;
    if (result.locale !== 'zh-CN') return;
    if (result.is_translation_locked) return;

    try {
      const { default: translateService } = await import('../../../../extensions/translate/services/translate');
      translateService
        .translateEntry(result.documentId as string, 'api::solution.solution')
        .catch((err: unknown) => console.error('[lifecycle:solution] translate error:', err));
    } catch (_e) {
      // translate service optional
    }
  },
};
