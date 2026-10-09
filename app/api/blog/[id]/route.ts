import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        category: body.category,
        image: body.image,
        date: body.date,
        readTime: body.readTime,
        content: body.content,
        published: body.published,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(post);
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}
