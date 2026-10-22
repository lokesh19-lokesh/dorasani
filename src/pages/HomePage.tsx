import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';

export const HomePage: React.FC = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // New arrivals for the homepage
  const newArrivals = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FAF2EB] border-b border-[#EEDCD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#C99632] uppercase">
                <span>✦</span>
                <span>THE ROYAL HERITAGE EDIT</span>
                <span>✦</span>
              </div>

              <h1 className="font-serif-royal text-3xl sm:text-5xl xl:text-6xl font-bold text-[#2D141A] leading-[1.15] tracking-tight">
                Woven in Tradition.<br />
                <span className="text-[#AC1443]">Adorned in Royalty.</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-[#74565D] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Discover the timeless beauty of South Indian fashion, where heritage, artistry and divine elegance come together in every sacred thread.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto bg-[#AC1443] hover:bg-[#860E33] text-white px-7 py-3 rounded font-medium text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/heritage"
                  className="w-full sm:w-auto bg-white/80 hover:bg-white text-[#2D141A] border border-[#DEC3B4] hover:border-[#AC1443] px-7 py-3 rounded font-medium text-xs sm:text-sm tracking-wide transition-all text-center"
                >
                  Discover Our Heritage
                </Link>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 pt-4">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentHeroSlide === idx
                        ? 'w-6 bg-[#AC1443]'
                        : 'w-2 bg-[#D8B5A2] hover:bg-[#AC1443]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Hero Image Composition */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Temple Art & Model Composite */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#EEDCD1] shadow-2xl bg-[#FFF9F5] aspect-[4/3] sm:aspect-[16/11]">
                  <img
                    src="/assets/banners/hero_model.jpg"
                    alt="Royal South Indian Bride in Rani Pink Kanjivaram Saree"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle inner overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D141A]/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Heritage Badge */}
                <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-[#FFF9F5] border border-[#C99632] rounded-xl p-3 shadow-lg items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF2DF] flex items-center justify-center text-[#C99632]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#AC1443] tracking-wide uppercase">
                      Pure Mulberry Silk
                    </p>
                    <p className="text-[10px] text-[#74565D]">
                      Handcrafted by Master Weavers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#2D141A] flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[#C99632] text-sm hidden sm:inline">✦</span>
              <span>Shop by Category</span>
              <span className="text-[#C99632] text-sm hidden sm:inline">✦</span>
            </h2>
            <p className="text-xs text-[#74565D] mt-1 hidden sm:block">
              Explore traditional textiles tailored for every auspicious celebration
            </p>
          </div>

          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#AC1443] hover:text-[#860E33] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Grid with Festive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Category Cards (7 Items) */}
          <div className="lg:col-span-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>

          {/* Festive Banner Card (Right) */}
          <div className="lg:col-span-4 rounded-xl overflow-hidden relative border border-[#EEDCD1] shadow-sm flex flex-col justify-end p-6 min-h-[260px] bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/banners/celebration_heritage_banner.jpg)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#63132B]/95 via-[#860E33]/70 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D0E9C0]">
                ✦ Festive Season Edit ✦
              </span>
              <h3 className="font-serif-royal text-xl sm:text-2xl font-bold text-white leading-snug">
                A Celebration of Our Heritage
              </h3>
              <p className="text-xs text-white/80 line-clamp-2">
                Elegant styles for festivals, weddings and meaningful family occasions.
              </p>
              <Link
                to="/collections/festive"
                className="inline-flex items-center gap-2 bg-white text-[#860E33] hover:bg-[#FAF2EB] text-xs font-semibold px-4 py-2 rounded transition-all mt-2 shadow-sm"
              >
                <span>Explore Festive Styles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#2D141A] flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[#C99632] text-sm hidden sm:inline">✦</span>
              <span>New Arrivals</span>
              <span className="text-[#C99632] text-sm hidden sm:inline">✦</span>
            </h2>
            <p className="text-xs text-[#74565D] mt-1 hidden sm:block">
              Fresh drapes and royal weaves freshly added to our boutique
            </p>
          </div>

          <Link
            to="/collections/new-arrivals"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#AC1443] hover:text-[#860E33] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Products Grid + Story Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Products (4 items) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Legacy of Beauty Story Banner */}
          <div className="lg:col-span-4 rounded-xl overflow-hidden relative border border-[#EEDCD1] shadow-sm flex flex-col justify-end p-6 min-h-[260px] bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/banners/legacy_beauty_banner.jpg)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D141A]/95 via-[#2D141A]/60 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C99632]">
                ✦ Our Heritage ✦
              </span>
              <h3 className="font-serif-royal text-xl sm:text-2xl font-bold leading-snug">
                A Legacy of Beauty. A Spirit of Tradition.
              </h3>
              <p className="text-xs text-white/80 line-clamp-3">
                DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-[#AC1443] hover:bg-[#860E33] text-white text-xs font-semibold px-4 py-2 rounded transition-all mt-2 shadow-sm"
              >
                <span>Our Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CUSTOMER TESTIMONIALS ("CUSTOMER LOVE") */}
      <section className="bg-[#FAF2EB] border-y border-[#EEDCD1] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C99632] uppercase">
            ✦ Real Experiences ✦
          </span>
          <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#2D141A] mt-2 mb-8">
            Customer Love
          </h2>

          {/* Testimonial Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EEDCD1] shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left max-w-2xl mx-auto">
            <img
              src="/assets/testimonials/priya_s.jpg"
              alt="Priya S."
              className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-[#DEC3B4] shadow-xs shrink-0"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#C99632]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="font-serif-royal italic text-sm sm:text-base text-[#2D141A] leading-relaxed">
                "Absolutely beautiful sarees! The quality and detailing are exceptional. DORASANI has truly captured the essence of South Indian tradition."
              </p>
              <div>
                <h4 className="font-semibold text-xs text-[#AC1443]">Priya S.</h4>
                <p className="text-[11px] text-[#74565D]">Verified Customer, Bengaluru</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
