'use client';

import { Leaf, Sprout, Truck, ShieldCheck } from 'lucide-react';
import { features } from '@/data/greenhaven';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: Leaf,
  sprout: Sprout,
  truck: Truck,
  'shield-check': ShieldCheck,
};

export function WhyChooseUs() {
  return (
    <section className="bg-[#F7F5EC] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            Why Choose Us
          </h2>
          <p className="mt-2 text-sm text-[#687067]">
            We are committed to bringing you the best in gardening
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Leaf;
            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-7 w-7 text-[#3F6B45]" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#20251F]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-[#687067]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lifestyle images */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="https://images.unsplash.com/photo-1529812461-1c0c0c0c0c0c?w=600&q=80"
              alt="Person gardening outdoors in sunlight"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="https://images.unsplash.com/photo-1545241047-6053be5d40f5?w=600&q=80"
              alt="Hands caring for indoor plants"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="https://images.unsplash.com/photo-1485955900006-3c0c0c0c0c0c?w=600&q=80"
              alt="Beautiful garden with various plants"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
