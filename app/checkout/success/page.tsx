'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface OrderData {
  id: string;
  orderNumber: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('شناسه جلسه نامعتبر است');
      setLoading(false);
      return;
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrder(data);
      })
      .catch(() => setError('خطا در تأیید سفارش'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E8F0E5] border-t-[#3F6B45]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#20251F]">{error || 'سفارش یافت نشد'}</h1>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F0E5]">
          <CheckCircle2 className="h-10 w-10 text-[#3F6B45]" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#20251F]">پرداخت موفق!</h1>
        <p className="mt-2 text-sm text-[#687067]">
          سفارش شما با موفقیت ثبت شد. ایمیل تأییدیه به آدرس {order.email} ارسال شد.
        </p>
      </div>

      {/* Order details */}
      <div className="mt-8 rounded-xl border border-[#E8F0E5] bg-white p-6">
        <div className="flex items-center justify-between border-b border-[#E8F0E5] pb-4">
          <div>
            <p className="text-xs text-[#687067]">شماره سفارش</p>
            <p className="text-lg font-bold text-[#20251F]">#{order.orderNumber}</p>
          </div>
          <div className="text-left">
            <p className="text-xs text-[#687067]">تاریخ</p>
            <p className="text-sm font-medium text-[#20251F]">
              {new Date(order.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#20251F]">{item.name}</p>
                <p className="text-xs text-[#687067]">تعداد: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-[#20251F]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-2 border-t border-[#E8F0E5] pt-4">
          <div className="flex justify-between text-sm text-[#687067]">
            <span>جمع کل</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#687067]">
            <span>ارسال</span>
            <span>{order.shipping === 0 ? 'رایگان' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#687067]">
            <span>مالیات</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E8F0E5] pt-2 text-base font-bold text-[#20251F]">
            <span>مبلغ پرداخت‌شده</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping info */}
      <div className="mt-4 rounded-xl border border-[#E8F0E5] bg-[#F7F5EC] p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#20251F]">
          <Truck className="h-4 w-4 text-[#3F6B45]" />
          آدرس ارسال
        </h3>
        <p className="text-sm text-[#687067]">{order.customerName}</p>
        <p className="text-sm text-[#687067]">{order.address}</p>
        <p className="text-sm text-[#687067]">{order.city}، {order.zip}</p>
      </div>

      {/* Order status */}
      <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-[#E8F0E5] bg-white p-4">
        <Clock className="h-5 w-5 text-[#C9825A]" />
        <p className="text-sm text-[#687067]">سفارش شما در حال پردازش است و به‌زودی ارسال خواهد شد.</p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]"
        >
          <Package className="h-4 w-4" />
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}
