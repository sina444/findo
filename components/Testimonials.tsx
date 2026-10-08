'use client';

import { testimonials } from '@/data/greenhaven';
import { StarRating } from '@/components/StarRating';

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            Testimonials
          </h2>
          <p className="mt-2 text-sm text-[#687067]">
            What our customers say about us
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-xl border border-[#E8F0E5] bg-white p-6 shadow-sm"
            >
              <StarRating rating={t.rating} size={18} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#20251F]">
                "{t.text}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#20251F]">{t.name}</p>
                  <p className="text-xs text-[#687067]">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
