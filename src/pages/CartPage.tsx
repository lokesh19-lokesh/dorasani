import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, ShieldCheck, ArrowRight, Check, ShoppingBag, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/common/SeoHead';
import { getStockStatusMeta } from '../types';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    toggleItemSelection,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    availableCoupons,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const selectedItems = cart.filter((i) => i.selected);
  const stockIssueItems = selectedItems.filter((item) => {
    const meta = getStockStatusMeta(
      item.product.stock,
      item.product.inStock ? 'active' : 'out_of_stock'
    );
    return meta.isOutOfStock || item.quantity > meta.qty;
  });
  const hasStockIssues = stockIssueItems.length > 0;

  const handleApplyCode = async (rawCode: string) => {
    const clean = rawCode.trim();
    if (!clean) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await applyCoupon(clean);
      if (!res.success) {
        setCouponError(res.message);
      } else {
        setCouponError('');
        setCouponInput('');
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    void handleApplyCode(couponInput);
  };

  return (
    <div className="space-y-8 pb-16">
      <SeoHead
        title="Shopping Cart | DORASANI"
        description="Review your selected DORASANI handloom sarees and ethnic ensembles before checkout."
        canonicalPath="/cart"
        robots="noindex, nofollow"
      />
      {/* 1. Header Banner */}
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-8 sm:py-12 px-4 sm:px-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#2D141A]">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#74565D]">
            Your handpicked favourites, one step closer to you.
          </p>
        </div>
      </div>

      {/* 2. Main Cart Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {cart.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#BCD8AA] mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#4F6355] mt-1">
              Add your cherished handloom sarees and lehengas to proceed.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-block bg-[#285A3C] text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-[#1E432D] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
                <span className="text-xs sm:text-sm font-semibold text-[#1A3B2B]">
                  {cart.length} Items in Your Cart
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#285A3C] hover:underline font-semibold"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-3">
                {cart.map((item) => {
                  const metaParts = [
                    item.selectedColor,
                    item.product.fabric || item.product.category,
                    item.product.blouseIncluded ? 'With Blouse Piece' : null,
                  ].filter(Boolean);
                  const stockMeta = getStockStatusMeta(
                    item.product.stock,
                    item.product.inStock ? 'active' : 'out_of_stock'
                  );
                  const isAvailable = item.product.inStock && !stockMeta.isOutOfStock;
                  const exceedsStock = isAvailable && item.quantity > stockMeta.qty;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#D8C7B5] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          aria-label={`Select ${item.product.title}`}
                          className="accent-[#285A3C] w-4 h-4 cursor-pointer"
                        />
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.title}
                          width={800}
                          height={1000}
                          className="w-16 h-20 sm:w-20 sm:h-24 object-cover object-top rounded-md border border-[#BCD8AA] bg-[#FAF5EE] shrink-0"
                        />

                        <div className="space-y-1 min-w-0">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="font-semibold text-xs sm:text-sm text-[#1A3B2B] hover:text-[#285A3C] line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-[11px] text-[#4F6355]">{metaParts.join(' | ')}</p>
                          {!isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : exceedsStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Only {stockMeta.qty} available — reduce quantity
                            </span>
                          ) : stockMeta.isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> Only {stockMeta.qty} left ({stockMeta.shortageCount} less than 3)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#285A3C] bg-[#D0E9C0]/40 px-2 py-0.5 rounded border border-[#BCD8AA]">
                              <Check className="w-3 h-3" /> In Stock ({stockMeta.qty} available)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5EAE2]">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-[#1A3B2B] block">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.product.mrp > item.product.price && (
                            <span className="text-[10px] text-[#8E9B92] line-through block">
                              ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center border border-[#BCD8AA] rounded bg-white text-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-1 text-[#4F6355] hover:bg-[#D0E9C0]/30"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold min-w-[20px] text-center text-[#1A3B2B]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={!isAvailable || item.quantity >= stockMeta.qty}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-1 text-[#4F6355] hover:bg-[#D0E9C0]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#8E9B92] hover:text-[#285A3C] p-1.5"
                          aria-label={`Remove ${item.product.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Coupon & Order Summary */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A3B2B] uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-[#285A3C]" />
                  <span>Apply Coupon</span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex">
                  <input
                    type="text"
                    aria-label="Coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-[#FAF5EE] border border-r-0 border-[#BCD8AA] rounded-l px-3 py-2 text-xs text-[#1A3B2B] uppercase focus:outline-none focus:border-[#285A3C]"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-50 text-white px-4 rounded-r font-semibold text-xs transition-colors"
                  >
                    {applyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>

                {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}

                {appliedCoupon && (
                  <div className="bg-[#D0E9C0]/40 border border-[#BCD8AA] p-2.5 rounded flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1A3B2B]">{appliedCoupon.code} applied!</span>
                      <p className="text-[10px] text-[#4F6355]">{appliedCoupon.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[#285A3C] font-bold text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F5EAE2] space-y-2">
                  <span className="text-[11px] font-bold text-[#4F6355] uppercase block">
                    Available Offers
                  </span>
                  {availableCoupons.length === 0 ? (
                    <p className="text-[11px] text-[#8E9B92]">
                      No active promotional offers right now.
                    </p>
                  ) : (
                    availableCoupons.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        disabled={applyingCoupon}
                        onClick={() => void handleApplyCode(cp.code)}
                        className="w-full text-left flex items-center justify-between gap-2 p-2 rounded bg-[#FAF5EE] hover:bg-[#D0E9C0]/40 disabled:opacity-50 transition-colors text-xs border border-transparent hover:border-[#BCD8AA]"
                      >
                        <span className="font-bold text-[#285A3C] shrink-0">{cp.code}</span>
                        <span className="text-[11px] text-[#4F6355] text-right">
                          {cp.description}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
                <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider border-b border-[#D8C7B5] pb-3">
                  Order Summary
                </h2>

                <div className="space-y-2 text-xs text-[#4F6355]">
                  <div className="flex justify-between">
                    <span>Subtotal ({selectedItems.length} items)</span>
                    <span className="font-semibold text-[#1A3B2B]">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#285A3C]">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-semibold text-[#285A3C]">
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[#D8C7B5] text-sm sm:text-base font-bold text-[#1A3B2B]">
                    <span>Total Amount</span>
                    <span className="text-[#285A3C]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-[#8E9B92] text-right">Inclusive of all taxes</p>
                </div>

                {hasStockIssues && (
                  <div
                    role="alert"
                    className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 text-[11px] text-rose-800 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                    <span>
                      Please uncheck or adjust items that are out of stock or exceed available quantity before proceeding to checkout.
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={selectedItems.length === 0 || hasStockIssues}
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-45 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-center pt-2 space-y-2 border-t border-[#F5EAE2]">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#4F6355]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#285A3C]" />
                    <span>100% Secure & Encrypted Payments</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-[#8E9B92] font-semibold">
                    <span>UPI</span>
                    <span>•</span>
                    <span>VISA</span>
                    <span>•</span>
                    <span>RuPay</span>
                    <span>•</span>
                    <span>Net Banking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
