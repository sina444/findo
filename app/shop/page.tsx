'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/types/greenhaven';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'featured', label: 'منتخب' },
  { value: 'price-low', label: 'قیمت: کم به زیاد' },
  { value: 'price-high', label: 'قیمت: زیاد به کم' },
  { value: 'rating', label: 'بالاتترین امتیاز' },
  { value: 'name', label: 'نام: الف تا ی' },
];

const priceRanges = [
  { label: 'کمتر از ۲۰ دلار', min: 0, max: 20 },
  { label: '۲۰-۴۰ دلار', min: 20, max: 40 },
  { label: '۴۰-۶۰ دلار', min: 40, max: 60 },
  { label: 'بیشتر از ۶۰ دلار', min: 60, max: Infinity },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  const saleOnly = searchParams.get('sale') === 'true';

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug)
        ? prev.filter((c) => c !== slug)
        : [...prev, slug]
    );
    setVisibleCount(8);
  };

  const togglePriceRange = (index: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
    setVisibleCount(8);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setMinRating(0);
    setInStockOnly(false);
    setVisibleCount(8);
  };

  const filteredProducts = useMemo(() => {
    let result: any[] = [...products].map(p => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images,
      specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '[]') : p.specifications,
      careInstructions: typeof p.careInstructions === 'string' ? JSON.parse(p.careInstructions || '[]') : p.careInstructions,
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
    }));

    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (saleOnly) {
      result = result.filter((p) => p.oldPrice !== undefined);
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter((p) =>
        selectedPriceRanges.some((index) => {
          const range = priceRanges[index];
          return p.price >= range.min && p.price < range.max;
        })
      );
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedPriceRanges, minRating, inStockOnly, sortBy, saleOnly]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const activeFilterCount =
    selectedCategories.length +
    selectedPriceRanges.length +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#20251F]">دسته‌بندی</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45] focus:ring-[#3F6B45]"
              />
              <span className="text-sm text-[#687067]">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#20251F]">قیمت</h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={index} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(index)}
                onChange={() => togglePriceRange(index)}
                className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45] focus:ring-[#3F6B45]"
              />
              <span className="text-sm text-[#687067]">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#20251F]">امتیاز</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.0].map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="h-4 w-4 border-[#AFC8A8] text-[#3F6B45] focus:ring-[#3F6B45]"
              />
              <span className="text-sm text-[#687067]">{rating.toFixed(1)} و بالاتر</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="h-4 w-4 border-[#AFC8A8] text-[#3F6B45] focus:ring-[#3F6B45]"
            />
            <span className="text-sm text-[#687067]">همه امتیازها</span>
          </label>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#20251F]">موجودی</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="h-4 w-4 rounded border-[#AFC8A8] text-[#3F6B45] focus:ring-[#3F6B45]"
          />
          <span className="text-sm text-[#687067]">فقط موجود</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-[#3F6B45] hover:underline"
        >
          پاک کردن همه فیلترها ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-[#E8F0E5] bg-[#F7F5EC]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
            فروشگاه
          </h1>
          <p className="mt-2 text-sm text-[#687067]">
            {searchQuery ? `نتایج جستجو برای «${searchQuery}»` : 'مجموعه کامل گیاهان پریمیوم و لوازم باغبانی ما را مرور کنید'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterContent />
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm font-medium text-[#20251F] lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  فیلترها
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#3F6B45] px-2 py-0.5 text-xs text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-[#687067]">
                  {filteredProducts.length} محصول
                </p>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm font-medium text-[#20251F] transition-colors hover:bg-[#F7F5EC]"
                >
                  مرتب‌سازی: {sortOptions.find((o) => o.value === sortBy)?.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {sortOpen && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-xl border border-[#E8F0E5] bg-white py-2 shadow-lg">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          'block w-full px-4 py-2 text-right text-sm transition-colors hover:bg-[#F7F5EC]',
                          sortBy === opt.value ? 'font-medium text-[#3F6B45]' : 'text-[#687067]'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-[#F7F5EC]" />)}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-[#20251F]">محصولی یافت نشد</p>
                <p className="mt-1 text-sm text-[#687067]">فیلترهای خود را تنظیم کنید</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-lg bg-[#3F6B45] px-6 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]"
                  >
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="rounded-lg border border-[#3F6B45] px-8 py-3 text-sm font-semibold text-[#3F6B45] transition-colors hover:bg-[#3F6B45] hover:text-white"
                >
                  بارگذاری محصولات بیشتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 animate-cart-drawer" style={{ animationName: 'slideInRight', animationDirection: 'reverse' }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">فیلترها</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-[#687067]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
}
