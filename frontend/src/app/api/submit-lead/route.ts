import { NextRequest, NextResponse } from 'next/server';
import { sendWecomNotification, sendEmailNotification } from '@/lib/notify';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizeField, isValidEmail, isValidPhone } from '@/lib/sanitize';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_WRITE_TOKEN = process.env.STRAPI_WRITE_TOKEN || '';

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) return true; // 测试环境跳过

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const body = await request.json();
    const { cfToken, _honey } = body;

    // Honeypot 检查
    if (_honey) {
      return NextResponse.json({ success: true });
    }

    // 输入验证与清洗
    const name = sanitizeField(body.name, 100);
    const email = sanitizeField(body.email, 200);
    const phone = sanitizeField(body.phone, 30);
    const company = sanitizeField(body.company, 200);
    const intentType = sanitizeField(body.intentType, 100);
    const message = sanitizeField(body.message, 2000);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    // Turnstile 验证
    if (cfToken) {
      const valid = await verifyTurnstile(cfToken);
      if (!valid) {
        return NextResponse.json({ error: '验证失败，请重试' }, { status: 400 });
      }
    }

    // 写入 Strapi
    try {
      await fetch(`${STRAPI_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_WRITE_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name,
            email: email || null,
            phone: phone || null,
            company: company || null,
            intentType: intentType || null,
            message: message || null,
            source: request.headers.get('referer') || 'website',
          },
        }),
      });
    } catch {
      console.warn('[submit-lead] Strapi unavailable, lead data logged only');
    }

    // 异步发送通知，不阻塞响应
    const notifyData: Record<string, string> = {
      '姓名': name,
      ...(email ? { '邮箱': email } : {}),
      ...(phone ? { '电话': phone } : {}),
      ...(company ? { '公司': company } : {}),
      ...(intentType ? { '意向': intentType } : {}),
      ...(message ? { '留言': message.substring(0, 200) } : {}),
      '来源': request.headers.get('referer') || '未知',
    };

    sendWecomNotification(notifyData).catch(() => {});
    sendEmailNotification(notifyData).catch(() => {});

    return NextResponse.json({ success: true, message: 'Lead submitted' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
