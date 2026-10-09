import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        image: body.image || '',
        description: body.description || '',
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'ایجاد دسته ناموفق بود' }, { status: 500 });
  }
}
