'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { categories } from '@/data/greenhaven';

export function FeaturedCategories() {
  return (
    <section id="categories" className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            دسته‌بندی‌های منتخب
          </h2>
          <p className="mt-2 text-sm text-[#687067]">
            مجموعه‌های منتخب ما را برای هر باغ کشف کنید
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="no-scrollbar flex gap-6 overflow-x-auto px-2 pb-2 md:grid md:grid-cols-5 md:gap-8 lg:gap-12">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex shrink-0 flex-col items-center"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#E8F0E5] transition-all duration-300 group-hover:border-[#3F6B45] group-hover:shadow-lg md:h-32 md:w-32 lg:h-36 lg:w-36">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="mt-4 text-sm font-medium text-[#20251F] transition-colors group-hover:text-[#3F6B45]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
