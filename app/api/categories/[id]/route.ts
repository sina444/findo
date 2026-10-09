import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        image: body.image,
        description: body.description,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(category);
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
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}
