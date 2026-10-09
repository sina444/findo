import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(testimonials);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        avatar: body.avatar || '',
        rating: parseInt(body.rating) || 5,
        text: body.text || '',
        location: body.location || '',
        published: body.published ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'ایجاد نظر ناموفق بود' }, { status: 500 });
  }
}
