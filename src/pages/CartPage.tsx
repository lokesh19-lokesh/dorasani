import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, ShieldCheck, ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { COUPONS } from '../data/products';

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
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  return (
    <div className="space-y-8 pb-16">
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
          <div className="py-20 text-center bg-white rounded-xl border border-[#EEDCD1] p-8 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#DEC3B4] mx-auto mb-3" />
            <h3 className="font-serif-royal text-lg font-bold text-[#2D141A]">
              Your cart is empty
            </h3>
            <p className="text-xs text-[#74565D] mt-1">
              Add your cherished handloom sarees and lehengas to proceed.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-block bg-[#AC1443] text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-[#860E33] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD1]">
                <span className="text-xs sm:text-sm font-semibold text-[#2D141A]">
                  {cart.length} Items in Your Cart
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-[#AC1443] hover:underline font-medium"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items Table/List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-[#EEDCD1] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs"
                  >
                    {/* Checkbox & Thumbnail */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="accent-[#AC1443] w-4 h-4 cursor-pointer"
                      />
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover object-top rounded-md border border-[#DEC3B4] bg-[#FAF2EB] shrink-0"
                      />

                      <div className="space-y-1 min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-semibold text-xs sm:text-sm text-[#2D141A] hover:text-[#AC1443] line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-[11px] text-[#74565D]">
                          {item.selectedColor} | Pure Silk | With Blouse Piece
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F6923] bg-[#D0E9C0]/30 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> In Stock
                        </span>
                      </div>
                    </div>

                    {/* Price, Quantity & Remove Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5EAE2]">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-[#AC1443] block">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#9B8086] line-through block">
                          ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#DEC3B4] rounded bg-white text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2.5 py-1 text-[#74565D] hover:bg-[#FAF0E6]"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2.5 py-1 text-[#74565D] hover:bg-[#FAF0E6]"
                        >
                          +
                        </button>
                      </div>

                      {/* Trash Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#9B8086] hover:text-[#AC1443] p-1.5"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Coupon & Order Summary */}
            <div className="lg:col-span-4 space-y-5">
              {/* Apply Coupon Box */}
              <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D141A] uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-[#AC1443]" />
                  <span>Apply Coupon</span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-[#FCF5EE] border border-r-0 border-[#DEC3B4] rounded-l px-3 py-2 text-xs text-[#2D141A] uppercase focus:outline-none focus:border-[#AC1443]"
                  />
                  <button
                    type="submit"
                    className="bg-[#AC1443] hover:bg-[#860E33] text-white px-4 rounded-r font-semibold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-600">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="bg-[#D0E9C0]/30 border border-[#D0E9C0] p-2.5 rounded flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2F6923]">
                        {appliedCoupon.code} applied!
                      </span>
                      <p className="text-[10px] text-[#74565D]">
                        {appliedCoupon.description}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#AC1443] font-bold text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Available Offers Pill List */}
                <div className="pt-2 border-t border-[#F5EAE2] space-y-2">
                  <span className="text-[11px] font-bold text-[#74565D] uppercase">
                    Available Offers
                  </span>
                  {COUPONS.map((cp) => (
                    <div
                      key={cp.code}
                      onClick={() => applyCoupon(cp.code)}
                      className="flex items-center justify-between p-2 rounded bg-[#FAF2EB] hover:bg-[#FBE5EB] cursor-pointer transition-colors text-xs"
                    >
                      <span className="font-bold text-[#AC1443]">{cp.code}</span>
                      <span className="text-[11px] text-[#74565D]">{cp.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-4">
                <h3 className="font-cinzel-royal font-bold text-sm text-[#2D141A] uppercase tracking-wider border-b border-[#EEDCD1] pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs text-[#74565D]">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.filter((i) => i.selected).length} items)</span>
                    <span className="font-semibold text-[#2D141A]">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#2F6923]">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{discount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-semibold text-[#2F6923]">
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[#EEDCD1] text-sm sm:text-base font-bold text-[#2D141A]">
                    <span>Total Amount</span>
                    <span className="text-[#AC1443]">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#9B8086] text-right">
                    Inclusive of all taxes
                  </p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#AC1443] hover:bg-[#860E33] text-white py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-center pt-2 space-y-2 border-t border-[#F5EAE2]">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#74565D]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2F6923]" />
                    <span>100% Secure & Encrypted Payments</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-[#9B8086] font-semibold">
                    <span>UPI</span>
                    <span>•</span>
                    <span>VISA</span>
                    <span>•</span>
                    <span>RuPay</span>
                    <span>•</span>
                    <span>Amazon Pay</span>
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
