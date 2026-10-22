import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones, ChevronDown } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#D0E9C0] text-[#1A3B2B] text-[11px] sm:text-[12px] py-1.5 px-3 sm:px-8 tracking-wide border-b border-[#BCD8AA] relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left / Center Scrolling or Flex Perks */}
        <div className="flex items-center space-x-3 sm:space-x-6 overflow-x-auto no-scrollbar py-0.5 font-medium">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-[#285A3C]" /> Free Shipping Above ₹999
          </span>
          <span className="hidden md:inline text-[#1A3B2B]/30">|</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5 text-[#285A3C]" /> Easy Returns
          </span>
          <span className="hidden md:inline text-[#1A3B2B]/30">|</span>
          <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-[#285A3C]" /> Authentic Handloom
          </span>
          <span className="hidden md:inline text-[#1A3B2B]/30">|</span>
          <span className="hidden lg:flex items-center gap-1.5 whitespace-nowrap">
            <Headphones className="w-3.5 h-3.5 text-[#285A3C]" /> Customer Support
          </span>
        </div>

        {/* Right Side Utility Links */}
        <div className="flex items-center space-x-4 shrink-0 text-[#1A3B2B]/90 font-medium">
          <Link to="/track-order" className="hover:text-[#285A3C] transition-colors">
            Track Order
          </Link>
          <span className="text-[#1A3B2B]/30">|</span>
          <Link to="/faq" className="hover:text-[#285A3C] transition-colors">
            Help
          </Link>
          <span className="hidden sm:inline text-[#1A3B2B]/30">|</span>
          <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-[#285A3C]">
            <span>English</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
