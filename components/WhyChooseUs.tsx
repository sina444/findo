'use client';

import { Leaf, Sprout, Truck, ShieldCheck } from 'lucide-react';
import { Feature } from '@/types/greenhaven';
import { TiltCard } from '@/components/TiltCard';
import { ParallaxSection } from '@/components/ParallaxSection';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: Leaf,
  sprout: Sprout,
  truck: Truck,
  'shield-check': ShieldCheck,
};

interface WhyChooseUsProps {
  features: Feature[];
  content: Record<string, string>;
}

export function WhyChooseUs({ features, content }: WhyChooseUsProps) {
  return (
    <section className="bg-[#F7F5EC] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            {content.about_title || 'چرا ما را انتخاب کنید'}
          </h2>
          <p className="mt-2 text-sm text-[#687067]">
            {content.about_subtitle || 'ما متعهد به ارائه بهترین‌های باغبانی به شما هستیم'}
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Leaf;
            return (
              <TiltCard key={feature.id} maxTilt={8} scale={1.05} className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0E5]" style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
                  <Icon className="h-7 w-7 text-[#3F6B45]" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#20251F]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-[#687067]">
                  {feature.description}
                </p>
              </TiltCard>
            );
          })}
        </div>

        {/* Lifestyle images with parallax */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <ParallaxSection speed={0.4} className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="/images/1604762525953-2c80447cc4a6.jpg"
              alt="شخصی در حال باغبانی در فضای باز"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </ParallaxSection>
          <ParallaxSection speed={0.6} className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="/images/1517191434949-5e90cd67d2b6.jpg"
              alt="دست‌ها در حال مراقبت از گیاهان آپارتمانی"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </ParallaxSection>
          <ParallaxSection speed={0.4} className="relative h-64 overflow-hidden rounded-2xl md:h-80">
            <img
              src="/images/1597868165956-03a6827955b1.jpg"
              alt="باغ زیبا با گیاهان متنوع"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </ParallaxSection>
        </div>
      </div>
    </section>
  );
}
