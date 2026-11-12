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
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkoutService } from '../services/checkoutService';
import { delhiveryService, type LiveTrackResponse } from '../services/delhiveryService';
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
  const [liveTrackInfo, setLiveTrackInfo] = useState<LiveTrackResponse['tracking'] | null>(null);
  const [isRedactedView, setIsRedactedView] = useState(false);
  const [loading, setLoading] = useState<boolean>(Boolean(targetOrderId));
  const [refreshingScans, setRefreshingScans] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const runLiveLookup = async (queryTerm: string, isManualRefresh = false): Promise<Order | null> => {
    const clean = queryTerm.trim().replace(/^#/, '');
    if (!clean) return null;

    if (isManualRefresh) {
      setRefreshingScans(true);
    } else {
      setLoading(true);
    }
    setLookupError(null);

    try {
      const looksLikeOrderNumber = /^dor-\d+/i.test(clean);
      const res = await delhiveryService.trackOrderLive({
        orderNumber: clean,
        ...(looksLikeOrderNumber ? {} : { waybill: clean }),
        refresh: true,
      });

      if (res.order) {
        setCurrentOrder(res.order);
        setLiveTrackInfo(res.tracking);
        setIsRedactedView(res.redacted);
        return res.order;
      }
      return null;
    } catch (liveErr: any) {
      const localMatch = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === clean.toLowerCase() ||
          o.id === clean ||
          (o.trackingId && o.trackingId.toLowerCase() === clean.toLowerCase())
      );
      if (localMatch) {
        setCurrentOrder(localMatch);
        setLiveTrackInfo(null);
        setIsRedactedView(false);
        return localMatch;
      }

      const remoteFallback = await checkoutService.lookupOrderByNumber(clean);
      if (remoteFallback) {
        setCurrentOrder(remoteFallback);
        setLiveTrackInfo(null);
        setIsRedactedView(false);
        return remoteFallback;
      }

      if (!isManualRefresh) {
        setCurrentOrder(null);
        setLiveTrackInfo(null);
        setLookupError(
          liveErr?.message ||
            `We could not find an order matching "${clean}". Please check your Order Number (e.g. DOR-...) or Delhivery AWB.`
        );
      } else {
        showToast(liveErr?.message || 'Unable to refresh live scans right now.', 'info');
      }
      return null;
    } finally {
      setLoading(false);
      setRefreshingScans(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLookupError(null);

    if (targetOrderId) {
      setTrackingIdInput(targetOrderId);
      runLiveLookup(targetOrderId, false);
    } else if (orders.length > 0) {
      const firstOrd = orders[0];
      setCurrentOrder(firstOrd);
      setTrackingIdInput(firstOrd.orderNumber);
      setIsRedactedView(false);
      setLoading(false);
      if (firstOrd.trackingId) {
        delhiveryService
          .trackOrderLive({ orderNumber: firstOrd.orderNumber, refresh: true })
          .then((res) => {
            if (!isMounted || !res.order) return;
            setCurrentOrder(res.order);
            setLiveTrackInfo(res.tracking);
          })
          .catch(() => {});
      }
    } else {
      setCurrentOrder(null);
      setLiveTrackInfo(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [targetOrderId, orders]);

  const isOrderNumberToken = (val?: string | null) => {
    const trimmed = String(val || '').trim();
    if (!trimmed) return false;
    if (/^dor-\d+/i.test(trimmed)) return true;
    if (
      currentOrder?.orderNumber &&
      trimmed.toLowerCase() === currentOrder.orderNumber.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  const activeAwb = [
    currentOrder?.shipment?.trackingNumber,
    currentOrder?.trackingId,
    liveTrackInfo?.awb,
  ]
    .map((candidate) => String(candidate || '').trim())
    .find((candidate) => Boolean(candidate) && !isOrderNumberToken(candidate)) || '';

  const activeScans =
    (liveTrackInfo?.scans && liveTrackInfo.scans.length > 0
      ? liveTrackInfo.scans
      : currentOrder?.shipment?.scans) || [];

  const rawTrackingUrl = liveTrackInfo?.trackingUrl || currentOrder?.trackingUrl || '';
  const normalizedRawUrl = rawTrackingUrl
    ? rawTrackingUrl.replace(
        'https://www.delhivery.com/track/package/',
        'https://www.delhivery.com/track-v2/package/'
      )
    : '';
  const activeTrackingUrl = activeAwb
    ? normalizedRawUrl &&
      (!currentOrder?.orderNumber ||
        !normalizedRawUrl.includes(encodeURIComponent(currentOrder.orderNumber))) &&
      !/\/DOR-\d+/i.test(normalizedRawUrl)
      ? normalizedRawUrl
      : `https://www.delhivery.com/track-v2/package/${encodeURIComponent(activeAwb)}`
    : '';

  const handleCopyTracking = () => {
    if (!activeAwb) return;
    navigator.clipboard.writeText(activeAwb);
    showToast('Tracking AWB copied to clipboard!');
  };

  const handleRefreshScans = async () => {
    if (!currentOrder) return;
    const updated = await runLiveLookup(activeAwb || currentOrder.orderNumber, true);
    if (updated) {
      showToast('Live Delhivery tracking status updated');
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = trackingIdInput.trim();
    if (!term) return;
    const found = await runLiveLookup(term, false);
    if (found) {
      setSearchParams({ order: found.orderNumber });
      showToast('Order details retrieved');
    } else {
      showToast('Order not found', 'info');
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

          <search className="w-full md:w-auto max-w-md">
            <form onSubmit={handleLookup} className="flex w-full">
              <input
                type="search"
                aria-label="Order number or tracking AWB"
                value={trackingIdInput}
                onChange={(e) => {
                  setTrackingIdInput(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Enter Order # or Delhivery AWB"
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
          </search>
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

              {/* Center: Live Tracking Milestones & Delhivery Scan Checkpoints */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#D8C7B5]">
                  <h2 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#285A3C]" />
                    <span>Live Tracking &amp; Courier Scans</span>
                  </h2>
                  {activeAwb && (
                    <button
                      type="button"
                      onClick={handleRefreshScans}
                      disabled={refreshingScans}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#285A3C] bg-[#FAF5EE] hover:bg-[#D0E9C0]/50 border border-[#BCD8AA] px-2.5 py-1 rounded transition-colors disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${refreshingScans ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>{refreshingScans ? 'Syncing...' : 'Refresh Live Scans'}</span>
                    </button>
                  )}
                </div>

                {activeAwb && (
                  <div className="rounded-lg bg-[#FAF5EE] border border-[#D8C7B5] p-3 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#1A3B2B]">
                        {liveTrackInfo?.currentStatus || currentOrder.shipment?.currentStatus || 'Manifested'}
                      </span>
                      {(liveTrackInfo?.estimatedDelivery || currentOrder.shipment?.estimatedDelivery) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D0E9C0] text-[#1A3B2B]">
                          Est. Delivery:{' '}
                          {new Date(
                            liveTrackInfo?.estimatedDelivery ||
                              currentOrder.shipment?.estimatedDelivery ||
                              ''
                          ).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4F6355]">
                      Route:{' '}
                      <strong className="text-[#1A3B2B]">
                        {liveTrackInfo?.origin || currentOrder.shipment?.originCity || 'Hyderabad'}
                      </strong>{' '}
                      →{' '}
                      <strong className="text-[#1A3B2B]">
                        {liveTrackInfo?.destination ||
                          currentOrder.shippingAddress.city ||
                          currentOrder.shippingAddress.pincode}
                      </strong>
                    </p>
                    {(liveTrackInfo?.currentLocation || currentOrder.shipment?.currentLocation) && (
                      <p className="text-[11px] text-[#285A3C] font-medium">
                        Current Hub: {liveTrackInfo?.currentLocation || currentOrder.shipment?.currentLocation}
                      </p>
                    )}
                  </div>
                )}

                {activeScans.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#4F6355]">
                      Courier Hub Activity ({activeScans.length})
                    </h3>
                    <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#BCD8AA] text-xs max-h-72 overflow-y-auto pr-1">
                      {activeScans.map((scan, sIdx) => (
                        <div key={`${scan.dateTime}-${scan.scan}-${sIdx}`} className="relative">
                          <span
                            className={`absolute -left-5 top-1 rounded-full ${
                              sIdx === 0
                                ? 'w-3 h-3 bg-[#285A3C] ring-4 ring-[#D0E9C0]'
                                : 'w-2.5 h-2.5 bg-[#BCD8AA]'
                            }`}
                          />
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <p className={`font-semibold ${sIdx === 0 ? 'text-[#285A3C]' : 'text-[#1A3B2B]'}`}>
                              {scan.scan}
                            </p>
                            <span className="text-[10px] text-[#647268]">
                              {scan.formattedTime || scan.dateTime}
                            </span>
                          </div>
                          {scan.location && (
                            <p className="text-[11px] font-medium text-[#4F6355]">{scan.location}</p>
                          )}
                          {scan.instructions && (
                            <p className="text-[11px] text-[#647268]">{scan.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-[#F5EAE2]">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#4F6355]">
                    Order Milestones
                  </h3>
                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#285A3C]/30 text-xs">
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
                        <h4
                          className={`font-semibold ${
                            step.current
                              ? 'font-bold text-[#285A3C]'
                              : step.completed
                              ? 'text-[#1A3B2B]'
                              : 'text-[#8E9B92]'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-[#4F6355]">{step.timestamp}</p>
                        <p className="text-xs text-[#4F6355] mt-0.5">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Delivery Address, Courier Partner & Help */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-2">
                  <h2 className="font-bold uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#285A3C]" />
                    <span>Delivery Destination</span>
                  </h2>
                  {!isRedactedView && currentOrder.shippingAddress.fullName ? (
                    <>
                      <p className="font-bold text-[#1A3B2B]">
                        {currentOrder.shippingAddress.fullName}
                      </p>
                      {currentOrder.shippingAddress.streetAddress && (
                        <p className="text-[#4F6355]">{currentOrder.shippingAddress.streetAddress}</p>
                      )}
                      <p className="text-[#4F6355]">
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} -{' '}
                        {currentOrder.shippingAddress.pincode}
                      </p>
                      {currentOrder.shippingAddress.phone && (
                        <p className="text-[#4F6355]">Phone: {currentOrder.shippingAddress.phone}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-[#1A3B2B]">
                        {[currentOrder.shippingAddress.city, currentOrder.shippingAddress.state]
                          .filter(Boolean)
                          .join(', ') || 'Destination City'}
                        {currentOrder.shippingAddress.pincode
                          ? ` - ${currentOrder.shippingAddress.pincode}`
                          : ''}
                      </p>
                      <p className="text-[11px] text-[#647268] leading-relaxed">
                        Street address and contact number are protected for privacy. Sign in with your order account to view complete details.
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-[#FAF5EE] rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-3">
                  <h2 className="font-bold uppercase tracking-wider text-[#1A3B2B] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#285A3C]" />
                    <span>Shipping Partner</span>
                  </h2>

                  {currentOrder.courierPartner || activeAwb ? (
                    <>
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-[#1A3B2B]">
                          {liveTrackInfo?.courierPartner || currentOrder.courierPartner || 'Delhivery One'}
                        </p>
                        {currentOrder.shipment?.shippingMode && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#BCD8AA] text-[#285A3C]">
                            {currentOrder.shipment.shippingMode} Service
                          </span>
                        )}
                        {activeAwb && (
                          <div className="flex items-center justify-between text-[#4F6355] pt-1">
                            <span className="font-mono text-[11px]">AWB: {activeAwb}</span>
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
                      {activeTrackingUrl &&
                        (/delhivery/i.test(currentOrder.courierPartner || '') ||
                          Boolean(currentOrder.shipment)) && (
                          <a
                            href={activeTrackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-white border border-[#BCD8AA] hover:border-[#285A3C] text-[#1A3B2B] py-2 rounded font-semibold text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Track on Delhivery</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        )}
                    </>
                  ) : (
                    <p className="text-[#4F6355] text-[11px] leading-relaxed">
                      Awaiting dispatch assignment. Your courier partner and tracking ID will appear here once manifested.
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
