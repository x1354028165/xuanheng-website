import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const MODEL_PATH_MAP: Record<string, string[]> = {
  article: ['/about/news'],
  product: ['/products'],
  solution: ['/solutions'],
  faq: ['/help'],
  'compatible-brand': ['/ecosystem'],
  'job-posting': ['/about/careers'],
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { model, event } = body;
  if (model) {
    const paths = MODEL_PATH_MAP[model as string] ?? ['/'];
    for (const p of paths) {
      revalidatePath(p, 'layout');
    }
    // Also revalidate home page
    revalidatePath('/', 'layout');
  }
  return NextResponse.json({ revalidated: true, model, event });
}
