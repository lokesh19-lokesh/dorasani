import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  MapPin,
  CreditCard,
  User,
  Bell,
  Gift,
  LogOut,
  Truck,
  LayoutDashboard,
  ShieldCheck,
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { WishlistIcon } from '../components/common/WishlistIcon';
import { OptimizedPicture } from '../components/common/OptimizedPicture';
import { useStore } from '../context/StoreContext';
import { authService } from '../services/authService';
import { SeoHead } from '../components/common/SeoHead';

export const AccountPage: React.FC = () => {
  const {
    user,
    authLoading,
    passwordRecoveryPending,
    clearPasswordRecovery,
    logout,
    updateProfile,
    orders,
    wishlist,
    addresses,
    siteSettings,
    showToast,
  } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'profile'>(
    actionParam === 'reset-password' || actionParam === 'email-updated' || passwordRecoveryPending
      ? 'profile'
      : 'dashboard'
  );

  // Editable Profile State
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(user?.whatsappOptIn ?? true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccessNotice, setPasswordSuccessNotice] = useState<string | null>(null);

  // Email Change State
  const [newEmailInput, setNewEmailInput] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailChangeNotice, setEmailChangeNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
      setWhatsappOptIn(user.whatsappOptIn ?? true);
    }
  }, [user]);

  useEffect(() => {
    if (actionParam === 'reset-password' || actionParam === 'email-updated' || passwordRecoveryPending) {
      setActiveTab('profile');
    }
  }, [actionParam, passwordRecoveryPending]);

  if (authLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <SeoHead
          title="My Account | DORASANI"
          description="Manage your DORASANI orders, saved addresses, and account profile."
          canonicalPath="/account"
          robots="noindex, nofollow"
        />
        <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#4F6355]">Loading your DORASANI account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <SeoHead
          title="Sign In to Account | DORASANI"
          description="Sign in to view your DORASANI orders, saved addresses, and profile."
          canonicalPath="/account"
          robots="noindex, nofollow"
        />
        <h1 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">You are not signed in</h1>
        <p className="text-xs text-[#4F6355] mt-2">
          Sign in to view your orders, addresses and profile.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block bg-[#285A3C] hover:bg-[#1E432D] text-white px-6 py-2.5 rounded text-xs font-semibold shadow-xs transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: profileName.trim(),
        phone: profilePhone.trim(),
        whatsappOptIn,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    setUpdatingPassword(true);
    setPasswordSuccessNotice(null);
    try {
      const res = await authService.updatePassword(newPassword);
      if (res.success) {
        setNewPassword('');
        clearPasswordRecovery();
        setPasswordSuccessNotice('Your password has been updated cleanly.');
        showToast('Password updated successfully!');
      } else {
        showToast(res.error || 'Could not update password.', 'error');
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newEmailInput.trim().toLowerCase();
    if (!cleaned || cleaned === user.email.toLowerCase()) {
      showToast('Please enter a different valid email address.', 'error');
      return;
    }
    setUpdatingEmail(true);
    setEmailChangeNotice(null);
    try {
      const res = await authService.updateEmail(cleaned);
      if (res.success) {
        setEmailChangeNotice(
          `Confirmation link sent to ${cleaned}. Open the verification email to complete updating your login email.`
        );
        setNewEmailInput('');
        showToast('Email verification sent!');
      } else {
        showToast(res.error || 'Could not request email update.', 'error');
      }
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 pb-16 pt-6">
      <SeoHead
        title="My Account | DORASANI"
        description="Manage your DORASANI orders, saved addresses, wishlist, and account profile."
        canonicalPath="/account"
        robots="noindex, nofollow"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 1. Left Sidebar Navigation */}
          <aside aria-label="Account menu" className="lg:col-span-3 bg-white rounded-xl border border-[#D8C7B5] p-5 shadow-xs space-y-5">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8DCCF]">
              <div className="w-12 h-12 rounded-full bg-[#285A3C] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm text-[#1A3B2B] truncate">{user.fullName}</p>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#18482C] text-white text-[9px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {(user.role || 'admin').replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#4F6355] truncate">{user.email}</p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-[10px] text-[#285A3C] font-semibold hover:underline mt-0.5 block"
                >
                  Edit Profile &gt;
                </button>
              </div>
            </div>

            {/* Admin Suite Shortcut */}
            {user.isAdmin && (
              <Link
                to="/admin"
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#18482C] hover:bg-[#113520] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </Link>
            )}

            {/* Nav Menu */}
            <nav aria-label="Account" className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-[#285A3C] text-white shadow-xs'
                    : 'text-[#1A3B2B] hover:bg-[#FAF5EE]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'orders'
                    ? 'bg-[#285A3C] text-white shadow-xs'
                    : 'text-[#1A3B2B] hover:bg-[#FAF5EE]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </button>

              <Link
                to="/wishlist"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[#1A3B2B] hover:bg-[#FAF5EE] transition-colors"
              >
                <WishlistIcon className="w-4 h-4 text-[#285A3C]" />
                <span>Wishlist ({wishlist.length})</span>
              </Link>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-left ${
                  activeTab === 'addresses'
                    ? 'bg-[#285A3C] text-white shadow-xs'
                    : 'text-[#1A3B2B] hover:bg-[#FAF5EE]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses ({addresses.length})</span>
              </button>

              <Link
                to="/track-order"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[#1A3B2B] hover:bg-[#FAF5EE] transition-colors"
              >
                <Truck className="w-4 h-4 text-[#285A3C]" />
                <span>Track Order</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-rose-600 hover:bg-rose-50 transition-colors text-left pt-3 border-t border-[#E8DCCF]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>

            {/* Promo Card in Sidebar */}
            <div className="rounded-xl bg-[#D0E9C0]/40 p-4 border border-[#BCD8AA] text-center space-y-1.5">
              <span className="text-xl" aria-hidden="true">🐘</span>
              <p className="font-serif-royal font-bold text-xs text-[#1A3B2B]">
                Tradition Lives On Because of You
              </p>
              <p className="text-[10px] text-[#4F6355]">
                Every purchase sustains master Indian handloom weavers.
              </p>
            </div>
          </aside>

          {/* 2. Main Account Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-[#D0E9C0]/40 rounded-xl border border-[#BCD8AA] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif-royal text-xl sm:text-2xl font-bold text-[#1A3B2B]">
                    Welcome Back, {user.fullName}!
                  </h1>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#18482C] text-white text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Administrator
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4F6355] mt-1">
                  {user.isAdmin
                    ? 'You have full administrator privileges. Switch between the Admin Dashboard and Storefront UI anytime.'
                    : 'Explore timeless collections, track your orders and manage your account with ease.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 bg-[#18482C] hover:bg-[#113520] text-white text-xs px-4 py-2 rounded font-bold transition-colors shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to={user.isAdmin ? '/' : '/shop'}
                  className="inline-flex items-center gap-1.5 bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs px-4 py-2 rounded font-semibold transition-colors shadow-xs"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{user.isAdmin ? 'User Interface' : 'Explore Sarees'}</span>
                </Link>
              </div>
            </div>

            {activeTab === 'dashboard' && (
              <>
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white p-4 rounded-xl border border-[#D8C7B5] shadow-xs cursor-pointer hover:border-[#285A3C] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[#285A3C]">
                      <Package className="w-5 h-5" />
                      <span className="text-xl font-bold">{orders.length}</span>
                    </div>
                    <h2 className="font-bold text-xs text-[#1A3B2B] mt-2">Total Orders</h2>
                    <span className="text-[10px] text-[#285A3C] font-semibold flex items-center gap-0.5 mt-1">
                      View Orders →
                    </span>
                  </div>

                  <Link
                    to="/wishlist"
                    className="bg-white p-4 rounded-xl border border-[#D8C7B5] shadow-xs hover:border-[#285A3C] transition-colors block"
                  >
                    <div className="flex items-center justify-between text-[#285A3C]">
                      <WishlistIcon className="w-5 h-5" filled={true} />
                      <span className="text-xl font-bold">{wishlist.length}</span>
                    </div>
                    <h2 className="font-bold text-xs text-[#1A3B2B] mt-2">Wishlist Items</h2>
                    <span className="text-[10px] text-[#285A3C] font-semibold flex items-center gap-0.5 mt-1">
                      View Wishlist →
                    </span>
                  </Link>

                  <div
                    onClick={() => setActiveTab('addresses')}
                    className="bg-white p-4 rounded-xl border border-[#D8C7B5] shadow-xs cursor-pointer hover:border-[#285A3C] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[#285A3C]">
                      <MapPin className="w-5 h-5" />
                      <span className="text-xl font-bold">{addresses.length}</span>
                    </div>
                    <h2 className="font-bold text-xs text-[#1A3B2B] mt-2">Saved Addresses</h2>
                    <span className="text-[10px] text-[#285A3C] font-semibold flex items-center gap-0.5 mt-1">
                      Manage Addresses →
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#D8C7B5] shadow-xs">
                    <div className="flex items-center justify-between text-[#285A3C]">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xl font-bold">UPI</span>
                    </div>
                    <h2 className="font-bold text-xs text-[#1A3B2B] mt-2">Payment Methods</h2>
                    <span className="text-[10px] text-[#4F6355] mt-1 block">
                      {siteSettings.codEnabled ? 'Cards, UPI & COD' : 'UPI, Cards & Net Banking'}
                    </span>
                  </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DCCF]">
                    <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#285A3C] font-semibold hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#4F6355] space-y-3">
                      <p>You have not placed any orders yet.</p>
                      <Link
                        to="/shop"
                        className="inline-block bg-[#285A3C] hover:bg-[#1E432D] text-white px-4 py-2 rounded font-semibold"
                      >
                        Browse Collections
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <OptimizedPicture
                              src={ord.items[0]?.imageUrl || '/assets/products/kanjivaram_silk_saree.jpg'}
                              alt={ord.items[0]?.productTitle || 'Order Item'}
                              sizes="64px"
                              loading="lazy"
                              pictureClassName="shrink-0 block"
                              className="w-14 h-16 object-cover rounded border border-[#D8C7B5]"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-[#1A3B2B]">
                                  Order #{ord.orderNumber}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                    ord.status === 'out_for_delivery' || ord.status === 'confirmed' || ord.status === 'delivered'
                                      ? 'bg-[#D0E9C0] text-[#1A3B2B]'
                                      : ord.status === 'cancelled' || ord.status === 'refunded'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {ord.status.replace(/_/g, ' ')}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                    ord.paymentStatus === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.paymentStatus === 'failed'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {ord.paymentMethod} • {ord.paymentStatus}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-[#1A3B2B]">
                                {ord.items[0]?.productTitle}
                              </p>
                              <p className="text-[11px] text-[#4F6355]">
                                {ord.date}
                                {ord.paymentDetails?.paymentId ? ` • Ref: ${ord.paymentDetails.paymentId}` : ''}
                              </p>
                              {(ord.courierPartner || ord.trackingId) && (
                                <p className="text-[11px] text-[#285A3C] font-semibold">
                                  {ord.courierPartner || 'Delhivery One'}
                                  {ord.trackingId ? ` • AWB: ${ord.trackingId}` : ''}
                                  {ord.shipment?.currentStatus && !ord.shipment.cancelledAt
                                    ? ` (${ord.shipment.currentStatus})`
                                    : ''}
                                </p>
                              )}
                              {(ord.status === 'cancelled' || (ord.refunds && ord.refunds.length > 0)) && (
                                <div className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 text-[11px] text-rose-900 space-y-0.5">
                                  {ord.status === 'cancelled' && (
                                    <p className="font-medium">
                                      {ord.cancellationReason
                                        ? `Cancelled by DORASANI: ${ord.cancellationReason}`
                                        : 'Cancelled by DORASANI — we sincerely apologize for the inconvenience.'}
                                    </p>
                                  )}
                                  {ord.refunds && ord.refunds.length > 0 && (
                                    <p className="font-semibold text-[#1A3B2B]">
                                      Refund ₹{ord.refunds[0].amountInr.toLocaleString('en-IN')} ({ord.refunds[0].status})
                                      {ord.refunds[0].refundReference ? (
                                        <span className="font-mono text-rose-800">
                                          {' '}• Ref ID: {ord.refunds[0].refundReference}
                                        </span>
                                      ) : null}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                            <span className="font-bold text-sm text-[#285A3C]">
                              ₹{ord.total.toLocaleString('en-IN')}
                            </span>
                            <Link
                              to={`/track-order/${ord.orderNumber}`}
                              className="bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs px-3.5 py-1.5 rounded font-semibold transition-colors shadow-xs"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-3 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#285A3C] mx-auto mb-1" />
                    <span className="font-semibold block text-[#1A3B2B]">Manage Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="p-3 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#285A3C] mx-auto mb-1" />
                    <span className="font-semibold block text-[#1A3B2B]">Saved Addresses</span>
                  </button>
                  <Link
                    to="/track-order"
                    className="p-3 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] transition-colors block"
                  >
                    <Truck className="w-4 h-4 text-[#285A3C] mx-auto mb-1" />
                    <span className="font-semibold block text-[#1A3B2B]">Track Orders</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="p-3 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] transition-colors block"
                  >
                    <Bell className="w-4 h-4 text-[#285A3C] mx-auto mb-1" />
                    <span className="font-semibold block text-[#1A3B2B]">Saved Items</span>
                  </Link>
                  <Link
                    to="/shop"
                    className="p-3 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] transition-colors block"
                  >
                    <Gift className="w-4 h-4 text-[#285A3C] mx-auto mb-1" />
                    <span className="font-semibold block text-[#1A3B2B]">New Collections</span>
                  </Link>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider pb-3 border-b border-[#E8DCCF]">
                  All Orders ({orders.length})
                </h2>
                {orders.length === 0 ? (
                  <p className="text-xs text-[#4F6355] py-6 text-center">No orders found for your account.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <OptimizedPicture
                            src={ord.items[0]?.imageUrl || '/assets/products/kanjivaram_silk_saree.jpg'}
                            alt={ord.items[0]?.productTitle || 'Order Item'}
                            sizes="64px"
                            loading="lazy"
                            pictureClassName="shrink-0 block"
                            className="w-14 h-16 object-cover rounded border border-[#D8C7B5]"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-[#1A3B2B]">
                                Order #{ord.orderNumber}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  ord.status === 'out_for_delivery' || ord.status === 'confirmed' || ord.status === 'delivered'
                                    ? 'bg-[#D0E9C0] text-[#1A3B2B]'
                                    : ord.status === 'cancelled' || ord.status === 'refunded'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {ord.status.replace(/_/g, ' ')}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.paymentStatus === 'failed'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.paymentMethod} • {ord.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-[#4F6355]">
                              {ord.items.map((i) => i.productTitle).join(', ')}
                            </p>
                            <p className="text-[11px] text-[#4F6355]">
                              {ord.date}
                              {ord.paymentDetails?.paymentId ? ` • Razorpay: ${ord.paymentDetails.paymentId}` : ''}
                            </p>
                            {(ord.courierPartner || ord.trackingId) && (
                              <p className="text-[11px] text-[#285A3C] font-semibold">
                                {ord.courierPartner || 'Delhivery One'}
                                {ord.trackingId ? ` • AWB: ${ord.trackingId}` : ''}
                                {ord.shipment?.currentStatus && !ord.shipment.cancelledAt
                                  ? ` (${ord.shipment.currentStatus})`
                                  : ''}
                              </p>
                            )}
                            {(ord.status === 'cancelled' || (ord.refunds && ord.refunds.length > 0)) && (
                              <div className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 text-[11px] text-rose-900 space-y-0.5">
                                {ord.status === 'cancelled' && (
                                  <p className="font-medium">
                                    {ord.cancellationReason
                                      ? `Cancelled by DORASANI: ${ord.cancellationReason}`
                                      : 'Cancelled by DORASANI — we sincerely apologize for the inconvenience.'}
                                  </p>
                                )}
                                {ord.refunds && ord.refunds.length > 0 && (
                                  <p className="font-semibold text-[#1A3B2B]">
                                    Refund ₹{ord.refunds[0].amountInr.toLocaleString('en-IN')} ({ord.refunds[0].status})
                                    {ord.refunds[0].refundReference ? (
                                      <span className="font-mono text-rose-800">
                                        {' '}• Ref ID: {ord.refunds[0].refundReference}
                                      </span>
                                    ) : null}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-[#285A3C]">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                          <Link
                            to={`/track-order/${ord.orderNumber}`}
                            className="bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs px-3 py-1.5 rounded font-semibold"
                          >
                            Track
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider pb-3 border-b border-[#E8DCCF]">
                  Saved Addresses ({addresses.length})
                </h2>
                {addresses.length === 0 ? (
                  <p className="text-xs text-[#4F6355] py-6 text-center">
                    No saved addresses yet. Your shipping address will be saved automatically during checkout.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#D0E9C0] text-[#1A3B2B] font-bold text-[10px] uppercase">
                          {addr.addressType}
                        </span>
                        <p className="font-bold text-[#1A3B2B] pt-1">{addr.fullName}</p>
                        <p className="text-[#4F6355]">{addr.streetAddress}</p>
                        <p className="text-[#4F6355]">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[#4F6355]">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4 text-xs"
                >
                  <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider pb-2 border-b border-[#E8DCCF]">
                    Profile Details
                  </h2>
                  <div>
                    <label htmlFor="profile-email" className="block font-semibold text-[#1A3B2B] mb-1">
                      Account Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-gray-100 border border-[#D8C7B5] rounded py-2 px-3 text-[#4F6355]"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-name" className="block font-semibold text-[#1A3B2B] mb-1">
                      Full Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 px-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="block font-semibold text-[#1A3B2B] mb-1">
                      Phone Number
                    </label>
                    <input
                      id="profile-phone"
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 px-3 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-[#4F6355]">
                    <input
                      type="checkbox"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="accent-[#285A3C] rounded"
                    />
                    <span>Receive WhatsApp order & new arrival updates</span>
                  </label>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white px-5 py-2.5 rounded font-bold transition-colors"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                <div className="space-y-6">
                  <form
                    onSubmit={handleUpdatePassword}
                    className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4 text-xs"
                  >
                    <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider pb-2 border-b border-[#E8DCCF] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#285A3C]" />
                      <span>Change Password</span>
                    </h2>

                    {(actionParam === 'reset-password' || passwordRecoveryPending) && (
                      <div className="p-3 rounded-lg bg-[#D0E9C0]/50 border border-[#BCD8AA] text-[#113520] font-medium">
                        Your verification link is confirmed. Enter and save your new password below.
                      </div>
                    )}

                    {passwordSuccessNotice && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        <span>{passwordSuccessNotice}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="new-account-password" className="block font-semibold text-[#1A3B2B] mb-1">
                        New Password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="new-account-password"
                          name="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          minLength={6}
                          required
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 pl-3 pr-9 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-pressed={showNewPassword}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-2.5 p-1 text-[#4F6355] hover:text-[#285A3C]"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white px-5 py-2.5 rounded font-bold transition-colors"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>

                  <form
                    onSubmit={handleUpdateEmail}
                    className="bg-white rounded-xl border border-[#D8C7B5] p-5 sm:p-6 shadow-xs space-y-4 text-xs"
                  >
                    <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] uppercase tracking-wider pb-2 border-b border-[#E8DCCF] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#285A3C]" />
                      <span>Change Email Address</span>
                    </h2>

                    {actionParam === 'email-updated' && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        <span>Email address update confirmed and synchronized.</span>
                      </div>
                    )}

                    {emailChangeNotice && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium leading-relaxed">
                        {emailChangeNotice}
                      </div>
                    )}

                    <div>
                      <label htmlFor="new-account-email" className="block font-semibold text-[#1A3B2B] mb-1">
                        New Email Address
                      </label>
                      <input
                        id="new-account-email"
                        name="newEmail"
                        type="email"
                        spellCheck={false}
                        required
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="newemail@example.com"
                        className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded py-2 px-3 text-base sm:text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingEmail}
                      className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white px-5 py-2.5 rounded font-bold transition-colors"
                    >
                      {updatingEmail ? 'Sending Verification...' : 'Send Email Change Link'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
