import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const feature = await prisma.feature.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        icon: body.icon,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(feature);
  } catch {
    return NextResponse.json({ error: 'به‌روزرسانی ناموفق بود' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.feature.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}
