import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const MODEL_PATHS: Record<string, string[]> = {
  product: ['/products'],
  solution: ['/solutions'],
  article: ['/about/news'],
  faq: ['/help'],
  'compatible-brand': ['/ecosystem'],
  'job-posting': ['/about/careers'],
  'i18n-key': ['/'],
};

const LOCALES = ['zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'es', 'pt', 'ru'];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ revalidated: false, reason: 'invalid json' }, { status: 400 });
  }

  const model = (body.model as string) ?? '';
  const event = (body.event as string) ?? '';
  const entry = (body.entry as Record<string, unknown>) ?? {};
  const slug = (entry.slug as string) ?? '';

  const validEvents = ['entry.publish', 'entry.update', 'entry.unpublish', 'entry.delete'];
  if (event && !validEvents.includes(event)) {
    return NextResponse.json({ revalidated: false, reason: 'unknown event' });
  }

  const paths: string[] = [];

  const revalidate = (p: string) => {
    revalidatePath(p);
    revalidatePath(p + '/');   // 同时带和不带trailing slash都刷
    paths.push(p);
  };

  if (model) {
    const basePaths = MODEL_PATHS[model] ?? ['/'];
    for (const locale of LOCALES) {
      for (const base of basePaths) {
        revalidate(`/${locale}${base}`);
        if (slug) revalidate(`/${locale}${base}/${slug}`);
      }
      revalidate(`/${locale}`);
    }
    // 根路径
    revalidate('/');
  }

  return NextResponse.json({ revalidated: true, model, event, slug, paths: paths.length });
}
