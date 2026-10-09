import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(body.price),
        oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
        rating: body.rating ? parseFloat(body.rating) : 0,
        reviewCount: body.reviewCount ? parseInt(body.reviewCount) : 0,
        category: body.category,
        image: body.image || '',
        images: JSON.stringify(body.images || []),
        description: body.description || '',
        shortDescription: body.shortDescription || '',
        specifications: JSON.stringify(body.specifications || []),
        careInstructions: JSON.stringify(body.careInstructions || []),
        inStock: body.inStock ?? true,
        badge: body.badge || null,
        features: JSON.stringify(body.features || []),
        sortOrder: body.sortOrder || 0,
        published: body.published ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'ایجاد محصول ناموفق بود' }, { status: 500 });
  }
}
