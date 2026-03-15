import translateService from '../../../../extensions/translate/services/translate';

export default {
  async afterPublish(event: { result: Record<string, unknown> }) {
    const { result } = event;
    // 铁律：只有主语言 zh-CN 发布时触发翻译
    if (result.locale !== 'zh-CN') return;
    // 翻译锁检查
    if (result.is_translation_locked) return;
    // 异步执行，不阻塞发布响应
    translateService
      .translateEntry(result.documentId as string, 'api::product.product')
      .catch((err: unknown) => console.error('[product] translate error:', err));
  },
};
