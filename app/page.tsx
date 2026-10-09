import { Hero } from '@/components/Hero';
import { FeaturedCategories } from '@/components/FeaturedCategories';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { PromoBanner } from '@/components/PromoBanner';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Testimonials } from '@/components/Testimonials';
import { BlogSection } from '@/components/BlogSection';
import { Newsletter } from '@/components/Newsletter';
import { getProducts, getCategories, getFeatures, getTestimonials, getBlogPosts, getSiteContent } from '@/lib/db';

export default async function HomePage() {
  const [products, categories, features, testimonials, blogPosts, content] = await Promise.all([
    getProducts(),
    getCategories(),
    getFeatures(),
    getTestimonials(),
    getBlogPosts(),
    getSiteContent(),
  ]);

  return (
    <>
      <Hero content={content} />
      <FeaturedCategories categories={categories} />
      <FeaturedProducts products={products} />
      <PromoBanner content={content} />
      <WhyChooseUs features={features} content={content} />
      <Testimonials testimonials={testimonials} />
      <BlogSection blogPosts={blogPosts} />
      <Newsletter content={content} />
    </>
  );
}
