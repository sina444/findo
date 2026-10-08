'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/data/greenhaven';
import { ProductCard } from '@/components/ProductCard';

export function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section className="bg-[#F7F5EC] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
              محصولات منتخب
            </h2>
            <p className="mt-2 text-sm text-[#687067]">
              محبوب‌ترین محصولات دست‌چین شده
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-[#3F6B45] transition-colors hover:gap-2 sm:flex"
          >
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-!6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#3F6B45]"
          >
            مشاهده همه محصولات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
