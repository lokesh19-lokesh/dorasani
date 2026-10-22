import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';

export const HomePage: React.FC = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // 4 New arrivals matching Pic 4
  const newArrivals = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-14 bg-[#FAF5EE]">
      {/* 1. HERO SECTION (100% Matching Pic 2 & Pic 3) */}
      <section className="relative overflow-hidden bg-[#FAF5EE] border-b border-[#E8DCCF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Panoramic Hero Art Container */}
          <div className="relative rounded-2xl overflow-hidden border border-[#D8C7B5] shadow-lg bg-[#FAF5EE]">
            {/* Full Panorama Background Art */}
            <img
              src="/assets/banners/hero_clean.jpg"
              alt="Dorasani - Woven in Tradition. Adorned in Royalty."
              className="w-full h-auto object-cover min-h-[280px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[420px]"
            />

            {/* Clickable Overlay / Functional Interactive Hotspots */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-14 pointer-events-none">
              {/* Left Content Hotspots for Screen Readers and Keyboard Navigation */}
              <div className="max-w-md space-y-2 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-[0.22em] text-[#285A3C] uppercase">
                  <span>✦</span>
                  <span>THE ROYAL HERITAGE EDIT</span>
                  <span>✦</span>
                </div>

                <h1 className="font-serif-royal text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1A3B2B] leading-[1.12] tracking-tight">
                  Woven in Tradition.<br />
                  <span className="text-[#1A3B2B]">Adorned in Royalty.</span>
                </h1>

                <p className="text-[11px] sm:text-xs md:text-sm text-[#4A574E] max-w-sm leading-relaxed hidden sm:block">
                  Discover the timeless beauty of South Indian fashion, where heritage, artistry and elegance come together.
                </p>

                {/* Interactive CTAs */}
                <div className="flex items-center gap-2.5 pt-2 pointer-events-auto">
                  <Link
                    to="/shop"
                    className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-medium tracking-wide transition-all shadow-md flex items-center gap-1.5 group"
                  >
                    <span>Explore the Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/heritage"
                    className="bg-white/95 hover:bg-white text-[#1A3B2B] border border-[#D8C7B5] hover:border-[#285A3C] px-4 sm:px-6 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-medium tracking-wide transition-all text-center shadow-xs"
                  >
                    Discover Our Heritage
                  </Link>
                </div>

                {/* Slider Dots matching Pic 3 */}
                <div className="flex items-center space-x-1.5 pt-3 pointer-events-auto">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentHeroSlide === idx
                          ? 'w-6 bg-[#285A3C]'
                          : 'w-2 bg-[#BCD8AA] hover:bg-[#285A3C]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY (100% Matching Pic 2 & Pic 4) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] flex items-center justify-center gap-2">
              <span className="text-[#285A3C] text-sm">✦</span>
              <span>Shop by Category</span>
              <span className="text-[#285A3C] text-sm">✦</span>
            </h2>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 7 Category Arch Cards + Right Celebration Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Category Cards (7 items) */}
          <div className="lg:col-span-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 items-end">
            {CATEGORIES.slice(0, 7).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>

          {/* Right Feature Card: A Celebration of Our Heritage */}
          <div className="lg:col-span-4 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE]">
            <Link to="/collections/festive" className="block relative h-full">
              <img
                src="/assets/banners/celebration_heritage.jpg"
                alt="A Celebration of Our Heritage - Festive Styles"
                className="w-full h-full object-cover object-center min-h-[220px] transition-transform duration-500 group-hover:scale-102"
              />
              {/* Invisible interactive area for Explore Festive Styles */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-xs font-semibold px-4 py-2 rounded shadow-md transition-colors">
                  <span>Explore Festive Styles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS (100% Matching Pic 2 & Pic 4) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] flex items-center justify-center gap-2">
              <span className="text-[#285A3C] text-sm">✦</span>
              <span>New Arrivals</span>
              <span className="text-[#285A3C] text-sm">✦</span>
            </h2>
          </div>

          <Link
            to="/collections/new-arrivals"
            className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Product Cards + Right Legacy Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 4 Products on Left */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Right Feature Card: A Legacy of Beauty. A Spirit of Tradition. */}
          <div className="lg:col-span-4 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE]">
            <Link to="/about" className="block relative h-full">
              <img
                src="/assets/banners/legacy_tradition.jpg"
                alt="A Legacy of Beauty. A Spirit of Tradition."
                className="w-full h-full object-cover object-center min-h-[240px] transition-transform duration-500 group-hover:scale-102"
              />
              {/* Interactive Button for Our Story */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-36 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-xs font-semibold px-5 py-2 rounded shadow-md transition-colors">
                  <span>Our Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PASTEL PISTACHIO TRUST STRIP (100% Matching Pic 2 & Pic 4) */}
      <section className="relative overflow-hidden bg-[#D0E9C0] border-y border-[#BCD8AA] py-6 sm:py-8 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-[#1A3B2B]">
            {/* 1. Thoughtfully Curated Fashion */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
                <Sparkles className="w-6 h-6 text-[#1A3B2B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                  Thoughtfully Curated Fashion
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                  Premium fabrics and timeless designs
                </p>
              </div>
            </div>

            {/* 2. Secure Payments */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
                <ShieldCheck className="w-6 h-6 text-[#1A3B2B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                  Secure Payments
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                  100% safe and encrypted
                </p>
              </div>
            </div>

            {/* 3. Reliable Delivery */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
                <Truck className="w-6 h-6 text-[#1A3B2B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                  Reliable Delivery
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                  Pan India shipping
                </p>
              </div>
            </div>

            {/* 4. Customer Support */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
                <Headphones className="w-6 h-6 text-[#1A3B2B]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                  Customer Support
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                  Here to help always
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner lotuses matching Pic 2/4 */}
        <div className="absolute bottom-0 left-0 w-24 h-16 pointer-events-none opacity-80">
          <img src="/assets/brand/pillar_left.jpg" alt="" className="w-full h-full object-cover object-bottom" />
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-16 pointer-events-none opacity-80">
          <img src="/assets/brand/pillar_right.jpg" alt="" className="w-full h-full object-cover object-bottom" />
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 text-center">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
          ✦ Real Experiences ✦
        </span>
        <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B] mt-2 mb-8">
          Customer Love
        </h2>

        {/* Testimonial Card in Cream & Forest Green */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCCF] shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left max-w-2xl mx-auto">
          <img
            src="/assets/categories/cat_sarees_arch.jpg"
            alt="Priya S."
            className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-[#D8C7B5] shadow-xs shrink-0"
          />
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-[#C29336]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="font-serif-royal italic text-sm sm:text-base text-[#1A3B2B] leading-relaxed">
              "Absolutely beautiful sarees! The quality and detailing are exceptional. DORASANI has truly captured the essence of South Indian tradition."
            </p>
            <div>
              <h4 className="font-semibold text-xs text-[#285A3C]">Priya S.</h4>
              <p className="text-[11px] text-[#647268]">Verified Customer, Bengaluru</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
