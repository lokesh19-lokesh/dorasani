import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '../components/common/AnnouncementBar';
import { Header } from '../components/common/Header';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MobileBottomBar } from '../components/common/MobileBottomBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { ToastContainer } from '../components/common/ToastContainer';

export const RootLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF5EE] text-[#1A3B2B]">
      <AnnouncementBar />

      {/* Desktop Header and Navbar unified wrapper with navbar.png background */}
      <div className="sticky top-0 z-30 w-full bg-[#FAF5EE] border-b border-[#E8DCCF]">
        <div className="hidden lg:block absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src="/assets/hero/desktop/navbar.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>
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
