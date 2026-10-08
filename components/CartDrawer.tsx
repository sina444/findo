'use client';

import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    clearCart,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-cart-drawer bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8F0E5] px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#3F6B45]" />
              <h2 className="text-lg font-semibold text-[#20251F]">
                Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#687067] transition-colors hover:bg-[#F7F5EC]"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F5EC]">
                  <ShoppingBag className="h-10 w-10 text-[#AFC8A8]" />
                </div>
                <p className="mt-4 text-lg font-medium text-[#20251F]">Your cart is empty</p>
                <p className="mt-1 text-sm text-[#687067]">Start adding some beautiful plants!</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 rounded-lg bg-[#3F6B45] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4A7D52]"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-xl border border-[#E8F0E5] p-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-[#20251F] hover:text-[#3F6B45]"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#687067] transition-colors hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-[#687067]">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border border-[#E8F0E5]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-[#687067] transition-colors hover:bg-[#F7F5EC]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-[#687067] transition-colors hover:bg-[#F7F5EC]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-[#20251F]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={clearCart}
                  className="text-sm text-[#687067] transition-colors hover:text-red-500"
                >
                  Clear cart
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-[#E8F0E5] px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-medium text-[#687067]">Subtotal</span>
                <span className="text-xl font-bold text-[#20251F]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="mb-4 text-xs text-[#687067]">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-lg bg-[#3F6B45] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4A7D52]"
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 w-full rounded-lg border border-[#E8F0E5] py-3 text-center text-sm font-medium text-[#20251F] transition-colors hover:bg-[#F7F5EC]"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
