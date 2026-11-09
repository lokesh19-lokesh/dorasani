import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Share2,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Check,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { WishlistIcon } from '../components/common/WishlistIcon';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { productService } from '../services/productService';
import type { Product, ProductReview } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, showToast, user, siteSettings } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'care' | 'shipping' | 'reviews'>('details');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState(user?.fullName || '');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.fullName && !reviewName) {
      setReviewName(user.fullName);
    }
  }, [user?.fullName, reviewName]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setProduct(null);
    setRelatedProducts([]);
    setReviews([]);
    setQuantity(1);

    if (!slug) {
      setLoading(false);
      return;
    }

    productService
      .getProductBySlug(slug)
      .then(async (live) => {
        if (!isMounted) return;
        if (!live) {
          setProduct(null);
          return;
        }
        setProduct(live);
        setSelectedImage(live.primaryImage);
        setSelectedColor(live.colors[0]?.name || 'Standard');

        const [related, prodReviews] = await Promise.all([
          productService.getRelatedProducts(live.categorySlug, live.id, 4),
          productService.getProductReviews(live.id),
        ]);
        if (!isMounted) return;
        setRelatedProducts(related);
        setReviews(prodReviews);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
        <div className="h-5 w-64 bg-[#EDE2D4] rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-[#EDE2D4] rounded-xl animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-3/4 bg-[#EDE2D4] rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-[#EDE2D4] rounded animate-pulse" />
            <div className="h-10 w-1/3 bg-[#EDE2D4] rounded animate-pulse" />
            <div className="h-28 w-full bg-[#EDE2D4] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-[#285A3C] mx-auto" />
        <h1 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">Product Not Found</h1>
        <p className="text-xs text-[#4F6355]">
          This piece may have been archived or moved to another collection.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/shop"
            className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2.5 rounded text-xs font-semibold transition-colors"
          >
            Browse Collections
          </Link>
          <Link
            to="/"
            className="border border-[#D8C7B5] hover:bg-[#FAF5EE] text-[#1A3B2B] px-5 py-2.5 rounded text-xs font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const maxAllowedQty = Math.max(1, product.stock || 1);
  const totalReviewCount = Math.max(product.reviewsCount || 0, reviews.length);

  const featureBadges = [
    product.fabric,
    product.weave,
    product.occasion,
    product.category,
  ]
    .filter((v): v is string => Boolean(v && v.trim()))
    .slice(0, 4);

  const categoryPath =
    product.categorySlug && product.categorySlug !== 'all'
      ? `/collections/${product.categorySlug}`
      : '/shop';

  const handleAddToCart = () => {
    if (!product.inStock) {
      showToast('This item is currently out of stock.', 'info');
      return;
    }
    addToCart(product, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
      showToast('This item is currently out of stock.', 'info');
      return;
    }
    addToCart(product, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setPincodeStatus('Available! Standard delivery in 3-5 business days.');
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 text-xs text-[#4F6355]">
          <Link to="/" className="hover:text-[#285A3C]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          <Link to={categoryPath} className="hover:text-[#285A3C]">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          {product.subCategory && (
            <>
              <span className="text-[#4F6355]">{product.subCategory}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
            </>
          )}
          <span className="font-semibold text-[#285A3C] truncate">{product.title}</span>
        </div>
      </div>

      {/* 2. Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start">
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar w-full sm:w-20 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden border-2 transition-all shrink-0 bg-[#FAF5EE] ${
                    selectedImage === img
                      ? 'border-[#285A3C] shadow-sm'
                      : 'border-[#BCD8AA] hover:border-[#285A3C]/60'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>

            <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm bg-[#FAF5EE] relative aspect-[4/5] group">
              <img
                src={selectedImage || product.primaryImage}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex flex-wrap gap-1.5">
                {product.isNew && (
                  <span className="bg-[#18482C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    New Arrival
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-[#285A3C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Bestseller
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 mt-2">
                <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                  {product.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full border border-[#BCD8AA] hover:border-[#285A3C] hover:text-[#285A3C] transition-colors"
                    title="Share product"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-full border transition-all ${
                      isWishlisted
                        ? 'bg-white border-[#BCD8AA] text-[#18482C] shadow-sm'
                        : 'border-[#BCD8AA] hover:border-[#18482C] hover:text-[#0D2818] text-[#18482C]'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <WishlistIcon className="w-4 h-4" filled={isWishlisted} />
                  </button>
                </div>
              </div>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#4F6355] mt-0.5 font-medium">
                  {product.subtitle}
                </p>
              )}

              {/* Live Rating & Sold metadata */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                {product.rating > 0 ? (
                  <>
                    <div className="flex items-center text-[#C99632]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(product.rating) ? 'fill-current' : 'opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-[#1A3B2B]">
                      {product.rating.toFixed(1)} ({totalReviewCount}{' '}
                      {totalReviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-[#4F6355] font-medium">
                    {totalReviewCount > 0
                      ? `${totalReviewCount} customer review${totalReviewCount === 1 ? '' : 's'}`
                      : 'Authentic DORASANI Collection'}
                  </span>
                )}
                {(product.soldCount ?? 0) > 0 && (
                  <>
                    <span className="text-[#8E9B92]">|</span>
                    <span className="text-[#285A3C] font-semibold">{product.soldCount} sold</span>
                  </>
                )}
              </div>
            </div>

            {/* Price Row */}
            <div className="pt-2 border-t border-[#D8C7B5]">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm sm:text-base text-[#8E9B92] line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {Boolean(product.discountPercent && product.discountPercent > 0) && (
                  <span className="text-xs font-bold text-[#1A3B2B] bg-[#D0E9C0] px-2 py-0.5 rounded border border-[#BCD8AA]">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#4F6355] mt-0.5">
                Inclusive of all taxes • Free shipping above ₹
                {siteSettings.freeShippingThreshold.toLocaleString('en-IN')} • SKU: {product.sku}
              </p>
            </div>

            {/* Description Paragraph */}
            {product.description && (
              <p className="text-xs sm:text-sm text-[#4F6355] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Dynamic Feature Badges Grid */}
            {featureBadges.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {featureBadges.map((badge) => (
                  <div
                    key={badge}
                    className="bg-[#FAF5EE] p-2.5 rounded border border-[#D8C7B5] flex items-center gap-2"
                  >
                    <span className="text-[#C99632] font-bold">✦</span>
                    <span className="font-semibold text-[#1A3B2B] truncate">{badge}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Color Swatches */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A3B2B]">
                  Color: <span className="text-[#285A3C] font-bold">{selectedColor}</span>
                </span>
                {product.sizes && product.sizes.length > 0 && (
                  <span className="text-[#4F6355] font-medium">
                    Size: {product.sizes.join(', ')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      selectedColor === c.name
                        ? 'ring-2 ring-[#285A3C] ring-offset-2 scale-110'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-label={`Select color ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector & Real Stock Status */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center border border-[#BCD8AA] rounded bg-white text-xs">
                <button
                  type="button"
                  disabled={!product.inStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-[#4F6355] hover:bg-[#D0E9C0]/30 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-2 font-bold text-sm min-w-[28px] text-center text-[#1A3B2B]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={!product.inStock || quantity >= maxAllowedQty}
                  onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                  className="px-3 py-2 text-[#4F6355] hover:bg-[#D0E9C0]/30 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {product.inStock ? (
                <div className="flex items-center gap-1.5 text-xs text-[#285A3C] font-semibold bg-[#D0E9C0]/40 px-3 py-2 rounded border border-[#BCD8AA]">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stock} ready to ship)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-50 px-3 py-2 rounded border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="w-full border-2 border-[#285A3C] text-[#285A3C] hover:bg-[#D0E9C0]/30 disabled:opacity-45 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
              </button>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleBuyNow}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-45 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* PIN Code Delivery Check */}
            <form onSubmit={checkPincode} className="pt-2 dorasani-form">
              <label
                htmlFor="delivery-pincode"
                className="text-xs font-semibold text-[#1A3B2B] block mb-1.5 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-[#285A3C]" />
                <span>Check Estimated Delivery</span>
              </label>
              <div className="flex max-w-sm">
                <input
                  id="delivery-pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    if (pincodeStatus) setPincodeStatus(null);
                  }}
                  className="flex-1 bg-white border border-r-0 border-[#BCD8AA] rounded-l px-3 py-2 text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
                <button
                  type="submit"
                  className="bg-[#1A3B2B] text-white text-xs px-4 rounded-r font-semibold hover:bg-[#285A3C] transition-colors"
                >
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <p className="text-[11px] font-medium text-[#285A3C] mt-1.5">{pincodeStatus}</p>
              )}
            </form>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#D8C7B5] text-center text-[10px] text-[#4F6355]">
              <div className="p-2 rounded bg-[#FAF5EE] flex flex-col items-center gap-1 border border-[#D8C7B5]">
                <Truck className="w-4 h-4 text-[#285A3C]" />
                <span className="font-semibold text-[#1A3B2B]">
                  Free Shipping Above ₹{siteSettings.freeShippingThreshold.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded bg-[#FAF5EE] flex flex-col items-center gap-1 border border-[#D8C7B5]">
                <RotateCcw className="w-4 h-4 text-[#285A3C]" />
                <span className="font-semibold text-[#1A3B2B]">7 Days Easy Returns</span>
              </div>
              <div className="p-2 rounded bg-[#FAF5EE] flex flex-col items-center gap-1 border border-[#D8C7B5]">
                <ShieldCheck className="w-4 h-4 text-[#285A3C]" />
                <span className="font-semibold text-[#1A3B2B]">Secure Payments 100% Safe</span>
              </div>
              <div className="p-2 rounded bg-[#FAF5EE] flex flex-col items-center gap-1 border border-[#D8C7B5]">
                <CreditCard className="w-4 h-4 text-[#285A3C]" />
                <span className="font-semibold text-[#1A3B2B]">Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Tabs & Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 shadow-xs">
          <div className="flex border-b border-[#D8C7B5] overflow-x-auto no-scrollbar gap-6 sm:gap-8 text-xs sm:text-sm font-semibold">
            {[
              { id: 'desc', label: 'Description' },
              { id: 'details', label: 'Product Details' },
              { id: 'care', label: 'Care Instructions' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'reviews', label: `Reviews (${totalReviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 relative whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#285A3C] font-bold'
                    : 'text-[#4F6355] hover:text-[#1A3B2B]'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#285A3C] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="py-6 text-xs sm:text-sm text-[#4F6355] leading-relaxed">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <p>{product.description || 'Crafted by skilled heritage artisans for DORASANI.'}</p>
                  <ul className="space-y-2 text-xs">
                    {product.fabric && (
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#285A3C]" />
                        <span>
                          <strong>Material:</strong> {product.fabric}
                        </span>
                      </li>
                    )}
                    {product.weave && (
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#285A3C]" />
                        <span>
                          <strong>Weave:</strong> {product.weave}
                        </span>
                      </li>
                    )}
                    {product.occasion && (
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#285A3C]" />
                        <span>
                          <strong>Occasion:</strong> {product.occasion}
                        </span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span>
                        <strong>Blouse Piece:</strong>{' '}
                        {product.blouseIncluded
                          ? 'Included (Unstitched matching piece)'
                          : 'Not included / Styled separately'}
                      </span>
                    </li>
                    {product.length && (
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#285A3C]" />
                        <span>
                          <strong>Length / Fit:</strong> {product.length}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {product.blouseIncluded && (
                  <div className="rounded-xl overflow-hidden border border-[#BCD8AA] bg-[#D0E9C0]/25 p-4 flex items-center gap-4">
                    <img
                      src="/assets/products/blouse_piece.jpg"
                      alt="Unstitched Blouse Piece"
                      className="w-24 h-20 object-cover rounded-md border border-[#D8C7B5]"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#285A3C]">
                        Includes Unstitched Blouse Piece
                      </h4>
                      <p className="text-[11px] text-[#4F6355] mt-0.5">
                        Coordinated fabric piece with woven border ready for custom tailoring.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-3 max-w-3xl">
                <p>{product.description}</p>
                <p>
                  Every DORASANI garment undergoes stringent quality checks to certify genuine handloom authenticity and thread integrity. Woven by generational weavers whose families have preserved sacred textile traditions for centuries.
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-2">
                <p>
                  • {product.careInstructions || 'Dry Clean Only to preserve the luster and zari work.'}
                </p>
                <p>• Store folded in a clean, breathable cotton or muslin bag.</p>
                <p>• Iron on low heat on the reverse side; avoid spraying water directly onto zari threads.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-2">
                <p>
                  • <strong>Free Shipping:</strong> On all orders above ₹
                  {siteSettings.freeShippingThreshold.toLocaleString('en-IN')} across India
                  (Standard shipping below threshold: ₹
                  {siteSettings.standardShippingFee.toLocaleString('en-IN')}; Express priority air
                  dispatch: ₹{siteSettings.expressShippingFee.toLocaleString('en-IN')}).
                </p>
                <p>
                  • <strong>Delivery Time:</strong> 3-5 business days for metro cities, 5-7 days for rest of India.
                </p>
                <p>
                  • <strong>Easy 7-Day Returns:</strong> Hassle-free pickup and immediate refund upon item receipt.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF5EE] p-4 rounded-xl border border-[#D8C7B5]">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A3B2B]">Customer Reviews</h4>
                    <p className="text-xs text-[#4F6355]">
                      Share your experience with this handloom creation.
                    </p>
                  </div>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewFormOpen((prev) => !prev);
                        setReviewMessage(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs font-semibold transition-colors"
                    >
                      {reviewFormOpen ? 'Close Review Form' : 'Write a Review'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg border border-[#285A3C] text-[#285A3C] hover:bg-[#D0E9C0]/40 text-xs font-semibold transition-colors"
                    >
                      Sign In to Write a Review
                    </Link>
                  )}
                </div>

                {reviewMessage && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`p-3 rounded-lg border text-xs font-medium ${
                      reviewMessage.type === 'success'
                        ? 'bg-[#D0E9C0]/50 border-[#8EC493] text-[#113520]'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {reviewMessage.text}
                  </p>
                )}

                {user && reviewFormOpen && (
                  <form
                    method="POST"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!reviewName.trim() || !reviewContent.trim()) {
                        setReviewMessage({
                          type: 'error',
                          text: 'Please provide your name and review comments.',
                        });
                        return;
                      }
                      setSubmittingReview(true);
                      setReviewMessage(null);
                      try {
                        const created = await productService.submitProductReview({
                          productId: product.id,
                          userId: user.id,
                          reviewerName: reviewName,
                          rating: reviewRating,
                          title: reviewTitle,
                          content: reviewContent,
                        });
                        setReviews((prev) => [created, ...prev]);
                        setReviewTitle('');
                        setReviewContent('');
                        setReviewRating(5);
                        setReviewFormOpen(false);
                        setReviewMessage({
                          type: 'success',
                          text: 'Thank you! Your review has been submitted and is awaiting admin approval.',
                        });
                        showToast('Review submitted for moderation');
                      } catch (err: any) {
                        setReviewMessage({
                          type: 'error',
                          text: err?.message || 'Unable to submit review right now.',
                        });
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    className="bg-[#FAF5EE] p-5 rounded-xl border border-[#D8C7B5] space-y-4 dorasani-form"
                  >
                    <fieldset className="space-y-2">
                      <legend className="text-xs font-semibold text-[#1A3B2B]">Your Rating *</legend>
                      <div className="flex flex-wrap gap-3">
                        {[5, 4, 3, 2, 1].map((starVal) => (
                          <label
                            key={starVal}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              reviewRating === starVal
                                ? 'bg-[#D0E9C0] border-[#285A3C] text-[#113520] font-bold'
                                : 'bg-white border-[#D8C7B5] text-[#4F6355]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reviewRating"
                              value={starVal}
                              checked={reviewRating === starVal}
                              onChange={() => setReviewRating(starVal)}
                              className="accent-[#285A3C]"
                            />
                            <span>
                              {starVal} Star{starVal > 1 ? 's' : ''}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="review-name"
                          className="block text-xs font-semibold text-[#1A3B2B] mb-1"
                        >
                          Display Name *
                        </label>
                        <input
                          id="review-name"
                          name="reviewerName"
                          type="text"
                          required
                          autoComplete="name"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="w-full bg-white border border-[#D8C7B5] rounded-lg px-3 py-2 text-xs text-[#1A3B2B]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="review-title"
                          className="block text-xs font-semibold text-[#1A3B2B] mb-1"
                        >
                          Headline (Optional)
                        </label>
                        <input
                          id="review-title"
                          name="reviewTitle"
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Exquisite weave & rich zari"
                          className="w-full bg-white border border-[#D8C7B5] rounded-lg px-3 py-2 text-xs text-[#1A3B2B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="review-content"
                        className="block text-xs font-semibold text-[#1A3B2B] mb-1"
                      >
                        Your Review *
                      </label>
                      <textarea
                        id="review-content"
                        name="reviewContent"
                        rows={3}
                        required
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Describe the silk texture, drape, colour accuracy, and craftsmanship..."
                        className="w-full bg-white border border-[#D8C7B5] rounded-lg px-3 py-2 text-xs text-[#1A3B2B]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewFormOpen(false)}
                        className="px-4 py-2 rounded-lg border border-[#D8C7B5] bg-white text-xs font-semibold text-[#4F6355]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 rounded-lg bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white text-xs font-semibold"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <div className="bg-[#FAF5EE] p-5 rounded-lg border border-[#D8C7B5] text-xs text-[#4F6355]">
                    <p className="font-semibold text-[#1A3B2B]">
                      No customer reviews published for this item yet.
                    </p>
                    <p className="mt-1">
                      Be the first patron to review this handloom piece.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-[#FAF5EE] p-4 rounded-lg border border-[#D8C7B5] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-[#1A3B2B]">
                              {rev.reviewerName}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] font-semibold bg-[#D0E9C0] text-[#1A3B2B] px-2 py-0.5 rounded">
                                Verified Buyer
                              </span>
                            )}
                            {rev.status === 'pending' && (
                              <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                                Pending Moderation
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-[#C99632]">
                            {Array.from({ length: Math.max(1, Math.round(rev.rating)) }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        {rev.title && (
                          <p className="font-semibold text-xs text-[#1A3B2B]">{rev.title}</p>
                        )}
                        {rev.content && <p className="text-xs text-[#4F6355]">{rev.content}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center sm:text-left mb-6">
            <h2 className="font-serif-royal text-xl sm:text-2xl font-bold text-[#1A3B2B]">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
