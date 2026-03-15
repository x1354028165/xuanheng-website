import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const MODEL_PATH_MAP: Record<string, string[]> = {
  article: ['/about/news'],
  product: ['/products'],
  solution: ['/solutions'],
  faq: ['/help'],
  'compatible-brand': ['/ecosystem'],
  'job-posting': ['/about/careers'],
  'i18n-key': ['/'],
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { model, event } = body;

  // 支持 4 种 Strapi 事件：entry.publish / entry.update / entry.unpublish / entry.delete
  const validEvents = ['entry.publish', 'entry.update', 'entry.unpublish', 'entry.delete'];
  if (event && !validEvents.includes(event)) {
    return NextResponse.json({ revalidated: false, reason: 'unknown event' });
  }

  if (model) {
    // 按 model 名称刷新 tag
    revalidateTag(model as string, 'default');
    // 全局 tag
    revalidateTag('strapi-data', 'default');

    // 同时刷新对应路径
    const paths = MODEL_PATH_MAP[model as string] ?? ['/'];
    for (const p of paths) {
      revalidatePath(p, 'layout');
    }
    // 首页始终刷新
    revalidatePath('/', 'layout');
  }

  return NextResponse.json({ revalidated: true, model, event });
}
