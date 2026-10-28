import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '../components/common/AnnouncementBar';
import { Header } from '../components/common/Header';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MobileBottomBar } from '../components/common/MobileBottomBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { ToastContainer } from '../components/common/ToastContainer';
import { Preloader } from '../components/common/Preloader';

export const RootLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Only show preloader on the home page ('/')
  const [showPreloader, setShowPreloader] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname === '/';
  });

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
      {showPreloader && isHomePage && (
        <Preloader onComplete={() => setShowPreloader(false)} />
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

      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomBar />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ToastContainer />
    </div>
  );
};
