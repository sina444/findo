'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('لطفاً ایمیل خود را وارد کنید');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    setSubscribed(true);
    setError('');
    setEmail('');
  };

  return (
    <section className="bg-[#3F6B45] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {subscribed ? (
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                خوش آمدید!
              </h2>
              <p className="mt-2 text-base text-white/80">
                به جامعه گرین‌هیون خوش آمدید. صندوق ورودی خود را برای یک هدیه خوش‌آمدگویی ویژه بررسی کنید.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                به جامعه گرین‌هیون بپیوندید
              </h2>
              <p className="mt-2 text-base text-white/80">
                ایمیل خود را برای عضویت در خبرنامه وارد کنید.
              </p>
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="ایمیل خود را وارد کنید"
                    className="w-full rounded-lg border-0 bg-white py-3 pr-12 pl-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#C9825A]"
                    aria-label="آدرس ایمیل"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#20251F] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  عضویت
                </button>
              </form>
              {error && (
                <p className="mt-3 text-sm text-white/90">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
