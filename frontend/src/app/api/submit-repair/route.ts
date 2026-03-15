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
    if (!checkRateLimit(ip, 'submit-repair')) {
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
    const phone = sanitizeField(body.phone, 30);
    const email = sanitizeField(body.email, 200);
    const product = sanitizeField(body.product, 200);
    const serialNumber = sanitizeField(body.serialNumber, 100);
    const description = sanitizeField(body.description, 5000);

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
      await fetch(`${STRAPI_URL}/api/repair-tickets`, {
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
            productModel: product || null,
            serialNumber: serialNumber || null,
            faultDesc: description || null,
          },
        }),
      });
    } catch {
      console.warn('[submit-repair] Strapi unavailable, repair data logged only');
    }

    // 异步发送通知，不阻塞响应
    const notifyData: Record<string, string> = {
      '类型': '在线报修',
      '姓名': name,
      ...(phone ? { '电话': phone } : {}),
      ...(email ? { '邮箱': email } : {}),
      ...(product ? { '产品型号': product } : {}),
      ...(serialNumber ? { '序列号': serialNumber } : {}),
      ...(description ? { '故障描述': description.substring(0, 200) } : {}),
    };

    sendWecomNotification(notifyData).catch(() => {});
    sendEmailNotification(notifyData).catch(() => {});

    return NextResponse.json({ success: true, message: 'Repair ticket submitted' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
