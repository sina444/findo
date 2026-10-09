'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { StarRating } from '@/components/StarRating';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice, cn } from '@/lib/utils';

function parseProduct(p: any) {
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '[]') : (p.specifications || []),
    careInstructions: typeof p.careInstructions === 'string' ? JSON.parse(p.careInstructions || '[]') : (p.careInstructions || []),
    features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
    oldPrice: p.oldPrice || undefined,
    badge: p.badge || undefined,
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist, openCart } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'care' | 'reviews'>('description');

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then((prods: any[]) => {
        const found = prods.find(p => p.slug === slug);
        if (found) {
          const parsed = parseProduct(found);
          setProduct(parsed);
          const related = prods
            .filter(p => p.category === found.category && p.id !== found.id)
            .slice(0, 4)
            .map(parseProduct);
          setRelatedProducts(related);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E8F0E5] border-t-[#3F6B45]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#20251F]">محصول یافت نشد</h1>
        <Link href="/shop" className="mt-4 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7D52]">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const wished = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    openCart();
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-[#E8F0E5]">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 text-sm text-[#687067]">
            <Link href="/" className="hover:text-[#3F6B45]">خانه</Link>
            <ChevronLeft className="h-3 w-3" />
            <Link href="/shop" className="hover:text-[#3F6B45]">فروشگاه</Link>
            <ChevronLeft className="h-3 w-3" />
            <span className="text-[#20251F]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#E8F0E5] bg-[#F7F5EC]">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-[#3F6B45] px-3 py-1 text-xs font-medium text-white">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-lg border-2 transition-all',
                      selectedImage === index
                        ? 'border-[#3F6B45]'
                        : 'border-[#E8F0E5] hover:border-[#AFC8A8]'
                    )}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-[#20251F] md:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} size={18} />
              <span className="text-sm text-[#687067]">
                {product.rating.toFixed(1)} ({product.reviewCount} نظر)
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#20251F]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-[#687067] line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="rounded-full bg-[#E8F0E5] px-2 py-0.5 text-xs font-medium text-[#3F6B45]">
                    {Math.round((1 - product.price / product.oldPrice) * 100)}٪ تخفیف
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#687067]">
              {product.shortDescription}
            </p>

            {/* Features */}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.features.map((feature) => (
                <span key={feature} className="rounded-full bg-[#E8F0E5] px-3 py-1 text-xs font-medium text-[#3F6B45]">
                  {feature}
                </span>
              ))}
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3F6B45]">
                  <span className="h-2 w-2 rounded-full bg-[#3F6B45]" />
                  موجود
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  ناموجود
                </span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-[#E8F0E5]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center text-[#687067] transition-colors hover:bg-[#F7F5EC]"
                  aria-label="کاهش تعداد"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-base font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center text-[#687067] transition-colors hover:bg-[#F7F5EC]"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3F6B45] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A7D52]"
              >
                <ShoppingBag className="h-4 w-4" />
                افزودن به سبد
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8F0E5] transition-colors hover:bg-[#F7F5EC]"
                aria-label="افزودن به علاقه‌مندی‌ها"
              >
                <Heart className={cn('h-5 w-5', wished ? 'fill-red-500 text-red-500' : 'text-[#687067]')} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="mt-3 w-full rounded-lg border-2 border-[#3F6B45] py-3 text-sm font-semibold text-[#3F6B45] transition-colors hover:bg-[#3F6B45] hover:text-white"
            >
              خرید فوری
            </button>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#E8F0E5] pt-6">
              <div className="flex flex-col items-center text-center">
                <Truck className="h-6 w-6 text-[#3F6B45]" />
                <span className="mt-2 text-xs text-[#687067]">ارسال رایگان بالای ۵۰ دلار</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="h-6 w-6 text-[#3F6B45]" />
                <span className="mt-2 text-xs text-[#687067]">بازگشت ۳۰ روزه</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-6 w-6 text-[#3F6B45]" />
                <span className="mt-2 text-xs text-[#687067]">گارانتی گیاه</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-[#E8F0E5] pt-8">
          <div className="flex gap-1 border-b border-[#E8F0E5]">
            {[
              { key: 'description', label: 'توضیحات' },
              { key: 'specifications', label: 'مشخصات' },
              { key: 'care', label: 'دستورالعمل مراقبت' },
              { key: 'reviews', label: 'نظرات' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-[#3F6B45] text-[#3F6B45]'
                    : 'border-transparent text-[#687067] hover:text-[#20251F]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <p className="max-w-3xl text-sm leading-relaxed text-[#687067]">
                {product.description}
              </p>
            )}
            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={index} className={cn(index % 2 === 0 && 'bg-[#F7F5EC]')}>
                        <td className="px-4 py-3 text-sm font-medium text-[#20251F]">{spec.label}</td>
                        <td className="px-4 py-3 text-sm text-[#687067]">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'care' && (
              <ul className="max-w-2xl space-y-3">
                {product.careInstructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-[#687067]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3F6B45]" />
                    {instruction}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reviews' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#20251F]">{product.rating.toFixed(1)}</p>
                    <StarRating rating={product.rating} size={16} className="mt-2 justify-center" />
                    <p className="mt-1 text-xs text-[#687067]">{product.reviewCount} نظر</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-4 text-xs text-[#687067]">{star}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8F0E5]">
                          <div
                            className="h-full rounded-full bg-[#FFC107]"
                            style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-sm text-[#687067]">
                  نظرات مشتریان پس از در دسترس قرار گرفتن در اینجا نمایش داده می‌شود.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold tracking-tight text-[#20251F] md:text-2xl">
              محصولات مرتبط
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
