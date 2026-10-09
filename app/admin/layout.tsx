'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <div className="min-h-screen bg-[#F7F5EC]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EC]">
      <AdminSidebar />
      <div className="lg:mr-72">
        <main className="min-h-screen p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
