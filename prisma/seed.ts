import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  categories as seedCategories,
  products as seedProducts,
  blogPosts as seedBlogPosts,
  testimonials as seedTestimonials,
  features as seedFeatures,
} from '../data/greenhaven';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });
  console.log('✅ Admin user created (username: admin, password: admin123)');

  // Seed categories
  for (let i = 0; i < seedCategories.length; i++) {
    const cat = seedCategories[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image,
        description: cat.description,
        sortOrder: i,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${seedCategories.length} categories seeded`);

  // Seed products
  for (let i = 0; i < seedProducts.length; i++) {
    const p = seedProducts[i];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice || null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        category: p.category,
        image: p.image,
        images: JSON.stringify(p.images),
        description: p.description,
        shortDescription: p.shortDescription,
        specifications: JSON.stringify(p.specifications),
        careInstructions: JSON.stringify(p.careInstructions),
        inStock: p.inStock,
        badge: p.badge || null,
        features: JSON.stringify(p.features),
        sortOrder: i,
        published: true,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        oldPrice: p.oldPrice || null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        category: p.category,
        image: p.image,
        images: JSON.stringify(p.images),
        description: p.description,
        shortDescription: p.shortDescription,
        specifications: JSON.stringify(p.specifications),
        careInstructions: JSON.stringify(p.careInstructions),
        inStock: p.inStock,
        badge: p.badge || null,
        features: JSON.stringify(p.features),
        sortOrder: i,
        published: true,
      },
    });
  }
  console.log(`✅ ${seedProducts.length} products seeded`);

  // Seed blog posts
  for (let i = 0; i < seedBlogPosts.length; i++) {
    const post = seedBlogPosts[i];
    await prisma.blogPost.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        image: post.image,
        date: post.date,
        readTime: post.readTime,
        sortOrder: i,
      },
      create: {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        image: post.image,
        date: post.date,
        readTime: post.readTime,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${seedBlogPosts.length} blog posts seeded`);

  // Seed testimonials
  for (let i = 0; i < seedTestimonials.length; i++) {
    const t = seedTestimonials[i];
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        avatar: t.avatar,
        rating: t.rating,
        text: t.text,
        location: t.location,
        sortOrder: i,
      },
      create: {
        id: t.id,
        name: t.name,
        avatar: t.avatar,
        rating: t.rating,
        text: t.text,
        location: t.location,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${seedTestimonials.length} testimonials seeded`);

  // Seed features
  for (let i = 0; i < seedFeatures.length; i++) {
    const f = seedFeatures[i];
    await prisma.feature.upsert({
      where: { id: f.id },
      update: {
        title: f.title,
        description: f.description,
        icon: f.icon,
        sortOrder: i,
      },
      create: {
        id: f.id,
        title: f.title,
        description: f.description,
        icon: f.icon,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${seedFeatures.length} features seeded`);

  // Seed site content
  const siteContent: Record<string, string> = {
    hero_title: 'طبیعت را به خانه بیاورید',
    hero_subtitle: 'گیاهان پریمیوم، ابزار باغبانی و لوازم فضای باز.',
    hero_cta_primary: 'خرید کنید',
    hero_cta_secondary: 'کاوش مجموعه‌ها',
    promo_badge: 'زمان محدود',
    promo_title: 'فروش بهاره — تا ۳۰٪ تخفیف',
    promo_subtitle: 'با پیشنهادات محدود زمانی ما روی گیاهان پریمیوم و لوازم باغبانی، به فضای خود جان تازه‌ای ببخشید.',
    promo_cta: 'خرید از فروش',
    promo_image: '/images/1509423350716-97f9360b4e09.jpg',
    about_title: 'چرا ما را انتخاب کنید',
    about_subtitle: 'ما متعهد به ارائه بهترین‌های باغبانی به شما هستیم',
    newsletter_title: 'به جامعه گرین‌هیون بپیوندید',
    newsletter_subtitle: 'ایمیل خود را برای عضویت در خبرنامه وارد کنید.',
    footer_description: 'گیاهان پریمیوم، ابزار باغبانی و لوازم فضای باز، تحویل درب منزل. آوردن طبیعت به خانه شما از سال ۲۰۲۶.',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    social_facebook: '#',
    social_instagram: '#',
    social_twitter: '#',
  };

  for (const [key, value] of Object.entries(siteContent)) {
    await prisma.siteContent.upsert({
      where: { id: key },
      update: { value },
      create: { id: key, value },
    });
  }
  console.log(`✅ ${Object.keys(siteContent).length} site content entries seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('🔐 Admin login: username=admin password=admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
