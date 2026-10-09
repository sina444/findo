import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        price: parseFloat(body.price),
        oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
        rating: parseFloat(body.rating) || 0,
        reviewCount: parseInt(body.reviewCount) || 0,
        category: body.category,
        image: body.image,
        images: JSON.stringify(body.images || []),
        description: body.description,
        shortDescription: body.shortDescription,
        specifications: JSON.stringify(body.specifications || []),
        careInstructions: JSON.stringify(body.careInstructions || []),
        inStock: body.inStock,
        badge: body.badge || null,
        features: JSON.stringify(body.features || []),
        sortOrder: body.sortOrder || 0,
        published: body.published,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    return NextResponse.json({ error: 'به‌روزرسانی ناموفق بود' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حذف ناموفق بود' }, { status: 500 });
  }
}
