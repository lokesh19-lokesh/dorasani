import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X, ChevronRight, User, Package, Heart, Sparkles, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_SECTIONS = [
  { name: 'Home', path: '/' },
  { name: 'Shop All Collections', path: '/shop' },
  { name: 'Sarees Collection', path: '/collections/sarees' },
  { name: 'Ethnic Wear', path: '/collections/ethnic-wear' },
  { name: 'Lehengas Collection', path: '/collections/lehengas' },
  { name: 'Festive Collection', path: '/collections/festive' },
  { name: 'New Arrivals', path: '/collections/new-arrivals' },
  { name: 'Our Bestsellers', path: '/collections/bestsellers' },
  { name: 'Mythology & Heritage', path: '/heritage' },
  { name: 'About DORASANI', path: '/about' },
  { name: 'Contact & Support', path: '/contact' },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#FFF9F5] h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[#EEDCD1] flex items-center justify-between bg-[#FDF4EC]">
          <div className="flex items-center space-x-2">
            <img
              src="/assets/brand/lotus_mark.png"
              alt="Lotus"
              className="w-5 h-5 object-contain"
            />
            <span className="font-cinzel-royal text-lg font-bold text-[#AC1443] tracking-widest">
              DORASANI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#74565D] hover:text-[#AC1443]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-[#FBE5EB]/50 border-b border-[#EEDCD1]">
          {user ? (
            <Link
              to="/account"
              onClick={onClose}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#AC1443] text-white flex items-center justify-center font-bold text-sm">
                {user.fullName.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-[#2D141A]">
                  {user.fullName}
                </p>
                <p className="text-xs text-[#AC1443]">View Account & Orders →</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#2D141A]">Welcome Guest</p>
                <p className="text-[11px] text-[#74565D]">Sign in for exclusive offers</p>
              </div>
              <Link
                to="/login"
                onClick={onClose}
                className="bg-[#AC1443] text-white text-xs px-3 py-1.5 rounded-md font-medium"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-2">
          {MENU_SECTIONS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-3 text-sm transition-colors border-b border-[#F7EBE3] ${
                  isActive
                    ? 'text-[#AC1443] font-semibold bg-[#FDF2F4]'
                    : 'text-[#3A1821] hover:text-[#AC1443] hover:bg-[#FAF0E6]'
                }`
              }
            >
              <span>{item.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}
        </div>

        {/* Quick Utility Section */}
        <div className="p-4 bg-[#FDF4EC] border-t border-[#EEDCD1] space-y-2 text-xs">
          <Link
            to="/track-order"
            onClick={onClose}
            className="flex items-center gap-2 text-[#441C25] hover:text-[#AC1443] py-1"
          >
            <Package className="w-4 h-4 text-[#AC1443]" />
            <span>Track Your Order</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center gap-2 text-[#441C25] hover:text-[#AC1443] py-1"
          >
            <Heart className="w-4 h-4 text-[#AC1443]" />
            <span>My Wishlist</span>
          </Link>
          <Link
            to="/heritage"
            onClick={onClose}
            className="flex items-center gap-2 text-[#441C25] hover:text-[#AC1443] py-1"
          >
            <Sparkles className="w-4 h-4 text-[#C99632]" />
            <span>Temple Art & Heritage</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="p-4 text-center text-[10px] text-[#74565D] bg-[#FFF9F5]">
          <p>© 2024 DORASANI Luxury Fashion</p>
          <p className="text-[#AC1443] font-medium mt-0.5">Pan India Delivery</p>
        </div>
      </div>
    </div>
  );
};
