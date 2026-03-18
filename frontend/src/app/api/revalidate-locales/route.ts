import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getLocalesForBuild } from '@/lib/api/locales';

/**
 * POST /api/revalidate-locales
 *
 * Call this after adding or removing a language in Strapi.
 * Revalidates all locale-prefixed paths so new languages appear immediately.
 */
export async function POST() {
  const locales = await getLocalesForBuild();
  const paths: string[] = [];

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/`);
    paths.push(`/${locale}`);
  }
  // Also revalidate root
  revalidatePath('/');

  return NextResponse.json({
    revalidated: true,
    locales,
    paths: paths.length,
  });
}
