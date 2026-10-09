import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: body.name,
        avatar: body.avatar,
        rating: parseInt(body.rating) || 5,
        text: body.text,
        location: body.location,
        published: body.published,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(testimonial);
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
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}
