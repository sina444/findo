'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tags, FileText, Star, ImagePlus, PackagePlus, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/admin-api';

interface DashboardStats {
  productCount: number;
  categoryCount: number;
  blogCount: number;
  testimonialCount: number;
  publishedProducts: number;
  unpublishedProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/products'),
      apiGet('/categories'),
      apiGet('/blog'),
      apiGet('/testimonials'),
    ])
      .then(([products, categories, blog, testimonials]) => {
        const prodArr = products as any[];
        setStats({
          productCount: prodArr.length,
          categoryCount: (categories as any[]).length,
          blogCount: (blog as any[]).length,
          testimonialCount: (testimonials as any[]).length,
          publishedProducts: prodArr.filter((p) => p.published).length,
          unpublishedProducts: prodArr.filter((p) => !p.published).length,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'محصولات', value: stats?.productCount ?? 0, icon: Package, color: 'bg-[#3F6B45]', href: '/admin/products' },
    { label: 'دسته‌بندی‌ها', value: stats?.categoryCount ?? 0, icon: Tags, color: 'bg-[#7FA77D]', href: '/admin/categories' },
    { label: 'پست‌های وبلاگ', value: stats?.blogCount ?? 0, icon: FileText, color: 'bg-[#C9825A]', href: '/admin/blog' },
    { label: 'نظرات مشتریان', value: stats?.testimonialCount ?? 0, icon: Star, color: 'bg-[#AFC8A8]', href: '/admin/testimonials' },
  ];

  const quickActions = [
    { label: 'افزودن محصول', href: '/admin/products', icon: PackagePlus },
    { label: 'افزودن تصویر', href: '/admin/images', icon: ImagePlus },
    { label: 'ویرایش محتوا', href: '/admin/content', icon: Settings },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#20251F]">داشبورد مدیریت</h1>
        <p className="mt-1 text-sm text-[#687067]">خلاصه وضعیت سایت و میانبرهای مدیریتی</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/60" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="rounded-xl border border-[#E8F0E5] bg-white p-5 transition-all hover:shadow-md"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#20251F]">{card.value}</p>
                  <p className="text-sm text-[#687067]">{card.label}</p>
                </Link>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold text-[#20251F]">میانبرهای سریع</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-2 rounded-lg border border-[#E8F0E5] bg-white px-4 py-3 text-sm font-medium text-[#20251F] transition-colors hover:border-[#3F6B45] hover:text-[#3F6B45]"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Status overview */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E8F0E5] bg-white p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#3F6B45]" />
                <h3 className="text-sm font-semibold text-[#20251F]">وضعیت انتشار محصولات</h3>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687067]">منتشر شده</span>
                  <span className="font-semibold text-[#3F6B45]">{stats?.publishedProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687067]">منتشر نشده</span>
                  <span className="font-semibold text-[#C9825A]">{stats?.unpublishedProducts}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8F0E5] bg-white p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#3F6B45]" />
                <h3 className="text-sm font-semibold text-[#20251F]">راهنما</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[#687067]">
                <li>• برای تغییر قیمت‌ها به بخش «محصولات» مراجعه کنید</li>
                <li>• برای ویرایش متن‌های سایت به «محتوای سایت» بروید</li>
                <li>• تصاویر را در «گالری تصاویر» بارگذاری کنید</li>
                <li>• تغییرات بلافاصله در سایت اعمال می‌شوند</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
