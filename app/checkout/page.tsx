'use client';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

import { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, ArrowRight, Loader2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'ایمیل الزامی است';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'ایمیل نامعتبر است';
    if (!form.firstName) newErrors.firstName = 'نام الزامی است';
    if (!form.lastName) newErrors.lastName = 'نام خانوادگی الزامی است';
    if (!form.phone) newErrors.phone = 'شماره تماس الزامی است';
    if (!form.address) newErrors.address = 'آدرس الزامی است';
    if (!form.city) newErrors.city = 'شهر الزامی است';
    if (!form.zip) newErrors.zip = 'کد پستی الزامی است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
          customer: form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'خطا در ایجاد جلسه پرداخت');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('خطای اتصال به سرور');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F5EC]">
            <ShoppingBag className="h-10 w-10 text-[#AFC8A8]" />
          </div>
          <h1 className="mt-6 text-xl font-bold text-[#20251F]">سبد خرید شما خالی است</h1>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-[#687067] hover:text-[#3F6B45]">
        <ArrowRight className="h-4 w-4" />
        ادامه خرید
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-[#20251F]">تسویه‌حساب</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Contact */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">اطلاعات تماس</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-[#687067]">ایمیل</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                  placeholder="you@example.com"
                  dir="ltr"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">شماره تماس</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">آدرس ارسال</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#687067]">نام</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">نام خانوادگی</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-[#687067]">آدرس</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">شهر</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">کد پستی</label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                  dir="ltr"
                />
                {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip}</p>}
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-[#687067]">توضیحات (اختیاری)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Payment info */}
          <div className="flex items-center gap-2 rounded-lg bg-[#E8F0E5] px-4 py-3 text-sm text-[#3F6B45]">
            <Lock className="h-4 w-4 shrink-0" />
            <span>پرداخت ایمن از طریق درگاه استرایپ انجام می‌شود. اطلاعات کارت شما هرگز روی سرور ما ذخیره نمی‌شود.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3F6B45] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A7D52] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال انتقال به درگاه پرداخت...
              </>
            ) : (
              `پرداخت — ${formatPrice(total)}`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#E8F0E5] bg-[#F7F5EC] p-6">
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">خلاصه سفارش</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#20251F]">{item.product.name}</p>
                    <p className="text-xs text-[#687067]">تعداد: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-[#20251F]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-[#E8F0E5] pt-4">
              <div className="flex justify-between text-sm text-[#687067]">
                <span>جمع کل</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>ارسال</span>
                <span>{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>مالیات</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8F0E5] pt-2 text-base font-bold text-[#20251F]">
                <span>مبلغ نهایی</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
