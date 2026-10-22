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
      <header className="bg-[#FAF5EE] lg:bg-transparent transition-all duration-200 relative z-10 w-full overflow-hidden">
        {/* 3-Column Balanced Layout - Content constrained within clear center area */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-20 py-2.5 sm:py-3.5 relative z-10">
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

              {/* Desktop Decorative Area */}
              <div className="hidden lg:block h-6" />
            </div>

            {/* Center Column: Perfectly Centered DORASANI Brand Logo */}
            <div className="relative flex items-center justify-center">
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
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 justify-end">
              {/* Desktop Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex items-center relative w-44 xl:w-52"
              >
                <input
                  type="text"
                  placeholder="Search sarees, lehengas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF5EE]/90 hover:bg-white focus:bg-white border border-[#D8C7B5] rounded-full py-1.5 pl-8 pr-3 text-xs text-[#18482C] placeholder:text-[#647268] focus:outline-none focus:border-[#18482C] focus:ring-1 focus:ring-[#18482C] transition-all shadow-xs backdrop-blur-xs font-medium"
                />
                <Search className="w-3.5 h-3.5 text-[#18482C] absolute left-3 pointer-events-none" />
              </form>

              {/* Mobile Search Icon Toggle */}
              <button
                onClick={() => setIsSearchExpandedMobile(!isSearchExpandedMobile)}
                className="lg:hidden p-1.5 text-[#18482C] hover:text-[#113520] transition-colors"
                aria-label="Toggle Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Desktop Account, Wishlist, Bag Action Group */}
              <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 bg-[#FAF5EE]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#D8C7B5] shadow-xs">
                {/* Account Link */}
                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center gap-1.5 px-2 py-1 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70"
                  title={user ? `Signed in as ${user.fullName}` : 'Login / Register'}
                >
                  <User className="w-4 h-4 stroke-[2]" />
                  <span className="hidden xl:inline text-[11px] font-semibold tracking-wider">
                    {user ? 'Account' : 'Login'}
                  </span>
                </Link>

                <span className="text-[#18482C]/25 text-xs">|</span>

                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="flex items-center gap-1.5 px-2 py-1 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70 relative"
                  title="View Wishlist"
                >
                  <div className="relative">
                    <Heart className="w-4 h-4 stroke-[2]" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline text-[11px] font-semibold tracking-wider">
                    Wishlist
                  </span>
                </Link>

                <span className="text-[#18482C]/25 text-xs">|</span>

                {/* Bag (Cart) Button */}
                <button
                  onClick={onOpenCart}
                  className="flex items-center gap-1.5 px-2 py-1 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70 relative"
                  title="View Shopping Bag"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline text-[11px] font-semibold tracking-wider">
                    Bag
                  </span>
                </button>
              </div>

              {/* Mobile Wishlist & Cart Icons */}
              <div className="sm:hidden flex items-center space-x-1">
                <Link
                  to="/wishlist"
                  className="p-1.5 text-[#18482C] relative"
                  title="View Wishlist"
                >
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                  {wishlistCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0 bg-[#18482C] text-white text-[8.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={onOpenCart}
                  className="p-1.5 text-[#18482C] relative"
                  title="View Shopping Bag"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                  {cartCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0 bg-[#18482C] text-white text-[8.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
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
