import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getCookieName } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    items: JSON.parse(order.items || '[]'),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(getCookieName())?.value;
  const auth = token ? await verifyToken(token) : null;

  if (!auth) {
    return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({
    ...updated,
    items: JSON.parse(updated.items || '[]'),
  });
}
