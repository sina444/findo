'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PromoBanner() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E8F0E5] to-[#AFC8A8]">
          <div className="flex flex-col items-center justify-between gap-8 p-8 md:flex-row md:p-12 lg:p-16">
            {/* Text */}
            <div className="max-w-lg text-center md:text-left">
              <span className="inline-block rounded-full bg-[#3F6B45] px-4 py-1.5 text-xs font-semibold text-white">
                Limited Time
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#20251F] md:text-4xl">
                Spring Sale — Up to 30% Off
              </h2>
              <p className="mt-3 text-base text-[#20251F]/80">
                Bring new life to your space with our limited-time offers on premium plants and gardening essentials.
              </p>
              <Link
                href="/shop?sale=true"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4A7D52]"
              >
                Shop the Sale
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Decorative image */}
            <div className="relative h-48 w-48 shrink-0 md:h-64 md:w-64">
              <img
                src="/images/1509423350716-97f9360b4e09.jpg"
                alt="Spring flowers and plants"
                className="h-full w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
