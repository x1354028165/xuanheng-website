import { NextResponse } from 'next/server';

export async function POST() {
  // Stub - will connect to Strapi in Phase 5
  return NextResponse.json({ success: true, message: 'Repair ticket submitted' });
}
