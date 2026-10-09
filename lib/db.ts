import { prisma } from '@/lib/prisma';
import type { Product, Category, BlogPost, Testimonial, Feature } from '@/types/greenhaven';

// Transform Prisma product to frontend Product type
function transformProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice || undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    category: p.category,
    image: p.image,
    images: JSON.parse(p.images || '[]'),
    description: p.description,
    shortDescription: p.shortDescription,
    specifications: JSON.parse(p.specifications || '[]'),
    careInstructions: JSON.parse(p.careInstructions || '[]'),
    inStock: p.inStock,
    badge: p.badge || undefined,
    features: JSON.parse(p.features || '[]'),
  };
}

function transformCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
  };
}

function transformBlogPost(b: any): BlogPost {
  return {
    id: b.id,
    title: b.title,
    excerpt: b.excerpt,
    category: b.category,
    image: b.image,
    date: b.date,
    readTime: b.readTime,
  };
}

function transformTestimonial(t: any): Testimonial {
  return {
    id: t.id,
    name: t.name,
    avatar: t.avatar,
    rating: t.rating,
    text: t.text,
    location: t.location,
  };
}

function transformFeature(f: any): Feature {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    icon: f.icon,
  };
}

// Data access functions (server-side only)
export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  });
  return products.map(transformProduct);
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return products.map(transformProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return undefined;
  return transformProduct(product);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return undefined;
  return transformProduct(product);
}

export async function getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      published: true,
    },
    take: limit,
    orderBy: { sortOrder: 'asc' },
  });
  return products.map(transformProduct);
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return categories.map(transformCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return undefined;
  return transformCategory(category);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  });
  return posts.map(transformBlogPost);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  });
  return testimonials.map(transformTestimonial);
}

export async function getFeatures(): Promise<Feature[]> {
  const features = await prisma.feature.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return features.map(transformFeature);
}

export async function getSiteContent(): Promise<Record<string, string>> {
  const entries = await prisma.siteContent.findMany();
  const result: Record<string, string> = {};
  for (const entry of entries) {
    result[entry.id] = entry.value;
  }
  return result;
}
