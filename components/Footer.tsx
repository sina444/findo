'use client';

import Link from 'next/link';
import { Leaf, Facebook, Instagram, Twitter } from 'lucide-react';

const footerColumns = [
  {
    title: 'About Us',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Mission', href: '/about' },
      { label: 'Sustainability', href: '/about' },
      { label: 'Careers', href: '/about' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'All Plants', href: '/shop' },
      { label: 'Tools', href: '/shop?category=gardening-tools' },
      { label: 'Planters', href: '/shop?category=planters' },
      { label: 'Sale', href: '/shop?sale=true' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/#contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-[#20251F] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F6B45]">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Green<span className="text-[#7FA77D]">Haven</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Premium plants, gardening tools, and outdoor essentials delivered to your door. Bringing nature home since 2026.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#3F6B45]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#3F6B45]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#3F6B45]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3F6B45]">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Green<span className="text-[#7FA77D]">Haven</span>
            </span>
          </Link>
          <p className="text-sm text-white/50">
            © 2026 GreenHaven. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
