import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showRating = false }) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = product.colors[selectedColorIndex]?.name || 'Standard';
    addToCart(product, color, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-lg border border-[#E8DCCF] hover:border-[#D8C7B5] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#FAF5EE]"
      >
        <img
          src={product.primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges (Top Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-[#285A3C] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-[#1E432D] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-[#285A3C] text-white shadow-md'
              : 'bg-white/95 text-[#1A3B2B] hover:bg-white hover:text-[#285A3C] shadow-xs'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
          />
        </button>
      </Link>

      {/* Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
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
            className="block text-xs sm:text-[13px] font-semibold text-[#1A3B2B] hover:text-[#285A3C] transition-colors line-clamp-1 leading-snug"
          >
            {product.title}
          </Link>

          {/* Pricing Row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#1A3B2B]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-xs text-[#8E9B92] line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent && (
              <span className="text-[9px] sm:text-[10px] font-bold text-[#1A3B2B] bg-[#D0E9C0] px-1.5 py-0.5 rounded">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Row: Color Dots + Cart Button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5EFE6]">
          {/* Color Dots */}
          <div className="flex items-center space-x-1.5">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={() => setSelectedColorIndex(idx)}
                aria-label={`Select color ${color.name}`}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all ${
                  selectedColorIndex === idx
                    ? 'ring-2 ring-[#285A3C] ring-offset-1 scale-110'
                    : 'border-black/10 hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#D8C7B5] hover:border-[#285A3C] hover:bg-[#285A3C] text-[#285A3C] hover:text-white flex items-center justify-center transition-all duration-200"
            title="Add to Bag"
            aria-label="Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
