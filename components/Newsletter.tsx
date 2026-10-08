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
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
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
                You're in!
              </h2>
              <p className="mt-2 text-base text-white/80">
                Welcome to the GreenHaven community. Check your inbox for a special welcome gift.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Join the GreenHaven Community
              </h2>
              <p className="mt-2 text-base text-white/80">
                Enter your email address to the newsletter.
              </p>
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border-0 bg-white py-3 pl-12 pr-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#C9825A]"
                    aria-label="Email address"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#20251F] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  Subscribe
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
