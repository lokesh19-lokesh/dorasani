import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Package,
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const TrackOrderPage: React.FC = () => {
  const { orders, showToast } = useStore();
  const { orderId } = useParams<{ orderId?: string }>();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('order');

  const defaultOrder = orders[0] || {
    id: 'demo-order',
    orderNumber: 'DOR20261021',
    date: '21 Oct 2026, 09:41 AM',
    items: [],
    shippingAddress: {
      id: 'addr-1',
      addressType: 'Home' as const,
      fullName: 'Devi Priya',
      phone: '+91 98765 43210',
      streetAddress: 'Flat 402, Royal Residency, Road No. 10',
      landmark: 'Near Lotus Pond',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    },
    deliveryOption: 'standard' as const,
    subtotal: 18499,
    discount: 1000,
    shippingFee: 0,
    total: 17499,
    paymentMethod: 'upi' as const,
    paymentStatus: 'paid' as const,
    status: 'out_for_delivery' as const,
    courierPartner: 'Delhivery',
    trackingId: '149087654321',
    timeline: [
      {
        title: 'Order Placed',
        description: 'Your order has been confirmed.',
        timestamp: '21 Oct 2026, 09:41 AM',
        completed: true,
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared.',
        timestamp: '21 Oct 2026, 11:30 AM',
        completed: true,
      },
      {
        title: 'Shipped',
        description: 'Your package has been shipped from our warehouse.',
        timestamp: '22 Oct 2026, 10:15 AM',
        completed: true,
      },
      {
        title: 'In Transit',
        description: 'Your package has reached Hyderabad Sortation Center.',
        timestamp: '22 Oct 2026, 09:45 PM',
        completed: true,
      },
      {
        title: 'Out for Delivery',
        description: 'Your package is out for delivery and will arrive today.',
        timestamp: '23 Oct 2026, 08:20 AM',
        completed: true,
        current: true,
      },
      {
        title: 'Delivered',
        description: 'Expected by 23 Oct, 06:00 PM',
        timestamp: 'Estimated: 23 Oct 2026, 06:00 PM',
        completed: false,
      },
    ],
  };

  const targetOrderId = orderId || queryOrderId;
  const initialOrder =
    (targetOrderId &&
      orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === targetOrderId.toLowerCase() ||
          o.id === targetOrderId ||
          o.trackingId === targetOrderId
      )) ||
    orders[0] ||
    defaultOrder;

  const [trackingIdInput, setTrackingIdInput] = useState(initialOrder.orderNumber);
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  useEffect(() => {
    if (targetOrderId) {
      const match = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === targetOrderId.toLowerCase() ||
          o.id === targetOrderId ||
          o.trackingId === targetOrderId
      );
      if (match) {
        setCurrentOrder(match);
        setTrackingIdInput(match.orderNumber);
      }
    }
  }, [targetOrderId, orders]);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(currentOrder.trackingId || '149087654321');
    showToast('Tracking ID copied to clipboard!');
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === trackingIdInput.trim().toLowerCase() ||
        o.trackingId === trackingIdInput.trim()
    );
    if (found) {
      setCurrentOrder(found);
      showToast('Order details retrieved');
    } else {
      showToast('Order not found. Showing demonstration order.', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 text-xs text-[#4F6355]">
          <Link to="/" className="hover:text-[#285A3C]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          <Link to="/account" className="hover:text-[#285A3C]">My Orders</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
          <span className="font-semibold text-[#285A3C]">Track Order #{currentOrder.orderNumber}</span>
        </div>
      </div>

      {/* 2. Banner with Order Lookup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#FAF5EE] rounded-2xl border border-[#D8C7B5] p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355]">
              Stay updated on your order status and track your delivery in real time.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex w-full md:w-auto max-w-md">
            <input
              type="text"
              value={trackingIdInput}
              onChange={(e) => setTrackingIdInput(e.target.value)}
              placeholder="Enter Order # or Tracking ID"
              className="bg-white border border-r-0 border-[#BCD8AA] rounded-l px-3.5 py-2 text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
            />
            <button
              type="submit"
              className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 rounded-r font-semibold text-xs transition-colors"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      {/* 3. Order Top Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-[#D8C7B5] shadow-xs">
          <div>
            <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#285A3C]" /> Order Number
            </span>
            <p className="font-bold text-sm text-[#1A3B2B] mt-0.5">#{currentOrder.orderNumber}</p>
          </div>

          <div>
            <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#285A3C]" /> Order Date
            </span>
            <p className="font-bold text-sm text-[#1A3B2B] mt-0.5">{currentOrder.date}</p>
          </div>

          <div>
            <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#285A3C]" /> Total Amount
            </span>
            <p className="font-bold text-sm text-[#285A3C] mt-0.5">
              ₹{currentOrder.total.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-[#4F6355] font-normal">(Paid via {currentOrder.paymentMethod.toUpperCase()})</span>
            </p>
          </div>

          <div>
            <span className="text-[11px] text-[#4F6355] font-bold uppercase flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#285A3C]" /> Order Status
            </span>
            <p className="font-bold text-sm text-[#285A3C] mt-0.5 flex items-center gap-1">
              <span>Out for Delivery</span>
              <span className="text-[10px] font-normal text-[#4F6355]">(Arriving Today)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Horizontal Delivery Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-xl border border-[#D8C7B5] p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
                ✓
              </div>
              <h4 className="font-bold text-xs text-[#1A3B2B]">Order Placed</h4>
              <p className="text-[10px] text-[#4F6355]">21 Oct, 09:41 AM</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
                ✓
              </div>
              <h4 className="font-bold text-xs text-[#1A3B2B]">Processing</h4>
              <p className="text-[10px] text-[#4F6355]">21 Oct, 11:30 AM</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
                ✓
              </div>
              <h4 className="font-bold text-xs text-[#1A3B2B]">Shipped</h4>
              <p className="text-[10px] text-[#4F6355]">22 Oct, 10:15 AM</p>
            </div>

            {/* Step 4: Active */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-md animate-bounce">
                🚚
              </div>
              <h4 className="font-bold text-xs text-[#285A3C]">Out for Delivery</h4>
              <p className="text-[10px] text-[#4F6355]">23 Oct, 08:20 AM</p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#BCD8AA] text-[#8E9B92] flex items-center justify-center text-xs font-bold mb-1">
                5
              </div>
              <h4 className="font-bold text-xs text-[#8E9B92]">Delivered</h4>
              <p className="text-[10px] text-[#8E9B92]">Expected by 06:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Three Columns: Items | Timeline | Shipping Partner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Items in Order */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5]">
              Items in this Order ({currentOrder.items.length})
            </h3>
            <div className="space-y-3">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-12 h-14 object-cover rounded border border-[#D8C7B5]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A3B2B] truncate">{item.productTitle}</p>
                    <p className="text-[11px] text-[#4F6355]">
                      {item.variantColor} | Qty: {item.quantity}
                    </p>
                    <p className="font-bold text-[#1A3B2B]">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Live Tracking Milestones */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#285A3C]" />
              <span>Tracking Details</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#285A3C]/30 text-xs">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#285A3C] ring-4 ring-[#D0E9C0]" />
                <h4 className="font-bold text-[#285A3C]">Out for Delivery</h4>
                <p className="text-[10px] text-[#4F6355]">23 Oct 2026, 08:20 AM</p>
                <p className="text-xs text-[#1A3B2B] mt-0.5">
                  Your package is out for delivery and will arrive today.
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#285A3C]" />
                <h4 className="font-semibold text-[#1A3B2B]">In Transit</h4>
                <p className="text-[10px] text-[#4F6355]">22 Oct 2026, 09:45 PM</p>
                <p className="text-xs text-[#4F6355]">
                  Your package has reached Hyderabad Sortation Center.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#285A3C]" />
                <h4 className="font-semibold text-[#1A3B2B]">Shipped</h4>
                <p className="text-[10px] text-[#4F6355]">22 Oct 2026, 10:15 AM</p>
                <p className="text-xs text-[#4F6355]">
                  Your package has been shipped from our Kanchipuram central warehouse.
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#285A3C]" />
                <h4 className="font-semibold text-[#1A3B2B]">Processing</h4>
                <p className="text-[10px] text-[#4F6355]">21 Oct 2026, 11:30 AM</p>
                <p className="text-xs text-[#4F6355]">
                  Your handloom garments were ironed, quality verified, and packed.
                </p>
              </div>

              {/* Event 5 */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#285A3C]" />
                <h4 className="font-semibold text-[#1A3B2B]">Order Placed</h4>
                <p className="text-[10px] text-[#4F6355]">21 Oct 2026, 09:41 AM</p>
                <p className="text-xs text-[#4F6355]">
                  Your order has been confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Courier Partner & Help */}
          <div className="lg:col-span-3 space-y-4">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-[#1A3B2B] pb-2 border-b border-[#D8C7B5] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#285A3C]" />
                <span>Delivery Address</span>
              </h3>
              <p className="font-bold text-[#1A3B2B]">{currentOrder.shippingAddress.fullName}</p>
              <p className="text-[#4F6355]">{currentOrder.shippingAddress.streetAddress}</p>
              <p className="text-[#4F6355]">{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.pincode}</p>
              <p className="text-[#4F6355]">Phone: {currentOrder.shippingAddress.phone}</p>
            </div>

            {/* Courier Partner Card */}
            <div className="bg-[#FAF5EE] rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-[#1A3B2B] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#285A3C]" />
                <span>Shipping Partner</span>
              </h3>

              <div className="space-y-1">
                <p className="font-bold text-sm text-[#1A3B2B]">Delhivery Express</p>
                <div className="flex items-center justify-between text-[#4F6355]">
                  <span>ID: {currentOrder.trackingId || '149087654321'}</span>
                  <button
                    onClick={handleCopyTracking}
                    className="p-1 text-[#285A3C] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <a
                href={`https://www.delhivery.com/track/package/${currentOrder.trackingId || '149087654321'}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-white border border-[#BCD8AA] hover:border-[#285A3C] text-[#1A3B2B] py-2 rounded font-semibold text-center block transition-colors shadow-xs"
              >
                Track on Delhivery
              </a>
            </div>

            {/* Support Box */}
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs text-xs space-y-2 text-center">
              <HelpCircle className="w-5 h-5 text-[#285A3C] mx-auto" />
              <h4 className="font-bold text-[#1A3B2B]">Need Help With Your Order?</h4>
              <p className="text-[#4F6355] text-[11px]">
                Facing any delays or require address changes? Our customer support team is available 24/7.
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
    </div>
  );
};
