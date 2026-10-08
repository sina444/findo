'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden md:h-[560px] lg:h-[600px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/1416879595882-3373a0480b5b.jpg"
          alt="Lush indoor plants and gardening tools on a table in natural sunlight"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Bring Nature Home
            </h1>
            <p className="mt-4 text-lg text-white/90 md:text-xl">
              Premium plants, gardening tools, and outdoor essentials.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#4A7D52] hover:shadow-xl"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#categories"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/80 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#3F6B45]"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
