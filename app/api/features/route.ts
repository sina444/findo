import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const features = await prisma.feature.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(features);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feature = await prisma.feature.create({
      data: {
        title: body.title,
        description: body.description || '',
        icon: body.icon || 'leaf',
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(feature, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'ایجاد ویژگی ناموفق بود' }, { status: 500 });
  }
}
