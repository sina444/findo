import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { verifyToken, getCookieName } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  const auth = token ? await verifyToken(token) : null;

  if (!auth) {
    return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders.map(o => ({
    ...o,
    items: JSON.parse(o.items || '[]'),
  })));
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'شناسه جلسه الزامی است' }, { status: 400 });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'پرداخت تأیید نشد' }, { status: 400 });
    }

    // Find order by stripe session ID
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
    });

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // Update order status to PAID
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });

    return NextResponse.json({
      ...updated,
      items: JSON.parse(updated.items || '[]'),
    });
  } catch {
    return NextResponse.json({ error: 'خطا در تأیید سفارش' }, { status: 500 });
  }
}
