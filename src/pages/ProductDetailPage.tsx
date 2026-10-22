import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
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
  MapPin
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useStore();

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const [selectedImage, setSelectedImage] = useState(product.primaryImage);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'care' | 'shipping' | 'reviews'>('details');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
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
          <Link to="/" className="hover:text-[#285A3C]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          <Link to="/collections/sarees" className="hover:text-[#285A3C]">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          {product.subCategory && (
            <>
              <span className="hover:text-[#285A3C] cursor-pointer">{product.subCategory}</span>
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
            {/* Thumbnails (Vertical on desktop) */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar w-full sm:w-20 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
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

            {/* Main Image */}
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm bg-[#FAF5EE] relative aspect-[4/5] group">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 space-y-5">
            {/* Badges & Title */}
            <div>
              {product.isBestseller && (
                <span className="bg-[#285A3C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Bestseller
                </span>
              )}

              <div className="flex items-start justify-between gap-4 mt-2">
                <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                  {product.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full border border-[#BCD8AA] hover:border-[#285A3C] hover:text-[#285A3C] transition-colors"
                    title="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 rounded-full border transition-colors ${
                      isWishlisted
                        ? 'bg-[#285A3C] border-[#285A3C] text-white'
                        : 'border-[#BCD8AA] hover:border-[#285A3C] hover:text-[#285A3C]'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#4F6355] mt-0.5 font-medium">
                  {product.subtitle}
                </p>
              )}

              {/* Rating and Sold count */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-[#C99632]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-[#1A3B2B]">
                  {product.rating} ({product.reviewsCount} reviews)
                </span>
                <span className="text-[#8E9B92]">|</span>
                <span className="text-[#285A3C] font-semibold">
                  {product.soldCount || 500}+ sold
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="pt-2 border-t border-[#D8C7B5]">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm sm:text-base text-[#8E9B92] line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[#1A3B2B] bg-[#D0E9C0] px-2 py-0.5 rounded border border-[#BCD8AA]">
                  {product.discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-[#4F6355] mt-0.5">
                Inclusive of all taxes • Pan India Free Shipping
              </p>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-[#4F6355] leading-relaxed">
              {product.description}
            </p>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-[#FAF5EE] p-2.5 rounded border border-[#D8C7B5] flex items-center gap-2">
                <span className="text-[#C99632] font-bold">✦</span>
                <span className="font-semibold text-[#1A3B2B]">Pure Kanjivaram Silk</span>
              </div>
              <div className="bg-[#FAF5EE] p-2.5 rounded border border-[#D8C7B5] flex items-center gap-2">
                <span className="text-[#C99632] font-bold">✦</span>
                <span className="font-semibold text-[#1A3B2B]">Handwoven Zari Work</span>
              </div>
              <div className="bg-[#FAF5EE] p-2.5 rounded border border-[#D8C7B5] flex items-center gap-2">
                <span className="text-[#C99632] font-bold">✦</span>
                <span className="font-semibold text-[#1A3B2B]">Traditional Motifs</span>
              </div>
              <div className="bg-[#FAF5EE] p-2.5 rounded border border-[#D8C7B5] flex items-center gap-2">
                <span className="text-[#C99632] font-bold">✦</span>
                <span className="font-semibold text-[#1A3B2B]">Authentic Handloom</span>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A3B2B]">
                  Color: <span className="text-[#285A3C] font-bold">{selectedColor}</span>
                </span>
                <span className="text-[#285A3C] underline cursor-pointer font-medium">
                  Size Guide
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      selectedColor === c.name
                        ? 'ring-2 ring-[#285A3C] ring-offset-2 scale-110'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center border border-[#BCD8AA] rounded bg-white text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-[#4F6355] hover:bg-[#D0E9C0]/30"
                >
                  -
                </button>
                <span className="px-3 py-2 font-bold text-sm min-w-[28px] text-center text-[#1A3B2B]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-[#4F6355] hover:bg-[#D0E9C0]/30"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#285A3C] font-semibold bg-[#D0E9C0]/40 px-3 py-2 rounded border border-[#BCD8AA]">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock & Ready to Ship</span>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full border-2 border-[#285A3C] text-[#285A3C] hover:bg-[#D0E9C0]/30 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] text-white py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* PIN Code Delivery Check */}
            <form onSubmit={checkPincode} className="pt-2">
              <label className="text-xs font-semibold text-[#1A3B2B] block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#285A3C]" />
                <span>Check Estimated Delivery</span>
              </label>
              <div className="flex max-w-sm">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
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
                <p className="text-[11px] font-medium text-[#285A3C] mt-1.5">
                  {pincodeStatus}
                </p>
              )}
            </form>

            {/* 4 Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#D8C7B5] text-center text-[10px] text-[#4F6355]">
              <div className="p-2 rounded bg-[#FAF5EE] flex flex-col items-center gap-1 border border-[#D8C7B5]">
                <Truck className="w-4 h-4 text-[#285A3C]" />
                <span className="font-semibold text-[#1A3B2B]">Free Shipping Above ₹999</span>
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
          {/* Tab Headers */}
          <div className="flex border-b border-[#D8C7B5] overflow-x-auto no-scrollbar gap-6 sm:gap-8 text-xs sm:text-sm font-semibold">
            {[
              { id: 'desc', label: 'Description' },
              { id: 'details', label: 'Product Details' },
              { id: 'care', label: 'Care Instructions' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'reviews', label: `Reviews (${product.reviewsCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
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

          {/* Tab Content */}
          <div className="py-6 text-xs sm:text-sm text-[#4F6355] leading-relaxed">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <p>
                    Crafted by skilled master artisans, this saree features rich zari weaving, traditional Dravidian motifs, and a luxurious heavy pallu.
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span><strong>Material:</strong> {product.fabric} (Pure Mulberry Silk)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span><strong>Weave:</strong> {product.weave || 'Traditional Zari Weaving'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span><strong>Occasion:</strong> {product.occasion}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span><strong>Blouse Piece:</strong> Included (Unstitched, matching zari border)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#285A3C]" />
                      <span><strong>Length:</strong> {product.length || '6.3 meters (including blouse)'}</span>
                    </li>
                  </ul>
                </div>

                {/* Blouse Piece Callout Banner */}
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
                      80 cm running contrast/matching silk fabric with zari border ready for custom tailoring.
                    </p>
                  </div>
                </div>
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
                <p>• {product.careInstructions || 'Dry Clean Only to preserve the luster and gold zari work.'}</p>
                <p>• Store folded in a clean, breathable cotton or muslin bag.</p>
                <p>• Iron on low heat on the reverse side; avoid spraying water directly onto zari threads.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-2">
                <p>• <strong>Free Shipping:</strong> On all orders above ₹999 across India.</p>
                <p>• <strong>Delivery Time:</strong> 3-5 business days for metro cities, 5-7 days for rest of India.</p>
                <p>• <strong>Easy 7-Day Returns:</strong> Hassle-free pickup and immediate refund upon item receipt.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#FAF5EE] p-4 rounded-lg border border-[#D8C7B5]">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-[#285A3C]">{product.rating}</span>
                    <div className="flex text-[#C99632] mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-[#4F6355]">
                    <p className="font-semibold text-[#1A3B2B]">Based on {product.reviewsCount} verified customer ratings</p>
                    <p>98% of customers recommended this product for weddings and festivals.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. You May Also Like Section */}
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
    </div>
  );
};
