import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        excerpt: body.excerpt || '',
        category: body.category || '',
        image: body.image || '',
        date: body.date || new Date().toLocaleDateString('fa-IR'),
        readTime: body.readTime || '',
        content: body.content || '',
        published: body.published ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'ایجاد پست ناموفق بود' }, { status: 500 });
  }
}
