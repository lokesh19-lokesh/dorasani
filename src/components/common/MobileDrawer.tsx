import React, { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X, ChevronRight, Package, Sparkles, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { WishlistIcon } from './WishlistIcon';
import { useStore } from '../../context/StoreContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_MOBILE_COLLECTIONS = [
  { name: 'Sarees', path: '/collections/sarees' },
  { name: 'Kurthis', path: '/collections/kurtis' },
  { name: 'Ethnic Wear', path: '/collections/ethnic-wear' },
  { name: 'Lehengas', path: '/collections/lehengas' },
  { name: 'Kids Wear', path: '/collections/kids-wear' },
  { name: 'Festive Collection', path: '/collections/festive' },
  { name: 'New Arrivals', path: '/collections/new-arrivals' },
  { name: 'Bestsellers', path: '/collections/bestsellers' },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, siteSettings, storeCategories } = useStore();

  const menuSections = useMemo(() => {
    const dynamicCollections =
      storeCategories.length > 0
        ? storeCategories.map((c) => ({
            name: c.name,
            path: `/collections/${c.slug}`,
          }))
        : DEFAULT_MOBILE_COLLECTIONS;

    return [
      { name: 'Home', path: '/' },
      { name: 'Shop All Collections', path: '/shop' },
      ...dynamicCollections,
      { name: 'Mythology & Heritage', path: '/heritage' },
      { name: 'About DORASANI', path: '/about' },
      { name: 'Contact & Support', path: '/contact' },
    ];
  }, [storeCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#FAF5EE] h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[#D8C7B5] flex items-center justify-between bg-[#F5EFE6]">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="DORASANI"
              width={1842}
              height={854}
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#4F6355] hover:text-[#285A3C]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-[#D0E9C0]/35 border-b border-[#BCD8AA] space-y-3">
          {user ? (
            <>
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#285A3C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#1A3B2B] truncate">
                      {user.fullName}
                    </p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#18482C] text-white text-[9px] font-bold uppercase shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#285A3C] font-medium">View Account & Orders →</p>
                </div>
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-[#18482C] hover:bg-[#113520] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Admin Dashboard</span>
                </Link>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1A3B2B]">Welcome Guest</p>
                <p className="text-[11px] text-[#4F6355]">Sign in for exclusive offers</p>
              </div>
              <Link
                to="/login"
                onClick={onClose}
                className="bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs px-3.5 py-1.5 rounded-md font-medium"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Mobile" className="flex-1 py-2">
          {menuSections.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-3 text-sm transition-colors border-b border-[#E8DCCF] ${
                  isActive
                    ? 'text-[#285A3C] font-bold bg-[#D0E9C0]/30 border-l-4 border-l-[#285A3C]'
                    : 'text-[#1A3B2B] hover:text-[#285A3C] hover:bg-[#FAF5EE]'
                }`
              }
            >
              <span>{item.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        {/* Quick Utility Section */}
        <div className="p-4 bg-[#F5EFE6] border-t border-[#D8C7B5] space-y-2 text-xs">
          <Link
            to="/track-order"
            onClick={onClose}
            className="flex items-center gap-2 text-[#1A3B2B] hover:text-[#285A3C] py-1"
          >
            <Package className="w-4 h-4 text-[#285A3C]" />
            <span>Track Your Order</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center gap-2 text-[#1A3B2B] hover:text-[#285A3C] py-1"
          >
            <WishlistIcon className="w-4 h-4 text-[#285A3C]" />
            <span>My Wishlist</span>
          </Link>
          <Link
            to="/heritage"
            onClick={onClose}
            className="flex items-center gap-2 text-[#1A3B2B] hover:text-[#285A3C] py-1"
          >
            <Sparkles className="w-4 h-4 text-[#C99632]" />
            <span>Temple Art & Heritage</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="p-4 text-center text-[10px] text-[#4F6355] bg-[#FAF5EE]">
          <p>{siteSettings.footerCopyright}</p>
          <p className="text-[#285A3C] font-medium mt-0.5">
            Free Pan-India Shipping Above ₹
            {siteSettings.freeShippingThreshold.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
};
