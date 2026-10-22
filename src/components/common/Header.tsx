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
      <header className="bg-[#FAF5EE] border-b border-[#E8DCCF] sticky top-0 z-30 transition-all duration-200 relative w-full overflow-hidden">
        {/* Subtle Heritage Architectural & Garland Artwork at the Edges */}
        <div className="absolute left-0 top-0 bottom-0 pointer-events-none select-none z-0 hidden md:block">
          <img
            src="/assets/brand/header_left_decor_2x.png"
            alt=""
            className="h-full w-auto object-cover object-left opacity-90"
          />
        </div>
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none select-none z-0 hidden xl:block opacity-60">
          <img
            src="/assets/brand/header_right_decor_2x.png"
            alt=""
            className="h-full w-auto object-cover object-right"
          />
        </div>

        {/* 3-Column Balanced Layout - Logo centered independently of left and right content widths */}
        <div className="w-full px-3 sm:px-8 lg:px-12 py-2.5 sm:py-3.5 relative z-10">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center">
            {/* Left Column: Mobile Hamburger or Desktop Decorative Space */}
            <div className="flex items-center">
              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-[#18482C] hover:text-[#113520] transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Decorative Area (artwork shows through naturally) */}
              <div className="hidden lg:block h-6" />
            </div>

            {/* Center Column: Perfectly Centered DORASANI Brand Logo */}
            <div className="relative flex items-center justify-center">
              {/* Subtle Temple Skyline Sketch in Header Background (Desktop Only) */}
              <div className="absolute inset-0 pointer-events-none hidden sm:flex items-center justify-center opacity-25 select-none overflow-hidden">
                <img
                  src="/assets/brand/temple_skyline_transparent.png"
                  alt=""
                  className="h-16 w-auto max-w-[280px] sm:max-w-[340px] object-contain"
                />
              </div>

              <Link
                to="/"
                className="flex items-center justify-center py-0.5 relative z-10 group transition-transform duration-300 hover:scale-102"
              >
                <img
                  src="/assets/brand/dorasani_full_logo.png"
                  alt="DORASANI - Where Heritage Meets Divine Elegance"
                  className="h-9 sm:h-12 md:h-13 lg:h-14 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right Column: Search field, Account, Wishlist, and Shopping Bag */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-5 justify-end">
              {/* Desktop Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex items-center relative w-48 xl:w-56"
              >
                <input
                  type="text"
                  placeholder="Search for sarees, lehengas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#D8C7B5] rounded-full py-1.5 pl-8 pr-3 text-xs text-[#18482C] placeholder:text-[#8E9B92] focus:outline-none focus:border-[#18482C] focus:ring-1 focus:ring-[#18482C] transition-all shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-[#647268] absolute left-3 pointer-events-none" />
              </form>

              {/* Mobile Search Icon Toggle */}
              <button
                onClick={() => setIsSearchExpandedMobile(!isSearchExpandedMobile)}
                className="lg:hidden p-1.5 text-[#18482C] hover:text-[#113520] transition-colors"
                aria-label="Toggle Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Link (Desktop Only, available in bottom bar on mobile) */}
              <Link
                to={user ? '/account' : '/login'}
                className="hidden sm:flex flex-col items-center p-1 text-[#18482C] hover:text-[#113520] transition-colors"
                title={user ? `Signed in as ${user.fullName}` : 'Login / Register'}
              >
                <User className="w-5 h-5 stroke-[1.7]" />
                <span className="hidden lg:inline text-[10px] font-medium tracking-wider mt-0.5">
                  Account
                </span>
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="flex flex-col items-center p-1 text-[#18482C] hover:text-[#113520] transition-colors relative"
                title="View Wishlist"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 stroke-[1.7]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
                className="flex flex-col items-center p-1 text-[#18482C] hover:text-[#113520] transition-colors relative"
                title="View Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
            <div className="lg:hidden mt-2.5 pt-2.5 border-t border-[#E8DCCF]">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for sarees, lehengas, silk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-[#D8C7B5] rounded-full py-2 pl-9 pr-10 text-sm text-[#18482C] focus:outline-none focus:border-[#18482C]"
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
