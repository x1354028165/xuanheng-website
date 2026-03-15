import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const locale = searchParams.get('locale') || 'zh-CN';

  if (secret !== process.env.DRAFT_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const redirectUrl = slug ? `/${locale}/${slug}` : `/${locale}`;
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
