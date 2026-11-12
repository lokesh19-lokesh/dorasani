import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  ShieldCheck,
  Truck,
  CreditCard,
  Coins,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
  MapPin,
  X,
} from 'lucide-react';
import { useStore, type CheckoutStage } from '../context/StoreContext';
import { SeoHead } from '../components/common/SeoHead';
import { OptimizedPicture } from '../components/common/OptimizedPicture';
import { delhiveryService } from '../services/delhiveryService';
import { getStockStatusMeta, type DelhiveryServiceabilityResult } from '../types';

const INDIAN_STATE_CODE_MAP: Record<string, string> = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CT: 'Chhattisgarh',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  OR: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  TS: 'Telangana',
  TR: 'Tripura',
  UP: 'Uttar Pradesh',
  UK: 'Uttarakhand',
  UT: 'Uttarakhand',
  WB: 'West Bengal',
  AN: 'Andaman and Nicobar Islands',
  CH: 'Chandigarh',
  DL: 'Delhi',
  JK: 'Jammu and Kashmir',
  LA: 'Ladakh',
  PY: 'Puducherry',
};

const FIELD_ORDER: { key: string; elementId: string }[] = [
  { key: 'fullName', elementId: 'checkout-full-name' },
  { key: 'phone', elementId: 'checkout-phone' },
  { key: 'email', elementId: 'checkout-email' },
  { key: 'streetAddress', elementId: 'checkout-street' },
  { key: 'pincode', elementId: 'checkout-pincode' },
  { key: 'city', elementId: 'checkout-city' },
  { key: 'stateName', elementId: 'checkout-state' },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    selectedAddress,
    siteSettings,
    placeOrder,
    user,
  } = useStore();

  const selectedCartItems = cart.filter((i) => i.selected);
  const stockBlockedItems = selectedCartItems.filter((item) => {
    const meta = getStockStatusMeta(
      item.product.stock,
      item.product.inStock ? 'active' : 'out_of_stock'
    );
    return meta.isOutOfStock || item.quantity > meta.qty;
  });
  const hasStockBlockedItems = stockBlockedItems.length > 0;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>(
    selectedAddress.addressType || 'Home'
  );
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

  useEffect(() => {
    if (selectedAddress?.streetAddress) {
      setFullName((prev) => prev || selectedAddress.fullName || '');
      setPhone((prev) => prev || selectedAddress.phone || '');
      setStreetAddress((prev) => prev || selectedAddress.streetAddress || '');
      setCity((prev) => prev || selectedAddress.city || '');
      setStateName((prev) => prev || selectedAddress.state || '');
      setPincode((prev) => prev || selectedAddress.pincode || '');
      setLandmark((prev) => prev || selectedAddress.landmark || '');
    }
  }, [selectedAddress]);

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [pinServiceability, setPinServiceability] =
    useState<DelhiveryServiceabilityResult | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinCheckWarning, setPinCheckWarning] = useState<string | null>(null);

  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPinServiceability(null);
      setPinCheckWarning(null);
      setCheckingPin(false);
      return;
    }

    let cancelled = false;
    setCheckingPin(true);
    setPinCheckWarning(null);

    const timer = window.setTimeout(() => {
      delhiveryService
        .checkServiceability(cleanPin, siteSettings.delhiveryOriginPincode)
        .then((res) => {
          if (cancelled) return;
          setPinServiceability(res);
          if (res.serviceable && res.city) {
            setCity((prev) => (prev.trim() ? prev : res.city));
          }
          if (res.serviceable && res.stateCode) {
            const fullState = INDIAN_STATE_CODE_MAP[res.stateCode.toUpperCase()];
            if (fullState) {
              setStateName((prev) => (prev.trim() ? prev : fullState));
            }
          }
        })
        .catch(() => {
          if (cancelled) return;
          setPinServiceability(null);
          setPinCheckWarning('Live Delhivery PIN check is temporarily unavailable — standard estimates apply.');
        })
        .finally(() => {
          if (!cancelled) setCheckingPin(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pincode, siteSettings.delhiveryOriginPincode]);

  const pinExplicitlyUnserviceable = Boolean(
    pinServiceability && !pinServiceability.fallback && !pinServiceability.serviceable
  );
  const pinBlocksCod = Boolean(
    pinServiceability && !pinServiceability.fallback && pinServiceability.serviceable && !pinServiceability.cod
  );
  const isCodAvailable = Boolean(siteSettings.codEnabled) && !pinBlocksCod;
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (!isCodAvailable && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [isCodAvailable, paymentMethod]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('idle');
  const [prePaymentConfirmOpen, setPrePaymentConfirmOpen] = useState(false);
  const prePaymentDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = prePaymentDialogRef.current;
    if (!el) return;
    if (prePaymentConfirmOpen && !el.open) {
      el.showModal();
    } else if (!prePaymentConfirmOpen && el.open) {
      el.close();
    }
  }, [prePaymentConfirmOpen]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<{
    type: 'cancelled' | 'error';
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const effectiveShipping =
    deliveryOption === 'express' ? siteSettings.expressShippingFee : shippingFee;
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
    if (paymentNotice) setPaymentNotice(null);
  };

  const getSubmitButtonLabel = (): string => {
    if (!isSubmitting) {
      const formattedAmount = payableTotal.toLocaleString('en-IN');
      return isCodAvailable && paymentMethod === 'cod'
        ? `Place COD Order — ₹${formattedAmount}`
        : `Pay ₹${formattedAmount} Securely`;
    }
    switch (checkoutStage) {
      case 'creating_order':
        return 'Creating Secure Order...';
      case 'awaiting_payment':
        return 'Complete Payment in Razorpay...';
      case 'verifying_payment':
        return 'Verifying Payment Signature...';
      default:
        return 'Placing Order...';
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setPaymentNotice(null);

    if (hasStockBlockedItems) {
      const blockedNames = stockBlockedItems
        .map((i) => {
          const meta = getStockStatusMeta(
            i.product.stock,
            i.product.inStock ? 'active' : 'out_of_stock'
          );
          return meta.isOutOfStock
            ? `${i.product.title} (Out of Stock)`
            : `${i.product.title} (only ${meta.qty} left)`;
        })
        .join(', ');
      setSubmitError(`Cannot place order because of stock changes: ${blockedNames}. Please update your cart first.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

    const firstInvalid = FIELD_ORDER.find((f) => Boolean(nextErrors[f.key]));
    if (firstInvalid) {
      setSubmitError('Please review the highlighted address and contact fields.');
      document.getElementById(firstInvalid.elementId)?.focus();
      return;
    }

    if (pinExplicitlyUnserviceable && pinServiceability) {
      setSubmitError(
        `PIN code ${pinServiceability.pincode} is currently outside Delhivery courier serviceability. Please enter a serviceable PIN code.`
      );
      document.getElementById('checkout-pincode')?.focus();
      return;
    }

    // Show pre-payment no-cancellation policy notice before going to payment gateway / order submission
    setPrePaymentConfirmOpen(true);
  };

  const executePlaceOrder = async () => {
    setPrePaymentConfirmOpen(false);
    setSubmitError(null);
    setPaymentNotice(null);
    setIsSubmitting(true);
    setCheckoutStage('creating_order');
    try {
      const res = await placeOrder(
        {
          deliveryOption,
          paymentMethod: isCodAvailable ? paymentMethod : 'razorpay',
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
        },
        setCheckoutStage
      );

      if (res.success && res.order) {
        navigate(`/order-confirmation/${res.order.orderNumber}`);
      } else if (res.cancelled) {
        setPaymentNotice({
          type: 'cancelled',
          message:
            res.error ||
            (isCodAvailable
              ? 'Payment was cancelled before completion. Your shopping bag and coupon are preserved — you can retry or switch to Cash on Delivery.'
              : 'Payment was cancelled before completion. Your shopping bag and coupon are preserved — please retry payment via Razorpay.'),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errMessage = res.error || 'Unable to place order right now. Please try again.';
        setPaymentNotice({
          type: 'error',
          message: errMessage,
        });
        setSubmitError(errMessage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
      setCheckoutStage('idle');
    }
  };

  if (selectedCartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <SeoHead
          title="Checkout | DORASANI"
          description={
            isCodAvailable
              ? 'Complete your DORASANI order via Razorpay UPI, cards, net banking, or Cash on Delivery.'
              : 'Complete your DORASANI order securely via Razorpay UPI, cards, net banking, or digital wallets.'
          }
          canonicalPath="/checkout"
          robots="noindex, nofollow"
        />
        <h1 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">
          No items selected for checkout
        </h1>
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

  const isPaymentStepActive =
    checkoutStage === 'awaiting_payment' || checkoutStage === 'verifying_payment';

  return (
    <div className="space-y-8 pb-16">
      <SeoHead
        title="Checkout | DORASANI"
        description={
          isCodAvailable
            ? 'Complete your DORASANI order securely via Razorpay or Cash on Delivery.'
            : 'Complete your DORASANI order securely online via Razorpay.'
        }
        canonicalPath="/checkout"
        robots="noindex, nofollow"
      />
      {/* 1. Header Banner & Step Indicator */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355] mt-1">
              {isCodAvailable
                ? 'Secure. Simple. Seamless. Complete your order via Razorpay or Cash on Delivery.'
                : 'Secure. Simple. Seamless. Complete your order online via Razorpay (UPI, Cards, Net Banking & Wallets).'}
            </p>
          </div>

          <nav aria-label="Checkout progress" className="pt-3">
            <ol className="flex items-center justify-center max-w-lg mx-auto text-xs font-semibold">
              <li className="flex items-center text-[#285A3C]">
                <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs mr-1.5">
                  ✓
                </span>
                <span>Cart</span>
              </li>
              <li aria-hidden="true" className="w-12 h-0.5 bg-[#285A3C] mx-2" />
              <li
                aria-current={!isPaymentStepActive ? 'step' : undefined}
                className="flex items-center text-[#285A3C]"
              >
                <span className="w-6 h-6 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs mr-1.5">
                  {isPaymentStepActive ? '✓' : '2'}
                </span>
                <span>Checkout</span>
              </li>
              <li
                aria-hidden="true"
                className={`w-12 h-0.5 mx-2 transition-colors ${isPaymentStepActive ? 'bg-[#285A3C]' : 'bg-[#BCD8AA]'
                  }`}
              />
              <li
                aria-current={isPaymentStepActive ? 'step' : undefined}
                className={`flex items-center transition-colors ${isPaymentStepActive ? 'text-[#285A3C]' : 'text-[#647268]'
                  }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1.5 transition-colors ${isPaymentStepActive
                    ? 'bg-[#285A3C] text-white ring-4 ring-[#D0E9C0]'
                    : 'bg-[#FAF5EE] border border-[#BCD8AA]'
                    }`}
                >
                  3
                </span>
                <span>Payment</span>
              </li>
              <li aria-hidden="true" className="w-12 h-0.5 bg-[#BCD8AA] mx-2" />
              <li className="flex items-center text-[#647268]">
                <span className="w-6 h-6 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] flex items-center justify-center text-xs mr-1.5">
                  4
                </span>
                <span>Order Placed</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* 2. Main Form & Order Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <form
          onSubmit={handlePlaceOrder}
          method="POST"
          noValidate
          className="dorasani-form grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {hasStockBlockedItems && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span className="leading-relaxed">
                    One or more items in your bag are out of stock or exceed current inventory. Please update your cart before placing this order.
                  </span>
                </div>
                <Link
                  to="/cart"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold hover:bg-rose-100/60 transition-colors"
                >
                  Edit Cart
                </Link>
              </div>
            )}

            {paymentNotice && (
              <div
                role={paymentNotice.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`rounded-xl border p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${paymentNotice.type === 'cancelled'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
              >
                <div className="flex items-start gap-2.5">
                  {paymentNotice.type === 'cancelled' ? (
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  )}
                  <span className="leading-relaxed">{paymentNotice.message}</span>
                </div>
                {isCodAvailable && paymentMethod !== 'cod' && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setPaymentNotice(null);
                      setSubmitError(null);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] font-semibold hover:bg-[#FAF5EE] transition-colors"
                  >
                    Switch to COD
                  </button>
                )}
              </div>
            )}

            {submitError && (!paymentNotice || paymentNotice.message !== submitError) && (
              <div
                role="alert"
                aria-live="assertive"
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
                  <label htmlFor="checkout-full-name" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="checkout-full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    aria-invalid={fieldErrors.fullName ? 'true' : undefined}
                    aria-describedby={fieldErrors.fullName ? 'checkout-full-name-error' : undefined}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearFieldErrorOnInput('fullName');
                    }}
                    onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.fullName && (
                    <p
                      id="checkout-full-name-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    aria-invalid={fieldErrors.phone ? 'true' : undefined}
                    aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldErrorOnInput('phone');
                    }}
                    onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.phone && (
                    <p
                      id="checkout-phone-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-email" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    aria-invalid={fieldErrors.email ? 'true' : undefined}
                    aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldErrorOnInput('email');
                    }}
                    onBlur={(e) => handleFieldBlur('email', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.email && (
                    <p
                      id="checkout-email-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#4F6355] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="whatsappUpdates"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="accent-[#285A3C] rounded w-4 h-4"
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
                      className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${addressType === type
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
                  <label htmlFor="checkout-street" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    Full Street Address *
                  </label>
                  <textarea
                    id="checkout-street"
                    name="streetAddress"
                    autoComplete="street-address"
                    rows={2}
                    required
                    aria-invalid={fieldErrors.streetAddress ? 'true' : undefined}
                    aria-describedby={
                      fieldErrors.streetAddress ? 'checkout-street-error' : undefined
                    }
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      clearFieldErrorOnInput('streetAddress');
                    }}
                    onBlur={(e) => handleFieldBlur('streetAddress', e.target.value)}
                    placeholder="House / Flat No., Building, Street, Locality"
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.streetAddress && (
                    <p
                      id="checkout-street-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.streetAddress}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-pincode" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    id="checkout-pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    autoComplete="postal-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    maxLength={6}
                    aria-invalid={fieldErrors.pincode ? 'true' : undefined}
                    aria-describedby={fieldErrors.pincode ? 'checkout-pincode-error' : undefined}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ''));
                      clearFieldErrorOnInput('pincode');
                    }}
                    onBlur={(e) => handleFieldBlur('pincode', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.pincode && (
                    <p
                      id="checkout-pincode-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.pincode}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    aria-invalid={fieldErrors.city ? 'true' : undefined}
                    aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldErrorOnInput('city');
                    }}
                    onBlur={(e) => handleFieldBlur('city', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.city && (
                    <p
                      id="checkout-city-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.city}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    State *
                  </label>
                  <input
                    id="checkout-state"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    required
                    aria-invalid={fieldErrors.stateName ? 'true' : undefined}
                    aria-describedby={fieldErrors.stateName ? 'checkout-state-error' : undefined}
                    value={stateName}
                    onChange={(e) => {
                      setStateName(e.target.value);
                      clearFieldErrorOnInput('stateName');
                    }}
                    onBlur={(e) => handleFieldBlur('stateName', e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                  {fieldErrors.stateName && (
                    <p
                      id="checkout-state-error"
                      role="alert"
                      className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.stateName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-landmark" className="block text-[#1A3B2B] font-semibold mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    id="checkout-landmark"
                    name="landmark"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>

              {(checkingPin || pinServiceability || pinCheckWarning) && (
                <div role="status" aria-live="polite" className="pt-1">
                  {checkingPin ? (
                    <div className="rounded-lg border border-[#BCD8AA] bg-[#FAF5EE] px-3 py-2 text-xs text-[#4F6355] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#285A3C]" aria-hidden="true" />
                      <span>Checking Delhivery One courier availability for PIN {pincode}...</span>
                    </div>
                  ) : pinServiceability && !pinServiceability.fallback ? (
                    <div
                      className={`rounded-lg border px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${
                        pinServiceability.serviceable
                          ? 'border-[#BCD8AA] bg-[#D0E9C0]/30 text-[#1A3B2B]'
                          : 'border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {pinServiceability.serviceable ? (
                          <CheckCircle2 className="w-4 h-4 text-[#285A3C] shrink-0" aria-hidden="true" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
                        )}
                        <span>
                          {pinServiceability.serviceable ? (
                            <>
                              <strong>Delhivery One Serviceable</strong>
                              {pinServiceability.city ? ` • ${pinServiceability.city}` : ''}
                              {pinServiceability.stateCode ? `, ${pinServiceability.stateCode}` : ''}
                              {pinServiceability.isOda ? ' (Extended Area)' : ''}
                            </>
                          ) : (
                            <>
                              <strong>PIN {pinServiceability.pincode} not serviceable by Delhivery</strong>
                              {pinServiceability.remarks ? ` (${pinServiceability.remarks})` : ''}
                            </>
                          )}
                        </span>
                      </div>
                      {pinServiceability.serviceable && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-white border border-[#BCD8AA] text-[#285A3C]">
                            Est. {pinServiceability.standardEstimatedWindow || '3–5 Days'}
                          </span>
                          {siteSettings.codEnabled && (
                            <span
                              className={`px-2 py-0.5 rounded border ${
                                pinServiceability.cod
                                  ? 'bg-white border-[#BCD8AA] text-[#285A3C]'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              {pinServiceability.cod ? 'COD Eligible' : 'Prepaid Only'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : pinCheckWarning ? (
                    <p className="text-[11px] text-[#4F6355] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#285A3C]" aria-hidden="true" />
                      <span>{pinCheckWarning}</span>
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Section 3: Delivery Options */}
            <fieldset className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8C7B5]">
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center"
                >
                  3
                </span>
                <legend className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Delivery Options
                </legend>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  className={`relative p-3.5 rounded-lg border flex items-center justify-between transition-all min-h-[52px] ${deliveryOption === 'standard'
                    ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                    : 'border-[#BCD8AA] bg-[#FAF5EE]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="checkout-delivery-standard"
                      type="radio"
                      name="deliveryOption"
                      value="standard"
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      aria-describedby="checkout-delivery-standard-desc"
                      className="accent-[#285A3C] w-4 h-4 relative z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285A3C]"
                    />
                    <div>
                      <label
                        htmlFor="checkout-delivery-standard"
                        className="font-bold text-[#1A3B2B] cursor-pointer after:content-[''] after:absolute after:inset-0"
                      >
                        Standard Delivery
                      </label>
                      <p id="checkout-delivery-standard-desc" className="text-[11px] text-[#4F6355]">
                        {pinServiceability && !pinServiceability.fallback && pinServiceability.standardEstimatedWindow
                          ? `Est. ${pinServiceability.standardEstimatedWindow} (${pinServiceability.standardTatDays}–${pinServiceability.standardTatDays + 1} Business Days)`
                          : '3-5 Business Days'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#285A3C]">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                <div
                  className={`relative p-3.5 rounded-lg border flex items-center justify-between transition-all min-h-[52px] ${deliveryOption === 'express'
                    ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                    : 'border-[#BCD8AA] bg-[#FAF5EE]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="checkout-delivery-express"
                      type="radio"
                      name="deliveryOption"
                      value="express"
                      checked={deliveryOption === 'express'}
                      onChange={() => setDeliveryOption('express')}
                      aria-describedby="checkout-delivery-express-desc"
                      className="accent-[#285A3C] w-4 h-4 relative z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285A3C]"
                    />
                    <div>
                      <label
                        htmlFor="checkout-delivery-express"
                        className="font-bold text-[#1A3B2B] cursor-pointer after:content-[''] after:absolute after:inset-0"
                      >
                        Express Delivery
                      </label>
                      <p id="checkout-delivery-express-desc" className="text-[11px] text-[#4F6355]">
                        {pinServiceability && !pinServiceability.fallback && pinServiceability.expressEstimatedWindow
                          ? `Est. ${pinServiceability.expressEstimatedWindow} (${pinServiceability.expressTatDays}–${pinServiceability.expressTatDays + 1} Business Days)`
                          : '1-2 Business Days'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#285A3C]">
                    ₹{siteSettings.expressShippingFee.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </fieldset>

            {/* Section 4: Payment Method */}
            <fieldset className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D8C7B5]">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="w-6 h-6 rounded-full bg-[#285A3C] text-white text-xs font-bold flex items-center justify-center"
                  >
                    4
                  </span>
                  <legend className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                    Payment Method
                  </legend>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#285A3C] bg-[#D0E9C0]/60 px-2.5 py-1 rounded-full border border-[#BCD8AA]">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Powered by Razorpay</span>
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div
                  className={`relative p-3.5 rounded-lg border flex items-center justify-between gap-3 transition-all min-h-[56px] ${!isCodAvailable || paymentMethod === 'razorpay'
                    ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                    : 'border-[#BCD8AA] bg-white hover:bg-[#FAF5EE]/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="checkout-payment-razorpay"
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={!isCodAvailable || paymentMethod === 'razorpay'}
                      onChange={() => {
                        setPaymentMethod('razorpay');
                        setPaymentNotice(null);
                      }}
                      aria-describedby="checkout-payment-razorpay-desc"
                      className="accent-[#285A3C] w-4 h-4 relative z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285A3C]"
                    />
                    <div>
                      <label
                        htmlFor="checkout-payment-razorpay"
                        className="font-bold text-[#1A3B2B] cursor-pointer after:content-[''] after:absolute after:inset-0"
                      >
                        {isCodAvailable
                          ? 'Pay Online via Razorpay (Recommended)'
                          : 'Pay Online via Razorpay'}
                      </label>
                      <p id="checkout-payment-razorpay-desc" className="text-[11px] text-[#4F6355]">
                        UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking &amp; Wallets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[10px] font-bold text-[#285A3C] bg-[#D0E9C0] px-2 py-0.5 rounded border border-[#BCD8AA]">
                      All Online Methods
                    </span>
                    <CreditCard className="w-4 h-4 text-[#285A3C]" aria-hidden="true" />
                  </div>
                </div>

                {isCodAvailable ? (
                  <div
                    className={`relative p-3.5 rounded-lg border flex items-center justify-between gap-3 transition-all min-h-[56px] ${paymentMethod === 'cod'
                      ? 'border-[#285A3C] bg-[#D0E9C0]/35 ring-1 ring-[#285A3C]'
                      : 'border-[#BCD8AA] bg-white hover:bg-[#FAF5EE]/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id="checkout-payment-cod"
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => {
                          setPaymentMethod('cod');
                          setPaymentNotice(null);
                        }}
                        aria-describedby="checkout-payment-cod-desc"
                        className="accent-[#285A3C] w-4 h-4 relative z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285A3C]"
                      />
                      <div>
                        <label
                          htmlFor="checkout-payment-cod"
                          className="font-bold text-[#1A3B2B] cursor-pointer after:content-[''] after:absolute after:inset-0"
                        >
                          Cash on Delivery (COD)
                        </label>
                        <p id="checkout-payment-cod-desc" className="text-[11px] text-[#4F6355]">
                          Pay cash upon delivery at your doorstep
                        </p>
                      </div>
                    </div>
                    <Coins className="w-4 h-4 text-[#4F6355] shrink-0" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg border border-dashed border-[#D8C7B5] bg-[#FAF5EE]/75 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Coins className="w-4 h-4 text-[#647268] shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-[#4F6355]">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[11px] text-[#647268]">
                          {pinBlocksCod && pinServiceability
                            ? `Cash on Delivery is unavailable for PIN ${pinServiceability.pincode} — please pay online via Razorpay.`
                            : 'Not available at present — please pay online via Razorpay.'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-[#647268] bg-white px-2.5 py-0.5 rounded border border-[#D8C7B5]">
                      Currently Unavailable
                    </span>
                  </div>
                )}
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
                placeholder="e.g. Leave with security, call before arrival, gift note..."
                rows={2}
                className="w-full bg-[#FAF5EE] border border-[#BCD8AA] rounded p-2.5 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
                <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wide">
                  Order Summary ({selectedCartItems.length} items)
                </h2>
                <Link to="/cart" className="text-xs text-[#285A3C] hover:underline font-semibold">
                  Edit Cart
                </Link>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-[#F5EAE2]">
                {selectedCartItems.map((item) => {
                  const stockMeta = getStockStatusMeta(
                    item.product.stock,
                    item.product.inStock ? 'active' : 'out_of_stock'
                  );
                  const isAvailable = item.product.inStock && !stockMeta.isOutOfStock;
                  const exceedsStock = isAvailable && item.quantity > stockMeta.qty;

                  return (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <OptimizedPicture
                          src={item.product.primaryImage}
                          alt={item.product.title}
                          sizes="48px"
                          loading="lazy"
                          pictureClassName="shrink-0 block"
                          className="w-10 h-12 object-cover rounded border border-[#D8C7B5]"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-[#1A3B2B] truncate">{item.product.title}</p>
                          <p className="text-[10px] text-[#4F6355]">
                            Qty: {item.quantity}
                            {!isAvailable && (
                              <span className="ml-1.5 text-rose-700 font-semibold">• Out of Stock</span>
                            )}
                            {exceedsStock && (
                              <span className="ml-1.5 text-rose-700 font-semibold">• Only {stockMeta.qty} left</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#1A3B2B] shrink-0">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
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
                disabled={isSubmitting || hasStockBlockedItems}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>{getSubmitButtonLabel()}</span>
              </button>

              {(!isCodAvailable || paymentMethod !== 'cod') && (
                <p className="text-[10px] text-center text-[#285A3C] font-medium">
                  Note: Orders cannot be cancelled after payment is completed. A 256-bit SSL encrypted Razorpay popup opens after confirmation.
                </p>
              )}

              <p className="text-[10px] text-center text-[#4F6355]">
                By placing this order, you agree to DORASANI's Terms of Service and Privacy Policy.
              </p>

              <div className="pt-3 border-t border-[#F5EAE2] space-y-2 text-[11px] text-[#4F6355]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#285A3C]" />
                  <span>Razorpay Verified • PCI-DSS Compliant Payments</span>
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

      {/* Pre-Payment Policy & Order Confirmation Notice Modal */}
      <dialog
        ref={prePaymentDialogRef}
        aria-labelledby="pre-payment-policy-title"
        {...({ closedby: 'any' } as Record<string, string>)}
        onClose={() => {
          if (prePaymentDialogRef.current) {
            prePaymentDialogRef.current.returnValue = '';
          }
          setPrePaymentConfirmOpen(false);
        }}
        onClick={(e) => {
          const dlg = prePaymentDialogRef.current;
          if (!dlg || 'closedBy' in HTMLDialogElement.prototype) return;
          const r = dlg.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          ) {
            dlg.close();
          }
        }}
        className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#D8C7B5] bg-white p-6 text-left shadow-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="pre-payment-policy-title"
                  className="font-serif-royal text-lg font-bold text-[#1A3B2B]"
                >
                  Important Notice Before Payment
                </h2>
                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide mt-0.5">
                  No Order Cancellation After Payment
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPrePaymentConfirmOpen(false)}
              aria-label="Close pre-payment notice"
              className="p-1.5 rounded-full hover:bg-[#FAF5EE] text-[#647268]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-[#1A3B2B] space-y-2 leading-relaxed">
            <p className="font-semibold">
              Please review your items, quantity ({selectedCartItems.length}), shipping address (PIN{' '}
              {pincode}), and payable total (₹{payableTotal.toLocaleString('en-IN')}) carefully before proceeding.
            </p>
            <p className="text-[#4F6355]">
              <strong>Once payment is completed, you will not be able to cancel your order or item</strong> as our handloom team immediately reserves and prepares your piece for dispatch.
            </p>
            <p className="text-[#4F6355]">
              In the rare case an item becomes unavailable after your order is placed, DORASANI will notify you and issue an automatic full refund with a visible Refund Reference ID in your order tracking page.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              autoFocus
              onClick={() => setPrePaymentConfirmOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-[#D8C7B5] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] transition-colors"
            >
              Go Back &amp; Review
            </button>
            <button
              type="button"
              onClick={() => void executePlaceOrder()}
              className="px-4 py-2.5 rounded-lg bg-[#285A3C] hover:bg-[#1E432D] text-white font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isCodAvailable && paymentMethod === 'cod'
                  ? 'I Understand, Place COD Order'
                  : 'I Understand, Proceed to Payment →'}
              </span>
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
