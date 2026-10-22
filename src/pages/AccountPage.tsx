import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  User,
  Bell,
  Gift,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AccountPage: React.FC = () => {
  const { user, logout, orders, wishlist, addresses } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'profile'>('dashboard');

  if (!user) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="font-serif-royal text-2xl font-bold text-[#2D141A]">You are not signed in</h2>
        <p className="text-xs text-[#74565D] mt-2">Sign in to view your orders, addresses and profile.</p>
        <Link
          to="/login"
          className="mt-5 inline-block bg-[#AC1443] text-white px-6 py-2.5 rounded text-xs font-semibold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 1. Left Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-xl border border-[#EEDCD1] p-5 shadow-xs space-y-5">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#EEDCD1]">
              <div className="w-12 h-12 rounded-full bg-[#AC1443] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-[#2D141A] truncate">{user.fullName}</h3>
                <p className="text-[11px] text-[#74565D] truncate">{user.email}</p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-[10px] text-[#AC1443] font-semibold hover:underline mt-0.5 block"
                >
                  Edit Profile &gt;
                </button>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-[#AC1443] text-white shadow-xs'
                    : 'text-[#441C25] hover:bg-[#FAF2EB]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'orders'
                    ? 'bg-[#AC1443] text-white shadow-xs'
                    : 'text-[#441C25] hover:bg-[#FAF2EB]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </button>

              <Link
                to="/wishlist"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[#441C25] hover:bg-[#FAF2EB] transition-colors"
              >
                <Heart className="w-4 h-4 text-[#AC1443]" />
                <span>Wishlist ({wishlist.length})</span>
              </Link>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'addresses'
                    ? 'bg-[#AC1443] text-white shadow-xs'
                    : 'text-[#441C25] hover:bg-[#FAF2EB]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </button>

              <Link
                to="/track-order"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[#441C25] hover:bg-[#FAF2EB] transition-colors"
              >
                <Truck className="w-4 h-4 text-[#2F6923]" />
                <span>Track Order</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-rose-600 hover:bg-rose-50 transition-colors text-left pt-3 border-t border-[#F5EAE2]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Promo Card in Sidebar */}
            <div className="rounded-xl bg-[#FAF2EB] p-4 border border-[#DEC3B4] text-center space-y-1.5">
              <span className="text-xl">🐘</span>
              <h4 className="font-serif-royal font-bold text-xs text-[#2D141A]">
                Tradition Lives On Because of You
              </h4>
              <p className="text-[10px] text-[#74565D]">
                Every purchase sustains master Indian handloom weavers.
              </p>
            </div>
          </aside>

          {/* 2. Main Account Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-[#FAF2EB] rounded-xl border border-[#EEDCD1] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-royal text-xl sm:text-2xl font-bold text-[#2D141A]">
                  Welcome Back, {user.fullName}!
                </h1>
                <p className="text-xs text-[#74565D] mt-1">
                  Explore timeless collections, track your orders and manage your account with ease.
                </p>
              </div>
              <Link
                to="/shop"
                className="shrink-0 bg-[#AC1443] hover:bg-[#860E33] text-white text-xs px-4 py-2 rounded font-semibold transition-colors"
              >
                Explore Sarees
              </Link>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-white p-4 rounded-xl border border-[#EEDCD1] shadow-xs cursor-pointer hover:border-[#AC1443] transition-colors"
              >
                <div className="flex items-center justify-between text-[#AC1443]">
                  <Package className="w-5 h-5" />
                  <span className="text-xl font-bold">{orders.length}</span>
                </div>
                <h4 className="font-bold text-xs text-[#2D141A] mt-2">Total Orders</h4>
                <span className="text-[10px] text-[#AC1443] font-semibold flex items-center gap-0.5 mt-1">
                  View Orders →
                </span>
              </div>

              <Link
                to="/wishlist"
                className="bg-white p-4 rounded-xl border border-[#EEDCD1] shadow-xs hover:border-[#AC1443] transition-colors block"
              >
                <div className="flex items-center justify-between text-[#AC1443]">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="text-xl font-bold">{wishlist.length}</span>
                </div>
                <h4 className="font-bold text-xs text-[#2D141A] mt-2">Wishlist Items</h4>
                <span className="text-[10px] text-[#AC1443] font-semibold flex items-center gap-0.5 mt-1">
                  View Wishlist →
                </span>
              </Link>

              <div
                onClick={() => setActiveTab('addresses')}
                className="bg-white p-4 rounded-xl border border-[#EEDCD1] shadow-xs cursor-pointer hover:border-[#AC1443] transition-colors"
              >
                <div className="flex items-center justify-between text-[#C99632]">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xl font-bold">{addresses.length}</span>
                </div>
                <h4 className="font-bold text-xs text-[#2D141A] mt-2">Saved Addresses</h4>
                <span className="text-[10px] text-[#AC1443] font-semibold flex items-center gap-0.5 mt-1">
                  Manage Addresses →
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EEDCD1] shadow-xs">
                <div className="flex items-center justify-between text-[#2F6923]">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xl font-bold">1</span>
                </div>
                <h4 className="font-bold text-xs text-[#2D141A] mt-2">Payment Method</h4>
                <span className="text-[10px] text-[#74565D] mt-1 block">UPI Linked</span>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl border border-[#EEDCD1] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD1]">
                <h3 className="font-cinzel-royal font-bold text-sm text-[#2D141A] uppercase tracking-wider">
                  Recent Orders
                </h3>
                <span className="text-xs text-[#AC1443] font-semibold hover:underline cursor-pointer">
                  View All Orders →
                </span>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-[#EEDCD1] bg-[#FFF9F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ord.items[0]?.imageUrl || '/assets/products/kanjivaram_silk_saree.jpg'}
                        alt={ord.items[0]?.productTitle}
                        className="w-14 h-16 object-cover rounded border border-[#DEC3B4]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#2D141A]">
                            Order #{ord.orderNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.status === 'out_for_delivery' || ord.status === 'confirmed'
                                ? 'bg-[#D0E9C0] text-[#2F6923]'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#2D141A]">
                          {ord.items[0]?.productTitle}
                        </p>
                        <p className="text-[11px] text-[#74565D]">{ord.date}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="font-bold text-sm text-[#AC1443]">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to="/track-order"
                        className="bg-[#AC1443] hover:bg-[#860E33] text-white text-xs px-3.5 py-1.5 rounded font-semibold transition-colors"
                      >
                        Track Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <button
                onClick={() => setActiveTab('profile')}
                className="p-3 rounded-lg border border-[#DEC3B4] bg-white hover:bg-[#FAF2EB] transition-colors"
              >
                <User className="w-4 h-4 text-[#AC1443] mx-auto mb-1" />
                <span className="font-semibold block">Manage Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className="p-3 rounded-lg border border-[#DEC3B4] bg-white hover:bg-[#FAF2EB] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#AC1443] mx-auto mb-1" />
                <span className="font-semibold block">Saved Addresses</span>
              </button>
              <div className="p-3 rounded-lg border border-[#DEC3B4] bg-white hover:bg-[#FAF2EB] transition-colors cursor-pointer">
                <CreditCard className="w-4 h-4 text-[#AC1443] mx-auto mb-1" />
                <span className="font-semibold block">Payment Methods</span>
              </div>
              <div className="p-3 rounded-lg border border-[#DEC3B4] bg-white hover:bg-[#FAF2EB] transition-colors cursor-pointer">
                <Bell className="w-4 h-4 text-[#AC1443] mx-auto mb-1" />
                <span className="font-semibold block">Notifications</span>
              </div>
              <div className="p-3 rounded-lg border border-[#DEC3B4] bg-white hover:bg-[#FAF2EB] transition-colors cursor-pointer">
                <Gift className="w-4 h-4 text-[#AC1443] mx-auto mb-1" />
                <span className="font-semibold block">Refer & Earn</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
