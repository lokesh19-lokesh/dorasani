import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    selectedAddress,
    placeOrder,
    user,
  } = useStore();

  const selectedCartItems = cart.filter((i) => i.selected);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [streetAddress, setStreetAddress] = useState(selectedAddress.streetAddress || '');
  const [city, setCity] = useState(selectedAddress.city || '');
  const [stateName, setStateName] = useState(selectedAddress.state || '');
  const [pincode, setPincode] = useState(selectedAddress.pincode || '');
  const [landmark, setLandmark] = useState(selectedAddress.landmark || '');

  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.fullName || '');
      setPhone((prev) => prev || user.phone || '');
      setEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const effectiveShipping = deliveryOption === 'express' ? 99 : shippingFee;
  const payableTotal = Math.max(0, subtotal - discount + effectiveShipping);

  const validateSingleField = (field: string, val: string): string => {
    const v = val.trim();
    if (field === 'fullName' && !v) return 'Please enter the recipient full name.';
    if (field === 'phone' && v.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid 10-digit phone number.';
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return 'Please enter a valid email address.';
    }
    if (field === 'streetAddress' && !v) return 'Please enter your full street address.';
    if (field === 'pincode' && !/^\d{6}$/.test(v)) return 'PIN code must be 6 digits.';
    if (field === 'city' && !v) return 'Please enter your city.';
    if (field === 'stateName' && !v) return 'Please enter your state.';
    return '';
  };

  const handleFieldBlur = (field: string, value: string) => {
    const err = validateSingleField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const clearFieldErrorOnInput = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (submitError) setSubmitError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors: Record<string, string> = {
      fullName: validateSingleField('fullName', fullName),
      phone: validateSingleField('phone', phone),
      email: validateSingleField('email', email),
      streetAddress: validateSingleField('streetAddress', streetAddress),
      pincode: validateSingleField('pincode', pincode),
      city: validateSingleField('city', city),
      stateName: validateSingleField('stateName', stateName),
    };
    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitError('Please review the highlighted address and contact fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placeOrder({
        deliveryOption,
        paymentMethod,
        orderNotes: orderNotes.trim() || undefined,
        customerEmail: email.trim(),
        shippingAddress: {
          id: `addr-${Date.now()}`,
          addressType,
          fullName: fullName.trim(),
          phone: phone.trim(),
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim() || undefined,
        },
      });

      if (res.success && res.order) {
        navigate(`/order-confirmation/${res.order.orderNumber}`);
      } else {
        setSubmitError(res.error || 'Unable to place order right now. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedCartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">
          No items selected for checkout
        </h2>
        <p className="text-xs text-[#4F6355] mt-2">
          Please select items in your shopping bag to continue.
        </p>
        <Link
          to="/cart"
          className="mt-5 inline-block bg-[#285A3C] text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-[#1E432D] transition-colors"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner & Step Indicator */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355] mt-1">
              Secure. Simple. Seamless. Complete your order and bring home timeless elegance.
            </p>
          </div>

          <div className="flex items-center justify-center max-w-lg mx-auto pt-3 text-xs font-semibold">
            <div className="flex items-center text-[#285A3C]">
              <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs mr-1.5">
                ✓
              </span>
              <span>Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-[#285A3C] mx-2" />
            <div className="flex items-center text-[#285A3C]">
              <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs mr-1.5">
                2
              </span>
              <span>Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-[#BCD8AA] mx-2" />
            <div className="flex items-center text-[#8E9B92]">
              <span className="w-6 h-6 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] flex items-center justify-center text-xs mr-1.5">
                3
              </span>
              <span>Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-[#BCD8AA] mx-2" />
            <div className="flex items-center text-[#8E9B92]">
              <span className="w-6 h-6 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] flex items-center justify-center text-xs mr-1.5">
                4
              </span>
              <span>Order Placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form & Order Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <form
          onSubmit={handlePlaceOrder}
          noValidate
          className="dorasani-form grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {submitError && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Section 1: Contact Information */}
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8C7B5]">
                <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="checkout-full-name" className="block text-[#1A3B2B] font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    id="checkout-full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearFieldErrorOnInput('fullName');
                    }}
                    onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-[#1A3B2B] font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldErrorOnInput('phone');
                    }}
                    onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-email" className="block text-[#1A3B2B] font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldErrorOnInput('email');
                    }}
                    onBlur={(e) => handleFieldBlur('email', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#4F6355] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="accent-[#285A3C] rounded"
                />
                <span>Send me order tracking updates on WhatsApp</span>
              </label>
            </div>

            {/* Section 2: Shipping Address */}
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D8C7B5]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                    Shipping Address
                  </h2>
                </div>
                <fieldset className="flex items-center gap-2 text-xs">
                  <legend className="sr-only">Address type</legend>
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <label
                      key={type}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        addressType === type
                          ? 'bg-[#285A3C] text-white'
                          : 'bg-[#FAF5EE] text-[#4F6355] hover:bg-[#D0E9C0]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={addressType === type}
                        onChange={() => setAddressType(type)}
                        className="sr-only"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </fieldset>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-street" className="block text-[#1A3B2B] font-semibold mb-1">
                    Full Street Address *
                  </label>
                  <input
                    id="checkout-street"
                    name="streetAddress"
                    type="text"
                    autoComplete="street-address"
                    required
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      clearFieldErrorOnInput('streetAddress');
                    }}
                    onBlur={(e) => handleFieldBlur('streetAddress', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.streetAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.streetAddress}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-pincode" className="block text-[#1A3B2B] font-semibold mb-1">
                    PIN Code *
                  </label>
                  <input
                    id="checkout-pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ''));
                      clearFieldErrorOnInput('pincode');
                    }}
                    onBlur={(e) => handleFieldBlur('pincode', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.pincode && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.pincode}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-[#1A3B2B] font-semibold mb-1">
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldErrorOnInput('city');
                    }}
                    onBlur={(e) => handleFieldBlur('city', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.city && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-[#1A3B2B] font-semibold mb-1">
                    State *
                  </label>
                  <input
                    id="checkout-state"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    required
                    value={stateName}
                    onChange={(e) => {
                      setStateName(e.target.value);
                      clearFieldErrorOnInput('stateName');
                    }}
                    onBlur={(e) => handleFieldBlur('stateName', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.stateName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.stateName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-landmark" className="block text-[#1A3B2B] font-semibold mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    id="checkout-landmark"
                    name="landmark"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Delivery Options */}
            <fieldset className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8C7B5]">
                <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <legend className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Delivery Options
                </legend>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === 'standard'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="standard"
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <p className="font-bold text-[#1A3B2B]">Standard Delivery</p>
                      <p className="text-[11px] text-[#4F6355]">3-5 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#285A3C]">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    deliveryOption === 'express'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="express"
                      checked={deliveryOption === 'express'}
                      onChange={() => setDeliveryOption('express')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <p className="font-bold text-[#1A3B2B]">Express Delivery</p>
                      <p className="text-[11px] text-[#4F6355]">1-2 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#285A3C]">₹99</span>
                </label>
              </div>
            </fieldset>

            {/* Section 4: Payment Method */}
            <fieldset className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8C7B5]">
                <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <legend className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Payment Method
                </legend>
              </div>

              <div className="space-y-2 text-xs">
                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <span className="font-bold text-[#1A3B2B]">UPI (Recommended)</span>
                      <p className="text-[11px] text-[#4F6355]">
                        Instant & zero fee via Google Pay, PhonePe, Paytm, BHIM
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#285A3C] bg-[#D0E9C0] px-2 py-0.5 rounded border border-[#BCD8AA]">
                    Fastest
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <span className="font-bold text-[#1A3B2B]">Credit / Debit Card</span>
                      <p className="text-[11px] text-[#4F6355]">
                        Visa, MasterCard, RuPay, American Express
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-[#4F6355]" />
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <span className="font-bold text-[#1A3B2B]">Net Banking</span>
                      <p className="text-[11px] text-[#4F6355]">
                        All major Indian banks supported
                      </p>
                    </div>
                  </div>
                  <Building className="w-4 h-4 text-[#4F6355]" />
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#285A3C]"
                    />
                    <div>
                      <span className="font-bold text-[#1A3B2B]">Cash on Delivery (COD)</span>
                      <p className="text-[11px] text-[#4F6355]">
                        Pay cash upon delivery at your doorstep
                      </p>
                    </div>
                  </div>
                  <Coins className="w-4 h-4 text-[#4F6355]" />
                </label>
              </div>
            </fieldset>

            {/* Section 5: Order Notes */}
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-2">
              <label htmlFor="checkout-order-notes" className="text-xs font-semibold text-[#1A3B2B] block">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                id="checkout-order-notes"
                name="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Leave with security, call before arrival, etc."
                rows={2}
                className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
                <h3 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Order Summary ({selectedCartItems.length} items)
                </h3>
                <Link to="/cart" className="text-xs text-[#285A3C] hover:underline font-semibold">
                  Edit Cart
                </Link>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-[#F5EAE2]">
                {selectedCartItems.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        className="w-10 h-12 object-cover rounded border border-[#D8C7B5] shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-[#1A3B2B] truncate">{item.product.title}</p>
                        <p className="text-[10px] text-[#4F6355]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1A3B2B] shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-[#4F6355] pt-3 border-t border-[#D8C7B5]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A3B2B]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#285A3C]">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#285A3C]">
                    {effectiveShipping === 0 ? 'FREE' : `₹${effectiveShipping}`}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#D8C7B5] text-base font-bold text-[#1A3B2B]">
                  <span>Total Payable</span>
                  <span className="text-[#285A3C]">
                    ₹{payableTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-50 text-white py-3.5 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order Securely'}</span>
              </button>

              <p className="text-[10px] text-center text-[#4F6355]">
                By placing this order, you agree to DORASANI's Terms of Service and Privacy Policy.
              </p>

              <div className="pt-3 border-t border-[#F5EAE2] space-y-2 text-[11px] text-[#4F6355]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#285A3C]" />
                  <span>100% Safe and Encrypted Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#285A3C]" />
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
