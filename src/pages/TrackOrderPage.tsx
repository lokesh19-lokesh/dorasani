import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Package,
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Copy,
  HelpCircle,
  ChevronRight,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkoutService } from '../services/checkoutService';
import { SeoHead } from '../components/common/SeoHead';
import type { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const { orders, user, showToast } = useStore();
  const { orderId } = useParams<{ orderId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrderId = searchParams.get('order');
  const targetOrderId = orderId || queryOrderId || '';

  const [trackingIdInput, setTrackingIdInput] = useState(targetOrderId);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(targetOrderId));
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLookupError(null);

    if (targetOrderId) {
      setTrackingIdInput(targetOrderId);
      const localMatch = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === targetOrderId.toLowerCase() ||
          o.id === targetOrderId ||
          (o.trackingId && o.trackingId.toLowerCase() === targetOrderId.toLowerCase())
      );

      if (localMatch) {
        setCurrentOrder(localMatch);
        setLoading(false);
        return;
      }

      setLoading(true);
      checkoutService
        .lookupOrderByNumber(targetOrderId)
        .then((remoteMatch) => {
          if (!isMounted) return;
          if (remoteMatch) {
            setCurrentOrder(remoteMatch);
          } else {
            setCurrentOrder(null);
            setLookupError(`No order found matching "${targetOrderId}".`);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else if (orders.length > 0) {
      setCurrentOrder(orders[0]);
      setTrackingIdInput(orders[0].orderNumber);
      setLoading(false);
    } else {
      setCurrentOrder(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [targetOrderId, orders]);

  const handleCopyTracking = () => {
    if (!currentOrder?.trackingId) return;
    navigator.clipboard.writeText(currentOrder.trackingId);
    showToast('Tracking ID copied to clipboard!');
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = trackingIdInput.trim();
    if (!term) return;
    setLookupError(null);

    const localFound = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === term.toLowerCase() ||
        (o.trackingId && o.trackingId.toLowerCase() === term.toLowerCase())
    );
    if (localFound) {
      setCurrentOrder(localFound);
      setSearchParams({ order: localFound.orderNumber });
      showToast('Order details retrieved');
      return;
    }

    setLoading(true);
    try {
      const remoteFound = await checkoutService.lookupOrderByNumber(term);
      if (remoteFound) {
        setCurrentOrder(remoteFound);
        setSearchParams({ order: remoteFound.orderNumber });
        showToast('Order details retrieved');
      } else {
        setCurrentOrder(null);
        const msg = user
          ? `No order found matching "${term}" under your account.`
          : `No order found matching "${term}". Please sign in with the account used to place the order.`;
        setLookupError(msg);
        showToast('Order not found', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const reversedTimeline = currentOrder ? [...currentOrder.timeline].reverse() : [];

  return (
    <div className="space-y-8 pb-16">
      <SeoHead
        title={currentOrder ? `Track Order #${currentOrder.orderNumber} | DORASANI` : 'Track Order | DORASANI'}
        description="Track your DORASANI handloom saree or ethnic wear delivery in real time using your order number or courier tracking ID."
        canonicalPath="/track-order"
        robots="noindex, nofollow"
      />
      {/* 1. Breadcrumbs */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto">
          <ol className="flex items-center space-x-1.5 text-xs text-[#4F6355]">
            <li>
              <Link to="/" className="hover:text-[#285A3C]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
            </li>
            <li>
              <Link to="/account" className="hover:text-[#285A3C]">
                My Orders
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
            </li>
            <li>
              <span aria-current="page" className="font-semibold text-[#285A3C]">
                {currentOrder ? `Track Order #${currentOrder.orderNumber}` : 'Track Order'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* 2. Banner with Order Lookup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#FAF5EE] rounded-2xl border border-[#D8C7B5] p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355]">
              Enter your DORASANI order number or courier tracking ID for real-time updates.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex w-full md:w-auto max-w-md">
            <input
              type="text"
              aria-label="Order number or tracking ID"
              value={trackingIdInput}
              onChange={(e) => {
                setTrackingIdInput(e.target.value);
                if (lookupError) setLookupError(null);
              }}
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Enter Order # or Tracking ID"
              className="flex-1 bg-white border border-r-0 border-[#BCD8AA] rounded-l px-3.5 py-2 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
            />
            <button
              type="submit"
              disabled={loading || !trackingIdInput.trim()}
              className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-50 text-white px-5 rounded-r font-semibold text-xs transition-colors"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#4F6355]">Fetching live order tracking status...</p>
        </div>
      ) : !currentOrder ? (
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-[#D8C7B5] p-8 text-center space-y-4 shadow-xs">
            {lookupError ? (
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            ) : (
              <Search className="w-10 h-10 text-[#285A3C] mx-auto" />
            )}
            <h2 className="font-serif-royal text-xl font-bold text-[#1A3B2B]">
              {lookupError ? 'Order Not Found' : 'Look Up Any Order'}
            </h2>
            <p className="text-xs text-[#4F6355] leading-relaxed">
              {lookupError ||
                (user
                  ? 'You have no placed orders yet, or enter an order number above to track it.'
                  : 'Sign in to view your past orders automatically, or enter your order number above.')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!user ? (
                <Link
                  to="/login?redirect=/track-order"
                  className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2.5 rounded text-xs font-semibold transition-colors"
                >
                  Sign In to View Orders
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2.5 rounded text-xs font-semibold transition-colors"
                >
                  Go to My Account
                </Link>
              )}
              <Link
                to="/shop"
                className="border border-[#D8C7B5] hover:bg-[#FAF5EE] text-[#1A3B2B] px-5 py-2.5 rounded text-xs font-semibold transition-colors"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Order Top Stats */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-[#D8C7B5] shadow-xs">
              <div>
                <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#285A3C]" /> Order Number
                </span>
                <p className="font-bold text-sm text-[#1A3B2B] mt-0.5">
                  #{currentOrder.orderNumber}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#285A3C]" /> Order Date
                </span>
                <p className="font-bold text-sm text-[#1A3B2B] mt-0.5">{currentOrder.date}</p>
              </div>

              <div>
                <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#285A3C]" /> Total & Payment
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-sm text-[#285A3C]">
                    ₹{currentOrder.total.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-[#4F6355]">
                    • {currentOrder.paymentMethod}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      currentOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentOrder.paymentStatus === 'failed'
                        ? 'bg-rose-100 text-rose-800'
                        : currentOrder.paymentStatus === 'refunded'
                        ? 'bg-stone-100 text-stone-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentOrder.paymentStatus}
                  </span>
                </div>
                {currentOrder.paymentDetails?.paymentId && (
                  <p className="text-[10px] font-mono text-[#647268] mt-0.5 truncate">
                    Razorpay ID: {currentOrder.paymentDetails.paymentId}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#285A3C]" /> Order Status
                </span>
                <p className="font-bold text-sm text-[#285A3C] mt-0.5 uppercase">
                  {currentOrder.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Dynamic Horizontal Delivery Progress Bar */}
          {currentOrder.timeline && currentOrder.timeline.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="bg-white rounded-xl border border-[#D8C7B5] p-6 shadow-xs">
                <div
                  className={`grid gap-4 relative ${
                    currentOrder.timeline.length <= 2
                      ? 'grid-cols-2'
                      : currentOrder.timeline.length === 4
                      ? 'grid-cols-2 md:grid-cols-4'
                      : 'grid-cols-2 md:grid-cols-5'
                  }`}
                >
                  {currentOrder.timeline.map((step, idx) => (
                    <div
                      key={step.title}
                      className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          step.completed
                            ? 'bg-[#285A3C] text-white shadow-sm'
                            : 'bg-[#FAF5EE] border border-[#BCD8AA] text-[#8E9B92]'
                        } ${step.current ? 'ring-4 ring-[#D0E9C0]' : ''}`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <h2
                        className={`font-bold text-xs ${
                          step.current
                            ? 'text-[#285A3C]'
                            : step.completed
                            ? 'text-[#1A3B2B]'
                            : 'text-[#8E9B92]'
                        }`}
                      >
                        {step.title}
                      </h2>
                      <p className="text-[10px] text-[#4F6355]">{step.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Three Columns: Items | Timeline | Shipping Partner */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Items in Order */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5]">
                  Items in this Order ({currentOrder.items.length})
                </h2>
                <div className="space-y-3">
                  {currentOrder.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.imageUrl}
                        alt={item.productTitle}
                        className="w-12 h-14 object-cover rounded border border-[#D8C7B5] bg-[#FAF5EE]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1A3B2B] truncate">{item.productTitle}</p>
                        <p className="text-[11px] text-[#4F6355]">
                          {item.variantColor} | Qty: {item.quantity}
                        </p>
                        <p className="font-bold text-[#1A3B2B]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center: Live Tracking Milestones */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#285A3C]" />
                  <span>Tracking Details</span>
                </h2>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#285A3C]/30 text-xs">
                  {reversedTimeline.map((step) => (
                    <div key={step.title} className="relative">
                      <span
                        className={`absolute -left-6 top-0.5 rounded-full ${
                          step.current
                            ? 'w-3.5 h-3.5 bg-[#285A3C] ring-4 ring-[#D0E9C0]'
                            : step.completed
                            ? 'w-3 h-3 bg-[#285A3C]'
                            : 'w-3 h-3 bg-[#FAF5EE] border border-[#BCD8AA]'
                        }`}
                      />
                      <h3
                        className={`font-semibold ${
                          step.current
                            ? 'font-bold text-[#285A3C]'
                            : step.completed
                            ? 'text-[#1A3B2B]'
                            : 'text-[#8E9B92]'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-[#4F6355]">{step.timestamp}</p>
                      <p className="text-xs text-[#4F6355] mt-0.5">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Delivery Address, Courier Partner & Help */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-2">
                  <h2 className="font-bold uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#285A3C]" />
                    <span>Delivery Address</span>
                  </h2>
                  <p className="font-bold text-[#1A3B2B]">
                    {currentOrder.shippingAddress.fullName}
                  </p>
                  <p className="text-[#4F6355]">{currentOrder.shippingAddress.streetAddress}</p>
                  <p className="text-[#4F6355]">
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} -{' '}
                    {currentOrder.shippingAddress.pincode}
                  </p>
                  <p className="text-[#4F6355]">Phone: {currentOrder.shippingAddress.phone}</p>
                </div>

                <div className="bg-[#FAF5EE] rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-3">
                  <h2 className="font-bold uppercase tracking-wider text-[#1A3B2B] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#285A3C]" />
                    <span>Shipping Partner</span>
                  </h2>

                  {currentOrder.courierPartner || currentOrder.trackingId ? (
                    <>
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-[#1A3B2B]">
                          {currentOrder.courierPartner || 'Courier Assigned'}
                        </p>
                        {currentOrder.trackingId && (
                          <div className="flex items-center justify-between text-[#4F6355]">
                            <span>ID: {currentOrder.trackingId}</span>
                            <button
                              type="button"
                              onClick={handleCopyTracking}
                              className="p-1 text-[#285A3C] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {currentOrder.courierPartner?.toLowerCase().includes('delhivery') &&
                        currentOrder.trackingId && (
                          <a
                            href={`https://www.delhivery.com/track/package/${currentOrder.trackingId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-white border border-[#BCD8AA] hover:border-[#285A3C] text-[#1A3B2B] py-2 rounded font-semibold text-center block transition-colors shadow-xs"
                          >
                            Track on Delhivery
                          </a>
                        )}
                    </>
                  ) : (
                    <p className="text-[#4F6355] text-[11px] leading-relaxed">
                      Awaiting dispatch assignment. Your courier partner and tracking ID will appear here once shipped.
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-2 text-center">
                  <HelpCircle className="w-5 h-5 text-[#285A3C] mx-auto" />
                  <h2 className="font-bold text-[#1A3B2B]">Need Help With Your Order?</h2>
                  <p className="text-[#4F6355] text-[11px]">
                    Facing any delays or require assistance? Reach out to DORASANI Customer Support.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-block text-[#285A3C] font-bold hover:underline pt-1"
                  >
                    Contact Customer Support →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
