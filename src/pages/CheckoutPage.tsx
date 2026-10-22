import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  ShieldCheck,
  Check,
  Truck,
  CreditCard,
  Building,
  Wallet,
  Coins,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    total,
    selectedAddress,
    placeOrder,
    user
  } = useStore();

  const selectedCartItems = cart.filter((i) => i.selected);

  // Form states matching design defaults
  const [fullName, setFullName] = useState(user?.fullName || 'Maddiboina Lokesh');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'lokesh@example.com');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [streetAddress, setStreetAddress] = useState(
    selectedAddress.streetAddress || 'Flat No. 101, Sri Sai Residency, KPHB Colony'
  );
  const [city, setCity] = useState(selectedAddress.city || 'Hyderabad');
  const [state, setState] = useState(selectedAddress.state || 'Telangana');
  const [pincode, setPincode] = useState(selectedAddress.pincode || '500072');
  const [landmark, setLandmark] = useState(selectedAddress.landmark || 'Near KPHB Metro Station');

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = placeOrder({
        deliveryOption,
        paymentMethod,
        orderNotes,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          addressType,
          fullName,
          phone,
          streetAddress,
          city,
          state,
          pincode,
          landmark,
        },
      });
      setIsSubmitting(false);
      navigate(`/order-confirmation/${newOrder.orderNumber}`);
    }, 700);
  };

  if (selectedCartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="font-serif-royal text-2xl font-bold text-[#2D141A]">No items selected for checkout</h2>
        <p className="text-xs text-[#74565D] mt-2">Please select items in your shopping bag to continue.</p>
        <Link to="/cart" className="mt-5 inline-block bg-[#AC1443] text-white px-6 py-2.5 rounded text-xs font-semibold">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner & Step Indicator */}
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#2D141A]">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#74565D] mt-1">
              Secure. Simple. Seamless. Complete your order and bring home timeless elegance.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center max-w-lg mx-auto pt-3 text-xs font-semibold">
            <div className="flex items-center text-[#AC1443]">
              <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white flex items-center justify-center text-xs mr-1.5">
                ✓
              </span>
              <span>Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-[#AC1443] mx-2" />
            <div className="flex items-center text-[#AC1443]">
              <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white flex items-center justify-center text-xs mr-1.5">
                2
              </span>
              <span>Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-[#DEC3B4] mx-2" />
            <div className="flex items-center text-[#9B8086]">
              <span className="w-6 h-6 rounded-full bg-[#FAF2EB] border border-[#DEC3B4] flex items-center justify-center text-xs mr-1.5">
                3
              </span>
              <span>Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-[#DEC3B4] mx-2" />
            <div className="flex items-center text-[#9B8086]">
              <span className="w-6 h-6 rounded-full bg-[#FAF2EB] border border-[#DEC3B4] flex items-center justify-center text-xs mr-1.5">
                4
              </span>
              <span>Order Placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form & Order Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Contact Information */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEDCD1]">
                <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#2D141A] uppercase tracking-wide">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#2D141A] font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#74565D] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="accent-[#AC1443] rounded"
                />
                <span>Send me order tracking updates on WhatsApp</span>
              </label>
            </div>

            {/* Section 2: Shipping Address */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD1]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-[#2D141A] uppercase tracking-wide">
                    Shipping Address
                  </h3>
                </div>
                {/* Address Type Pills */}
                <div className="flex items-center gap-2 text-xs">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setAddressType(type)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        addressType === type
                          ? 'bg-[#AC1443] text-white'
                          : 'bg-[#FAF2EB] text-[#74565D] hover:bg-[#FBE5EB]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[#2D141A] font-semibold mb-1">Full Street Address *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Delivery Options */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEDCD1]">
                <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-[#2D141A] uppercase tracking-wide">
                  Delivery Options
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === 'standard'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-[#FAF2EB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <p className="font-bold text-[#2D141A]">Standard Delivery</p>
                      <p className="text-[11px] text-[#74565D]">3-5 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#2F6923]">FREE</span>
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === 'express'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-[#FAF2EB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'express'}
                      onChange={() => setDeliveryOption('express')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <p className="font-bold text-[#2D141A]">Express Delivery</p>
                      <p className="text-[11px] text-[#74565D]">1-2 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#AC1443]">₹99</span>
                </label>
              </div>
            </div>

            {/* Section 4: Payment Method */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEDCD1]">
                <span className="w-6 h-6 rounded-full bg-[#AC1443] text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-sm text-[#2D141A] uppercase tracking-wide">
                  Payment Method
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {/* UPI */}
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <span className="font-bold text-[#2D141A]">UPI (Recommended)</span>
                      <p className="text-[11px] text-[#74565D]">
                        Instant & zero fee via Google Pay, PhonePe, Paytm, BHIM
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#2F6923] bg-[#D0E9C0]/40 px-2 py-0.5 rounded">
                    Fastest
                  </span>
                </label>

                {/* Card */}
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <span className="font-bold text-[#2D141A]">Credit / Debit Card</span>
                      <p className="text-[11px] text-[#74565D]">
                        Visa, MasterCard, RuPay, American Express
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-[#74565D]" />
                </label>

                {/* Net Banking */}
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <span className="font-bold text-[#2D141A]">Net Banking</span>
                      <p className="text-[11px] text-[#74565D]">
                        All major Indian banks supported
                      </p>
                    </div>
                  </div>
                  <Building className="w-4 h-4 text-[#74565D]" />
                </label>

                {/* COD */}
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#AC1443] bg-[#FBE5EB]/30'
                      : 'border-[#DEC3B4] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#AC1443]"
                    />
                    <div>
                      <span className="font-bold text-[#2D141A]">Cash on Delivery (COD)</span>
                      <p className="text-[11px] text-[#74565D]">
                        Pay cash at your doorstep (+₹49 handling fee)
                      </p>
                    </div>
                  </div>
                  <Coins className="w-4 h-4 text-[#74565D]" />
                </label>
              </div>
            </div>

            {/* Section 5: Order Notes */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-2">
              <label className="text-xs font-semibold text-[#2D141A] block">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Leave with security, call before arrival, etc."
                rows={2}
                className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-xs text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD1]">
                <h3 className="font-cinzel-royal font-bold text-sm text-[#2D141A] uppercase tracking-wide">
                  Order Summary ({selectedCartItems.length} items)
                </h3>
                <Link to="/cart" className="text-xs text-[#AC1443] hover:underline font-semibold">
                  Edit Cart
                </Link>
              </div>

              {/* Items Preview */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-[#F5EAE2]">
                {selectedCartItems.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        className="w-10 h-12 object-cover rounded border border-[#EEDCD1] shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-[#2D141A] truncate">{item.product.title}</p>
                        <p className="text-[10px] text-[#74565D]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#AC1443] shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation */}
              <div className="space-y-2 text-xs text-[#74565D] pt-3 border-t border-[#EEDCD1]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2D141A]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#2F6923]">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#2F6923]">
                    {deliveryOption === 'express' ? '₹99' : shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#EEDCD1] text-base font-bold text-[#2D141A]">
                  <span>Total Payable</span>
                  <span className="text-[#AC1443]">
                    ₹{(total + (deliveryOption === 'express' ? 99 : 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#AC1443] hover:bg-[#860E33] disabled:opacity-50 text-white py-3.5 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order Securely'}</span>
              </button>

              <p className="text-[10px] text-center text-[#74565D]">
                By placing this order, you agree to DORASANI's Terms of Service and Privacy Policy.
              </p>

              {/* Trust Strip */}
              <div className="pt-3 border-t border-[#F5EAE2] space-y-2 text-[11px] text-[#74565D]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2F6923]" />
                  <span>100% Safe and Encrypted Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#AC1443]" />
                  <span>Direct Delivery from South Indian Weavers</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
