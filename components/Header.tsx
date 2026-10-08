'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Leaf, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { products, categories } from '@/data/greenhaven';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'خانه', href: '/' },
  { label: 'فروشگاه', href: '/shop', hasDropdown: true },
  { label: 'گیاهان', href: '/shop?category=indoor-plants', hasDropdown: true },
  { label: 'ابزار', href: '/shop?category=gardening-tools' },
  { label: 'فضای باز', href: '/shop?category=outdoor-plants' },
  { label: 'وبلاگ', href: '/#blog' },
  { label: 'تماس', href: '/#contact' },
];

export function Header() {
  const { cartCount, openCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const searchResults = searchQuery
    ? products
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-md'
            : 'bg-white'
        )}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F6B45]">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#20251F]">
                Green<span className="text-[#3F6B45]">Haven</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium text-[#20251F] transition-colors hover:text-[#3F6B45]"
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>
                  {link.hasDropdown && openDropdown === link.label && (
                    <div className="absolute right-0 top-full pt-2">
                      <div className="w-52 rounded-xl border border-[#E8F0E5] bg-white py-2 shadow-lg">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="block px-4 py-2 text-sm text-[#687067] transition-colors hover:bg-[#F7F5EC] hover:text-[#3F6B45]"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search button */}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setTimeout(() => searchRef.current?.focus(), 100);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#20251F] transition-colors hover:bg-[#F7F5EC]"
                aria-label="جستجو"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#20251F] transition-colors hover:bg-[#F7F5EC]"
                  aria-label="حساب کاربری"
                >
                  <User className="h-5 w-5" />
                </button>
                {accountOpen && (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="w-56 rounded-xl border border-[#E8F0E5] bg-white py-2 shadow-lg">
                      <Link href="/account" className="block px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC] hover:text-[#3F6B45]">حساب من</Link>
                      <Link href="/account" className="block px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC] hover:text-[#3F6B45]">سفارش‌های من</Link>
                      <Link href="/account" className="block px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC] hover:text-[#3F6B45]">لیست علاقه‌مندی‌ها</Link>
                      <hr className="my-1 border-[#E8F0E5]" />
                      <Link href="/account" className="block px-4 py-2 text-sm font-medium text-[#3F6B45] hover:bg-[#F7F5EC]">ورود</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#20251F] transition-colors hover:bg-[#F7F5EC]"
                aria-label="سبد خرید"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -left-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3F6B45] text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#20251F] transition-colors hover:bg-[#F7F5EC] lg:hidden"
                aria-label="منو"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Search bar dropdown */}
          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-40 border-t border-[#E8F0E5] bg-white px-4 py-4 shadow-lg sm:px-6 lg:px-8">
              <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#687067]" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی گیاه، ابزار، گلدان..."
                    className="w-full rounded-xl border border-[#E8F0E5] bg-[#F7F5EC] py-3 pr-12 pl-4 text-sm text-[#20251F] outline-none focus:border-[#3F6B45] focus:bg-white"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#F7F5EC]"
                      >
                        <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-[#20251F]">{p.name}</p>
                          <p className="text-sm text-[#687067]">{p.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E8F0E5] bg-white lg:hidden">
            <nav className="flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="border-b border-[#E8F0E5] py-3 text-sm font-medium text-[#20251F] transition-colors hover:text-[#3F6B45]"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/account" className="py-3 text-sm font-medium text-[#20251F] transition-colors hover:text-[#3F6B45]">
                حساب کاربری
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
