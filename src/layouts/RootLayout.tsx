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
    <div className="flex flex-col min-h-screen bg-[#FFF9F5] text-[#2D141A]">
      <AnnouncementBar />
      <Header onOpenCart={() => setIsCartOpen(true)} />
      <Navbar />

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
