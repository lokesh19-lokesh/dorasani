import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MobileDrawer } from './MobileDrawer';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpandedMobile, setIsSearchExpandedMobile] = useState(false);

  const { cartCount, wishlistCount, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpandedMobile(false);
    }
  };

  return (
    <>
      <header className="bg-[#FAF5EE] border-b border-[#E8DCCF] sticky top-0 z-30 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#1A3B2B] hover:text-[#285A3C] transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Left Spacer for perfect center alignment */}
            <div className="hidden lg:block w-72" />

            {/* Brand Logo (Center) */}
            <Link
              to="/"
              className="flex flex-col items-center group cursor-pointer text-center py-0.5"
            >
              {/* Lotus Emblem */}
              <div className="w-7 h-6 sm:w-8 sm:h-7 mb-1 transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/assets/brand/lotus_mark_green.png"
                  alt="DORASANI Lotus"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.src = '/assets/brand/lotus_mark_green.png';
                  }}
                />
              </div>

              {/* Brand Wordmark */}
              <span className="font-cinzel-royal text-2xl sm:text-3xl font-bold tracking-[0.22em] text-[#1A3B2B] leading-none uppercase group-hover:text-[#285A3C] transition-colors">
                DORASANI
              </span>

              {/* Brand Tagline */}
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#647268] mt-1 font-medium">
                Where Heritage Meets Divine Elegance
              </span>
            </Link>

            {/* Right Controls: Search, Account, Wishlist, Bag */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:w-72 justify-end">
              {/* Desktop Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex items-center relative w-56 xl:w-64"
              >
                <input
                  type="text"
                  placeholder="Search for sarees, lehengas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D8C7B5] rounded-full py-1.5 pl-8 pr-4 text-xs text-[#1A3B2B] placeholder:text-[#8E9B92] focus:outline-none focus:border-[#285A3C] focus:ring-1 focus:ring-[#285A3C] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-[#647268] absolute left-3 pointer-events-none" />
              </form>

              {/* Mobile Search Icon Toggle */}
              <button
                onClick={() => setIsSearchExpandedMobile(!isSearchExpandedMobile)}
                className="lg:hidden p-2 text-[#1A3B2B] hover:text-[#285A3C] transition-colors"
                aria-label="Toggle Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Link */}
              <Link
                to={user ? '/account' : '/login'}
                className="flex flex-col items-center p-1.5 text-[#1A3B2B] hover:text-[#285A3C] transition-colors"
                title={user ? `Signed in as ${user.fullName}` : 'Login / Register'}
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-[10px] font-medium tracking-wider mt-0.5">
                  Account
                </span>
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="flex flex-col items-center p-1.5 text-[#1A3B2B] hover:text-[#285A3C] transition-colors relative"
                title="View Wishlist"
              >
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#285A3C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-[10px] font-medium tracking-wider mt-0.5">
                  Wishlist
                </span>
              </Link>

              {/* Bag (Cart) Button */}
              <button
                onClick={onOpenCart}
                className="flex flex-col items-center p-1.5 text-[#1A3B2B] hover:text-[#285A3C] transition-colors relative"
                title="View Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#285A3C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-[10px] font-medium tracking-wider mt-0.5">
                  Bag
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Expandable Search Bar */}
          {isSearchExpandedMobile && (
            <div className="lg:hidden mt-3 pt-3 border-t border-[#E8DCCF]">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for sarees, lehengas, silk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#FFFFFF] border border-[#D8C7B5] rounded-full py-2 pl-9 pr-10 text-sm text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
                <Search className="w-4 h-4 text-[#647268] absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setIsSearchExpandedMobile(false)}
                  className="absolute right-3 p-1 text-[#647268]"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
