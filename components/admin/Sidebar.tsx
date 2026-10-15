'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tags, FileText, Star, Image as ImageIcon,
  Settings, LogOut, Leaf, ShoppingBag,
  Home, Sprout, Droplets, Wallet, Cpu, Bell, Users,
  Bot, Microscope, FileBarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const storeItems = [
  { label: 'داشبورد فروشگاه', href: '/admin', icon: LayoutDashboard },
  { label: 'محصولات', href: '/admin/products', icon: Package },
  { label: 'سفارش‌ها', href: '/admin/orders', icon: ShoppingBag },
  { label: 'دسته‌بندی‌ها', href: '/admin/categories', icon: Tags },
  { label: 'محتوای سایت', href: '/admin/content', icon: Settings },
  { label: 'وبلاگ', href: '/admin/blog', icon: FileText },
  { label: 'نظرات مشتریان', href: '/admin/testimonials', icon: Star },
  { label: 'گالری تصاویر', href: '/admin/images', icon: ImageIcon },
];

const greenhouseItems = [
  { label: 'داشبورد گلخانه', href: '/admin/greenhouse', icon: Home },
  { label: 'مدیریت محصولات کشت', href: '/admin/crops', icon: Sprout },
  { label: 'آبیاری هوشمند', href: '/admin/irrigation', icon: Droplets },
  { label: 'مدیریت مالی', href: '/admin/finance', icon: Wallet },
  { label: 'تجهیزات و IoT', href: '/admin/equipment', icon: Cpu },
  { label: 'هشدارها', href: '/admin/alerts', icon: Bell },
  { label: 'کارکنان و وظایف', href: '/admin/workers', icon: Users },
  { label: 'دستیار هوشمند', href: '/admin/ai-assistant', icon: Bot },
  { label: 'پزشک گیاه', href: '/admin/plant-doctor', icon: Microscope },
  { label: 'گزارش‌گیری', href: '/admin/reports', icon: FileBarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 flex-col bg-[#20251F] text-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F6B45]">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            Green<span className="text-[#7FA77D]">Haven</span>
          </span>
          <span className="text-xs font-normal text-white/50">پلتفرم هوشمند گلخانه</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {/* Store section */}
        <p className="px-4 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-white/30">فروشگاه</p>
        {storeItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
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

        {/* Greenhouse section */}
        <p className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-white/30">مدیریت گلخانه</p>
        {greenhouseItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
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
