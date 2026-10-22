import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Headphones,
  Instagram,
  Facebook,
  Youtube,
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
    <footer className="bg-[#FFF9F5] border-t border-[#EEDCD1] mt-auto">
      {/* 1. Trust Indicators Strip */}
      <div className="bg-[#FBE5EB]/70 border-b border-[#EEDCD1] py-8 sm:py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Perk 1 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#AC1443]/10 flex items-center justify-center shrink-0 text-[#AC1443]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2D141A]">
                Thoughtfully Curated Fashion
              </h4>
              <p className="text-xs text-[#74565D] mt-0.5">
                Premium fabrics & timeless designs
              </p>
            </div>
          </div>

          {/* Perk 2 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#AC1443]/10 flex items-center justify-center shrink-0 text-[#AC1443]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2D141A]">
                Secure Payments
              </h4>
              <p className="text-xs text-[#74565D] mt-0.5">
                100% safe & encrypted checkout
              </p>
            </div>
          </div>

          {/* Perk 3 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#AC1443]/10 flex items-center justify-center shrink-0 text-[#AC1443]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2D141A]">
                Reliable Delivery
              </h4>
              <p className="text-xs text-[#74565D] mt-0.5">
                Pan India express shipping
              </p>
            </div>
          </div>

          {/* Perk 4 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="w-12 h-12 rounded-full bg-[#AC1443]/10 flex items-center justify-center shrink-0 text-[#AC1443]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2D141A]">
                Customer Support
              </h4>
              <p className="text-xs text-[#74565D] mt-0.5">
                Here to help always, 7 days a week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter Section */}
      <div className="py-12 px-4 sm:px-8 border-b border-[#EEDCD1] bg-[#FDF4EC]/60 relative overflow-hidden text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="font-cinzel-royal text-xs tracking-[0.25em] text-[#C99632] uppercase font-semibold">
            ✦ Be Part of Our Legacy ✦
          </span>
          <h3 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#2D141A] mt-2 mb-2">
            Join the DORASANI Family
          </h3>
          <p className="text-xs sm:text-sm text-[#74565D] max-w-lg mx-auto mb-6">
            Be the first to know about new arrivals, exclusive festive collections, and special privileged offers.
          </p>

          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white border border-r-0 border-[#DEC3B4] rounded-l-md px-4 py-2.5 text-xs text-[#2D141A] placeholder:text-[#9B8086] focus:outline-none focus:border-[#AC1443]"
            />
            <button
              type="submit"
              className="bg-[#AC1443] hover:bg-[#860E33] text-white px-5 rounded-r-md transition-colors flex items-center justify-center"
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
              src="/assets/brand/lotus_mark.png"
              alt="Lotus Emblem"
              className="w-full h-full object-contain mx-auto"
            />
          </div>
          <h2 className="font-cinzel-royal text-2xl font-bold text-[#AC1443] tracking-[0.2em] uppercase">
            DORASANI
          </h2>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#74565D] mt-1 font-medium">
            Where Heritage Meets Divine Elegance
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mt-5 text-[#AC1443]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#FBE5EB] hover:bg-[#AC1443] hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#FBE5EB] hover:bg-[#AC1443] hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#FBE5EB] hover:bg-[#AC1443] hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Desktop Columns Grid */}
        <div className="hidden md:grid grid-cols-5 gap-8 text-xs pt-4 border-t border-[#EEDCD1]">
          {/* Column 1: Shop */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#2D141A] tracking-wider mb-4 uppercase">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[#74565D]">
              <li><Link to="/collections/sarees" className="hover:text-[#AC1443]">Sarees Collection</Link></li>
              <li><Link to="/collections/sarees" className="hover:text-[#AC1443]">Kanjivaram Silk</Link></li>
              <li><Link to="/collections/ethnic-wear" className="hover:text-[#AC1443]">Ethnic Wear</Link></li>
              <li><Link to="/collections/lehengas" className="hover:text-[#AC1443]">Lehengas</Link></li>
              <li><Link to="/collections/festive" className="hover:text-[#AC1443]">Festive Edit</Link></li>
              <li><Link to="/collections/new-arrivals" className="hover:text-[#AC1443]">New Arrivals</Link></li>
              <li><Link to="/collections/bestsellers" className="hover:text-[#AC1443]">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Column 2: About DORASANI */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#2D141A] tracking-wider mb-4 uppercase">
              About DORASANI
            </h4>
            <ul className="space-y-2.5 text-[#74565D]">
              <li><Link to="/about" className="hover:text-[#AC1443]">Our Story</Link></li>
              <li><Link to="/heritage" className="hover:text-[#AC1443]">Mythology & Heritage</Link></li>
              <li><Link to="/heritage" className="hover:text-[#AC1443]">Temple Architecture</Link></li>
              <li><Link to="/about" className="hover:text-[#AC1443]">Artisans & Weavers</Link></li>
              <li><Link to="/about" className="hover:text-[#AC1443]">Handloom Promise</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#2D141A] tracking-wider mb-4 uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-[#74565D]">
              <li><Link to="/track-order" className="hover:text-[#AC1443]">Track Your Order</Link></li>
              <li><Link to="/shipping" className="hover:text-[#AC1443]">Shipping Information</Link></li>
              <li><Link to="/returns" className="hover:text-[#AC1443]">Easy Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-[#AC1443]">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-[#AC1443]">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#2D141A] tracking-wider mb-4 uppercase">
              Policies
            </h4>
            <ul className="space-y-2.5 text-[#74565D]">
              <li><Link to="/terms" className="hover:text-[#AC1443]">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#AC1443]">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-[#AC1443]">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-[#AC1443]">Cancellation Policy</Link></li>
              <li><Link to="/about" className="hover:text-[#AC1443]">Handloom Certification</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="font-cinzel-royal font-bold text-sm text-[#2D141A] tracking-wider mb-4 uppercase">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-[#74565D]">
              <li className="text-[#2D141A] font-semibold">DORASANI Flagship Studio</li>
              <li>Banjara Hills, Road No. 10</li>
              <li>Hyderabad, Telangana - 500034</li>
              <li className="pt-1">Phone: +91 98765 43210</li>
              <li>Email: contact@dorasani.com</li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordions */}
        <div className="md:hidden border-t border-[#EEDCD1] divide-y divide-[#EEDCD1]">
          {/* Accordion 1: Shop */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('shop')}
              className="flex items-center justify-between w-full font-semibold text-xs text-[#2D141A] tracking-wider uppercase text-left"
            >
              <span>Shop</span>
              {openSections['shop'] ? <Minus className="w-4 h-4 text-[#AC1443]" /> : <Plus className="w-4 h-4 text-[#74565D]" />}
            </button>
            {openSections['shop'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#74565D] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#2D141A] tracking-wider uppercase text-left"
            >
              <span>About DORASANI</span>
              {openSections['about'] ? <Minus className="w-4 h-4 text-[#AC1443]" /> : <Plus className="w-4 h-4 text-[#74565D]" />}
            </button>
            {openSections['about'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#74565D] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#2D141A] tracking-wider uppercase text-left"
            >
              <span>Customer Care</span>
              {openSections['care'] ? <Minus className="w-4 h-4 text-[#AC1443]" /> : <Plus className="w-4 h-4 text-[#74565D]" />}
            </button>
            {openSections['care'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#74565D] pl-2">
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
              className="flex items-center justify-between w-full font-semibold text-xs text-[#2D141A] tracking-wider uppercase text-left"
            >
              <span>Policies</span>
              {openSections['policies'] ? <Minus className="w-4 h-4 text-[#AC1443]" /> : <Plus className="w-4 h-4 text-[#74565D]" />}
            </button>
            {openSections['policies'] && (
              <ul className="mt-3 space-y-2 text-xs text-[#74565D] pl-2">
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 5: Contact Us */}
          <div className="py-3">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full font-semibold text-xs text-[#2D141A] tracking-wider uppercase text-left"
            >
              <span>Contact Us</span>
              {openSections['contact'] ? <Minus className="w-4 h-4 text-[#AC1443]" /> : <Plus className="w-4 h-4 text-[#74565D]" />}
            </button>
            {openSections['contact'] && (
              <div className="mt-3 text-xs text-[#74565D] pl-2 space-y-1">
                <p>Phone: +91 98765 43210</p>
                <p>Email: contact@dorasani.com</p>
                <p>Banjara Hills, Hyderabad, India</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-[#EEDCD1] text-center text-[11px] text-[#74565D] pb-16 lg:pb-0">
          <p>© 2024 DORASANI. All rights reserved.</p>
          <p className="text-[10px] text-[#9B8086] mt-1">
            Inspired by Temple Architecture & Traditional Indian Weaves
          </p>
        </div>
      </div>
    </footer>
  );
};
