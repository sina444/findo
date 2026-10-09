import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Generate order number (count existing + 1)
    const orderCount = await prisma.order.count();

    // Create order in DB with PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber: orderCount + 1,
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zip: customer.zip,
        notes: customer.notes || null,
        items: JSON.stringify(items.map((item: any) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }))),
        subtotal,
        shipping,
        tax,
        total,
        status: 'PENDING',
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?cancelled=1`,
      customer_email: customer.email,
      metadata: {
        orderId: order.id,
      },
      shipping_address_collection: {
        allowed_countries: ['NL', 'DE', 'FR', 'GB', 'US', 'AE', 'TR'],
      },
    });

    // Save Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error?.message?.includes('STRIPE_SECRET_KEY') || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'درگاه پرداخت پیکربندی نشده است. لطفاً بعداً تلاش کنید.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'خطا در ایجاد جلسه پرداخت' }, { status: 500 });
  }
}
