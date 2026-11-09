import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '../components/common/AnnouncementBar';
import { Header } from '../components/common/Header';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MobileBottomBar } from '../components/common/MobileBottomBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { ToastContainer } from '../components/common/ToastContainer';
import { Preloader } from '../components/common/Preloader';
import { BaseStoreSchema } from '../components/common/SeoHead';
import { useStore } from '../context/StoreContext';

export const RootLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { siteSettings } = useStore();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Show preloader once per session on the home page, or if forced via query param / replay event
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.pathname !== '/') return false;
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('preloader') === '1' || searchParams.get('replay') === '1') {
      return true;
    }
    const hasSeen = sessionStorage.getItem('dorasani_preloader_seen');
    return !hasSeen;
  });

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dorasani_preloader_seen', 'true');
    }
  }, []);

  // Scroll to top on route navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Dismiss preloader immediately if not on home page
  useEffect(() => {
    if (!isHomePage && showPreloader) {
      setShowPreloader(false);
    }
  }, [isHomePage, showPreloader]);

  // Support replaying preloader on demand (e.g. dev testing or custom user action) on home page
  useEffect(() => {
    const handleReplay = () => {
      if (location.pathname === '/') {
        setShowPreloader(true);
      }
    };
    window.addEventListener('dorasani:replay-preloader', handleReplay);
    return () => window.removeEventListener('dorasani:replay-preloader', handleReplay);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF5EE] text-[#1A3B2B]">
      <BaseStoreSchema settings={siteSettings} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#18482C] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      {showPreloader && isHomePage && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      <AnnouncementBar />

      {/* Desktop Header and Navbar unified wrapper with #abd9af plain background */}
      <div className="sticky top-0 z-30 w-full bg-[#abd9af] border-b border-[#96c89b] shadow-xs">
        {/* Present navbar background image (commented out):
        <div className="hidden lg:block absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src="/assets/hero/desktop/navbar.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>
        */}
        <Header onOpenCart={() => setIsCartOpen(true)} />
        <Navbar />
      </div>

      <main id="main-content" tabIndex={-1} className="flex-1 pb-16 lg:pb-0 focus:outline-none">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomBar />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ToastContainer />
    </div>
  );
};
