'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';
    if (!form.address) newErrors.address = 'Address is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.zip) newErrors.zip = 'ZIP code is required';
    if (!form.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!form.cardExpiry) newErrors.cardExpiry = 'Expiry is required';
    if (!form.cardCvc) newErrors.cardCvc = 'CVC is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setOrderPlaced(true);
      clearCart();
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F0E5]">
            <CheckCircle2 className="h-10 w-10 text-[#3F6B45]" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[#20251F]">Order Confirmed!</h1>
          <p className="mt-2 text-sm text-[#687067]">
            Thank you for your order. A confirmation email is on its way.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F5EC]">
            <ShoppingBag className="h-10 w-10 text-[#AFC8A8]" />
          </div>
          <h1 className="mt-6 text-xl font-bold text-[#20251F]">Your cart is empty</h1>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-[#687067] hover:text-[#3F6B45]">
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-[#20251F]">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Contact */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">Contact Information</h2>
            <div>
              <label className="mb-1 block text-sm text-[#687067]">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#687067]">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-[#687067]">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#687067]">ZIP Code</label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                />
                {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip}</p>}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#687067]">Card Number</label>
                <input
                  type="text"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#687067]">Expiry</label>
                  <input
                    type="text"
                    value={form.cardExpiry}
                    onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                    placeholder="MM/YY"
                  />
                  {errors.cardExpiry && <p className="mt-1 text-xs text-red-500">{errors.cardExpiry}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#687067]">CVC</label>
                  <input
                    type="text"
                    value={form.cardCvc}
                    onChange={(e) => setForm({ ...form, cardCvc: e.target.value })}
                    className="w-full rounded-lg border border-[#E8F0E5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3F6B45]"
                    placeholder="123"
                  />
                  {errors.cardCvc && <p className="mt-1 text-xs text-red-500">{errors.cardCvc}</p>}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#3F6B45] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A7D52]"
          >
            Place Order — {formatPrice(total)}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#E8F0E5] bg-[#F7F5EC] p-6">
            <h2 className="mb-4 text-base font-semibold text-[#20251F]">Order Summary</h2>
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
                    <p className="text-xs text-[#687067]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-[#20251F]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-[#E8F0E5] pt-4">
              <div className="flex justify-between text-sm text-[#687067]">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#687067]">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8F0E5] pt-2 text-base font-bold text-[#20251F]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
