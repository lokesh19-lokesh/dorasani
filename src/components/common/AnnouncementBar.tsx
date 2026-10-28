import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#D0E9C0] text-[#18482C] text-[11px] sm:text-[12px] py-1.5 sm:py-2 px-3 sm:px-8 lg:px-12 tracking-wide border-b border-[#BCD8AA] relative z-40 w-full overflow-hidden">
      {/* Desktop Announcement Bar */}
      <div className="hidden sm:flex w-full items-center justify-between">
        {/* Left Perks */}
        <div className="flex items-center space-x-3 sm:space-x-5 py-0.5 font-medium">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-[#18482C]" /> Free Shipping Above ₹999
          </span>
          <span className="text-[#18482C]/30 font-light">|</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5 text-[#18482C]" /> Easy Returns
          </span>
          <span className="text-[#18482C]/30 font-light">|</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-[#18482C]" /> Authentic Handloom
          </span>
          <span className="hidden md:inline text-[#18482C]/30 font-light">|</span>
          <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <Headphones className="w-3.5 h-3.5 text-[#18482C]" /> Customer Support
          </span>
        </div>

        {/* Right Utility Links */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 text-[#18482C] font-medium ml-4">
          <Link to="/track-order" className="hover:text-[#113520] transition-colors whitespace-nowrap">
            Track Order
          </Link>
          <span className="text-[#18482C]/30 font-light">|</span>
          <Link to="/faq" className="hover:text-[#113520] transition-colors whitespace-nowrap">
            Help
          </Link>
        </div>
      </div>

      {/* Mobile Clean Announcement Bar - No scrollbar, elegant compact perks */}
      <div className="sm:hidden flex items-center justify-between py-0.5 text-[10.5px] font-medium">
        <span className="flex items-center gap-1 whitespace-nowrap text-[#18482C]">
          <Truck className="w-3 h-3 text-[#18482C]" /> Free Shipping Above ₹999
        </span>
        <span className="text-[#18482C]/25">•</span>
        <span className="flex items-center gap-1 whitespace-nowrap text-[#18482C]">
          <RotateCcw className="w-3 h-3 text-[#18482C]" /> Easy Returns
        </span>
        <span className="text-[#18482C]/25">•</span>
        <span className="flex items-center gap-1 whitespace-nowrap text-[#18482C]">
          <ShieldCheck className="w-3 h-3 text-[#18482C]" /> 100% Authentic
        </span>
      </div>
    </div>
  );
};
