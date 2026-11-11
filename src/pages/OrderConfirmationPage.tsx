import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  Clock,
  Truck,
  MapPin,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { checkoutService } from '../services/checkoutService';
import { SeoHead } from '../components/common/SeoHead';
import type { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, orders } = useStore();

  const localOrder = (orderId ? getOrder(orderId) : orders[0]) || null;
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(orderId && !localOrder));

  useEffect(() => {
    let isMounted = true;
    if (localOrder || !orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    checkoutService
      .lookupOrderByNumber(orderId)
      .then((live) => {
        if (!isMounted) return;
        setFetchedOrder(live);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, localOrder]);

  const order = localOrder || fetchedOrder;

  useEffect(() => {
    if (!order) return;
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#285A3C', '#C99632', '#D0E9C0', '#FAF5EE'],
      });
    } catch {
      // Ignore if confetti canvas is unavailable
    }
  }, [order?.id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <SeoHead
          title="Order Confirmation | DORASANI"
          description="View your DORASANI order confirmation, Razorpay payment status, and dispatch timeline."
          canonicalPath={orderId ? `/order-confirmation/${orderId}` : '/order-confirmation'}
          robots="noindex, nofollow"
        />
        <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#4F6355]">Loading your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
        <SeoHead
          title="Order Confirmation | DORASANI"
          description="Look up or confirm your DORASANI order details."
          canonicalPath="/order-confirmation"
          robots="noindex, nofollow"
        />
        <Package className="w-12 h-12 text-[#285A3C] mx-auto" />
        <h1 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">
          No Recent Order Found
        </h1>
        <p className="text-xs text-[#4F6355]">
          You can view your past purchases in your account or track an order using its order number.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/track-order"
            className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2.5 rounded text-xs font-semibold transition-colors"
          >
            Track Order
          </Link>
          <Link
            to="/shop"
            className="border border-[#D8C7B5] hover:bg-[#FAF5EE] text-[#1A3B2B] px-5 py-2.5 rounded text-xs font-semibold transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      <SeoHead
        title={`Order #${order.orderNumber} Confirmed | DORASANI`}
        description={`Order #${order.orderNumber} confirmation and dispatch details for your DORASANI purchase.`}
        canonicalPath={`/order-confirmation/${order.orderNumber}`}
        robots="noindex, nofollow"
      />
      {/* 1. Success Hero Banner */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
            Order Placed Successfully!
          </h1>
          <p className="font-serif-royal text-sm sm:text-base text-[#285A3C] font-semibold">
            Thank you for shopping with DORASANI
          </p>
          <p className="text-xs sm:text-sm text-[#4F6355]">
            {order.paymentStatus === 'paid'
              ? 'Payment verified via Razorpay. Your order has been confirmed and our weavers are preparing your handloom package.'
              : 'Your order has been received and our team is preparing your handloom package.'}
          </p>
        </div>
      </div>

      {/* 2. Order Summary Cards Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-[#D8C7B5] shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-[#4F6355] uppercase font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#285A3C]" /> Order Number
            </span>
            <p className="text-sm font-bold text-[#1A3B2B]">#{order.orderNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#4F6355] uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#285A3C]" /> Order Date
            </span>
            <p className="text-sm font-bold text-[#1A3B2B]">{order.date}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#4F6355] uppercase font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#285A3C]" /> Total & Payment
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-[#285A3C]">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-semibold uppercase text-[#4F6355]">
                • {order.paymentMethod}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'failed'
                    ? 'bg-rose-100 text-rose-800'
                    : order.paymentStatus === 'refunded'
                    ? 'bg-stone-100 text-stone-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentDetails?.paymentId && (
              <p className="text-[10px] font-mono text-[#647268] truncate">
                Razorpay ID: {order.paymentDetails.paymentId}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#4F6355] uppercase font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#285A3C]" /> Order Status
            </span>
            <span className="inline-block bg-[#D0E9C0] text-[#1A3B2B] font-bold text-xs px-2.5 py-0.5 rounded uppercase border border-[#BCD8AA]">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Horizontal Order Status Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-xl border border-[#D8C7B5] p-6 shadow-xs">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#4F6355] mb-6">
              Order Progress
            </h2>

            <div
              className={`grid gap-4 relative ${
                order.timeline.length <= 2
                  ? 'grid-cols-2'
                  : order.timeline.length === 4
                  ? 'grid-cols-2 md:grid-cols-4'
                  : 'grid-cols-2 md:grid-cols-5'
              }`}
            >
              {order.timeline.map((step, idx) => (
                <div
                  key={step.title}
                  className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      step.completed
                        ? 'bg-[#285A3C] text-white shadow-sm'
                        : 'bg-[#FAF5EE] border border-[#BCD8AA] text-[#8E9B92]'
                    }`}
                  >
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <h3
                    className={`font-bold text-xs ${
                      step.current
                        ? 'text-[#285A3C]'
                        : step.completed
                        ? 'text-[#1A3B2B]'
                        : 'text-[#8E9B92]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-[#4F6355]">{step.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom 3-Column Info Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Items in Order */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5]">
              Items in This Order ({order.items.length})
            </h2>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={`${item.productId}-${i}`} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-12 h-14 object-cover rounded border border-[#D8C7B5] bg-[#FAF5EE]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A3B2B] truncate">{item.productTitle}</p>
                    <p className="text-[11px] text-[#4F6355]">
                      Color: {item.variantColor} | Qty: {item.quantity}
                    </p>
                    <p className="font-bold text-[#1A3B2B]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Delivery Details & Tracking Actions */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#285A3C]" />
              <span>Delivery Information</span>
            </h2>

            <div className="text-xs text-[#4F6355] space-y-1">
              <p className="font-bold text-sm text-[#1A3B2B]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="pt-2 border-t border-[#F5EAE2] space-y-2">
              <div>
                <span className="text-[11px] font-bold text-[#1A3B2B] block">
                  Delivery Option:
                </span>
                <p className="text-xs text-[#285A3C] font-semibold">
                  {order.deliveryOption === 'express'
                    ? 'Express Delivery (1-2 Business Days)'
                    : 'Standard Delivery (3-5 Business Days)'}
                </p>
              </div>
              {(order.courierPartner || order.trackingId) && (
                <div className="rounded-lg bg-[#FAF5EE] border border-[#BCD8AA] p-2.5 text-xs space-y-0.5">
                  <p className="font-bold text-[#1A3B2B]">
                    Courier: {order.courierPartner || 'Delhivery One'}
                  </p>
                  {order.trackingId && (
                    <p className="font-mono text-[11px] text-[#285A3C]">
                      Waybill / AWB: {order.trackingId}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to={`/track-order/${order.orderNumber}`}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] text-white py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </Link>
              <Link
                to="/shop"
                className="w-full border border-[#BCD8AA] hover:border-[#285A3C] text-[#1A3B2B] hover:text-[#285A3C] py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 3: Brand Appreciation Card */}
          <div className="lg:col-span-3 bg-[#FAF5EE] rounded-xl border border-[#D8C7B5] p-6 text-center space-y-3">
            <span className="text-2xl" aria-hidden="true">🎁</span>
            <h2 className="font-serif-royal text-base font-bold text-[#1A3B2B]">
              Thank You For Choosing DORASANI
            </h2>
            <p className="text-xs text-[#4F6355] leading-relaxed">
              Tradition lives on because of customers like you. Every piece you purchase supports generational weavers and South Indian handloom families.
            </p>
            <Link
              to="/collections/festive"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#285A3C] hover:underline pt-2"
            >
              <span>Explore More Collections</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
