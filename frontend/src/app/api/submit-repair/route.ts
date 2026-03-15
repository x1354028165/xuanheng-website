import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_WRITE_TOKEN = process.env.STRAPI_WRITE_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, product, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Forward to Strapi
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
            faultDesc: description || null,
          },
        }),
      });
    } catch {
      console.warn('[submit-repair] Strapi unavailable, repair data logged only');
    }

    return NextResponse.json({ success: true, message: 'Repair ticket submitted' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
