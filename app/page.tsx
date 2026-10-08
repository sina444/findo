import { Hero } from '@/components/Hero';
import { FeaturedCategories } from '@/components/FeaturedCategories';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { PromoBanner } from '@/components/PromoBanner';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Testimonials } from '@/components/Testimonials';
import { BlogSection } from '@/components/BlogSection';
import { Newsletter } from '@/components/Newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoBanner />
      <WhyChooseUs />
      <Testimonials />
      <BlogSection />
      <Newsletter />
    </>
  );
}
