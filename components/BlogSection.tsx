'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlogPost } from '@/types/greenhaven';

interface BlogSectionProps {
  blogPosts: BlogPost[];
}

export function BlogSection({ blogPosts }: BlogSectionProps) {
  return (
    <section id="blog" className="bg-[#F7F5EC] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            وبلاگ
          </h2>
          <p className="mt-2 text-sm text-[#687067]">
            محتوا و بینش‌های منتخب
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E8F0E5] bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <Link href={`/blog/${post.id}`} className="block overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium tracking-wide text-[#3F6B45]">
                  {post.category}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#20251F]">
                  <Link href={`/blog/${post.id}`} className="transition-colors hover:text-[#3F6B45]">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-[#687067]">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#687067]">{post.date} · {post.readTime}</span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#3F6B45] transition-all hover:gap-2"
                  >
                    ادامه مطلب
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
