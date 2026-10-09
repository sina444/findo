'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, FileText, Star, Image as ImageIcon, Settings, LogOut, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'محصولات', href: '/admin/products', icon: Package },
  { label: 'دسته‌بندی‌ها', href: '/admin/categories', icon: Tags },
  { label: 'محتوای سایت', href: '/admin/content', icon: Settings },
  { label: 'وبلاگ', href: '/admin/blog', icon: FileText },
  { label: 'نظرات مشتریان', href: '/admin/testimonials', icon: Star },
  { label: 'گالری تصاویر', href: '/admin/images', icon: ImageIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 flex-col bg-[#20251F] text-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F6B45]">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold">
          Green<span className="text-[#7FA77D]">Haven</span>
          <span className="mr-2 text-xs font-normal text-white/50">پنل مدیریت</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#3F6B45] text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="mb-2 flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Leaf className="h-4 w-4" />
          مشاهده سایت
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          خروج از سیستم
        </button>
      </div>
    </aside>
  );
}
