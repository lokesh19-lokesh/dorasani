import React, { useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, orders } = useStore();

  const order = (orderId ? getOrder(orderId) : orders[0]) || orders[0];

  useEffect(() => {
    // Elegant celebratory confetti burst on mount
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#AC1443', '#C99632', '#D0E9C0', '#FDF4EC'],
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }, []);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* 1. Success Hero Banner */}
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#D0E9C0] text-[#2F6923] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#2D141A]">
            Order Placed Successfully!
          </h1>
          <p className="font-serif-royal text-sm sm:text-base text-[#AC1443] font-semibold">
            Thank you for shopping with DORASANI
          </p>
          <p className="text-xs sm:text-sm text-[#74565D]">
            Your order has been confirmed and our artisans are carefully preparing your package.
          </p>
        </div>
      </div>

      {/* 2. Order Summary Cards Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-[#EEDCD1] shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-[#74565D] uppercase font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#AC1443]" /> Order Number
            </span>
            <p className="text-sm font-bold text-[#2D141A]">#{order.orderNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#74565D] uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#AC1443]" /> Order Date
            </span>
            <p className="text-sm font-bold text-[#2D141A]">{order.date}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#74565D] uppercase font-bold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#AC1443]" /> Total Amount
            </span>
            <p className="text-sm font-bold text-[#AC1443]">
              ₹{order.total.toLocaleString('en-IN')} <span className="text-[10px] text-[#74565D] font-normal">(Paid via {order.paymentMethod.toUpperCase()})</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#74565D] uppercase font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2F6923]" /> Order Status
            </span>
            <span className="inline-block bg-[#D0E9C0]/50 text-[#2F6923] font-bold text-xs px-2.5 py-0.5 rounded uppercase">
              Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Order Status Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-xl border border-[#EEDCD1] p-6 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#74565D] mb-6">
            Estimated Progress
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#AC1443] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
                ✓
              </div>
              <h4 className="font-bold text-xs text-[#2D141A]">Order Placed</h4>
              <p className="text-[11px] text-[#74565D]">{order.date}</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#AC1443] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm animate-pulse">
                2
              </div>
              <h4 className="font-bold text-xs text-[#AC1443]">Processing</h4>
              <p className="text-[11px] text-[#74565D]">We are preparing your order</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#FAF2EB] border border-[#DEC3B4] text-[#9B8086] flex items-center justify-center text-xs font-bold mb-1">
                3
              </div>
              <h4 className="font-bold text-xs text-[#9B8086]">Shipped</h4>
              <p className="text-[11px] text-[#9B8086]">Track your delivery soon</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#FAF2EB] border border-[#DEC3B4] text-[#9B8086] flex items-center justify-center text-xs font-bold mb-1">
                4
              </div>
              <h4 className="font-bold text-xs text-[#9B8086]">Out for Delivery</h4>
              <p className="text-[11px] text-[#9B8086]">Arriving at your doorstep</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 3-Column Info Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Items in Order */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#2D141A] pb-2 border-b border-[#EEDCD1]">
              Items in This Order ({order.items.length})
            </h3>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-12 h-14 object-cover rounded border border-[#EEDCD1] bg-[#FAF2EB]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2D141A] truncate">{item.productTitle}</p>
                    <p className="text-[11px] text-[#74565D]">Color: {item.variantColor} | Qty: {item.quantity}</p>
                    <p className="font-bold text-[#AC1443]">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Delivery Details & Tracking Actions */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#2D141A] pb-2 border-b border-[#EEDCD1] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#AC1443]" />
              <span>Delivery Information</span>
            </h3>

            <div className="text-xs text-[#74565D] space-y-1">
              <p className="font-bold text-sm text-[#2D141A]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="pt-2 border-t border-[#F5EAE2]">
              <span className="text-[11px] font-bold text-[#2D141A] block">
                Estimated Delivery:
              </span>
              <p className="text-xs text-[#2F6923] font-semibold">
                3-5 Business Days (Expected within this week)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                to={`/track-order?order=${order.orderNumber}`}
                className="w-full bg-[#AC1443] hover:bg-[#860E33] text-white py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </Link>
              <Link
                to="/shop"
                className="w-full border border-[#DEC3B4] hover:border-[#AC1443] text-[#2D141A] hover:text-[#AC1443] py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 3: Brand Appreciation Card */}
          <div className="lg:col-span-3 bg-[#FAF2EB] rounded-xl border border-[#EEDCD1] p-6 text-center space-y-3">
            <span className="text-2xl">🎁</span>
            <h3 className="font-serif-royal text-base font-bold text-[#2D141A]">
              Thank You For Choosing DORASANI
            </h3>
            <p className="text-xs text-[#74565D] leading-relaxed">
              Tradition lives on because of customers like you. Every piece you purchase supports generational weavers and South Indian handloom families.
            </p>
            <Link
              to="/collections/festive"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AC1443] hover:underline pt-2"
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
