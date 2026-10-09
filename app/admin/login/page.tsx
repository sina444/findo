'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'ورود ناموفق بود');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('خطای اتصال به سرور');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3F6B45]">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#20251F]">پنل مدیریت گرین‌هیون</h1>
          <p className="mt-2 text-sm text-[#687067]">برای ورود نام کاربری و رمز عبور خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#E8F0E5] bg-white p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#20251F]">نام کاربری</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] py-3 pr-11 pl-4 text-sm outline-none focus:border-[#3F6B45] focus:bg-white"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#20251F]">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#E8F0E5] bg-[#F7F5EC] py-3 pr-11 pl-4 text-sm outline-none focus:border-[#3F6B45] focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#3F6B45] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A7D52] disabled:opacity-50"
          >
            {loading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#687067]">
          رمز پیش‌فرض: admin / admin123 — لطفاً پس از ورود آن را تغییر دهید
        </p>
      </div>
    </div>
  );
}
