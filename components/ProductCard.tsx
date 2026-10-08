'use client';

import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/types/greenhaven';
import { useStore } from '@/lib/store-context';
import { StarRating } from '@/components/StarRating';
import { formatPrice, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wished = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E8F0E5] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Badge */}
      {product.badge && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-[#3F6B45] px-3 py-1 text-xs font-medium text-white">
          {product.badge}
        </span>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white"
        aria-label="افزودن به علاقه‌مندی‌ها"
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-colors',
            wished ? 'fill-red-500 text-red-500' : 'text-[#687067]'
          )}
        />
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <div className="aspect-square overflow-hidden bg-[#F7F5EC]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[#20251F] transition-colors hover:text-[#3F6B45]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2">
          <StarRating rating={product.rating} size={14} showNumber reviewCount={product.reviewCount} />
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-[#687067]">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#20251F]">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-[#687067] line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3F6B45] text-white transition-all hover:bg-[#4A7D52] hover:shadow-md"
            aria-label={`افزودن ${product.name} به سبد`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
