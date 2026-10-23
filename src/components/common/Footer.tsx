import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Headphones,
  Send,
  Plus,
  Minus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { showToast } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for joining the DORASANI family!');
      setEmail('');
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-[#abd9af] border-t border-[#8EC493] mt-auto text-[#0F2E1B]">
      {/* 1. Trust Indicators Strip - Commented out as requested */}
      {/*
      <div className="bg-[#D0E9C0]/35 border-b border-[#BCD8AA] py-8 sm:py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#285A3C]/10 flex items-center justify-center shrink-0 text-[#285A3C]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1A3B2B]">
                Thoughtfully Curated Fashion
              </h4>
              <p className="text-xs text-[#4F6355] mt-0.5">
                Premium fabrics & timeless designs
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#285A3C]/10 flex items-center justify-center shrink-0 text-[#285A3C]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1A3B2B]">
                Secure Payments
              </h4>
              <p className="text-xs text-[#4F6355] mt-0.5">
                100% safe & encrypted checkout
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#285A3C]/10 flex items-center justify-center shrink-0 text-[#285A3C]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1A3B2B]">
                Reliable Delivery
              </h4>
              <p className="text-xs text-[#4F6355] mt-0.5">
                Pan India express shipping
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#285A3C]/10 flex items-center justify-center shrink-0 text-[#285A3C]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1A3B2B]">
                Customer Support
              </h4>
              <p className="text-xs text-[#4F6355] mt-0.5">
                Here to help always, 7 days a week
              </p>
            </div>
          </div>
        </div>
      </div>
      */}

      {/* 2. Newsletter Section */}
      <div className="py-10 sm:py-12 px-4 sm:px-8 border-b border-[#8EC493] bg-[#abd9af] relative overflow-hidden text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="font-cinzel-royal text-xs tracking-[0.25em] text-[#143D24] uppercase font-bold">
            ✦ Be Part of Our Legacy ✦
          </span>
          <h3 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#0A2414] mt-2 mb-2">
            Join the DORASANI Family
          </h3>
          <p className="text-xs sm:text-sm text-[#143D24] font-medium max-w-lg mx-auto mb-6">
            Be the first to know about new arrivals, exclusive festive collections, and special privileged offers.
          </p>

          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white border border-r-0 border-[#285A3C]/40 rounded-l-md px-4 py-2.5 text-xs text-[#0A2414] placeholder:text-[#5B7362] focus:outline-none focus:border-[#0A2414]"
            />
            <button
              type="submit"
              className="bg-[#18482C] hover:bg-[#0E2C1A] text-white px-5 rounded-r-md transition-colors flex items-center justify-center shadow-xs"
              aria-label="Subscribe"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Main Footer Links & Brand Section */}
      <div className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand Header inside Footer */}
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/" className="inline-block transition-transform duration-300 hover:scale-102 mb-1">
            <img
              src="/assets/brand/dorasani_full_logo.png"
              alt="DORASANI - Where Heritage Meets Divine Elegance"
              className="h-12 sm:h-14 w-auto object-contain mx-auto"
            />
          </Link>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mt-5 text-[#abd9af]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-[#18482C] text-[#abd9af] hover:bg-[#0E2C1A] hover:text-white transition-all shadow-xs"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-[#18482C] text-[#abd9af] hover:bg-[#0E2C1A] hover:text-white transition-all shadow-xs"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-[#18482C] text-[#abd9af] hover:bg-[#0E2C1A] hover:text-white transition-all shadow-xs"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Columns Grid */}
        <div className="hidden md:grid grid-cols-5 gap-8 text-xs pt-4 border-t border-[#8EC493]">
          {/* Column 1: Shop */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#0A2414] tracking-wider mb-4 uppercase">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[#143D24]">
              <li><Link to="/collections/sarees" className="hover:text-[#000000] font-medium transition-colors">Sarees Collection</Link></li>
              <li><Link to="/collections/sarees" className="hover:text-[#000000] font-medium transition-colors">Kanjivaram Silk</Link></li>
              <li><Link to="/collections/ethnic-wear" className="hover:text-[#000000] font-medium transition-colors">Ethnic Wear</Link></li>
              <li><Link to="/collections/lehengas" className="hover:text-[#000000] font-medium transition-colors">Lehengas</Link></li>
              <li><Link to="/collections/festive" className="hover:text-[#000000] font-medium transition-colors">Festive Edit</Link></li>
              <li><Link to="/collections/new-arrivals" className="hover:text-[#000000] font-medium transition-colors">New Arrivals</Link></li>
              <li><Link to="/collections/bestsellers" className="hover:text-[#000000] font-medium transition-colors">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Column 2: About DORASANI */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#0A2414] tracking-wider mb-4 uppercase">
              About DORASANI
            </h4>
            <ul className="space-y-2.5 text-[#143D24]">
              <li><Link to="/about" className="hover:text-[#000000] font-medium transition-colors">Our Story</Link></li>
              <li><Link to="/heritage" className="hover:text-[#000000] font-medium transition-colors">Mythology & Heritage</Link></li>
              <li><Link to="/heritage" className="hover:text-[#000000] font-medium transition-colors">Temple Architecture</Link></li>
              <li><Link to="/about" className="hover:text-[#000000] font-medium transition-colors">Artisans & Weavers</Link></li>
              <li><Link to="/about" className="hover:text-[#000000] font-medium transition-colors">Handloom Promise</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#0A2414] tracking-wider mb-4 uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-[#143D24]">
              <li><Link to="/track-order" className="hover:text-[#000000] font-medium transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping" className="hover:text-[#000000] font-medium transition-colors">Shipping Information</Link></li>
              <li><Link to="/returns" className="hover:text-[#000000] font-medium transition-colors">Easy Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-[#000000] font-medium transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-[#000000] font-medium transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#0A2414] tracking-wider mb-4 uppercase">
              Policies
            </h4>
            <ul className="space-y-2.5 text-[#143D24]">
              <li><Link to="/terms" className="hover:text-[#000000] font-medium transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#000000] font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-[#000000] font-medium transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-[#000000] font-medium transition-colors">Cancellation Policy</Link></li>
              <li><Link to="/about" className="hover:text-[#000000] font-medium transition-colors">Handloom Certification</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#0A2414] tracking-wider mb-4 uppercase">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-[#143D24]">
              <li className="text-[#0A2414] font-bold">DORASANI Flagship Studio</li>
              <li>Banjara Hills, Road No. 10</li>
              <li>Hyderabad, Telangana - 500034</li>
              <li className="pt-1">Phone: +91 99xxxxxxxx</li>
              <li>Email: contact@dorasani.com</li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordions */}
        <div className="md:hidden border-t border-[#8EC493] divide-y divide-[#8EC493]">
          {/* Accordion 1: Shop */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('shop')}
              className="flex items-center justify-between w-full font-bold text-xs text-[#0A2414] tracking-wider uppercase text-left"
            >
              <span>Shop</span>
              {openSections['shop'] ? <Minus className="w-4 h-4 text-[#0A2414]" /> : <Plus className="w-4 h-4 text-[#143D24]" />}
            </button>
            {openSections['shop'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#143D24] pl-2 font-medium">
                <li><Link to="/collections/sarees">Sarees</Link></li>
                <li><Link to="/collections/ethnic-wear">Ethnic Wear</Link></li>
                <li><Link to="/collections/lehengas">Lehengas</Link></li>
                <li><Link to="/collections/festive">Festive Collection</Link></li>
                <li><Link to="/collections/new-arrivals">New Arrivals</Link></li>
                <li><Link to="/collections/bestsellers">Bestsellers</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 2: About DORASANI */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('about')}
              className="flex items-center justify-between w-full font-bold text-xs text-[#0A2414] tracking-wider uppercase text-left"
            >
              <span>About DORASANI</span>
              {openSections['about'] ? <Minus className="w-4 h-4 text-[#0A2414]" /> : <Plus className="w-4 h-4 text-[#143D24]" />}
            </button>
            {openSections['about'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#143D24] pl-2 font-medium">
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/heritage">Mythology & Heritage</Link></li>
                <li><Link to="/about">Artisans of India</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 3: Customer Care */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('care')}
              className="flex items-center justify-between w-full font-bold text-xs text-[#0A2414] tracking-wider uppercase text-left"
            >
              <span>Customer Care</span>
              {openSections['care'] ? <Minus className="w-4 h-4 text-[#0A2414]" /> : <Plus className="w-4 h-4 text-[#143D24]" />}
            </button>
            {openSections['care'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#143D24] pl-2 font-medium">
                <li><Link to="/track-order">Track Order</Link></li>
                <li><Link to="/shipping">Shipping Policy</Link></li>
                <li><Link to="/returns">Returns & Exchange</Link></li>
                <li><Link to="/faq">FAQs</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 4: Policies */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('policies')}
              className="flex items-center justify-between w-full font-bold text-xs text-[#0A2414] tracking-wider uppercase text-left"
            >
              <span>Policies</span>
              {openSections['policies'] ? <Minus className="w-4 h-4 text-[#0A2414]" /> : <Plus className="w-4 h-4 text-[#143D24]" />}
            </button>
            {openSections['policies'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#143D24] pl-2 font-medium">
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 5: Contact Us */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full font-bold text-xs text-[#0A2414] tracking-wider uppercase text-left"
            >
              <span>Contact Us</span>
              {openSections['contact'] ? <Minus className="w-4 h-4 text-[#0A2414]" /> : <Plus className="w-4 h-4 text-[#143D24]" />}
            </button>
            {openSections['contact'] && (
              <div className="mt-3 text-xs text-[#143D24] pl-2 space-y-1 font-medium">
                <p>Phone: +91 99xxxxxxxx</p>
                <p>Email: contact@dorasani.com</p>
                <p>Banjara Hills, Hyderabad, India</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-[#8EC493] text-center text-xs text-[#143D24] pb-16 lg:pb-0 flex flex-col items-center gap-2">
          <p className="font-medium">© 2026 DORASANI. All rights reserved.</p>
          
          {/* Design by The Bubbles Media with Interactive Soap Bubbles Hover Animation */}
          <div className="text-xs text-[#143D24] flex items-center justify-center gap-1.5 flex-wrap">
            <span>Design by</span>
            <a
              href="https://thebubblesmedia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center font-bold text-[#0A2414] hover:text-[#000000] underline decoration-[#0A2414]/50 underline-offset-3 group/bubble cursor-pointer"
            >
              <span>The Bubbles Media</span>
              {/* Floating Bubbles on hover */}
              <span className="pointer-events-none absolute inset-x-0 -top-1 h-12 overflow-visible opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-300">
                <span className="bubble-particle left-[8%] w-3 h-3" style={{ '--drift': '-8px', '--duration': '1.3s', '--delay': '0s' } as React.CSSProperties} />
                <span className="bubble-particle left-[28%] w-4 h-4" style={{ '--drift': '6px', '--duration': '1.6s', '--delay': '0.15s' } as React.CSSProperties} />
                <span className="bubble-particle left-[50%] w-2.5 h-2.5" style={{ '--drift': '-5px', '--duration': '1.1s', '--delay': '0.35s' } as React.CSSProperties} />
                <span className="bubble-particle left-[72%] w-3.5 h-3.5" style={{ '--drift': '8px', '--duration': '1.5s', '--delay': '0.1s' } as React.CSSProperties} />
                <span className="bubble-particle left-[90%] w-2 h-2" style={{ '--drift': '-3px', '--duration': '1.2s', '--delay': '0.45s' } as React.CSSProperties} />
              </span>
            </a>
          </div>

          <p className="text-[10.5px] text-[#245737] font-medium">
            Inspired by Temple Architecture & Traditional Indian Weaves
          </p>
        </div>
      </div>
    </footer>
  );
};
