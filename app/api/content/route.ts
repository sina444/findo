import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const entries = await prisma.siteContent.findMany();
  const result: Record<string, string> = {};
  for (const entry of entries) {
    result[entry.id] = entry.value;
  }
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      await prisma.siteContent.upsert({
        where: { id: key },
        update: { value: String(value) },
        create: { id: key, value: String(value) },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'به‌روزرسانی محتوا ناموفق بود' }, { status: 500 });
  }
}
