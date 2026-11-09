import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ShieldCheck } from 'lucide-react';
import { WishlistIcon } from './WishlistIcon';
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
      <header className="bg-transparent transition-all duration-200 relative z-10 w-full overflow-hidden">
        {/* Main Balanced Navbar Header */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-2.5 relative z-10">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Mobile Hamburger & DORASANI Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-[#113520] hover:text-[#06180c] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>

              <Link
                to="/"
                className="flex items-center py-0.5 group transition-transform duration-300 hover:scale-102"
              >
                <img
                  src="/assets/logo.png"
                  alt="DORASANI — A Symbol of Tradition"
                  width={1842}
                  height={854}
                  className="h-11 sm:h-13 md:h-14 lg:h-15 xl:h-16 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center: Desktop Search Bar (Generous width, perfectly centered) */}
            <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-auto">
              <search className="w-full">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative w-full flex items-center"
                >
                  <label htmlFor="desktop-catalog-search" className="sr-only">
                    Search sarees, lehengas, kurthis, and silks
                  </label>
                  <input
                    id="desktop-catalog-search"
                    type="search"
                    placeholder="Search sarees, lehengas, kurtis, silks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/95 hover:bg-white focus:bg-white border border-[#8ec893] rounded-full py-2 pl-9 pr-4 text-xs text-[#113520] placeholder:text-[#3f654b] focus:outline-none focus:border-[#113520] focus:ring-1 focus:ring-[#113520] transition-all shadow-xs backdrop-blur-xs font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-[#18482C] absolute left-3.5 pointer-events-none" aria-hidden="true" />
                </form>
              </search>
            </div>

            {/* Right: Search Toggle (Mobile) and Account, Wishlist, Bag Action Group */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 justify-end">
              {/* Mobile Search Icon Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchExpandedMobile(!isSearchExpandedMobile)}
                className="lg:hidden p-1.5 text-[#113520] hover:text-[#06180c] transition-colors"
                aria-label="Toggle Search"
                aria-expanded={isSearchExpandedMobile}
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Desktop & Tablet Account, Wishlist, Bag Action Group */}
              <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#8ec893] shadow-xs">
                {user?.isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 px-2 py-0.5 text-[#113520] bg-[#D0E9C0]/70 hover:bg-[#D0E9C0] transition-colors rounded-full font-bold"
                      title="Open Admin Dashboard"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#18482C]" />
                      <span className="text-[11px] tracking-wider">Admin</span>
                    </Link>
                    <span className="text-[#18482C]/25 text-xs">|</span>
                  </>
                )}

                {/* Account Link */}
                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70"
                  title={user ? `Signed in as ${user.fullName}` : 'Login / Register'}
                >
                  <User className="w-4 h-4 stroke-[2]" />
                  <span className="text-[11.5px] font-semibold tracking-wider">
                    {user ? 'Account' : 'Login'}
                  </span>
                </Link>

                <span className="text-[#18482C]/25 text-xs">|</span>

                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70 relative"
                  title="View Wishlist"
                >
                  <div className="relative">
                    <WishlistIcon className="w-4 h-4 text-[#18482C]" strokeWidth={1.75} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11.5px] font-semibold tracking-wider">
                    Wishlist
                  </span>
                </Link>

                <span className="text-[#18482C]/25 text-xs">|</span>

                {/* Bag (Cart) Button */}
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[#18482C] hover:text-[#0D2818] transition-colors rounded-full hover:bg-white/70 relative"
                  aria-label="View Shopping Bag"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#18482C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11.5px] font-semibold tracking-wider">
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
                  <WishlistIcon className="w-5 h-5 text-[#18482C]" strokeWidth={1.75} />
                  {wishlistCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0 bg-[#18482C] text-white text-[8.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="p-1.5 text-[#18482C] relative"
                  aria-label="View Shopping Bag"
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
              <search>
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <label htmlFor="mobile-catalog-search" className="sr-only">
                    Search for sarees, lehengas, and silks
                  </label>
                  <input
                    id="mobile-catalog-search"
                    type="search"
                    placeholder="Search for sarees, lehengas, silk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-white border border-[#D8C7B5] rounded-full py-2 pl-9 pr-10 text-sm text-[#18482C] focus:outline-none focus:border-[#18482C]"
                  />
                  <Search className="w-4 h-4 text-[#647268] absolute left-3.5" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpandedMobile(false)}
                    aria-label="Close search"
                    className="absolute right-3 p-1 text-[#647268]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              </search>
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
