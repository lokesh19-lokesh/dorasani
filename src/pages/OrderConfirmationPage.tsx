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
        colors: ['#285A3C', '#C99632', '#D0E9C0', '#FAF5EE'],
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }, []);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
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
            Your order has been confirmed and our artisans are carefully preparing your package.
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
              <CreditCard className="w-3.5 h-3.5 text-[#285A3C]" /> Total Amount
            </span>
            <p className="text-sm font-bold text-[#285A3C]">
              ₹{order.total.toLocaleString('en-IN')} <span className="text-[10px] text-[#4F6355] font-normal">(Paid via {order.paymentMethod.toUpperCase()})</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#4F6355] uppercase font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#285A3C]" /> Order Status
            </span>
            <span className="inline-block bg-[#D0E9C0] text-[#1A3B2B] font-bold text-xs px-2.5 py-0.5 rounded uppercase border border-[#BCD8AA]">
              Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Order Status Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-xl border border-[#D8C7B5] p-6 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#4F6355] mb-6">
            Estimated Progress
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
                ✓
              </div>
              <h4 className="font-bold text-xs text-[#1A3B2B]">Order Placed</h4>
              <p className="text-[11px] text-[#4F6355]">{order.date}</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm animate-pulse">
                2
              </div>
              <h4 className="font-bold text-xs text-[#285A3C]">Processing</h4>
              <p className="text-[11px] text-[#4F6355]">We are preparing your order</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] text-[#8E9B92] flex items-center justify-center text-xs font-bold mb-1">
                3
              </div>
              <h4 className="font-bold text-xs text-[#8E9B92]">Shipped</h4>
              <p className="text-[11px] text-[#8E9B92]">Track your delivery soon</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] text-[#8E9B92] flex items-center justify-center text-xs font-bold mb-1">
                4
              </div>
              <h4 className="font-bold text-xs text-[#8E9B92]">Out for Delivery</h4>
              <p className="text-[11px] text-[#8E9B92]">Arriving at your doorstep</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 3-Column Info Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Items in Order */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5]">
              Items in This Order ({order.items.length})
            </h3>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-12 h-14 object-cover rounded border border-[#D8C7B5] bg-[#FAF5EE]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A3B2B] truncate">{item.productTitle}</p>
                    <p className="text-[11px] text-[#4F6355]">Color: {item.variantColor} | Qty: {item.quantity}</p>
                    <p className="font-bold text-[#1A3B2B]">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Delivery Details & Tracking Actions */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#285A3C]" />
              <span>Delivery Information</span>
            </h3>

            <div className="text-xs text-[#4F6355] space-y-1">
              <p className="font-bold text-sm text-[#1A3B2B]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="pt-2 border-t border-[#F5EAE2]">
              <span className="text-[11px] font-bold text-[#1A3B2B] block">
                Estimated Delivery:
              </span>
              <p className="text-xs text-[#285A3C] font-semibold">
                3-5 Business Days (Expected within this week)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                to={`/track-order?order=${order.orderNumber}`}
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
            <span className="text-2xl">🎁</span>
            <h3 className="font-serif-royal text-base font-bold text-[#1A3B2B]">
              Thank You For Choosing DORASANI
            </h3>
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
