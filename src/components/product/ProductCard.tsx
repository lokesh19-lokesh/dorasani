import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { WishlistIcon } from '../common/WishlistIcon';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  imageAspectRatio?: string;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showRating = false,
  imageAspectRatio,
  compact = false,
}) => {
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = product.colors[0]?.name || 'Standard';
    addToCart(product, color, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-lg border border-[#E8DCCF] hover:border-[#D8C7B5] hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative h-full">
      {/* Image Container - Aspect ratio adjusted for sleek proportional fit */}
      <Link
        to={`/products/${product.slug}`}
        className={`relative block ${imageAspectRatio || (compact ? 'aspect-[16/11]' : 'aspect-[4/3]')} overflow-hidden bg-[#FAF5EE]`}
      >
        <img
          src={product.primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges (Top Left) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className={`bg-[#1E432D] text-white ${compact ? 'text-[8px] sm:text-[8.5px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5'} font-bold rounded uppercase tracking-wider shadow-xs`}>
              NEW
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className={`bg-[#1E432D] text-white ${compact ? 'text-[8px] sm:text-[8.5px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5'} font-bold rounded uppercase tracking-wider shadow-xs`}>
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 ${
            compact ? 'w-6.5 h-6.5 sm:w-7 sm:h-7' : 'w-7.5 h-7.5 sm:w-8 sm:h-8'
          } rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isWishlisted
              ? 'bg-white text-[#18482C] border border-[#BCD8AA] shadow-md scale-105'
              : 'bg-white/92 backdrop-blur-md text-[#18482C] hover:text-[#0D2818] border border-[#E8DCCF]/90 hover:bg-white shadow-2xs hover:scale-105 active:scale-95'
          }`}
        >
          <WishlistIcon
            className={compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'}
            filled={isWishlisted}
          />
        </button>
      </Link>

      {/* Content Details */}
      <div className={`${compact ? 'p-2 sm:p-2.5' : 'p-3 sm:p-3.5'} flex flex-col flex-1 justify-between bg-white`}>
        <div>
          {/* Rating if enabled */}
          {showRating && product.rating && (
            <div className="flex items-center gap-1 text-[11px] text-[#C29336] mb-1">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-[#8E9B92]">({product.reviewsCount})</span>
            </div>
          )}

          {/* Title */}
          <Link
            to={`/products/${product.slug}`}
            className={`block ${compact ? 'text-[11.5px] sm:text-[12.5px]' : 'text-xs sm:text-[13px]'} font-semibold text-[#1A3B2B] hover:text-[#285A3C] transition-colors line-clamp-1 leading-snug`}
          >
            {product.title}
          </Link>

          {/* Pricing Row */}
          <div className={`flex items-center gap-1 sm:gap-1.5 ${compact ? 'mt-1' : 'mt-1.5'} flex-wrap`}>
            <span className={`${compact ? 'text-[11.5px] sm:text-xs' : 'text-xs sm:text-sm'} font-bold text-[#1A3B2B]`}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-[9.5px] sm:text-[10px] text-[#8E9B92] line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent && (
              <span className="text-[8px] sm:text-[8.5px] font-bold text-[#1A3B2B] bg-[#D0E9C0] px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Row: Fabric Tag + Cart Button */}
        <div className={`flex items-center justify-between ${compact ? 'mt-2 pt-1.5' : 'mt-3 pt-2'} border-t border-[#F5EFE6]`}>
          <span className={`${compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'} text-[#7A8A7E] font-medium tracking-wide uppercase truncate max-w-[70%]`}>
            {product.fabric || 'Pure Silk'}
          </span>

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            className={`${compact ? 'w-6 h-6 sm:w-6.5 sm:h-6.5' : 'w-7 h-7 sm:w-7.5 sm:h-7.5'} rounded border border-[#BCD8AA] bg-[#F3F8F1]/60 hover:bg-[#285A3C] text-[#285A3C] hover:text-white flex items-center justify-center transition-all duration-200 shrink-0`}
            title="Add to Bag"
            aria-label="Add to Bag"
          >
            <ShoppingBag className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
