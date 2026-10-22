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
    <footer className="bg-[#FAF5EE] border-t border-[#D8C7B5] mt-auto">
      {/* 1. Trust Indicators Strip */}
      <div className="bg-[#D0E9C0]/35 border-b border-[#BCD8AA] py-8 sm:py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Perk 1 */}
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

          {/* Perk 2 */}
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

          {/* Perk 3 */}
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

          {/* Perk 4 */}
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

      {/* 2. Newsletter Section */}
      <div className="py-12 px-4 sm:px-8 border-b border-[#D8C7B5] bg-[#F5EFE6] relative overflow-hidden text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="font-cinzel-royal text-xs tracking-[0.25em] text-[#C99632] uppercase font-semibold">
            ✦ Be Part of Our Legacy ✦
          </span>
          <h3 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B] mt-2 mb-2">
            Join the DORASANI Family
          </h3>
          <p className="text-xs sm:text-sm text-[#4F6355] max-w-lg mx-auto mb-6">
            Be the first to know about new arrivals, exclusive festive collections, and special privileged offers.
          </p>

          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white border border-r-0 border-[#BCD8AA] rounded-l-md px-4 py-2.5 text-xs text-[#1A3B2B] placeholder:text-[#8E9B92] focus:outline-none focus:border-[#285A3C]"
            />
            <button
              type="submit"
              className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 rounded-r-md transition-colors flex items-center justify-center"
              aria-label="Subscribe"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Main Footer Links & Brand Section */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand Header inside Footer */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-8 h-7 mb-2">
            <img
              src="/assets/brand/lotus_mark_green.png"
              alt="Lotus Emblem"
              className="w-full h-full object-contain mx-auto"
            />
          </div>
          <h2 className="font-cinzel-royal text-2xl font-bold text-[#1A3B2B] tracking-[0.2em] uppercase">
            DORASANI
          </h2>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#4F6355] mt-1 font-medium">
            Where Heritage Meets Divine Elegance
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mt-5 text-[#285A3C]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#D0E9C0] hover:bg-[#285A3C] hover:text-white transition-colors text-[#285A3C]"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#D0E9C0] hover:bg-[#285A3C] hover:text-white transition-colors text-[#285A3C]"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#D0E9C0] hover:bg-[#285A3C] hover:text-white transition-colors text-[#285A3C]"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Columns Grid */}
        <div className="hidden md:grid grid-cols-5 gap-8 text-xs pt-4 border-t border-[#D8C7B5]">
          {/* Column 1: Shop */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider mb-4 uppercase">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[#4F6355]">
              <li><Link to="/collections/sarees" className="hover:text-[#285A3C]">Sarees Collection</Link></li>
              <li><Link to="/collections/sarees" className="hover:text-[#285A3C]">Kanjivaram Silk</Link></li>
              <li><Link to="/collections/ethnic-wear" className="hover:text-[#285A3C]">Ethnic Wear</Link></li>
              <li><Link to="/collections/lehengas" className="hover:text-[#285A3C]">Lehengas</Link></li>
              <li><Link to="/collections/festive" className="hover:text-[#285A3C]">Festive Edit</Link></li>
              <li><Link to="/collections/new-arrivals" className="hover:text-[#285A3C]">New Arrivals</Link></li>
              <li><Link to="/collections/bestsellers" className="hover:text-[#285A3C]">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Column 2: About DORASANI */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider mb-4 uppercase">
              About DORASANI
            </h4>
            <ul className="space-y-2.5 text-[#4F6355]">
              <li><Link to="/about" className="hover:text-[#285A3C]">Our Story</Link></li>
              <li><Link to="/heritage" className="hover:text-[#285A3C]">Mythology & Heritage</Link></li>
              <li><Link to="/heritage" className="hover:text-[#285A3C]">Temple Architecture</Link></li>
              <li><Link to="/about" className="hover:text-[#285A3C]">Artisans & Weavers</Link></li>
              <li><Link to="/about" className="hover:text-[#285A3C]">Handloom Promise</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider mb-4 uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-[#4F6355]">
              <li><Link to="/track-order" className="hover:text-[#285A3C]">Track Your Order</Link></li>
              <li><Link to="/shipping" className="hover:text-[#285A3C]">Shipping Information</Link></li>
              <li><Link to="/returns" className="hover:text-[#285A3C]">Easy Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-[#285A3C]">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-[#285A3C]">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider mb-4 uppercase">
              Policies
            </h4>
            <ul className="space-y-2.5 text-[#4F6355]">
              <li><Link to="/terms" className="hover:text-[#285A3C]">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#285A3C]">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-[#285A3C]">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-[#285A3C]">Cancellation Policy</Link></li>
              <li><Link to="/about" className="hover:text-[#285A3C]">Handloom Certification</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider mb-4 uppercase">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-[#4F6355]">
              <li className="text-[#1A3B2B] font-semibold">DORASANI Flagship Studio</li>
              <li>Banjara Hills, Road No. 10</li>
              <li>Hyderabad, Telangana - 500034</li>
              <li className="pt-1">Phone: +91 98765 43210</li>
              <li>Email: contact@dorasani.com</li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordions */}
        <div className="md:hidden border-t border-[#D8C7B5] divide-y divide-[#D8C7B5]">
          {/* Accordion 1: Shop */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('shop')}
              className="flex items-center justify-between w-full font-semibold text-xs text-[#1A3B2B] tracking-wider uppercase text-left"
            >
              <span>Shop</span>
              {openSections['shop'] ? <Minus className="w-4 h-4 text-[#285A3C]" /> : <Plus className="w-4 h-4 text-[#4F6355]" />}
            </button>
            {openSections['shop'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#4F6355] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#1A3B2B] tracking-wider uppercase text-left"
            >
              <span>About DORASANI</span>
              {openSections['about'] ? <Minus className="w-4 h-4 text-[#285A3C]" /> : <Plus className="w-4 h-4 text-[#4F6355]" />}
            </button>
            {openSections['about'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#4F6355] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#1A3B2B] tracking-wider uppercase text-left"
            >
              <span>Customer Care</span>
              {openSections['care'] ? <Minus className="w-4 h-4 text-[#285A3C]" /> : <Plus className="w-4 h-4 text-[#4F6355]" />}
            </button>
            {openSections['care'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#4F6355] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#1A3B2B] tracking-wider uppercase text-left"
            >
              <span>Policies</span>
              {openSections['policies'] ? <Minus className="w-4 h-4 text-[#285A3C]" /> : <Plus className="w-4 h-4 text-[#4F6355]" />}
            </button>
            {openSections['policies'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#4F6355] pl-2">
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 5: Contact Us */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full font-semibold text-xs text-[#1A3B2B] tracking-wider uppercase text-left"
            >
              <span>Contact Us</span>
              {openSections['contact'] ? <Minus className="w-4 h-4 text-[#285A3C]" /> : <Plus className="w-4 h-4 text-[#4F6355]" />}
            </button>
            {openSections['contact'] && (
              <div className="mt-3 text-xs text-[#4F6355] pl-2 space-y-1">
                <p>Phone: +91 98765 43210</p>
                <p>Email: contact@dorasani.com</p>
                <p>Banjara Hills, Hyderabad, India</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-[#D8C7B5] text-center text-[11px] text-[#4F6355] pb-16 lg:pb-0">
          <p>© 2024 DORASANI. All rights reserved.</p>
          <p className="text-[10px] text-[#8E9B92] mt-1">
            Inspired by Temple Architecture & Traditional Indian Weaves
          </p>
        </div>
      </div>
    </footer>
  );
};
